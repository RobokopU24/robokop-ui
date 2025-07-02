import { useState, useMemo, useContext } from "react";

import BiolinkContext from "../../context/biolink";
import kgUtils from "../../utils/knowledgeGraph";
import resultsUtils from "../../utils/results";
import stringUtils from "../../utils/strings";

// Type definitions for TRAPI message structure
interface TRAPIAnalysis {
  score: number;
  edge_bindings: Record<string, Array<{ id: string }>>;
  support_graphs?: string[];
}

interface TRAPIResult {
  node_bindings: Record<string, Array<{ id: string }>>;
  analyses: TRAPIAnalysis[];
}

interface TRAPINode {
  name?: string;
  categories?: string[] | string;
  [key: string]: any;
}

interface TRAPIEdge {
  subject: string;
  object: string;
  predicate: string;
  attributes?: Array<{
    attribute_type_id: string;
    type: string;
    value_url?: string;
    value?: string[] | string;
  }>;
  [key: string]: any;
}

interface TRAPIMessage {
  query_graph?: {
    nodes: Record<string, any>;
    edges: Record<string, any>;
  };
  knowledge_graph?: {
    nodes: Record<string, TRAPINode>;
    edges: Record<string, TRAPIEdge>;
  };
  results?: TRAPIResult[];
  auxiliary_graphs?: Record<string, { edges: string[] }>;
  [key: string]: any;
}

interface GraphNode {
  id: string;
  name: string;
  categories: string[];
  qg_id: string;
  is_set: boolean;
  score: number;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  predicate: string;
}

interface SelectedResult {
  nodes: Record<string, GraphNode>;
  edges: Record<string, GraphEdge>;
}

interface DisplayStateAction {
  type: "toggle" | "disable";
  payload: {
    component: string;
    show?: boolean;
  };
}

/**
 * Main answer page store
 *
 * Stores current TRAPI message
 */
