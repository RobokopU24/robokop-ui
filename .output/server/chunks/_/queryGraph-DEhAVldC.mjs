import isString from 'lodash/isString.js';
import transform from 'lodash/transform.js';
import omitBy from 'lodash/omitBy.js';
import pick from 'lodash/pick.js';
import cloneDeep from 'lodash/cloneDeep.js';
import startCase from 'lodash/startCase.js';
import camelCase from 'lodash/camelCase.js';
import snakeCase from 'lodash/snakeCase.js';

function toSpaceCase(str) {
  return startCase(str);
}
function toCamelCase(str) {
  return camelCase(str);
}
function toSnakeCase(str) {
  return snakeCase(str);
}
function toPascalCase(str) {
  const camelCaseStr = camelCase(str);
  const pascalCase = `${camelCaseStr.charAt(0).toUpperCase()}${camelCaseStr.slice(1)}`;
  return pascalCase;
}
function nodeFromBiolink(category) {
  return category && `biolink:${toPascalCase(category)}`;
}
function edgeFromBiolink(type) {
  return type && `biolink:${toSnakeCase(type)}`;
}
function displayCategory(arg) {
  if (!arg) {
    return "";
  }
  let label = arg;
  if (Array.isArray(label)) {
    [label] = label;
  }
  try {
    const [, pascalCategory] = label.split(":");
    const splitCategory = pascalCategory.split(/(?=[A-Z][a-z])/g);
    return splitCategory.join(" ");
  } catch (err) {
    return "";
  }
}
function setify(category) {
  let pluralCategory = displayCategory(category);
  if (pluralCategory.endsWith("ay")) {
    pluralCategory = `${pluralCategory}s`;
  } else if (pluralCategory.endsWith("y")) {
    pluralCategory = `${pluralCategory.slice(0, pluralCategory.length - 1)}ies`;
  } else if (pluralCategory.endsWith("ms")) {
    pluralCategory = `${pluralCategory}`;
  } else if (pluralCategory.endsWith("s")) {
    pluralCategory = `${pluralCategory}es`;
  } else {
    pluralCategory = `${pluralCategory}s`;
  }
  return `Set of ${pluralCategory}`;
}
function displayPredicate(arg) {
  if (!arg) {
    return "";
  }
  let label = arg;
  if (Array.isArray(label)) {
    [label] = label;
  }
  try {
    const [, snake_type] = label.split(":");
    const out = snake_type.split(/_/g);
    return out.join(" ");
  } catch (err) {
    console.error("Error in displayPredicate:", err);
    return "";
  }
}
function prettyDisplay(arg) {
  if (!arg) {
    return "";
  }
  let label = arg;
  if (Array.isArray(label)) {
    [label] = label;
  }
  const out = label.replace(/_/g, " ");
  return out.replace(
    /(?!or\b)\b\w+/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}
const stringUtils = {
  nodeFromBiolink,
  edgeFromBiolink,
  toSpaceCase,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  prettyDisplay,
  displayPredicate,
  displayCategory,
  setify
};
function handleAxiosError(error) {
  const output = {};
  if (error.response) {
    const axiosErrorPrefix = `Error in response with code ${error.response.status}: `;
    if (error.response.data.message) {
      output.message = error.response.data.message;
    } else if (isString(error.response.data)) {
      output.message = `${axiosErrorPrefix} ${error.response.data}`;
    } else if (error.response.data.detail) {
      output.message = `${axiosErrorPrefix} ${error.response.data.detail}`;
    } else {
      output.message = `${axiosErrorPrefix} Unparseable error response.`;
    }
  } else {
    output.message = "Unknown axios exception encountered.";
  }
  output.status = "error";
  return output;
}
const utils = {
  handleAxiosError
};
function getNextNodeID(q_graph) {
  let index = 0;
  while (`n${index}` in q_graph.nodes) {
    index += 1;
  }
  return `n${index}`;
}
function getNextEdgeID(q_graph) {
  let index = 0;
  while (`e${index}` in q_graph.edges) {
    index += 1;
  }
  return `e${index}`;
}
function getNumEdgesPerNode(q_graph) {
  return transform(
    q_graph.edges,
    (result, value) => {
      result[value.object] = result[value.object] ? result[value.object] + 1 : 1;
      result[value.subject] = result[value.subject] ? result[value.subject] + 1 : 1;
    },
    {}
  );
}
function getConnectedEdges(edges, nodeId) {
  return new Set(
    Object.keys(edges).filter(
      (eId) => edges[eId].subject === nodeId || edges[eId].object === nodeId
    )
  );
}
function getRootNode(q_graph, rootNode) {
  if (rootNode && getConnectedEdges(q_graph.edges, rootNode).size > 0) {
    return rootNode;
  }
  const nodes = Object.entries(q_graph.nodes).map(([key, node]) => {
    const n = node;
    return {
      key,
      pinned: n.id && Array.isArray(n.id) && n.id.length > 0
    };
  });
  const edgeNums = getNumEdgesPerNode(q_graph);
  const unpinnedNodes = nodes.filter((node) => !node.pinned && node.key in edgeNums);
  const pinnedNodes = nodes.filter((node) => node.pinned && node.key in edgeNums);
  let root = nodes.length && nodes[0].key || null;
  if (unpinnedNodes.length) {
    unpinnedNodes.sort((a, b) => edgeNums[b.key] - edgeNums[a.key]);
    root = unpinnedNodes[0].key;
  } else if (pinnedNodes.length) {
    pinnedNodes.sort((a, b) => edgeNums[b.key] - edgeNums[a.key]);
    root = pinnedNodes[0].key;
  }
  return root;
}
function removeDetachedFromRoot(q_graph, rootNode) {
  const disconnectedEdges = Object.keys(q_graph.edges);
  const connectedNodes = [rootNode];
  let foundConnections = true;
  while (foundConnections) {
    foundConnections = false;
    for (let i = 0; i < connectedNodes.length; i += 1) {
      const nodeId = connectedNodes[i];
      for (let j = 0; j < disconnectedEdges.length; j += 1) {
        const edgeId = disconnectedEdges[j];
        const edge = q_graph.edges[edgeId];
        if (edge.subject === nodeId || edge.object === nodeId) {
          if (!(connectedNodes.indexOf(edge.subject) > -1)) {
            connectedNodes.push(edge.subject);
          }
          if (!(connectedNodes.indexOf(edge.object) > -1)) {
            connectedNodes.push(edge.object);
          }
          const index = disconnectedEdges.indexOf(edgeId);
          disconnectedEdges.splice(index, 1);
          j -= 1;
          foundConnections = true;
        }
      }
    }
  }
  q_graph.edges = omitBy(q_graph.edges, (e, id) => disconnectedEdges.indexOf(id) > -1);
  q_graph.nodes = pick(q_graph.nodes, connectedNodes);
  return q_graph;
}
function removeAttachedEdges(q_graph, nodeId) {
  const edgeIds = Object.keys(q_graph.edges).map((id) => id);
  edgeIds.forEach((eId) => {
    const currentEdge = q_graph.edges[eId];
    if (currentEdge.subject === nodeId || currentEdge.object === nodeId) {
      delete q_graph.edges[eId];
    }
  });
  return q_graph;
}
function isValidGraph(query_graph) {
  let isValid = true;
  let errMsg = "";
  const nodeIds = Object.keys(query_graph.nodes);
  if (!nodeIds.length) {
    isValid = false;
    errMsg = "There are no terms left. Please add a new term to continue.";
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    const id = nodeIds[i];
    if (getConnectedEdges(query_graph.edges, id).size === 0) {
      isValid = false;
      errMsg = "There is at least one disconnected term in this question.";
      break;
    }
  }
  return { isValid, errMsg };
}
const queryBuilderUtils = {
  getNextNodeID,
  getNextEdgeID,
  getNumEdgesPerNode,
  getConnectedEdges,
  removeDetachedFromRoot,
  removeAttachedEdges,
  getRootNode,
  isValidGraph
};
function getEmptyGraph() {
  return {
    nodes: {},
    edges: {}
  };
}
function arrayWithIdsToObj(array) {
  const object = {};
  array.forEach((item) => {
    object[item.id] = { ...item };
    delete object[item.id].id;
  });
  return object;
}
function makeArray(value) {
  if (Array.isArray(value)) {
    return [...value];
  }
  if (typeof value === "string") {
    return [value];
  }
  if (value === null || value === void 0) {
    return value;
  }
  throw TypeError("Unexpected input. Should be either an array or string.");
}
function pruneEmptyArray(obj, property) {
  if (obj[property] && Array.isArray(obj[property]) && obj[property].length === 0) {
    delete obj[property];
  }
}
function toCurrentTRAPI(qGraph) {
  const query_graph = cloneDeep(qGraph);
  if (Array.isArray(qGraph.nodes)) {
    query_graph.nodes = arrayWithIdsToObj(qGraph.nodes);
  } else {
    query_graph.nodes = qGraph.nodes;
  }
  if (Array.isArray(qGraph.edges)) {
    query_graph.edges = arrayWithIdsToObj(qGraph.edges);
  } else {
    query_graph.edges = qGraph.edges;
  }
  Object.values(query_graph.nodes).forEach((nodeUnknown) => {
    const node = nodeUnknown;
    if (node.curie) {
      node.ids = node.curie;
      delete node.curie;
    } else if (node.id) {
      node.ids = node.id;
      delete node.id;
    }
    if (node.ids) {
      node.ids = makeArray(node.ids);
    }
    if (node.type) {
      node.categories = node.type;
      delete node.type;
    } else if (node.category) {
      node.categories = node.category;
      delete node.category;
    }
    if (node.categories) {
      node.categories = makeArray(node.categories);
    }
    if (typeof node.set === "boolean") {
      node.is_set = node.set;
      delete node.set;
    }
    if (!node.name) {
      node.name = node.ids && node.ids.length && node.ids.join(", ") || node.categories && node.categories.length && stringUtils.displayCategory(node.categories) || "";
    }
  });
  Object.values(query_graph.edges).forEach((edgeUnknown) => {
    const edge = edgeUnknown;
    if (edge.source_id) {
      edge.subject = edge.source_id;
      delete edge.source_id;
    }
    if (edge.target_id) {
      edge.object = edge.target_id;
      delete edge.target_id;
    }
    if (edge.predicate) {
      edge.predicates = edge.predicate;
      delete edge.predicate;
    }
    if (edge.predicates) {
      edge.predicates = makeArray(edge.predicates);
    }
  });
  return query_graph;
}
function prune(q_graph) {
  const clonedQueryGraph = cloneDeep(q_graph);
  Object.keys(clonedQueryGraph.nodes).forEach((n) => {
    delete clonedQueryGraph.nodes[n].taxa;
    pruneEmptyArray(clonedQueryGraph.nodes[n], "categories");
    pruneEmptyArray(clonedQueryGraph.nodes[n], "ids");
  });
  Object.keys(clonedQueryGraph.edges).forEach((e) => {
    pruneEmptyArray(clonedQueryGraph.edges[e], "predicates");
  });
  return clonedQueryGraph;
}
function getTableHeaderLabel(node) {
  if (node.ids && Array.isArray(node.ids)) {
    return node.ids.join(", ");
  }
  return node.ids;
}
function getNodeAndEdgeListsForDisplay(query_graph) {
  const nodes = Object.entries(query_graph.nodes).map(([nodeId, obj]) => {
    const node = obj;
    let { name } = node;
    if (!node.name) {
      name = node.ids && node.ids.length ? node.ids.join(", ") : stringUtils.displayCategory(node.categories);
    }
    if (!name) {
      name = "Something";
    }
    return {
      id: nodeId,
      name,
      categories: node.categories,
      is_set: node.is_set
    };
  });
  const edges = Object.entries(query_graph.edges).map(([edgeId, obj]) => {
    const edge = obj;
    return {
      id: edgeId,
      predicates: edge.predicates,
      // source and target are specifically for d3
      source: edge.subject,
      target: edge.object
    };
  });
  return { nodes, edges };
}
const queryGraphUtils = {
  getEmptyGraph,
  toCurrentTRAPI,
  prune,
  getNodeAndEdgeListsForDisplay,
  getTableHeaderLabel
};

export { queryBuilderUtils as a, queryGraphUtils as q, stringUtils as s, utils as u };
//# sourceMappingURL=queryGraph-DEhAVldC.mjs.map
