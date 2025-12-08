import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  size,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  useListNavigation,
  useTypeahead,
} from '@floating-ui/react';
import {
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  Divider,
  ListSubheader,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Fuse, { IFuseOptions } from 'fuse.js';
import fetchCuries from '../../../../utils/fetchCuries';
import { useAlert } from '../../../../components/AlertProvider';
import stringUtils from '../../../../utils/strings';
export interface AutocompleteOption<T = any> {
  value: T;
  label: string;
  subText?: string;
  disabled?: boolean;
  data?: any;
}

export interface AutocompleteGroup<T = any> {
  id: string;
  label: string;
  options: AutocompleteOption<T>[];
}

export interface DataSource<T = any> {
  id: string;
  label?: string;
  color?: string;
  sticky?: boolean;
  options?: AutocompleteOption<T>[];
  fetchOptions?: (query: string) => Promise<AutocompleteOption<T>[]>;
  isLoading?: boolean;
}

export interface AutocompleteProps<T = any> {
  value?: AutocompleteOption<T> | null;
  onChange?: (value: AutocompleteOption<T> | null) => void;
  dataSources: DataSource<T>[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  fullWidth?: boolean;
  clearable?: boolean;
  minQueryLength?: number; // Minimum characters before search starts
  debounceMs?: number;
  maxHeight?: number;
  loading?: boolean; 
  onInputChange?: (value: string) => void;
  renderOption?: (option: AutocompleteOption<T>, state: { selected: boolean; active: boolean }) => React.ReactNode;
  getOptionLabel?: (option: AutocompleteOption<T>) => string;
  getOptionDisabled?: (option: AutocompleteOption<T>) => boolean;
  noOptionsText?: string;
  loadingText?: string;
  fuseOptions?: IFuseOptions<AutocompleteOption<T>>; 
  highlightMatches?: boolean; 
  className?: string;
  onFocus?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  InputProps?: {
    classes?: {
      root?: string;
    };
  };
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  maxHeight: 'inherit',
  overflow: 'auto',
}));

const StyledListItem = styled(ListItemButton)(({ theme }) => ({
  padding: '6px 12px',
  '&.Mui-selected': {
    backgroundColor: theme.palette.action.selected,
  },
  '&.Mui-focusVisible, &.active': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

interface HighlightTextProps {
  text: string;
  query: string;
  component?: React.ElementType;
  highlightStyle?: React.CSSProperties;
}

const HighlightText: React.FC<HighlightTextProps> = ({ 
  text, 
  query, 
  component: Component = 'span',
  highlightStyle = { fontWeight: 600, backgroundColor: '#fff59d' }
}) => {
  if (!query) return <Component>{text}</Component>;
  
  const parts: Array<{ text: string; highlight: boolean }> = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  let lastIndex = 0;
  let index = lowerText.indexOf(lowerQuery, lastIndex);
  
  while (index !== -1) {
    if (index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, index), highlight: false });
    }
    parts.push({ text: text.slice(index, index + query.length), highlight: true });
    lastIndex = index + query.length;
    index = lowerText.indexOf(lowerQuery, lastIndex);
  }
  
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), highlight: false });
  }
  
  return (
    <Component>
      {parts.map((part, i) => (
        part.highlight ? (
          <Box component="span" key={i} sx={highlightStyle}>
            {part.text}
          </Box>
        ) : (
          <span key={i}>{part.text}</span>
        )
      ))}
    </Component>
  );
};