export default function useAnswerStore() {
  const [message, setMessage] = useState<TRAPIMessage>({});
  const [kgNodes, setKgNodes] = useState<Array<{ count: number }>>([]);
  const [selectedResult, setSelectedResult] = useState<SelectedResult>({ nodes: {}, edges: {} });
  const [selectedRowId, setSelectedRowId] = useState<string>("");
  const [metaData, setMetaData] = useState<Record<string, string[]>>({});
  const [resultJSON, setResultJSON] = useState<{
    knowledge_graph?: { nodes: Record<string, any>; edges: Record<string, any> };
    result?: TRAPIResult;
  }>({});
  const { colorMap, hierarchies } = useContext(BiolinkContext) || {};

  /**
   * Reset all answer explorer state
   */
  function resetAnswerExplorer() {
    setSelectedResult({ nodes: {}, edges: {} });
    setSelectedRowId("");
    setMetaData({});
    setResultJSON({});
  }

  /**
   * Takes a TRAPI message and average the analysis scores for each
   * result, and places that average in a new key called `score` on
   * each result object.
   * @param {object} msg - TRAPI message
   */
  function averageAnalysesScores(msg: TRAPIMessage): TRAPIMessage {
    if (!msg.results) return msg;

    const resultsWithScore = msg.results.map((result: TRAPIResult) => {
      // get average score of all analyses
      const score = result.analyses.reduce((sum: number, analysis: TRAPIAnalysis) => sum + analysis.score, 0) / result.analyses.length;
      return {
        ...result,
        score,
      };
    });

    return {
      ...msg,
      results: resultsWithScore,
    };
  }

  /**
   * Initialize the answer store with a message
   *
   * Stores the message, makes the nodes for a bubble chart,
   * and resets any results table info
   * @param {object} msg - TRAPI message
   */
  function initialize(msg: TRAPIMessage, updateDisplayState: (action: DisplayStateAction) => void) {
    setMessage(averageAnalysesScores(msg));
    if (msg.knowledge_graph && msg.results) {
      setKgNodes(kgUtils.makeDisplayNodes(msg as { results: any[]; knowledge_graph: any }, hierarchies || {}));
      updateDisplayState({ type: "toggle", payload: { component: "results", show: true } });
    } else {
      // if knowledge_graph and results are undefined, then disable those components
      updateDisplayState({ type: "disable", payload: { component: "results" } });
    }
    resetAnswerExplorer();
  }

  function reset() {
    setMessage({});
    setKgNodes([]);
    resetAnswerExplorer();
  }

  /**
   * Get metadata of result when selected in the results table
   * @param {object} row - result object from message that was selected
   * @param {string} rowId - the internal row id
   */
  function selectRow(row: TRAPIResult, rowId: string) {
    if (rowId === selectedRowId) {
      resetAnswerExplorer();
    } else {
      const publications: Record<string, string[]> = {};
      const nodes: Record<string, GraphNode> = {};
      const nodesJSON: Record<string, any> = {};

      Object.entries(row.node_bindings).forEach(([qg_id, value]) => {
        // any lone node in a node binding will get an infinite score
        // and automatically not be pruned
        const kgIdLength = value.length;
        // add all results nodes to json display
        value.forEach((kgObject: { id: string }) => {
          const kgNode = message.knowledge_graph?.nodes[kgObject.id];
          nodesJSON[kgObject.id] = kgNode || "Unknown";
          if (kgNode) {
            let { categories } = kgNode;
            if (categories && !Array.isArray(categories)) {
              categories = [categories];
            }
            categories = kgUtils.getRankedCategories(hierarchies || {}, Array.isArray(categories) ? categories : categories ? [categories] : []);
            const graphNode: GraphNode = {
              id: kgObject.id,
              name: kgNode.name || kgObject.id || categories[0] || "",
              categories: categories || [],
              qg_id,
              is_set: false,
              score: kgIdLength > 1 ? 0 : Infinity,
            };
            nodes[kgObject.id] = graphNode;
          }
        });
      });

      const edges: Record<string, GraphEdge> = {};
      const edgesJSON: Record<string, any> = {};
      row.analyses.forEach((analysis: TRAPIAnalysis) => {
        const edge_bindings = Object.values(analysis.edge_bindings).flat();

        const support_graph_edge_bindings: Array<{ id: string }> = [];
        if (Array.isArray(analysis.support_graphs)) {
          analysis.support_graphs.forEach((supportGraphId: string) => {
            const supportGraph = message.auxiliary_graphs?.[supportGraphId];
            if (supportGraph) {
              support_graph_edge_bindings.push(...supportGraph.edges.map((e: string) => ({ id: e })));
            }
          });
        }

        [...edge_bindings, ...support_graph_edge_bindings].forEach((binding: { id: string }) => {
          const kgEdge = message.knowledge_graph?.edges[binding.id];
          edgesJSON[binding.id] = kgEdge || "Unknown";
          if (kgEdge) {
            const graphEdge: GraphEdge = {
              id: binding.id,
              source: kgEdge.subject,
              target: kgEdge.object,
              predicate: kgEdge.predicate,
            };
            edges[binding.id] = graphEdge;
            if (kgEdge.subject in nodes) {
              nodes[kgEdge.subject].score += 1;
            }
            if (kgEdge.object in nodes) {
              nodes[kgEdge.object].score += 1;
            }
            const subjectNode = message.knowledge_graph?.nodes[kgEdge.subject];
            const objectNode = message.knowledge_graph?.nodes[kgEdge.object];
            const edgeKey = `${subjectNode?.name || kgEdge.subject} ${stringUtils.displayPredicate(kgEdge.predicate)} ${objectNode?.name || kgEdge.object}`;
            publications[edgeKey] = resultsUtils.getPublications(kgEdge as { attributes: any[] });
          }
        });
      });

      setSelectedResult({ nodes, edges });
      setSelectedRowId(rowId);
      setMetaData(publications);
      // store full result JSON
      setResultJSON({ knowledge_graph: { nodes: nodesJSON, edges: edgesJSON }, result: row });
    }
  }

  /**
   * Compute table header list when message changes
   */
  const tableHeaders = useMemo(() => {
    if (message.query_graph && message.knowledge_graph && message.results) {
      return resultsUtils.makeTableHeaders(message as { query_graph: any; knowledge_graph: any; results: any }, colorMap || (() => [null, ""]));
    }
    return [];
  }, [message, colorMap]);

  /**
   * Show prune slider when there are sets with more than 3 nodes in them
   */
  const showNodePruneSlider = useMemo(
    () => Object.keys(resultJSON).length > 0 && resultJSON.result && Object.values(resultJSON.result.node_bindings).some((kgIdList: Array<{ id: string }>) => kgIdList.length > 3),
    [resultJSON]
  );

  const numQgNodes = useMemo(() => tableHeaders.length, [tableHeaders]);

  return {
    initialize,
    reset,
    message,

    kgNodes,

    tableHeaders,
    selectedResult,
    selectedRowId,
    resultJSON,
    selectRow,
    showNodePruneSlider,
    numQgNodes,

    metaData,
  };
}
