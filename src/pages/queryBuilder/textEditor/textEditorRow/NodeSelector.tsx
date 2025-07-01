import React, { useState, useEffect, useContext, useMemo } from "react";
import axios, { CancelTokenSource } from "axios";

import BiolinkContext from "../../../../context/biolink";
import strings from "../../../../utils/strings";
import useDebounce from "../../../../stores/useDebounce";

import fetchCuries from "../../../../utils/fetchCuries";
import highlighter from "../../../../utils/d3/highlighter";

import taxaCurieLookup from "./taxon-curie-lookup.json";
import { useAlert } from "../../../../components/AlertProvider";
import { Autocomplete, IconButton, Tooltip, TextField, CircularProgress, AutocompleteRenderOptionState } from "@mui/material";
import Check from "@mui/icons-material/Check";
import FileCopy from "@mui/icons-material/FileCopy";
import { withStyles } from "@mui/styles";
import { Theme } from "@mui/material/styles";
import { NodeOption } from "../types";

interface NodeSelectorProps {
  id: string;
  properties: any; // Could be more specific if known
  isReference: boolean;
  setReference: (key: string | null) => void;
  update: (id: string, value: NodeOption | null) => void;
  title?: string;
  size?: "small" | "medium";
  nameresCategoryFilter?: string;
  options?: {
    includeCuries?: boolean;
    includeExistingNodes?: boolean;
    existingNodes?: NodeOption[];
    includeCategories?: boolean;
    clearable?: boolean;
    includeSets?: boolean;
  };
}

function isValidNode(properties: any): boolean {
  return (properties.categories && properties.categories.length > 0) || (properties.ids && properties.ids.length > 0);
}

/**
 * Given an array of taxa (returns null if empty), get the name based on a lookup table,
 * or just return the curie string if it isn't found in the table
 * @param {string[]} taxaIdArray
 */
function lookupTaxaName(taxaIdArray: string[] | undefined): string | null {
  if (!Array.isArray(taxaIdArray) || taxaIdArray.length < 1) return null;

  const firstTaxaCurie = taxaIdArray[0];
  const firstTaxaName = (taxaCurieLookup as Record<string, string | null>)[firstTaxaCurie];

  if (!firstTaxaName) return firstTaxaCurie;
  return firstTaxaName;
}

const { CancelToken } = axios;
let cancel: CancelTokenSource | undefined;

/**
 * Generic node selector component
 * @param {string} id - node id
 * @param {object} properties - node properties from query graph
 * @param {boolean} isReference - is the node a reference
 * @param {function} setReference - function to set node selector reference
 * @param {function} update - function to update node properties
 * @param {string} title - title of the select box (if not specified, id is used)
 * @param {string} size - size of the select box
 * @param {string} nameresCategoryFilter - biolink category to filter the nameres options
 * @param {object} nodeOptions
 * @param {boolean} nodeOptions.includeCuries - node selector can include curies for a new node
 * @param {boolean} nodeOptions.includeExistingNodes - node selector can include existing nodes
 * @param {boolean} nodeOptions.includeCategories - node selector can include general categories
 */
