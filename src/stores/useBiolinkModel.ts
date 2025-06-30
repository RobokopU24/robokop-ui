import { useState, useEffect, useCallback } from 'react';
import strings from '../utils/strings';
import getNodeCategoryColorMap from '../utils/colors';

const baseClass = 'biolink:NamedThing';

interface BiolinkClass {
  is_a?: string;
  description?: string;
  mixins?: string[];
  id_prefixes?: string[];
  exact_mappings?: string[];
  abstract?: boolean;
  mixin?: boolean;
  slot_usage?: {
    subject?: { range?: string };
    object?: { range?: string };
    predicate?: { subproperty_of?: string };
  };
  [k: string]: unknown;
}

interface BiolinkSlot {
  description?: string;
  is_a?: string;
  domain?: string;
  range?: string;
  symmetric?: boolean;
  abstract?: boolean;
  mixin?: boolean;
  mixins?: string[];
  [k: string]: unknown;
}

export interface BiolinkModel {
  id: string;
  name: string;
  description: string;
  license: string;
  version: string;

  classes: Record<string, BiolinkClass>;
  slots: Record<string, BiolinkSlot>;
  enums: Record<string, unknown>;
  prefixes: Record<string, string>;
  subsets: Record<string, unknown>;
  types: Record<string, unknown>;

  default_curi_maps: string[];
  default_prefix: string;
  default_range: string;
  emit_prefixes: string[];
  imports: string[];
}

const newClassNode = (name: string) => ({
  name,
  uuid: crypto.randomUUID(),
  parent: null,
  children: [],
  mixinParents: [],
  mixinChildren: [],
  abstract: false,
  mixin: false,
});

const newSlotNode = (name: string) => ({
  name,
  uuid: crypto.randomUUID(),
  parent: null,
  children: [],
  mixinParents: [],
  mixinChildren: [],
  abstract: false,
  mixin: false,
});

