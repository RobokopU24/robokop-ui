import React, { useEffect, useContext, useMemo } from 'react';
import axios, { CancelTokenSource } from 'axios';

import BiolinkContext from '../../../../context/biolink';
import strings from '../../../../utils/strings';

import fetchCuries from '../../../../utils/fetchCuries';
import highlighter from '../../../../utils/d3/highlighter';

import taxaCurieLookup from './taxon-curie-lookup.json';
import { useAlert } from '../../../../components/AlertProvider';
import { NodeOption } from '../types';
import {
  AsyncAutocomplete,
  AutocompleteOption,
  DataSource,
} from './AsyncAutocomplete';

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
export default function NodeSelector({
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
  const { displayAlert } = useAlert();
  // @ts-ignore: context type is not strict
  const { concepts } = useContext(BiolinkContext) as { concepts: string[] };

  /**
   * Create a human-readable label for every option
   * @param {object} opt - autocomplete option
   * @returns {string} Label to display
   */
  function getOptionLabel(opt: NodeOption): string {
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
  }

  /**
   * Convert NodeOption to AutocompleteOption
   */
  function nodeToAutocompleteOption(node: NodeOption): AutocompleteOption<NodeOption> {
    // Build subText: show ID and taxa name (if available)
    const subTextParts: string[] = [];

    if (node.ids && node.ids.length > 0) {
      subTextParts.push(node.ids[0]);
    }

    if (node.categories && node.categories.length > 0) {
      const category = node.categories[0].replace(/^biolink:/, '');
      subTextParts.push(category);
    }

    const taxaName = lookupTaxaName(node.taxa);
    if (taxaName) {
      subTextParts.push(taxaName);
    }

    return {
      value: node,
      label: getOptionLabel(node),
      subText: subTextParts.length > 0 ? subTextParts.join(' • ') : undefined,
      data: node,
    };
  }

  const dataSources = useMemo<DataSource<NodeOption>[]>(() => {
    const sources: DataSource<NodeOption>[] = [];

    // Add reference node option if needed
    if (isReference) {
      sources.push({
        id: 'reference',
        label: 'Reference',
        color: '#22c55e',
        sticky: true,
        options: [nodeToAutocompleteOption({ name: 'New Term', key: null })],
      });
    }

    // Add existing nodes
    if (includeExistingNodes && existingNodes.length > 0) {
      sources.push({
        id: 'existingNodes',
        label: 'Existing Nodes',
        color: '#3b82f6',
        sticky: true,
        options: existingNodes.map(nodeToAutocompleteOption),
      });
    }

    // Add categories
    if (includeCategories) {
      let categoryOptions: NodeOption[] = concepts.map((category: string) => ({
        categories: [category],
        name: strings.displayCategory(category),
      }));

      if (includeSets) {
        categoryOptions = concepts.flatMap((category: string) => [
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

      sources.push({
        id: 'categories',
        label: 'Categories',
        color: '#a855f7',
        sticky: true,
        options: categoryOptions.map(nodeToAutocompleteOption),
      });
    }

    // Add async name resolver curies
    if (includeCuries) {
      sources.push({
        id: 'curies',
        label: 'Name Resolver',
        color: '#ff9c39',
        sticky: true,
        fetchOptions: async (query: string) => {
          const results: NodeOption[] = [];
          if (query.includes(':')) {
            results.push({ name: query, ids: [query] });
          }

          if (cancel) {
            cancel.cancel();
          }
          cancel = CancelToken.source();
          const curies: NodeOption[] = await fetchCuries(
            query,
            displayAlert as (arg0: string, arg1: string) => void,
            cancel.token,
            nameresCategoryFilter
          );
          results.push(...curies);

          return results.map(nodeToAutocompleteOption);
        },
      });
    }

    return sources;
  }, [
    isReference,
    includeExistingNodes,
    existingNodes,
    includeCategories,
    concepts,
    includeSets,
    includeCuries,
    displayAlert,
    nameresCategoryFilter,
  ]);

  useEffect(
    () => () => {
      if (cancel) {
        cancel.cancel();
      }
    },
    []
  );

  function handleUpdate(option: AutocompleteOption<NodeOption> | null) {
    if (option && option.value && 'key' in option.value) {
      setReference(option.value.key ?? null);
    } else {
      update(id, option?.value ?? null);
    }
  }

  /**
   * Compute current value of selector
   */
  const selectorValue = useMemo<AutocompleteOption<NodeOption> | null>(() => {
    if (isValidNode(properties)) {
      return nodeToAutocompleteOption(properties);
    }
    return null;
  }, [properties]);

  return (
    <AsyncAutocomplete
      value={selectorValue}
      onChange={handleUpdate}
      dataSources={dataSources}
      label={title || id}
      placeholder="Search..."
      minQueryLength={3}
      debounceMs={500}
      clearable={clearable}
      className={`textEditorSelector${isReference ? ' referenceNode' : ''} highlight-${id}`}
      onFocus={() => {
        highlighter.highlightGraphNode(id);
        highlighter.highlightTextEditorNode(id);
      }}
      onBlur={() => {
        highlighter.clearGraphNode(id);
        highlighter.clearTextEditorNode(id);
      }}
      InputProps={{
        classes: {
          root: `nodeSelector nodeSelector-${id}`,
        },
      }}
      getOptionLabel={(option) => option.label}
    />
  );
}