export default function NodeSelector({ id, properties, isReference, setReference, update, title, size, nameresCategoryFilter, options: nodeOptions = {} }: NodeSelectorProps) {
  const { includeCuries = true, includeExistingNodes = true, existingNodes = [], includeCategories = true, clearable = true, includeSets = false } = nodeOptions;
  const [loading, toggleLoading] = useState<boolean>(false);
  const [inputText, updateInputText] = useState<string>("");
  const [open, toggleOpen] = useState<boolean>(false);
  const [options, setOptions] = useState<NodeOption[]>([]);
  const { displayAlert } = useAlert();
  // @ts-ignore: context type is not strict
  const { concepts } = useContext(BiolinkContext) as { concepts: string[] };
  const searchTerm = useDebounce(inputText, 500) as string;

  /**
   * Get dropdown options for node selector
   */
  async function getOptions() {
    toggleLoading(true);
    const newOptions: NodeOption[] = isReference ? [{ name: "New Term", key: null }] : [];
    // allow user to select an existing node
    if (includeExistingNodes) {
      newOptions.push(...existingNodes);
    }
    // add general concepts to options
    if (includeCategories) {
      let includedCategories: NodeOption[] = concepts
        .filter((category: string) => category.toLowerCase().includes(searchTerm.toLowerCase()))
        .map((category: string) => ({ categories: [category], name: strings.displayCategory(category) }));
      if (includeSets) {
        includedCategories = concepts
          .filter((category: string) => category.toLowerCase().includes(searchTerm.toLowerCase()))
          .flatMap((category: string) => [
            {
              categories: [category],
              name: strings.displayCategory(category),
            },
            {
              categories: [category],
              name: strings.setify(category),
              is_set: true,
            },
          ]);
      }
      newOptions.push(...includedCategories);
    }
    // fetch matching curies from external services
    if (includeCuries) {
      if (searchTerm.includes(":")) {
        // user is typing a specific curie
        newOptions.push({ name: searchTerm, ids: [searchTerm] });
      }
      if (cancel) {
        cancel.cancel();
      }
      cancel = CancelToken.source();
      const curies: NodeOption[] = await fetchCuries(searchTerm, displayAlert as (arg0: string, arg1: string) => void, cancel.token, nameresCategoryFilter);
      newOptions.push(...curies);
    }
    toggleLoading(false);
    setOptions(newOptions);
  }

  /**
   * Get node options when dropdown opens or search term changes
   * after debounce
   */
  useEffect(() => {
    if (open && searchTerm.length >= 3) {
      getOptions();
    } else {
      setOptions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, searchTerm]);

  /**
   * Cancel any api calls on unmount
   */
  useEffect(
    () => () => {
      if (cancel) {
        cancel.cancel();
      }
    },
    []
  );

  /**
   * Create a human-readable label for every option
   * @param {object} opt - autocomplete option
   * @returns {string} Label to display
   */
  function getOptionLabel(opt: NodeOption): string {
    let label = "";
    if (opt.key) {
      label += `${opt.key}: `;
    }
    if (opt.name) {
      return label + opt.name;
    }
    if (opt.ids && Array.isArray(opt.ids) && opt.ids.length) {
      return label + opt.ids.join(", ");
    }
    if (opt.categories && Array.isArray(opt.categories)) {
      if (opt.categories.length) {
        return label + opt.categories.join(", ");
      }
      return `${label} Something`;
    }
    return "";
  }

  /**
   * Update query graph based on option selected
   * @param {*} e - click event
   * @param {object|null} v - value of selected option
   */
  function handleUpdate(e: React.SyntheticEvent<Element, Event>, v: NodeOption | null) {
    // reset search term back when user selects something
    updateInputText("");
    if (v && "key" in v) {
      // key will only be in v when switching to existing node
      setReference(v.key ?? null);
    } else {
      // updating a node value
      update(id, v);
    }
  }

  /**
   * Compute current value of selector
   */
  const selectorValue = useMemo(() => {
    if (isValidNode(properties)) {
      return properties;
    }
    return null;
  }, [properties]);

  return (
    <Autocomplete
      options={options}
      loading={loading}
      className={`textEditorSelector${isReference ? " referenceNode" : ""} highlight-${id}`}
      getOptionLabel={getOptionLabel}
      filterOptions={(x) => x}
      autoComplete
      autoHighlight
      clearOnBlur
      blurOnSelect
      disableClearable={!clearable}
      inputValue={inputText}
      value={selectorValue}
      isOptionEqualToValue={(option: NodeOption, value: NodeOption) => option.name === value.name}
      open={open}
      onChange={handleUpdate}
      onOpen={() => toggleOpen(true)}
      onClose={() => toggleOpen(false)}
      onInputChange={(_e, v) => updateInputText(v)}
      renderOption={(props, option: NodeOption, state: AutocompleteRenderOptionState) => <Option {...option} {...props} />}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          className="nodeDropdown"
          label={title || id}
          margin="dense"
          onFocus={() => {
            highlighter.highlightGraphNode(id);
            highlighter.highlightTextEditorNode(id);
          }}
          onBlur={() => {
            highlighter.clearGraphNode(id);
            highlighter.clearTextEditorNode(id);
          }}
          InputProps={{
            ...params.InputProps,
            classes: {
              root: `nodeSelector nodeSelector-${id}`,
            },
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      size={size || "medium"}
    />
  );
}

const CustomTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    fontSize: theme.typography.pxToRem(14),
  },
}))(Tooltip);

interface OptionProps extends NodeOption {
  // MUI Autocomplete renderOption props
  [key: string]: any;
}

function Option({ name, ids, categories, taxa, ...props }: OptionProps) {
  const taxaName = lookupTaxaName(taxa);

  return (
    <CustomTooltip
      arrow
      title={
        <div className="node-option-tooltip-wrapper">
          {Array.isArray(ids) && ids.length > 0 && (
            <div>
              <span>{ids[0]}</span>
              <CopyButton textToCopy={ids[0]} />
            </div>
          )}
          {Array.isArray(categories) && categories.length > 0 && <span>{categories[0]}</span>}
        </div>
      }
      placement="left"
    >
      <div {...props}>
        {name} {taxaName ? `(${taxaName})` : null}
      </div>
    </CustomTooltip>
  );
}

interface CopyButtonProps {
  textToCopy: string;
}

function CopyButton({ textToCopy }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    navigator.clipboard.writeText(textToCopy);
    setHasCopied(true);
  };

  if (typeof navigator.clipboard === "undefined" || typeof navigator.clipboard.writeText !== "function" || typeof textToCopy !== "string") {
    return null;
  }

  return (
    <IconButton color="inherit" size="small" onClick={handleCopy}>
      {hasCopied ? <Check /> : <FileCopy />}
    </IconButton>
  );
}