export default function useBiolinkModel() {
  const [biolinkModel, setBiolinkModel] = useState<BiolinkModel | null>(null);
  const [concepts, setConcepts] = useState<string[]>([]);
  const [hierarchies, setHierarchies] = useState<Record<string, string[]>>({});
  const [predicates, setPredicates] = useState<
    Array<{
      predicate: string;
      domain: string;
      range: string;
      symmetric: boolean;
    }>
  >([]);
  const [ancestorsMap, setAncestorsMap] = useState<Record<string, string[]>>({});
  const colorMap = useCallback(getNodeCategoryColorMap(hierarchies), [hierarchies]);

  const [model, setModel] = useState<any>(null);

  function checkIfDescendantOfRelatedTo([name, slot]: [string, BiolinkSlot]) {
    let currentName = name;
    let current = slot;
    while (current.is_a) {
      currentName = current.is_a;
      const currentSlot = biolinkModel?.slots[current.is_a];
      if (!currentSlot) break;
      current = currentSlot;
    }
    return currentName === 'related to';
  }

  /**
   * Get a list of all predicates in the biolink model
   * @returns {object[]} list of predicate objects
   */
  function getEdgePredicates() {
    if (!biolinkModel?.slots) return [];

    const newPredicates = Object.entries(biolinkModel.slots).filter(checkIfDescendantOfRelatedTo);
    // hard code in treats + parent, they're techincally not descendants of `related to`
    // TODO: we'll want the more correct parsing using mixins at some point
    const treatsSlot = biolinkModel.slots.treats;
    if (treatsSlot) {
      newPredicates.push(['treats', treatsSlot]);
    }

    const treatsOrAppliedSlot = biolinkModel.slots['treats or applied or studied to treat'];
    if (treatsOrAppliedSlot) {
      newPredicates.push(['treats or applied or studied to treat', treatsOrAppliedSlot]);
    }

    return newPredicates.map(([identifier, predicate]) => ({
      predicate: strings.edgeFromBiolink(identifier),
      domain: strings.nodeFromBiolink((predicate?.domain as string) || ''),
      range: strings.nodeFromBiolink((predicate?.range as string) || ''),
      symmetric: predicate?.symmetric || false,
    }));
  }

  /**
   * Given a biolink class name, return an array of all mixin
   * classes (and their ancestors)
   *
   * @param {string} className - a biolink class
   * @param {object} classes - object of all biolink classes
   * @returns {string[]}
   */
  function collectMixins(className: string, classes: Record<string, BiolinkClass>) {
    const collected: string[] = [];
    if (
      classes[className] &&
      classes[className].mixins &&
      Array.isArray(classes[className].mixins)
    ) {
      for (let i = 0; i < classes[className].mixins!.length; i += 1) {
        const mixin = classes[className].mixins![i];
        collected.push(mixin);
        if (classes[mixin]?.is_a) {
          collectMixins(classes[mixin].is_a!, classes);
        }
      }
    }
    return collected;
  }

  /**
   * Given a biolink class, build a list of parent classes
   * Ex: Given 'gene' as an input this function will return:
   *
   * [ "gene", "gene_or_gene_product", "macromolecular_machine",
   *   "genomic_entity", "molecular_entity", "biological_entity",
   *   "named_thing" ]
   *
   * @param {string} className - a biolink class
   * @param {object} biolinkClasses - object of all biolink classes
   * @returns {string[]} list of related biolink classes
   */
  function getAncestors(childClass: string, classes: Record<string, BiolinkClass>) {
    let currentClass = childClass;
    const ancestors: string[] = [];
    // Repeat until we hit the top of the classes
    while (classes[currentClass] && classes[currentClass].is_a) {
      // reassign current type to parent type
      currentClass = classes[currentClass].is_a!;
      ancestors.push(currentClass, ...collectMixins(currentClass, classes));
    }
    return ancestors;
  }

  /**
   * Get all descendants by getting direct descendants recursively
   * @param {string} parentClass - biolink class to get direct descendants of
   * @param {object} classes - object of all biolink classes
   * @returns {string[]} list of all descendants
   */
  function getDescendants(parentClass: string, classes: Record<string, BiolinkClass>) {
    let descendants: string[] = [];
    Object.keys(classes).forEach((key) => {
      if (classes[key].is_a === parentClass) {
        descendants.push(key);

        if (classes[key].mixins && Array.isArray(classes[key].mixins)) {
          for (let i = 0; i < classes[key].mixins!.length; i += 1) {
            const mixin = classes[key].mixins![i];
            descendants.push(mixin);
            if (classes[mixin]?.is_a) {
              collectMixins(classes[mixin].is_a!, classes);
            }
          }
        }

        // Repeat until we hit the bottom of the classes
        descendants = descendants.concat(getDescendants(key, classes));
      }
    });
    return descendants;
  }

  /**
   * Get a list of hierarchies for all biolink classes
   * @param {object} biolinkClasses - object of all biolink classes
   * @returns {object} Object with classes as keys and hierarchy lists as values
   */
  function getAllHierarchies(biolinkClasses: Record<string, BiolinkClass>) {
    const newHierarchies: Record<string, string[]> = {};
    Object.keys(biolinkClasses).forEach((item) => {
      let ancestors = getAncestors(item, biolinkClasses);
      ancestors = ancestors.map((h) => strings.nodeFromBiolink(h));
      let descendants = getDescendants(item, biolinkClasses);
      descendants = descendants.map((h) => strings.nodeFromBiolink(h));
      const thisClassAndMixins = [item, ...collectMixins(item, biolinkClasses)].map((h) =>
        strings.nodeFromBiolink(h)
      );
      newHierarchies[strings.nodeFromBiolink(item)] = [
        ...descendants,
        ...thisClassAndMixins,
        ...ancestors,
      ];
    });
    return newHierarchies;
  }

  /**
   * Get a list of ancestors for all biolink classes
   * @param {object} biolinkClasses - object of all biolink classes
   * @returns {object} Object with classes as keys and ancestor lists as values
   */
  function getAllAncestors(biolinkClasses: Record<string, BiolinkClass>) {
    const newAncestors: Record<string, string[]> = {};
    Object.keys(biolinkClasses).forEach((item) => {
      let ancestors = getAncestors(item, biolinkClasses);
      ancestors = ancestors.map((h) => strings.nodeFromBiolink(h));
      const thisClassAndMixins = [item, ...collectMixins(item, biolinkClasses)].map((h) =>
        strings.nodeFromBiolink(h)
      );
      newAncestors[strings.nodeFromBiolink(item)] = [...thisClassAndMixins, ...ancestors];
    });
    return newAncestors;
  }

  /**
   * Filter out concepts that are not derived classes of base class
   * @param {object} allHierarchies - object of all hierarchy lists
   * @returns {array} list of valid concepts
   */
  function getValidConcepts(allHierarchies: { [x: string]: string | string[] }) {
    const newConcepts = Object.keys(allHierarchies).filter((biolinkClass) =>
      allHierarchies[biolinkClass].includes(baseClass)
    );
    return newConcepts;
  }

  useEffect(() => {
    if (biolinkModel) {
      const biolinkClasses: Record<string, BiolinkClass> = {};
      Object.entries(biolinkModel.classes).forEach(([key, value]) => {
        biolinkClasses[key] = value;
      });

      const allHierarchies = getAllHierarchies(biolinkClasses);
      const allConcepts = getValidConcepts(allHierarchies);
      const allPredicates = getEdgePredicates();
      const allAncestors = getAllAncestors(biolinkClasses);
      setHierarchies(allHierarchies);
      setConcepts(allConcepts);
      setPredicates(allPredicates);
      setAncestorsMap(allAncestors);

      const slotRootItems: any[] = [];
      const slotLookup = new Map();
      for (const [name, slot] of Object.entries(biolinkModel.slots)) {
        if (!slotLookup.has(name)) {
          slotLookup.set(name, newSlotNode(name));
        }

        const thisNode = slotLookup.get(name);

        const parentName = slot.is_a ?? null;
        if (!parentName) {
          slotRootItems.push(thisNode);
        } else {
          if (!slotLookup.has(parentName)) {
            slotLookup.set(parentName, newSlotNode(parentName));
          }

          const parentNode = slotLookup.get(parentName);
          parentNode.children.push(thisNode);
          thisNode.parent = parentNode;
        }

        thisNode.abstract = slot.abstract ?? false;
        thisNode.mixin = slot.mixin ?? false;

        // this node has mixins parents
        const mixinNames = slot.mixins ?? null;
        if (mixinNames && Array.isArray(mixinNames)) {
          for (const mixinName of mixinNames) {
            if (!slotLookup.has(mixinName)) {
              slotLookup.set(mixinName, newSlotNode(mixinName));
            }

            const mixinNode = slotLookup.get(mixinName);
            mixinNode.mixinChildren.push(thisNode);
            thisNode.mixinParents.push(mixinNode);
          }
        }
      }

      const rootItems: any[] = [];
      const lookup = new Map();
      for (const [name, cls] of Object.entries(biolinkModel.classes)) {
        if (!lookup.has(name)) {
          lookup.set(name, newClassNode(name));
        }

        const thisNode = lookup.get(name);

        const parentName = cls.is_a ?? null;
        if (!parentName) {
          rootItems.push(thisNode);
        } else {
          if (!lookup.has(parentName)) {
            lookup.set(parentName, newClassNode(parentName));
          }

          const parentNode = lookup.get(parentName);
          parentNode.children.push(thisNode);
          thisNode.parent = parentNode;
        }

        thisNode.abstract = cls.abstract ?? false;
        thisNode.mixin = cls.mixin ?? false;

        if (cls.slot_usage) {
          thisNode.slotUsage = cls.slot_usage;

          thisNode.slotUsage.subject = cls.slot_usage.subject?.range
            ? lookup.get(cls.slot_usage.subject?.range)
            : undefined;

          thisNode.slotUsage.object = cls.slot_usage.object?.range
            ? lookup.get(cls.slot_usage.object?.range)
            : undefined;

          thisNode.slotUsage.predicate = cls.slot_usage.predicate?.subproperty_of
            ? slotLookup.get(cls.slot_usage.predicate?.subproperty_of)
            : undefined;
        }

        // this node has mixins parents
        const mixinNames = cls.mixins ?? null;
        if (mixinNames && Array.isArray(mixinNames)) {
          for (const mixinName of mixinNames) {
            if (!lookup.has(mixinName)) {
              lookup.set(mixinName, newClassNode(mixinName));
            }

            const mixinNode = lookup.get(mixinName);
            mixinNode.mixinChildren.push(thisNode);
            thisNode.mixinParents.push(mixinNode);
          }
        }
      }

      setModel({
        classes: {
          treeRootNodes: rootItems,
          lookup,
        },
        slots: {
          treeRootNodes: slotRootItems,
          lookup: slotLookup,
        },
        associations: lookup.get('association'),
        qualifiers: slotLookup.get('qualifier'),
        enums: biolinkModel.enums,
      });
    }
  }, [biolinkModel]);

  return {
    setBiolinkModel,
    model,
    concepts,
    hierarchies,
    predicates,
    ancestorsMap,
    colorMap,
  };
}
