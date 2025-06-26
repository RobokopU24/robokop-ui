interface Hierarchies {
  [category: string]: string[];
}

type Category = string;

type ConceptColorMap = { [category: string]: string };

const undefinedColor = '#FFEEA3';

const conceptColorMap: ConceptColorMap = {
  'biolink:AnatomicalEntity': '#e5d8bd', // Brown
  'biolink:BiologicalEntity': '#c1a25a', // Darker Brown
  'biolink:BiologicalProcess': '#b3cde3', // Blue
  'biolink:BiologicalProcessOrActivity': '#b3cde3', // same as biological_process
  'biolink:Cell': '#fddaec', // Pink
  'biolink:CellularComponent': '#ead6e0', // Gray-Pink
  'biolink:ChemicalSubstance': '#8787ff', // Blue
  'biolink:ChemicalExposure': '#126180', // Blue Sapphire
  'biolink:ChemicalEntity': '#8787ff', // Blue
  'biolink:Disease': '#fbb4ae', // Red
  'biolink:DiseaseOrPhenotypicFeature': '#fbb4ae', // Red, same as disease
  'biolink:Drug': '#8787ff', // Purply blue, same as chemical_substance
  'biolink:EnvironmentalFeature': '#8a9a5b', // Moss Green
  'biolink:Food': '#ffa343', // Neon Carrot
  'biolink:Gene': '#ccebc5', // Green
  'biolink:GeneFamily': '#68c357', // Darker Green
  'biolink:GeneticCondition': '#ffffcc', // Yellow
  'biolink:GrossAnatomicalStructure': '#f1ebe0', // Lighter brown to go with anatomical_entity
  'biolink:LifeStage': '#fe4164', // Neon Fuchsia
  'biolink:MolecularFunction': '#fed9a6', // Orange
  'biolink:MolecularEntity': '#a6a6d9', // Gray Purple
  'biolink:MolecularActivity': '#bae2d1', // Green Cyan
  'biolink:Metabolite': '#cad2b2', // Yellow Green
  'biolink:OrganismTaxon': '#00b7eb', // Cyan
  'biolink:Pathway': '#decbe4', // Purple
  'biolink:PhenotypicFeature': '#f56657', // Darker red, to go with disease
  'biolink:PopulationOfIndividualOrganisms': '#dde26a', // Bored Accent Green
  'biolink:Protein': '#ccebc5', // Green like gene
  'biolink:SequenceVariant': '#00c4e6', // Light teal
  // 'biolink:SmallMolecule': '#7b68ee', // Medium Slate Blue
};

export default function getNodeCategoryColorMap(hierarchies: Hierarchies) {
  return (categories: Category | Category[]): [Category | null, string] => {
    if (!categories || !Object.keys(hierarchies).length) {
      return [null, undefinedColor];
    }
    if (!Array.isArray(categories)) {
      categories = [categories]; // eslint-disable-line
    }
    // traverse up hierarchy until we find a category we have a color for
    let category: Category | undefined;
    (categories as Category[]).forEach((c) => {
      if (!category) {
        const hierarchy = hierarchies[c];
        if (hierarchy) {
          const index = hierarchy.indexOf(c);
          const parentCategories = hierarchy.slice(index);
          const bestKnownCategory = parentCategories.find((h) => h in conceptColorMap);
          if (bestKnownCategory !== undefined) {
            category = bestKnownCategory;
          }
        }
      }
    });
    if (category !== undefined) {
      return [category, conceptColorMap[category]];
    }

    // only if we have no predefined color in the hierarchy
    return [null, undefinedColor];
  };
}
