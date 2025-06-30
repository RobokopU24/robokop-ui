import cloneDeep from 'lodash/cloneDeep';

/**
 * Calculate the radius node circles
 * @param {integer} width - width of container
 * @param {integer} height - height of container
 * @param {integer} numQNodes - number of query graph nodes
 * @param {integer} numResults - total number of results
 * @returns {function} function that takes a number and returns a radius
 */
function getNodeRadius(width: number, height: number, numQNodes: number, numResults: number) {
  const totalArea = width * height * 0.5;
  return (num: number) => {
    const numerator = totalArea * num;
    const circleArea = numerator / numResults / numQNodes;
    let radius = Math.sqrt(circleArea / Math.PI);
    // cap radius at 90% of height
    radius = Math.min(radius, (height / 2) * 0.9);
    return radius;
  };
}

/**
 * Rank categories based on how specific they are
 * @param {object} hierarchies - all biolink hierarchies
 * @param {array} categories - list of categories of a specific node
 * @returns {string[]} list of ranked categories
 */
function getRankedCategories(hierarchies: { [x: string]: string | any[] }, categories: string[]) {
  const rankedCategories = categories.sort((a: string | number, b: string | number) => {
    const aLength = (hierarchies[a] && hierarchies[a].length) || 0;
    const bLength = (hierarchies[b] && hierarchies[b].length) || 0;
    return aLength - bLength;
  });
  return rankedCategories;
}

/**
 * Make a list of nodes for bubble graph display
 * @param {object} message - TRAPI message
 * @param {object} hierarchies - all biolink hierarchies
 * @returns {object[]} list of node objects for display
 */
type KnowledgeGraphNode = {
  name: any;
  categories?: string[] | string;
};

type KnowledgeGraph = {
  nodes: { [x: string]: KnowledgeGraphNode };
};

type NodeBinding = { id: string | number };

type Result = {
  node_bindings: { [s: string]: NodeBinding[] };
};

function makeDisplayNodes(
  message: { results: Result[]; knowledge_graph: KnowledgeGraph },
  hierarchies: any
) {
  const displayNodes: { [id: string]: any } = {};
  message.results.forEach((result) => {
    Object.values(result.node_bindings).forEach((kgObjects) => {
      (kgObjects as NodeBinding[]).forEach((kgObj) => {
        let displayNode = displayNodes[kgObj.id];
        if (!displayNode) {
          displayNode = cloneDeep(kgObj);
          const nodeData = message.knowledge_graph.nodes[String(displayNode.id)];
          let categories = nodeData.categories;
          if (categories && !Array.isArray(categories)) {
            categories = [categories];
          }
          categories = Array.isArray(categories) ? categories : categories ? [categories] : [];
          categories = getRankedCategories(hierarchies, categories);
          displayNode.categories = categories;
          displayNode.name = nodeData.name;
          displayNode.count = 1;
        } else {
          displayNode.count += 1;
        }
        displayNodes[kgObj.id] = displayNode;
      });
    });
  });
  const kgNodes: { count: number }[] = Object.values(displayNodes);
  kgNodes.sort((a, b) => b.count - a.count);
  return kgNodes;
}

/**
 * Get nodes and edges to display in full knowledge graph
 * @param {object} message - TRAPI message
 * @returns {{ nodes: object[], edges: object[] }} lists of nodes and edges for display
 */
function getFullDisplay(message: { knowledge_graph: { nodes: any; edges: any } }) {
  let { nodes, edges } = message.knowledge_graph;
  type NodeType = { id: string; name?: string; categories?: string[] | string };
  nodes = Object.entries(nodes).map(([nodeId, nodeProps]) => {
    const props = nodeProps as { name?: string; categories?: string[] | string };
    const node: NodeType = {
      id: nodeId,
      name: props.name,
      categories: props.categories,
    };
    if (node.categories && !Array.isArray(node.categories)) {
      node.categories = [node.categories];
    }
    return node;
  });
  edges = Object.entries(edges).map(([edgeId, edgeProps]) => {
    type EdgeType = {
      id: string;
      source: string;
      target: string;
      predicates?: string[] | string;
    };
    const eProps = edgeProps as { subject: string; object: string; predicates?: string[] | string };
    const edge: EdgeType = {
      id: edgeId,
      source: eProps.subject,
      target: eProps.object,
      predicates: eProps.predicates,
    };
    if (edge.predicates && !Array.isArray(edge.predicates)) {
      edge.predicates = [edge.predicates];
    }
    return edge;
  });
  return { nodes, edges };
}

export default {
  makeDisplayNodes,
  getFullDisplay,
  getRankedCategories,
  getNodeRadius,
};
