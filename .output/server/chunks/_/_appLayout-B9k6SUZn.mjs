import { jsx, jsxs } from 'react/jsx-runtime';
import { Outlet, useNavigate, Link } from '@tanstack/react-router';
import React, { useEffect, useState, useCallback } from 'react';
import { s as stringUtils } from './queryGraph-DEhAVldC.mjs';
import { B as BiolinkContext, A as API } from './biolink-BMtGoYHa.mjs';
import { A as AlertProvider, u as useAlert, r as routes } from './AlertProvider-wxvwEFCh.mjs';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ThemeProvider as ThemeProvider$1 } from '@mui/styles';
import { A as AuthProvider, u as useAuth } from './AuthContext-MCs-YjR3.mjs';
import { AppBar, Toolbar, IconButton, Avatar, Menu, MenuItem, Dialog, DialogTitle, DialogContent, Input, Button } from '@mui/material';
import FaGoogle from '@mui/icons-material/Google';
import FaGithub from '@mui/icons-material/GitHub';
import FaFingerprint from '@mui/icons-material/Fingerprint';
import axios from 'axios';
import { u as usePasskey } from './usePasskey-DKEsSi17.mjs';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Q as QueryBuilderProvider } from './queryBuilder-B0Yriqen.mjs';
import 'lodash/isString.js';
import 'lodash/transform.js';
import 'lodash/omitBy.js';
import 'lodash/pick.js';
import 'lodash/cloneDeep.js';
import 'lodash/startCase.js';
import 'lodash/camelCase.js';
import 'lodash/snakeCase.js';
import './baseUrlProxy-CL-Lrxdy.mjs';
import '@mui/material/Snackbar';
import '@mui/material/Alert';
import '@simplewebauthn/browser';