export function AsyncAutocomplete<T = any>({
  value,
  onChange,
  dataSources,
  placeholder = 'Search...',
  disabled = false,
  error = false,
  helperText,
  label,
  fullWidth = false,
  clearable = true,
  minQueryLength = 0,
  debounceMs = 300,
  maxHeight = 400,
  loading: externalLoading = false,
  onInputChange,
  renderOption,
  getOptionLabel = (option) => option.label,
  getOptionDisabled = (option) => option.disabled || false,
  noOptionsText = 'No options',
  loadingText = 'Loading...',
  fuseOptions,
  highlightMatches = true,
  className,
  onFocus,
  onBlur,
  InputProps,
}: AutocompleteProps<T>) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [sourceLoadingStates, setSourceLoadingStates] = useState<Record<string, boolean>>({});
  const [asyncResults, setAsyncResults] = useState<Record<string, AutocompleteOption<T>[]>>({});
  
  const listRef = useRef<Array<HTMLElement | null>>([]);
  const listContentRef = useRef<Array<string | null>>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        apply({ rects, elements, availableHeight }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${Math.min(maxHeight, availableHeight)}px`,
            width: `${rects.reference.width}px`,
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const optionsWithGroups = useMemo(() => {
    const result: Array<{
      type: 'header' | 'option';
      group?: DataSource<T>;
      option?: AutocompleteOption<T>;
      selectableIndex?: number;
    }> = [];
    
    let selectableIndex = 0;
    
    dataSources.forEach((source) => {
      let options: AutocompleteOption<T>[] = [];
      
      if (source.options) {
        if (inputValue && inputValue.length >= minQueryLength) {
          const defaultFuseOptions: IFuseOptions<AutocompleteOption<T>> = {
            keys: ['label', 'subText'],
            threshold: 0.3,
            includeScore: true,
            ignoreLocation: true,
          };
          
          const fuse = new Fuse(source.options, { ...defaultFuseOptions, ...fuseOptions });
          options = fuse.search(inputValue).map(result => result.item);
        } else {
          options = source.options;
        }
      } else {
        options = asyncResults[source.id] || [];
      }
      
      const hasOptions = options.length > 0;
      
      if (hasOptions && source.label) {
        result.push({ type: 'header', group: source });
      }
      
      options.forEach((option) => {
        const isDisabled = getOptionDisabled(option);
        result.push({ 
          type: 'option', 
          option, 
          selectableIndex: isDisabled ? undefined : selectableIndex
        });
        if (!isDisabled) {
          selectableIndex++;
        }
      });
    });
    
    return result;
  }, [dataSources, asyncResults, getOptionDisabled, inputValue, minQueryLength, fuseOptions]);

  const selectableOptions = useMemo(() => {
    return optionsWithGroups
      .filter((item) => item.type === 'option' && item.option && !getOptionDisabled(item.option))
      .map((item) => item.option!);
  }, [optionsWithGroups, getOptionDisabled]);

  useEffect(() => {
    listContentRef.current = selectableOptions.map((option) => getOptionLabel(option));
  }, [selectableOptions, getOptionLabel]);

  const role = useRole(context, { role: 'listbox' });
  const dismiss = useDismiss(context);

  const listNavigation = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    virtual: true,
    loop: true,
  });

  const typeahead = useTypeahead(context, {
    listRef: listContentRef,
    activeIndex,
    selectedIndex: activeIndex,
    onMatch: open ? setActiveIndex : undefined,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    role,
    dismiss,
    listNavigation,
    typeahead,
  ]);

  const fetchAsyncData = useCallback(async (query: string) => {
    const asyncSources = dataSources.filter((source) => source.fetchOptions);
    
    if (query.length < minQueryLength) {
      setAsyncResults({});
      setSourceLoadingStates({});
      return;
    }
    
    const loadingStates: Record<string, boolean> = {};
    asyncSources.forEach((source) => {
      loadingStates[source.id] = true;
    });
    setSourceLoadingStates(loadingStates);
    
    // Fetch data from all async sources
    const promises = asyncSources.map(async (source) => {
      try {
        const results = await source.fetchOptions!(query);
        return { id: source.id, results };
      } catch (error) {
        console.error(`Error fetching options for source ${source.id}:`, error);
        return { id: source.id, results: [] };
      }
    });
    
    const results = await Promise.all(promises);
    
    const newResults: Record<string, AutocompleteOption<T>[]> = {};
    const newLoadingStates: Record<string, boolean> = {};
    
    results.forEach(({ id, results }) => {
      newResults[id] = results;
      newLoadingStates[id] = false;
    });
    
    setAsyncResults(newResults);
    setSourceLoadingStates(newLoadingStates);
  }, [dataSources, minQueryLength]);

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    if (open && inputValue) {
      debounceTimerRef.current = setTimeout(() => {
        fetchAsyncData(inputValue);
      }, debounceMs);
    } else if (!inputValue) {
      setAsyncResults({});
      setSourceLoadingStates({});
    }
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue, open, fetchAsyncData, debounceMs]);

  useEffect(() => {
    if (open && selectableOptions.length > 0) {
      // Keep activeIndex within bounds
      if (activeIndex === null || activeIndex >= selectableOptions.length) {
        setActiveIndex(0);
      }
    } else if (!open) {
      setActiveIndex(null);
    }
  }, [selectableOptions.length, open]);

  useEffect(() => {
    if (activeIndex !== null && listRef.current[activeIndex]) {
      listRef.current[activeIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [activeIndex]);

  // Handle input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    onInputChange?.(newValue);
    
    if (value && newValue !== getOptionLabel(value)) {
      onChange?.(null);
    }
    
    if (!open && newValue) {
      setOpen(true);
    }
  };

  const handleOptionClick = (option: AutocompleteOption<T>, index: number) => {
    if (!getOptionDisabled(option)) {
      onChange?.(option);
      setInputValue(getOptionLabel(option));
      setOpen(false);
      setActiveIndex(null);
    }
  };

  const refProps = getReferenceProps();
  const interactionKeyDownHandler = refProps.onKeyDown as ((event: React.KeyboardEvent<HTMLDivElement>) => void) | undefined;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Allow text editing keys to pass through immediately
    if (event.key === 'Backspace' || event.key === 'Delete' || event.key.length === 1) {
      return;
    }
    
    if (event.key === 'Enter' && open && activeIndex !== null && selectableOptions[activeIndex]) {
      event.preventDefault();
      handleOptionClick(selectableOptions[activeIndex], activeIndex);
      return;
    }
    
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
      return;
    }
    
    // For arrow keys, let the interactions handle it
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!open) {
        setOpen(true);
      }
      if (interactionKeyDownHandler) {
        interactionKeyDownHandler(event);
      }
      return;
    }
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange?.(null);
    setInputValue('');
    onInputChange?.('');
    setAsyncResults({});
    setSourceLoadingStates({});
  };

  // Sync input value with prop value only when not actively editing
  useEffect(() => {
    if (!open) {
      if (value) {
        setInputValue(getOptionLabel(value));
      } else {
        setInputValue('');
      }
    }
  }, [value, open, getOptionLabel]);

  const isLoading = externalLoading || Object.values(sourceLoadingStates).some((loading) => loading);
  const hasOptions = selectableOptions.length > 0;

  return (
    <>
      <TextField
        ref={refs.setReference}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={(e) => {
          if (inputValue.length >= minQueryLength || (!inputValue && dataSources.some(s => s.options && s.options.length > 0))) {
            setOpen(true);
          }
          onFocus?.(e);
        }}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        helperText={helperText}
        label={label}
        fullWidth={fullWidth}
        size="small"
        className={className}
        InputProps={{
          classes: InputProps?.classes,
          endAdornment: (
            <InputAdornment position="end">
              {isLoading && <CircularProgress size={20} />}
              {clearable && inputValue && !disabled && (
                <IconButton size="small" onClick={handleClear} edge="end">
                  <ClearIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton
                size="small"
                edge="end"
                disabled={disabled}
                onClick={() => setOpen(!open)}
              >
                <ArrowDropDownIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      
      {open && (
        <FloatingPortal>
          <StyledPaper
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              zIndex: 9999,
              isolation: 'isolate',
            }}
            elevation={8}
            {...getFloatingProps()}
          >
              <List dense disablePadding sx={{ py: 0 }}>
                {optionsWithGroups.length === 0 && !isLoading && inputValue.length >= minQueryLength ? (
                  <ListItem>
                    <ListItemText 
                      primary={noOptionsText}
                      sx={{ textAlign: 'center', color: 'text.secondary' }}
                    />
                  </ListItem>
                ) : (
                  optionsWithGroups.map((item, visualIndex) => {
                    if (item.type === 'header') {
                      const baseColor = item.group!.color;
                      const hasColor = !!baseColor;
                      
                      return (
                        <ListSubheader
                          key={`header-${item.group!.id}`}
                          sx={{
                            position: item.group!.sticky ? 'sticky' : 'relative',
                            top: item.group!.sticky ? 0 : undefined,
                            zIndex: item.group!.sticky ? 1 : undefined,
                            backgroundColor: hasColor 
                              ? `color-mix(in oklch, ${baseColor} 8%, white)`
                              : 'rgb(250, 250, 250)',
                            backgroundImage: hasColor
                              ? `repeating-linear-gradient(45deg, transparent, transparent 8px, color-mix(in oklch, ${baseColor} 12%, white) 8px, color-mix(in oklch, ${baseColor} 12%, white) 16px)`
                              : 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(0, 0, 0, 0.015) 8px, rgba(0, 0, 0, 0.015) 16px)',
                            borderTop: '1px solid',
                            borderBottom: '1px solid',
                            borderColor: hasColor
                              ? `color-mix(in oklch, ${baseColor} 25%, white)`
                              : 'rgb(229, 229, 229)',
                            py: 0.75,
                            px: 1.5,
                            lineHeight: '1.2',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            color: hasColor
                              ? `color-mix(in oklch, ${baseColor} 65%, black)`
                              : 'rgba(0, 0, 0, 0.6)',
                          }}
                        >
                          {item.group!.label}
                        </ListSubheader>
                      );
                    }
                    
                    const option = item.option!;
                    const selectableIdx = item.selectableIndex;
                    const isSelected = value?.value === option.value;
                    const isActive = selectableIdx !== undefined && selectableIdx === activeIndex;
                    const isDisabled = getOptionDisabled(option);
                    
                    return (
                      <StyledListItem
                        key={`option-${visualIndex}-${option.value}`}
                        ref={(el) => {
                          // Only add selectable items to listRef for keyboard navigation
                          if (selectableIdx !== undefined) {
                            listRef.current[selectableIdx] = el;
                          }
                        }}
                        selected={isSelected}
                        disabled={isDisabled}
                        onClick={() => selectableIdx !== undefined && handleOptionClick(option, selectableIdx)}
                        className={isActive ? 'active' : ''}
                        tabIndex={-1}
                        role="option"
                        aria-selected={isActive}
                      >
                        {renderOption ? (
                          renderOption(option, { selected: isSelected, active: isActive })
                        ) : (
                          <ListItemText
                            primary={
                              highlightMatches ? (
                                <HighlightText 
                                  text={getOptionLabel(option)} 
                                  query={inputValue}
                                />
                              ) : (
                                getOptionLabel(option)
                              )
                            }
                            secondary={
                              option.subText ? (
                                highlightMatches ? (
                                  <HighlightText 
                                    text={option.subText} 
                                    query={inputValue}
                                  />
                                ) : (
                                  option.subText
                                )
                              ) : undefined
                            }
                            slotProps={{
                              primary: {
                                noWrap: true,
                                sx: { fontWeight: isSelected ? 600 : 400, fontSize: '0.875rem' },
                              },
                              secondary: {
                                noWrap: false,
                                variant: 'caption',
                                sx: { fontSize: '0.75rem', whiteSpace: 'normal', wordBreak: 'break-word' },
                              }
                            }}
                            sx={{ my: 0 }}
                          />
                        )}
                      </StyledListItem>
                    );
                  })
                )}
              </List>
            </StyledPaper>
        </FloatingPortal>
      )}
    </>
  );
}

const concepts = [
    "biolink:Attribute",
    "biolink:ChemicalRole",
    "biolink:BiologicalSex",
    "biolink:PhenotypicSex",
    "biolink:GenotypicSex",
    "biolink:SeverityValue",
    "biolink:Entity",
    "biolink:NamedThing",
    "biolink:OrganismTaxon",
    "biolink:Event",
    "biolink:AdministrativeEntity",
    "biolink:StudyResult",
    "biolink:Study",
    "biolink:StudyVariable",
    "biolink:CommonDataElement",
    "biolink:ConceptCountAnalysisResult",
    "biolink:ObservedExpectedFrequencyAnalysisResult",
    "biolink:RelativeFrequencyAnalysisResult",
    "biolink:TextMiningResult",
    "biolink:ChiSquaredAnalysisResult",
    "biolink:LogOddsAnalysisResult",
    "biolink:Agent",
    "biolink:InformationContentEntity",
    "biolink:Dataset",
    "biolink:DatasetDistribution",
    "biolink:DatasetVersion",
    "biolink:DatasetSummary",
    "biolink:ConfidenceLevel",
    "biolink:EvidenceType",
    "biolink:Publication",
    "biolink:Book",
    "biolink:BookChapter",
    "biolink:Serial",
    "biolink:Article",
    "biolink:JournalArticle",
    "biolink:Patent",
    "biolink:WebPage",
    "biolink:PreprintPublication",
    "biolink:DrugLabel",
    "biolink:RetrievalSource",
    "biolink:PhysicalEntity",
    "biolink:Activity",
    "biolink:Procedure",
    "biolink:Phenomenon",
    "biolink:Device",
    "biolink:DiagnosticAid",
    "biolink:StudyPopulation",
    "biolink:MaterialSample",
    "biolink:PlanetaryEntity",
    "biolink:EnvironmentalProcess",
    "biolink:EnvironmentalFeature",
    "biolink:GeographicLocation",
    "biolink:GeographicLocationAtTime",
    "biolink:BiologicalEntity",
    "biolink:MolecularEntity",
    "biolink:ChemicalEntity",
    "biolink:SmallMolecule",
    "biolink:ChemicalMixture",
    "biolink:NucleicAcidEntity",
    "biolink:RegulatoryRegion",
    "biolink:AccessibleDnaRegion",
    "biolink:TranscriptionFactorBindingSite",
    "biolink:MolecularMixture",
    "biolink:ComplexMolecularMixture",
    "biolink:BiologicalProcessOrActivity",
    "biolink:MolecularActivity",
    "biolink:BiologicalProcess",
    "biolink:Pathway",
    "biolink:PhysiologicalProcess",
    "biolink:Behavior",
    "biolink:ProcessedMaterial",
    "biolink:Drug",
    "biolink:EnvironmentalFoodContaminant",
    "biolink:FoodAdditive",
    "biolink:Food",
    "biolink:OrganismAttribute",
    "biolink:PhenotypicQuality",
    "biolink:GeneticInheritance",
    "biolink:OrganismalEntity",
    "biolink:Bacterium",
    "biolink:Virus",
    "biolink:CellularOrganism",
    "biolink:Mammal",
    "biolink:Human",
    "biolink:Plant",
    "biolink:Invertebrate",
    "biolink:Vertebrate",
    "biolink:Fungus",
    "biolink:LifeStage",
    "biolink:IndividualOrganism",
    "biolink:PopulationOfIndividualOrganisms",
    "biolink:DiseaseOrPhenotypicFeature",
    "biolink:Disease",
    "biolink:PhenotypicFeature",
    "biolink:BehavioralFeature",
    "biolink:AnatomicalEntity",
    "biolink:CellularComponent",
    "biolink:Cell",
    "biolink:CellLine",
    "biolink:GrossAnatomicalStructure",
    "biolink:Gene",
    "biolink:MacromolecularComplex",
    "biolink:NucleosomeModification",
    "biolink:Genome",
    "biolink:Exon",
    "biolink:Transcript",
    "biolink:CodingSequence",
    "biolink:Polypeptide",
    "biolink:Protein",
    "biolink:ProteinIsoform",
    "biolink:ProteinDomain",
    "biolink:PosttranslationalModification",
    "biolink:ProteinFamily",
    "biolink:NucleicAcidSequenceMotif",
    "biolink:RnaProduct",
    "biolink:RnaProductIsoform",
    "biolink:NoncodingRnaProduct",
    "biolink:MicroRna",
    "biolink:SiRna",
    "biolink:GeneFamily",
    "biolink:Zygosity",
    "biolink:Genotype",
    "biolink:Haplotype",
    "biolink:SequenceVariant",
    "biolink:Snv",
    "biolink:ReagentTargetedGene",
    "biolink:ClinicalAttribute",
    "biolink:ClinicalMeasurement",
    "biolink:ClinicalModifier",
    "biolink:ClinicalCourse",
    "biolink:Onset",
    "biolink:ClinicalEntity",
    "biolink:ClinicalTrial",
    "biolink:ClinicalIntervention",
    "biolink:ClinicalFinding",
    "biolink:Hospitalization",
    "biolink:SocioeconomicAttribute",
    "biolink:Case",
    "biolink:Cohort",
    "biolink:GenomicBackgroundExposure",
    "biolink:PathologicalProcess",
    "biolink:PathologicalProcessExposure",
    "biolink:PathologicalAnatomicalStructure",
    "biolink:PathologicalAnatomicalExposure",
    "biolink:DiseaseOrPhenotypicFeatureExposure",
    "biolink:ChemicalExposure",
    "biolink:ComplexChemicalExposure",
    "biolink:DrugExposure",
    "biolink:DrugToGeneInteractionExposure",
    "biolink:Treatment",
    "biolink:BioticExposure",
    "biolink:GeographicExposure",
    "biolink:EnvironmentalExposure",
    "biolink:BehavioralExposure",
    "biolink:SocioeconomicExposure"
].map((c) => stringUtils.displayCategory(c));

// Example usage with mock async functions
export const AutocompleteTest = () => {
  const { displayAlert } = useAlert();
  const [selected, setSelected] = useState<AutocompleteOption | null>(null);
  
  // Mock async function for products
  const searchProducts = async (query: string): Promise<AutocompleteOption[]> => {
    // Simulate slower API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const mockProducts = [
      { id: 1, name: 'Laptop', price: 999 },
      { id: 2, name: 'Mouse', price: 29 },
      { id: 3, name: 'Keyboard', price: 79 },
      { id: 4, name: 'Monitor', price: 299 },
    ];
    
    return mockProducts
      .filter(product => product.name.toLowerCase().includes(query.toLowerCase()))
      .map(product => ({
        value: product.id,
        label: product.name,
        subText: `$${product.price}`,
      }));
  };

  const searchNameRes = async (query: string): Promise<AutocompleteOption[]> => {
    const nameResResults = await fetchCuries(
      query,
      displayAlert as (arg0: string, arg1: string) => void,
      undefined,
      undefined
    );

    return nameResResults.map((result: any) => ({
      id: result.ids[0],
      label: result.name,
      value: result,
      subText: `${result.ids[0]}${result.taxa.length > 0 ? ` • Taxon: ${result.taxa.join(', ')}` : ''}`,
    }));
  }
  
  const dataSources: DataSource[] = [
    {
      id: 'nodes',
      label: 'Nodes',
      color: '#3b82f6', // Blue
      sticky: true,
      options: [
        { value: 'n0', label: 'n0' },
        { value: 'n1', label: 'n1' },
      ],
    },
    {
      id: 'static',
      label: 'Biolink Categories',
      color: '#a855f7',
      sticky: true,
      options: concepts.map((c) => ({
        label: c,
        value: c,
      })),
    },
    {
      id: 'nameResolver',
      label: 'Name Resolver',
      color: '#ff9c39',
      sticky: true,
      fetchOptions: searchNameRes,
    },
  ];
  
  return (
    <Box sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
      
      <AsyncAutocomplete
        value={selected}
        onChange={setSelected}
        dataSources={dataSources}
        label="n0"
        placeholder="Start typing to search..."
        fullWidth
        minQueryLength={1}
        debounceMs={300}
        clearable
      />
      
    </Box>
  );
};