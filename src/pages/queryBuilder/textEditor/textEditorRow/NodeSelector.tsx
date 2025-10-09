import React, { useState, useEffect, useContext, useMemo, useCallback, useRef } from 'react';
import axios, { CancelTokenSource } from 'axios';

import BiolinkContext from '../../../../context/biolink';
import strings from '../../../../utils/strings';
import useDebounce from '../../../../stores/useDebounce';

import fetchCuries from '../../../../utils/fetchCuries';
import highlighter from '../../../../utils/d3/highlighter';

import taxaCurieLookup from './taxon-curie-lookup.json';
import { useAlert } from '../../../../components/AlertProvider';
import {
  Autocomplete,
  IconButton,
  Tooltip,
  TextField,
  CircularProgress,
  AutocompleteRenderOptionState,
} from '@mui/material';
import Check from '@mui/icons-material/Check';
import FileCopy from '@mui/icons-material/FileCopy';
import { withStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { NodeOption } from '../types';

interface NodeSelectorProps {
  id: string;
  properties: any; // Could be more specific if known
  isReference: boolean;
  setReference: (key: string | null) => void;
  update: (id: string, value: NodeOption | null) => void;
  title?: string;
  size?: 'small' | 'medium';
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
  return (
    (properties.categories && properties.categories.length > 0) ||
    (properties.ids && properties.ids.length > 0)
  );
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
function NodeSelector({
  id,
  properties,
  isReference,
  setReference,
  update,
  title,
  size,
  nameresCategoryFilter,
  options: nodeOptions = {},
}: NodeSelectorProps) {
  const {
    includeCuries = true,
    includeExistingNodes = true,
    existingNodes = [],
    includeCategories = true,
    clearable = true,
    includeSets = false,
  } = nodeOptions;
  const [loading, toggleLoading] = useState<boolean>(false);
  const [inputText, updateInputText] = useState<string>('');
  const [open, toggleOpen] = useState<boolean>(false);
  const [options, setOptions] = useState<NodeOption[]>([]);
  const { displayAlert } = useAlert();

  const cancelRef = useRef<CancelTokenSource | undefined>(undefined);
  const lastSearchRef = useRef<string>('');

  // @ts-ignore: context type is not strict
  const { concepts } = useContext(BiolinkContext) as { concepts: string[] };
  const searchTerm = useDebounce(inputText, 300) as string;
  const trimmedSearchTerm = useMemo(() => searchTerm.trim(), [searchTerm]);
  const loweredTrimmedSearchTerm = useMemo(
    () => trimmedSearchTerm.toLowerCase(),
    [trimmedSearchTerm]
  );

  // Memoize category filtering to avoid recalculation
  const filteredCategories = useMemo(() => {
    if (!includeCategories || !loweredTrimmedSearchTerm) return [];

    const matchesCategory = (category: string) => {
      const raw = category.toLowerCase();
      const display = strings.displayCategory(category).toLowerCase();
      return raw.includes(loweredTrimmedSearchTerm) || display.includes(loweredTrimmedSearchTerm);
    };

    const matchedCategories = concepts.filter(matchesCategory);

    if (includeSets) {
      return matchedCategories.flatMap((category: string) => [
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

    return matchedCategories.map((category: string) => ({
      categories: [category],
      name: strings.displayCategory(category),
    }));
  }, [concepts, loweredTrimmedSearchTerm, includeCategories, includeSets]);

  /**
   * Get dropdown options for node selector - optimized version
   */
  const getOptions = useCallback(async () => {
    if (lastSearchRef.current === trimmedSearchTerm) {
      return;
    }
    lastSearchRef.current = trimmedSearchTerm;

    toggleLoading(true);

    try {
      const newOptions: NodeOption[] = isReference ? [{ name: 'New Term', key: null }] : [];

      if (includeExistingNodes) {
        newOptions.push(...existingNodes);
      }

      newOptions.push(...filteredCategories);

      if (includeCuries && trimmedSearchTerm.length >= 3) {
        if (cancelRef.current) {
          cancelRef.current.cancel();
        }

        if (trimmedSearchTerm.includes(':')) {
          newOptions.push({ name: trimmedSearchTerm, ids: [trimmedSearchTerm] });
        }

        cancelRef.current = CancelToken.source();
        const curies: NodeOption[] = await fetchCuries(
          trimmedSearchTerm,
          displayAlert as (arg0: string, arg1: string) => void,
          cancelRef.current.token,
          nameresCategoryFilter
        );
        newOptions.push(...curies);
      }

      setOptions(newOptions);
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Error fetching options:', error);
      }
    } finally {
      toggleLoading(false);
    }
  }, [
    trimmedSearchTerm,
    isReference,
    includeExistingNodes,
    existingNodes,
    filteredCategories,
    includeCuries,
    displayAlert,
    nameresCategoryFilter,
  ]);

  /**
   * Get node options when dropdown opens or search term changes
   * after debounce - optimized version
   */
  useEffect(() => {
    if (open && trimmedSearchTerm.length >= 3) {
      getOptions();
    } else if (!open) {
      // Clear options when closed to free memory
      setOptions([]);
      lastSearchRef.current = '';
    }
  }, [open, trimmedSearchTerm, getOptions]);

  /**
   * Cancel any api calls on unmount
   */
  useEffect(() => {
    return () => {
      if (cancelRef.current) {
        cancelRef.current.cancel();
      }
    };
  }, []);

  /**
   * Create a human-readable label for every option - memoized
   * @param {object} opt - autocomplete option
   * @returns {string} Label to display
   */
  const getOptionLabel = useCallback((opt: NodeOption): string => {
    let label = '';
    if (opt.key) {
      label += `${opt.key}: `;
    }
    if (opt.name) {
      return label + opt.name;
    }
    if (opt.ids && Array.isArray(opt.ids) && opt.ids.length) {
      return label + opt.ids.join(', ');
    }
    if (opt.categories && Array.isArray(opt.categories)) {
      if (opt.categories.length) {
        return label + opt.categories.join(', ');
      }
      return `${label} Something`;
    }
    return '';
  }, []);

  /**
   * Update query graph based on option selected - memoized
   * @param {*} e - click event
   * @param {object|null} v - value of selected option
   */
  const handleUpdate = useCallback(
    (e: React.SyntheticEvent<Element, Event>, v: NodeOption | null) => {
      updateInputText('');
      if (v && 'key' in v) {
        setReference(v.key ?? null);
      } else {
        update(id, v);
      }
    },
    [setReference, update, id]
  );

  /**
   * Compute current value of selector - memoized
   */
  const selectorValue = useMemo(() => {
    if (isValidNode(properties)) {
      return properties;
    }
    return null;
  }, [properties]);

  const handleOpen = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();
    toggleOpen(true);
  }, []);

  const handleClose = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();
    toggleOpen(false);
  }, []);

  const handleInputChange = useCallback((_e: React.SyntheticEvent, v: string) => {
    updateInputText(v);
  }, []);

  const handleTextFieldClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleTextFieldFocus = useCallback(() => {
    highlighter.highlightGraphNode(id);
    highlighter.highlightTextEditorNode(id);
  }, [id]);

  const handleTextFieldBlur = useCallback(() => {
    highlighter.clearGraphNode(id);
    highlighter.clearTextEditorNode(id);
  }, [id]);

  return (
    <Autocomplete
      options={options}
      loading={loading}
      className={`textEditorSelector${isReference ? ' referenceNode' : ''} highlight-${id}`}
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
      onOpen={handleOpen}
      onClose={handleClose}
      onInputChange={handleInputChange}
      renderOption={(props, option: NodeOption, state: AutocompleteRenderOptionState) => (
        <Option {...option} {...props} />
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          className="nodeDropdown"
          label={title || id}
          margin="dense"
          onClick={handleTextFieldClick}
          onFocus={handleTextFieldFocus}
          onBlur={handleTextFieldBlur}
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
      size={size || 'medium'}
    />
  );
}

export default React.memo(NodeSelector);

const CustomTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    fontSize: theme.typography.pxToRem(14),
  },
}))(Tooltip);

interface OptionProps extends NodeOption {
  // MUI Autocomplete renderOption props
  [key: string]: any;
}

const Option = React.memo(function Option({ name, ids, categories, taxa, ...props }: OptionProps) {
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
});

interface CopyButtonProps {
  textToCopy: string;
}

const CopyButton = React.memo(function CopyButton({ textToCopy }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      navigator.clipboard.writeText(textToCopy);
      setHasCopied(true);
    },
    [textToCopy]
  );

  // Reset copied state after a short delay
  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  if (
    typeof navigator.clipboard === 'undefined' ||
    typeof navigator.clipboard.writeText !== 'function' ||
    typeof textToCopy !== 'string'
  ) {
    return null;
  }

  return (
    <IconButton color="inherit" size="small" onClick={handleCopy}>
      {hasCopied ? <Check /> : <FileCopy />}
    </IconButton>
  );
});