const undefinedColor = "#FFEEA3";
const conceptColorMap = {
  "biolink:AnatomicalEntity": "#e5d8bd",
  // Brown
  "biolink:BiologicalEntity": "#c1a25a",
  // Darker Brown
  "biolink:BiologicalProcess": "#b3cde3",
  // Blue
  "biolink:BiologicalProcessOrActivity": "#b3cde3",
  // same as biological_process
  "biolink:Cell": "#fddaec",
  // Pink
  "biolink:CellularComponent": "#ead6e0",
  // Gray-Pink
  "biolink:ChemicalSubstance": "#8787ff",
  // Blue
  "biolink:ChemicalExposure": "#126180",
  // Blue Sapphire
  "biolink:ChemicalEntity": "#8787ff",
  // Blue
  "biolink:Disease": "#fbb4ae",
  // Red
  "biolink:DiseaseOrPhenotypicFeature": "#fbb4ae",
  // Red, same as disease
  "biolink:Drug": "#8787ff",
  // Purply blue, same as chemical_substance
  "biolink:EnvironmentalFeature": "#8a9a5b",
  // Moss Green
  "biolink:Food": "#ffa343",
  // Neon Carrot
  "biolink:Gene": "#ccebc5",
  // Green
  "biolink:GeneFamily": "#68c357",
  // Darker Green
  "biolink:GeneticCondition": "#ffffcc",
  // Yellow
  "biolink:GrossAnatomicalStructure": "#f1ebe0",
  // Lighter brown to go with anatomical_entity
  "biolink:LifeStage": "#fe4164",
  // Neon Fuchsia
  "biolink:MolecularFunction": "#fed9a6",
  // Orange
  "biolink:MolecularEntity": "#a6a6d9",
  // Gray Purple
  "biolink:MolecularActivity": "#bae2d1",
  // Green Cyan
  "biolink:Metabolite": "#cad2b2",
  // Yellow Green
  "biolink:OrganismTaxon": "#00b7eb",
  // Cyan
  "biolink:Pathway": "#decbe4",
  // Purple
  "biolink:PhenotypicFeature": "#f56657",
  // Darker red, to go with disease
  "biolink:PopulationOfIndividualOrganisms": "#dde26a",
  // Bored Accent Green
  "biolink:Protein": "#ccebc5",
  // Green like gene
  "biolink:SequenceVariant": "#00c4e6"
  // Light teal
  // 'biolink:SmallMolecule': '#7b68ee', // Medium Slate Blue
};
function getNodeCategoryColorMap(hierarchies) {
  return (categories) => {
    if (!categories || !Object.keys(hierarchies).length) {
      return [null, undefinedColor];
    }
    if (!Array.isArray(categories)) {
      categories = [categories];
    }
    let category;
    categories.forEach((c) => {
      if (!category) {
        const hierarchy = hierarchies[c];
        if (hierarchy) {
          const index = hierarchy.indexOf(c);
          const parentCategories = hierarchy.slice(index);
          const bestKnownCategory = parentCategories.find((h) => h in conceptColorMap);
          if (bestKnownCategory !== void 0) {
            category = bestKnownCategory;
          }
        }
      }
    });
    if (category !== void 0) {
      return [category, conceptColorMap[category]];
    }
    return [null, undefinedColor];
  };
}
const baseClass = "biolink:NamedThing";
const newClassNode = (name) => ({
  name,
  uuid: crypto.randomUUID(),
  parent: null,
  children: [],
  mixinParents: [],
  mixinChildren: [],
  abstract: false,
  mixin: false
});
const newSlotNode = (name) => ({
  name,
  uuid: crypto.randomUUID(),
  parent: null,
  children: [],
  mixinParents: [],
  mixinChildren: [],
  abstract: false,
  mixin: false
});
function useBiolinkModel() {
  const [biolinkModel, setBiolinkModel] = useState(null);
  const [concepts, setConcepts] = useState([]);
  const [hierarchies, setHierarchies] = useState({});
  const [predicates, setPredicates] = useState([]);
  const [ancestorsMap, setAncestorsMap] = useState({});
  const colorMap = useCallback(getNodeCategoryColorMap(hierarchies), [hierarchies]);
  const [model, setModel] = useState(null);
  function checkIfDescendantOfRelatedTo([name, slot]) {
    let currentName = name;
    let current = slot;
    while (current.is_a) {
      currentName = current.is_a;
      const currentSlot = biolinkModel == null ? void 0 : biolinkModel.slots[current.is_a];
      if (!currentSlot) break;
      current = currentSlot;
    }
    return currentName === "related to";
  }
  function getEdgePredicates() {
    if (!(biolinkModel == null ? void 0 : biolinkModel.slots)) return [];
    const newPredicates = Object.entries(biolinkModel.slots).filter(checkIfDescendantOfRelatedTo);
    const treatsSlot = biolinkModel.slots.treats;
    if (treatsSlot) {
      newPredicates.push(["treats", treatsSlot]);
    }
    const treatsOrAppliedSlot = biolinkModel.slots["treats or applied or studied to treat"];
    if (treatsOrAppliedSlot) {
      newPredicates.push(["treats or applied or studied to treat", treatsOrAppliedSlot]);
    }
    return newPredicates.map(([identifier, predicate]) => ({
      predicate: stringUtils.edgeFromBiolink(identifier),
      domain: stringUtils.nodeFromBiolink((predicate == null ? void 0 : predicate.domain) || ""),
      range: stringUtils.nodeFromBiolink((predicate == null ? void 0 : predicate.range) || ""),
      symmetric: (predicate == null ? void 0 : predicate.symmetric) || false
    }));
  }
  function collectMixins(className, classes) {
    var _a;
    const collected = [];
    if (classes[className] && classes[className].mixins && Array.isArray(classes[className].mixins)) {
      for (let i = 0; i < classes[className].mixins.length; i += 1) {
        const mixin = classes[className].mixins[i];
        collected.push(mixin);
        if ((_a = classes[mixin]) == null ? void 0 : _a.is_a) {
          collectMixins(classes[mixin].is_a, classes);
        }
      }
    }
    return collected;
  }
  function getAncestors(childClass, classes) {
    let currentClass = childClass;
    const ancestors = [];
    while (classes[currentClass] && classes[currentClass].is_a) {
      currentClass = classes[currentClass].is_a;
      ancestors.push(currentClass, ...collectMixins(currentClass, classes));
    }
    return ancestors;
  }
  function getDescendants(parentClass, classes) {
    let descendants = [];
    Object.keys(classes).forEach((key) => {
      var _a;
      if (classes[key].is_a === parentClass) {
        descendants.push(key);
        if (classes[key].mixins && Array.isArray(classes[key].mixins)) {
          for (let i = 0; i < classes[key].mixins.length; i += 1) {
            const mixin = classes[key].mixins[i];
            descendants.push(mixin);
            if ((_a = classes[mixin]) == null ? void 0 : _a.is_a) {
              collectMixins(classes[mixin].is_a, classes);
            }
          }
        }
        descendants = descendants.concat(getDescendants(key, classes));
      }
    });
    return descendants;
  }
  function getAllHierarchies(biolinkClasses) {
    const newHierarchies = {};
    Object.keys(biolinkClasses).forEach((item) => {
      let ancestors = getAncestors(item, biolinkClasses);
      ancestors = ancestors.map((h) => stringUtils.nodeFromBiolink(h));
      let descendants = getDescendants(item, biolinkClasses);
      descendants = descendants.map((h) => stringUtils.nodeFromBiolink(h));
      const thisClassAndMixins = [item, ...collectMixins(item, biolinkClasses)].map(
        (h) => stringUtils.nodeFromBiolink(h)
      );
      newHierarchies[stringUtils.nodeFromBiolink(item)] = [
        ...descendants,
        ...thisClassAndMixins,
        ...ancestors
      ];
    });
    return newHierarchies;
  }
  function getAllAncestors(biolinkClasses) {
    const newAncestors = {};
    Object.keys(biolinkClasses).forEach((item) => {
      let ancestors = getAncestors(item, biolinkClasses);
      ancestors = ancestors.map((h) => stringUtils.nodeFromBiolink(h));
      const thisClassAndMixins = [item, ...collectMixins(item, biolinkClasses)].map(
        (h) => stringUtils.nodeFromBiolink(h)
      );
      newAncestors[stringUtils.nodeFromBiolink(item)] = [...thisClassAndMixins, ...ancestors];
    });
    return newAncestors;
  }
  function getValidConcepts(allHierarchies) {
    const newConcepts = Object.keys(allHierarchies).filter(
      (biolinkClass) => allHierarchies[biolinkClass].includes(baseClass)
    );
    return newConcepts;
  }
  useEffect(() => {
    var _a2, _b2, _c2, _d2, _e2, _f2, _g, _h;
    var _a, _b, _c, _d, _e, _f;
    if (biolinkModel) {
      const biolinkClasses = {};
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
      const slotRootItems = [];
      const slotLookup = /* @__PURE__ */ new Map();
      for (const [name, slot] of Object.entries(biolinkModel.slots)) {
        if (!slotLookup.has(name)) {
          slotLookup.set(name, newSlotNode(name));
        }
        const thisNode = slotLookup.get(name);
        const parentName = (_a2 = slot.is_a) != null ? _a2 : null;
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
        thisNode.abstract = (_b2 = slot.abstract) != null ? _b2 : false;
        thisNode.mixin = (_c2 = slot.mixin) != null ? _c2 : false;
        const mixinNames = (_d2 = slot.mixins) != null ? _d2 : null;
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
      const rootItems = [];
      const lookup = /* @__PURE__ */ new Map();
      for (const [name, cls] of Object.entries(biolinkModel.classes)) {
        if (!lookup.has(name)) {
          lookup.set(name, newClassNode(name));
        }
        const thisNode = lookup.get(name);
        const parentName = (_e2 = cls.is_a) != null ? _e2 : null;
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
        thisNode.abstract = (_f2 = cls.abstract) != null ? _f2 : false;
        thisNode.mixin = (_g = cls.mixin) != null ? _g : false;
        if (cls.slot_usage) {
          thisNode.slotUsage = cls.slot_usage;
          thisNode.slotUsage.subject = ((_a = cls.slot_usage.subject) == null ? void 0 : _a.range) ? lookup.get((_b = cls.slot_usage.subject) == null ? void 0 : _b.range) : void 0;
          thisNode.slotUsage.object = ((_c = cls.slot_usage.object) == null ? void 0 : _c.range) ? lookup.get((_d = cls.slot_usage.object) == null ? void 0 : _d.range) : void 0;
          thisNode.slotUsage.predicate = ((_e = cls.slot_usage.predicate) == null ? void 0 : _e.subproperty_of) ? slotLookup.get((_f = cls.slot_usage.predicate) == null ? void 0 : _f.subproperty_of) : void 0;
        }
        const mixinNames = (_h = cls.mixins) != null ? _h : null;
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
          lookup
        },
        slots: {
          treeRootNodes: slotRootItems,
          lookup: slotLookup
        },
        associations: lookup.get("association"),
        qualifiers: slotLookup.get("qualifier"),
        enums: biolinkModel.enums
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
    colorMap
  };
}
const theme = createTheme({
  typography: {
    fontSize: 14
  }
});
const RobokopLogo = (props) => /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 455 76", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M4.896 75.0003C3.488 75.0003 2.304 74.5523 1.344 73.6563C0.448 72.6963 0 71.5123 0 70.1043V4.92029C0 3.44829 0.448 2.26429 1.344 1.36829C2.304 0.472292 3.488 0.024292 4.896 0.024292H22.272C27.008 0.024292 31.232 1.04829 34.944 3.09629C38.656 5.08029 41.536 7.83229 43.584 11.3523C45.696 14.8723 46.752 18.9683 46.752 23.6403C46.752 27.9923 45.696 31.8643 43.584 35.2563C41.536 38.6483 38.656 41.3043 34.944 43.2243C31.232 45.1443 27.008 46.1043 22.272 46.1043H9.792V70.1043C9.792 71.5123 9.344 72.6963 8.448 73.6563C7.552 74.5523 6.368 75.0003 4.896 75.0003ZM44.736 75.0003C43.84 75.0003 43.04 74.8083 42.336 74.4243C41.632 74.0403 41.024 73.4323 40.512 72.6003L23.136 44.6643L32.64 41.9763L48.576 67.5123C49.664 69.3043 49.792 71.0003 48.96 72.6003C48.192 74.2003 46.784 75.0003 44.736 75.0003ZM9.792 36.9843H22.272C25.216 36.9843 27.808 36.4403 30.048 35.3523C32.352 34.2003 34.144 32.6003 35.424 30.5523C36.704 28.5043 37.344 26.2003 37.344 23.6403C37.344 20.7603 36.704 18.2323 35.424 16.0563C34.144 13.8803 32.352 12.1843 30.048 10.9683C27.808 9.68829 25.216 9.04829 22.272 9.04829H9.792V36.9843Z",
        fill: "black"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M411.224 75.0003C409.816 75.0003 408.632 74.5523 407.672 73.6563C406.776 72.6963 406.328 71.5123 406.328 70.1043V4.92029C406.328 3.51229 406.776 2.36029 407.672 1.46429C408.632 0.504292 409.816 0.024292 411.224 0.024292H430.424C435.224 0.024292 439.48 1.08029 443.192 3.19229C446.904 5.30429 449.784 8.21629 451.832 11.9283C453.944 15.6403 455 19.9603 455 24.8883C455 29.5603 453.944 33.7203 451.832 37.3683C449.784 41.0163 446.904 43.8643 443.192 45.9123C439.48 47.9603 435.224 48.9843 430.424 48.9843H416.12V70.1043C416.12 71.5123 415.64 72.6963 414.68 73.6563C413.784 74.5523 412.632 75.0003 411.224 75.0003ZM416.12 39.8643H430.424C433.368 39.8643 435.96 39.2243 438.2 37.9443C440.504 36.6643 442.296 34.9043 443.576 32.6643C444.92 30.3603 445.592 27.7683 445.592 24.8883C445.592 21.7523 444.952 19.0323 443.672 16.7283C442.392 14.3603 440.6 12.5043 438.296 11.1603C435.992 9.75229 433.368 9.04829 430.424 9.04829H416.12V39.8643Z",
        fill: "black"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M137.896 75.0003C136.552 75.0003 135.4 74.5523 134.44 73.6563C133.48 72.6963 133 71.5123 133 70.1043V4.92029C133 3.44829 133.448 2.26429 134.344 1.36829C135.304 0.472292 136.488 0.024292 137.896 0.024292H160.84C165.192 0.024292 169 0.888292 172.264 2.61629C175.528 4.28029 178.088 6.61629 179.944 9.62429C181.864 12.5683 182.824 15.9923 182.824 19.8963C182.824 23.0963 181.96 25.9763 180.232 28.5363C178.568 31.0323 176.264 33.0163 173.32 34.4883C177.544 35.5123 180.936 37.5283 183.496 40.5363C186.056 43.5443 187.336 47.4803 187.336 52.3443C187.336 56.7603 186.28 60.6643 184.168 64.0563C182.12 67.4483 179.24 70.1363 175.528 72.1203C171.88 74.0403 167.656 75.0003 162.856 75.0003H137.896ZM142.792 65.9763H162.856C165.8 65.9763 168.392 65.4643 170.632 64.4403C172.872 63.3523 174.632 61.8163 175.912 59.8323C177.256 57.8483 177.928 55.3523 177.928 52.3443C177.928 49.5923 177.256 47.3203 175.912 45.5283C174.632 43.6723 172.872 42.2963 170.632 41.4003C168.392 40.4403 165.8 39.9603 162.856 39.9603H142.792V65.9763ZM142.792 30.8403H160.84C164.552 30.8403 167.56 29.9443 169.864 28.1523C172.232 26.2963 173.416 23.5443 173.416 19.8963C173.416 16.2483 172.232 13.5283 169.864 11.7363C167.56 9.94429 164.552 9.04829 160.84 9.04829H142.792V30.8403Z",
        fill: "black"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M101.345 58.662C104.251 54.1542 106 46.9778 106 37.564C106 28.3613 104.079 21.1548 101.041 16.5739C98.3265 12.4806 94.5283 10.064 88.5 10.064C82.4717 10.064 78.6735 12.4806 75.9591 16.5739C72.9215 21.1548 71 28.3613 71 37.564C71 46.9778 72.7487 54.1542 75.6548 58.662C78.1547 62.5397 81.8351 65.064 88.5 65.064C95.1649 65.064 98.8453 62.5397 101.345 58.662ZM88.5 75.064C108.5 75.064 116 58.2746 116 37.564C116 16.8533 107.5 0.0639648 88.5 0.0639648C69.5 0.0639648 61 16.8533 61 37.564C61 58.2746 68.5 75.064 88.5 75.064Z",
        fill: "black"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M239.845 58.662C242.751 54.1542 244.5 46.9778 244.5 37.564C244.5 28.3613 242.579 21.1548 239.541 16.5739C236.826 12.4806 233.028 10.064 227 10.064C220.972 10.064 217.174 12.4806 214.459 16.5739C211.421 21.1548 209.5 28.3613 209.5 37.564C209.5 46.9778 211.249 54.1542 214.155 58.662C216.655 62.5397 220.335 65.064 227 65.064C233.665 65.064 237.345 62.5397 239.845 58.662ZM227 75.064C247 75.064 254.5 58.2746 254.5 37.564C254.5 16.8533 246 0.0639648 227 0.0639648C208 0.0639648 199.5 16.8533 199.5 37.564C199.5 58.2746 207 75.064 227 75.064Z",
        fill: "black"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M375.845 58.662C378.751 54.1542 380.5 46.9778 380.5 37.564C380.5 28.3613 378.579 21.1548 375.541 16.5739C372.826 12.4806 369.028 10.064 363 10.064C356.972 10.064 353.174 12.4806 350.459 16.5739C347.421 21.1548 345.5 28.3613 345.5 37.564C345.5 46.9778 347.249 54.1542 350.155 58.662C352.655 62.5397 356.335 65.064 363 65.064C369.665 65.064 373.345 62.5397 375.845 58.662ZM363 75.064C383 75.064 390.5 58.2746 390.5 37.564C390.5 16.8533 382 0.0639648 363 0.0639648C344 0.0639648 335.5 16.8533 335.5 37.564C335.5 58.2746 343 75.064 363 75.064Z",
        fill: "black"
      }
    )
  ] }),
  /* @__PURE__ */ jsx(
    "path",
    {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M280.993 15.1381C280.993 14.366 281.453 13.6821 282.082 13.2353C283.943 11.9149 285.158 9.7431 285.158 7.28767C285.158 3.2628 281.895 0 277.87 0C273.845 0 270.582 3.2628 270.582 7.28767C270.582 9.74314 271.797 11.915 273.658 13.2353C274.287 13.6821 274.747 14.3661 274.747 15.1382V28.2695C274.747 29.1171 274.201 29.8545 273.454 30.2545C270.506 31.8329 268.5 34.9425 268.5 38.5206C268.5 42.0987 270.506 45.2083 273.454 46.7867C274.201 47.1867 274.747 47.9241 274.747 48.7717V60.8619C274.747 61.634 274.287 62.3179 273.658 62.7647C271.797 64.0851 270.582 66.2569 270.582 68.7124C270.582 72.7372 273.845 76 277.87 76C281.895 76 285.158 72.7372 285.158 68.7124C285.158 66.2569 283.943 64.0851 282.082 62.7648C281.453 62.318 280.993 61.634 280.993 60.8619V48.5271C280.993 47.826 281.447 47.2119 282.073 46.897V46.897C282.7 46.5818 283.456 46.5906 284.018 47.0104L310.31 66.6467C310.919 67.1015 311.195 67.863 311.185 68.623C311.185 68.6528 311.185 68.6825 311.185 68.7124C311.185 72.7372 314.448 76 318.473 76C322.497 76 325.76 72.7372 325.76 68.7124C325.76 64.6875 322.497 61.4247 318.473 61.4247C317.657 61.4247 316.872 61.5587 316.14 61.8059C315.397 62.0569 314.558 62.0228 313.93 61.5532L287.952 42.152C287.273 41.6449 287.008 40.7671 287.135 39.9291C287.204 39.4697 287.24 38.9993 287.24 38.5206C287.24 37.9961 287.197 37.4816 287.114 36.9806C286.976 36.1444 287.227 35.2628 287.899 34.7461L314.153 14.5509C314.766 14.0795 315.589 14.0275 316.328 14.2547C317.006 14.4631 317.726 14.5753 318.473 14.5753C322.497 14.5753 325.76 11.3125 325.76 7.28767C325.76 3.2628 322.497 0 318.473 0C314.448 0 311.185 3.2628 311.185 7.28767C311.185 7.38403 311.187 7.47996 311.191 7.57541C311.22 8.34669 310.958 9.12748 310.346 9.59809L283.844 29.9848C283.319 30.3882 282.607 30.4073 282.013 30.1143V30.1143C281.42 29.8215 280.993 29.2419 280.993 28.5807V15.1381Z",
      fill: "url(#paint0_radial_188_15)"
    }
  ),
  /* @__PURE__ */ jsx(
    "path",
    {
      d: "M287.24 38.5206C287.24 43.6955 283.045 47.8905 277.87 47.8905C272.695 47.8905 268.5 43.6955 268.5 38.5206C268.5 33.3458 272.695 29.1508 277.87 29.1508C283.045 29.1508 287.24 33.3458 287.24 38.5206Z",
      fill: "url(#paint1_radial_188_15)"
    }
  ),
  /* @__PURE__ */ jsx(
    "path",
    {
      d: "M325.76 68.7124C325.76 72.7372 322.498 76 318.473 76C314.448 76 311.185 72.7372 311.185 68.7124C311.185 64.6875 314.448 61.4247 318.473 61.4247C322.498 61.4247 325.76 64.6875 325.76 68.7124Z",
      fill: "url(#paint2_radial_188_15)"
    }
  ),
  /* @__PURE__ */ jsx(
    "path",
    {
      d: "M285.158 68.7124C285.158 72.7372 281.895 76 277.87 76C273.845 76 270.582 72.7372 270.582 68.7124C270.582 64.6875 273.845 61.4247 277.87 61.4247C281.895 61.4247 285.158 64.6875 285.158 68.7124Z",
      fill: "url(#paint3_radial_188_15)"
    }
  ),
  /* @__PURE__ */ jsx(
    "path",
    {
      d: "M325.76 7.28767C325.76 11.3125 322.498 14.5753 318.473 14.5753C314.448 14.5753 311.185 11.3125 311.185 7.28767C311.185 3.2628 314.448 0 318.473 0C322.498 0 325.76 3.2628 325.76 7.28767Z",
      fill: "url(#paint4_radial_188_15)"
    }
  ),
  /* @__PURE__ */ jsx(
    "path",
    {
      d: "M285.158 7.28767C285.158 11.3125 281.895 14.5753 277.87 14.5753C273.845 14.5753 270.582 11.3125 270.582 7.28767C270.582 3.2628 273.845 0 277.87 0C281.895 0 285.158 3.2628 285.158 7.28767Z",
      fill: "url(#paint5_radial_188_15)"
    }
  ),
  /* @__PURE__ */ jsxs("defs", { children: [
    /* @__PURE__ */ jsxs(
      "radialGradient",
      {
        id: "paint0_radial_188_15",
        cx: "0",
        cy: "0",
        r: "1",
        gradientUnits: "userSpaceOnUse",
        gradientTransform: "translate(274.226 34.3562) rotate(37.8328) scale(61.954 60.8288)",
        children: [
          /* @__PURE__ */ jsx("stop", { stopColor: "#B1EBFE" }),
          /* @__PURE__ */ jsx("stop", { offset: "0.0933733", stopColor: "#24CAFF" }),
          /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#8D47FF" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "radialGradient",
      {
        id: "paint1_radial_188_15",
        cx: "0",
        cy: "0",
        r: "1",
        gradientUnits: "userSpaceOnUse",
        gradientTransform: "translate(273.074 33.9134) rotate(45.4122) scale(15.5833)",
        children: [
          /* @__PURE__ */ jsx("stop", { stopColor: "#A2D3E2" }),
          /* @__PURE__ */ jsx("stop", { offset: "0.182292", stopColor: "#1CC2F5" }),
          /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#2894F8" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "radialGradient",
      {
        id: "paint2_radial_188_15",
        cx: "0",
        cy: "0",
        r: "1",
        gradientUnits: "userSpaceOnUse",
        gradientTransform: "translate(314.512 65.148) rotate(44.4069) scale(12.655)",
        children: [
          /* @__PURE__ */ jsx("stop", { stopColor: "#8E86DF" }),
          /* @__PURE__ */ jsx("stop", { offset: "0.208333", stopColor: "#6152F3" }),
          /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#A05CF8" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "radialGradient",
      {
        id: "paint3_radial_188_15",
        cx: "0",
        cy: "0",
        r: "1",
        gradientUnits: "userSpaceOnUse",
        gradientTransform: "translate(273.884 65.0012) rotate(46.9946) scale(12.5967)",
        children: [
          /* @__PURE__ */ jsx("stop", { stopColor: "#93B5E3" }),
          /* @__PURE__ */ jsx("stop", { offset: "0.176926", stopColor: "#428FF7" }),
          /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#3D79EF" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "radialGradient",
      {
        id: "paint4_radial_188_15",
        cx: "0",
        cy: "0",
        r: "1",
        gradientUnits: "userSpaceOnUse",
        gradientTransform: "translate(314.593 3.84501) rotate(44.029) scale(12.431)",
        children: [
          /* @__PURE__ */ jsx("stop", { stopColor: "#9797EB" }),
          /* @__PURE__ */ jsx("stop", { offset: "0.192708", stopColor: "#585AFA" }),
          /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#8359FB" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "radialGradient",
      {
        id: "paint5_radial_188_15",
        cx: "0",
        cy: "0",
        r: "1",
        gradientUnits: "userSpaceOnUse",
        gradientTransform: "translate(273.945 3.12669) rotate(44.6968) scale(12.78)",
        children: [
          /* @__PURE__ */ jsx("stop", { stopColor: "#9ED3FF" }),
          /* @__PURE__ */ jsx("stop", { offset: "0.196764", stopColor: "#44A9FF" }),
          /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#228FE7" })
        ]
      }
    )
  ] })
] });
console.log(void 0, "VITE_DEPLOYMENT");
const Logo = RobokopLogo;
function LoginDialog({ open, onClose }) {
  const { displayAlert } = useAlert();
  const [email, setEmail] = React.useState("");
  const { login } = useAuth();
  const { loginWithPasskey, browserSupport } = usePasskey();
  const handlePasskeyLogin = async () => {
    try {
      const response = await loginWithPasskey();
      login(response.user, response.token);
      onClose();
    } catch (err) {
      console.error("Passkey login error:", err);
      displayAlert(
        "error",
        "Unable to login with passkey or no passkey registered. Please try again later. Please continue with another login method."
      );
    }
  };
  const handleGoogleLogin = () => {
    window.location.href = routes.authRoutes.google;
  };
  const handleGithubLogin = () => {
    window.location.href = routes.authRoutes.github;
  };
  const handleMagicLinkLogin = () => {
    axios.post(routes.authRoutes.magicLink, {
      email: email.trim()
    }).then((response) => {
      displayAlert(
        "success",
        response.data.message || "Login link sent to your email. Please check your inbox."
      );
      setEmail("");
      onClose();
    }).catch((error) => {
      displayAlert(
        "error",
        error.error || error.message || "Failed to send magic link. Please try again."
      );
    });
  };
  return /* @__PURE__ */ jsxs(Dialog, { open, onClose, maxWidth: "xs", fullWidth: true, children: [
    /* @__PURE__ */ jsx(DialogTitle, { children: /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        },
        children: [
          /* @__PURE__ */ jsx("p", { style: { margin: 0 }, children: "Login" }),
          /* @__PURE__ */ jsx(IconButton, { style: { fontSize: "18px" }, title: "Close", onClick: onClose, children: /* @__PURE__ */ jsx(CloseIcon, {}) })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(DialogContent, { children: /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          padding: "1rem 0"
        },
        children: [
          /* @__PURE__ */ jsx(
            Input,
            {
              placeholder: "Email",
              type: "email",
              fullWidth: true,
              required: true,
              value: email,
              onChange: (e) => setEmail(e.target.value)
            }
          ),
          /* @__PURE__ */ jsx(Button, { variant: "contained", color: "primary", onClick: handleMagicLinkLogin, children: "Login" }),
          /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                display: "flex",
                flexDirection: "row",
                gap: "1rem",
                alignItems: "center",
                margin: "1rem 0"
              },
              children: [
                /* @__PURE__ */ jsx("div", { style: { height: "1px", backgroundColor: "#ccc", flex: 1 } }),
                /* @__PURE__ */ jsx("p", { style: { margin: 0, color: "#aaa", fontSize: "1rem" }, children: "or" }),
                /* @__PURE__ */ jsx("div", { style: { height: "1px", backgroundColor: "#ccc", flex: 1 } })
              ]
            }
          ),
          /* @__PURE__ */ jsx(Button, { onClick: handleGithubLogin, variant: "outlined", fullWidth: true, startIcon: /* @__PURE__ */ jsx(FaGithub, {}), children: "Login with GitHub" }),
          /* @__PURE__ */ jsx(Button, { onClick: handleGoogleLogin, variant: "outlined", fullWidth: true, startIcon: /* @__PURE__ */ jsx(FaGoogle, {}), children: "Login with Google" }),
          browserSupport && /* @__PURE__ */ jsx(
            Button,
            {
              onClick: handlePasskeyLogin,
              variant: "outlined",
              fullWidth: true,
              startIcon: /* @__PURE__ */ jsx(FaFingerprint, {}),
              children: "Login with Passkey"
            }
          )
        ]
      }
    ) })
  ] });
}
function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [loginDialogOpen, setLoginDialogOpen] = React.useState(false);
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleLoginClick = () => {
    setLoginDialogOpen(true);
    handleMenuClose();
  };
  const handleProfileClick = () => {
    navigate({ to: "/profile" });
    handleMenuClose();
  };
  const handleLogout = () => {
    handleMenuClose();
    logout();
  };
  return /* @__PURE__ */ jsxs(AppBar, { position: "relative", className: "header", children: [
    /* @__PURE__ */ jsxs(Toolbar, { id: "headerToolbar", children: [
      /* @__PURE__ */ jsx(Link, { to: "/", style: { cursor: "pointer", margin: 0 }, children: /* @__PURE__ */ jsx(Logo, { height: "32px", width: "100%", style: { paddingTop: "6px" } }) }),
      /* @__PURE__ */ jsx("div", { className: "grow" }),
      /* @__PURE__ */ jsx(Link, { to: "/question-builder", children: "Question Builder" }),
      /* @__PURE__ */ jsx(Link, { to: "/explore", children: "Explore" }),
      /* @__PURE__ */ jsx(Link, { to: "/about", children: "About" }),
      /* @__PURE__ */ jsx(Link, { to: "/guide", children: "Guide" }),
      /* @__PURE__ */ jsx(Link, { to: "/tutorial", children: "Tutorial" }),
      /* @__PURE__ */ jsx(Link, { to: "/", children: "Help" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(IconButton, { onClick: handleMenuOpen, children: user ? /* @__PURE__ */ jsx(Avatar, { src: user.profilePicture, sizes: "small", children: user.name ? user.name.charAt(0).toUpperCase() : "" }) : /* @__PURE__ */ jsx(AccountCircle, { style: { fontSize: "32px" } }) }),
        /* @__PURE__ */ jsx(
          Menu,
          {
            style: { marginTop: "48px" },
            id: "account-menu",
            anchorEl,
            anchorOrigin: {
              vertical: "top",
              horizontal: "right"
            },
            keepMounted: true,
            transformOrigin: {
              vertical: "top",
              horizontal: "right"
            },
            open: Boolean(anchorEl),
            onClose: handleMenuClose,
            children: user ? [
              /* @__PURE__ */ jsx(MenuItem, { onClick: handleProfileClick, children: "Profile" }, "profile"),
              /* @__PURE__ */ jsx(MenuItem, { onClick: handleLogout, children: "Logout" }, "logout")
            ] : /* @__PURE__ */ jsx(MenuItem, { onClick: handleLoginClick, children: "Login" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(LoginDialog, { open: loginDialogOpen, onClose: () => setLoginDialogOpen(false) })
  ] });
}
function Footer() {
  return /* @__PURE__ */ jsx("footer", { children: /* @__PURE__ */ jsxs("p", { children: [
    "ROBOKOP is a joint creation of",
    " ",
    /* @__PURE__ */ jsx("a", { href: "http://www.renci.org", target: "_blank", rel: "noreferrer", children: "RENCI" }),
    " ",
    "and",
    " ",
    /* @__PURE__ */ jsx("a", { href: "http://www.covar.com", target: "_blank", rel: "noreferrer", children: "CoVar LLC" }),
    ". Early development was supported by",
    " ",
    /* @__PURE__ */ jsx("a", { href: "https://ncats.nih.gov", target: "_blank", rel: "noreferrer", children: "NCATS" }),
    "; continued development is supported by",
    " ",
    /* @__PURE__ */ jsx("a", { href: "https://niehs.nih.gov", target: "_blank", rel: "noreferrer", children: "NIEHS" }),
    " ",
    "and the",
    " ",
    /* @__PURE__ */ jsx("a", { href: "https://www.nih.gov/", target: "_blank", rel: "noreferrer", children: "NIH" }),
    " ",
    /* @__PURE__ */ jsx("a", { href: "https://datascience.nih.gov/about/odss", target: "_blank", rel: "noreferrer", children: "ODSS" }),
    ". ",
    /* @__PURE__ */ jsx(Link, { to: "/termsofservice", children: "Terms of Service" }),
    "."
  ] }) });
}
function RootComponentWrapper({ children }) {
  const biolink = useBiolinkModel();
  const { displayAlert } = useAlert();
  async function fetchBiolink() {
    const response = await API.biolink.getModelSpecification();
    if (response.status === "error") {
      displayAlert(
        "error",
        "Failed to contact server to download biolink model. You will not be able to select general nodes or predicates. Please try again later."
      );
      return;
    }
    biolink.setBiolinkModel(response);
  }
  useEffect(() => {
    fetchBiolink();
  }, []);
  return /* @__PURE__ */ jsx(AlertProvider, { children: /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsx(BiolinkContext.Provider, { value: biolink, children: /* @__PURE__ */ jsx(ThemeProvider, { theme, children: /* @__PURE__ */ jsx(ThemeProvider$1, { theme, children: /* @__PURE__ */ jsxs("div", { id: "pageContainer", children: [
    /* @__PURE__ */ jsx(Header, {}),
    /* @__PURE__ */ jsx("div", { id: "contentContainer", children }),
    /* @__PURE__ */ jsx(Footer, {})
  ] }) }) }) }) }) });
}
function AppContent() {
  return /* @__PURE__ */ jsx(QueryBuilderProvider, { children: /* @__PURE__ */ jsx(Outlet, {}) });
}
const SplitComponent = function RouteComponent() {
  return /* @__PURE__ */ jsx(AlertProvider, { children: /* @__PURE__ */ jsx(RootComponentWrapper, { children: /* @__PURE__ */ jsx(AppContent, {}) }) });
};

export { SplitComponent as component };
//# sourceMappingURL=_appLayout-B9k6SUZn.mjs.map
