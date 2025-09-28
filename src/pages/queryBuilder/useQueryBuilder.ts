import { useEffect, useReducer, useMemo } from 'react';

import snakeCase from 'lodash/snakeCase';
import queryBuilderUtils from '../../utils/queryBuilder';
import queryGraphUtils from '../../utils/queryGraph';
import { useAlert } from '../../components/AlertProvider';
import cloneDeep from 'lodash/cloneDeep';

interface QueryGraphNode {
  name?: string;
  ids?: string[];
  categories?: string[];
  is_set?: boolean;
  [key: string]: any;
}

interface QueryGraphEdge {
  predicates?: string[];
  subject?: string;
  object?: string;
  qualifier_constraints?: Array<{
    qualifier_set: Array<{ qualifier_type_id: string; qualifier_value: string }>;
  }>;
  [key: string]: any;
}

interface QueryGraph {
  nodes: { [s: string]: QueryGraphNode };
  edges: { [s: string]: QueryGraphEdge };
}

interface QueryBuilderState {
  message: {
    message: {
      query_graph: QueryGraph;
    };
  };
  rootNode: string | null;
  isValid: boolean;
  errMessage: string;
}

type QueryBuilderAction =
  | { type: 'addEdge'; payload: [string, string] }
  | {
      type: 'editEdge';
      payload: { edgeId: string; endpoint: 'subject' | 'object'; nodeId?: string };
    }
  | { type: 'editPredicate'; payload: { id: string; predicates: string[] } }
  | { type: 'editQualifiers'; payload: { id: string; qualifiers: Record<string, string> } }
  | { type: 'deleteEdge'; payload: { id: string } }
  | { type: 'addHop'; payload: { nodeId?: string } }
  | { type: 'addNode' }
  | { type: 'editNode'; payload: { id: string; node?: QueryGraphNode } }
  | { type: 'resetGraph' }
  | { type: 'deleteNode'; payload: { id: string } }
  | { type: 'saveGraph'; payload: { message: { query_graph: QueryGraph } } }
  | { type: 'restoreGraph'; payload: QueryGraph }
  | { type: string; payload?: any };

interface TextEditorRow {
  edgeId: string;
  subjectIsReference: boolean;
  objectIsReference: boolean;
}

function getDefaultNode(): QueryGraphNode {
  return {
    categories: [],
    ids: [],
  };
}
function getDefaultEdge(subject?: string, object?: string): QueryGraphEdge {
  return {
    subject: subject || '',
    object: object || '',
    predicates: ['biolink:related_to'],
  };
}

const defaultQueryGraph: QueryGraph = {
  nodes: {
    n0: getDefaultNode(),
    n1: getDefaultNode(),
  },
  edges: {
    e0: getDefaultEdge('n0', 'n1'),
  },
};

const initialState: QueryBuilderState = {
  message: {
    message: {
      query_graph: defaultQueryGraph,
    },
  },
  rootNode: 'n0',
  isValid: true,
  errMessage: '',
};

function reducer(state: QueryBuilderState, action: QueryBuilderAction): QueryBuilderState {
  const newState = cloneDeep(state);
  switch (action.type) {
    case 'addEdge': {
      const [subjectId, objectId]: [string, string] = action.payload;
      const newEdgeId = queryBuilderUtils.getNextEdgeID(newState.message.message.query_graph);
      newState.message.message.query_graph.edges[newEdgeId] = getDefaultEdge(subjectId, objectId);
      break;
    }
    case 'editEdge': {
      const {
        edgeId,
        endpoint,
        nodeId,
      }: { edgeId: string; endpoint: 'subject' | 'object'; nodeId?: string } = action.payload;
      if (!nodeId) {
        const newNodeId = queryBuilderUtils.getNextNodeID(newState.message.message.query_graph);
        newState.message.message.query_graph.nodes[newNodeId] = getDefaultNode();
        newState.message.message.query_graph.edges[edgeId][endpoint] = newNodeId;
      } else {
        newState.message.message.query_graph.edges[edgeId][endpoint] = nodeId;
      }
      newState.rootNode = queryBuilderUtils.getRootNode(
        newState.message.message.query_graph as any,
        newState.rootNode
      );
      newState.message.message.query_graph = queryBuilderUtils.removeDetachedFromRoot(
        newState.message.message.query_graph as any,
        newState.rootNode
      );
      break;
    }
    case 'editPredicate': {
      const { id, predicates }: { id: string; predicates: string[] } = action.payload;
      newState.message.message.query_graph.edges[id].predicates = predicates;
      break;
    }
    case 'editQualifiers': {
      const { id, qualifiers }: { id: string; qualifiers: Record<string, string> } = action.payload;
      if (Object.keys(qualifiers).length !== 0) {
        const qualifier_set = Object.entries(qualifiers).map(([name, value]) => ({
          qualifier_type_id: `biolink:${snakeCase(name)}`,
          qualifier_value:
            name === 'qualified predicate'
              ? `biolink:${snakeCase(value as string)}`
              : snakeCase(value as string),
        }));
        newState.message.message.query_graph.edges[id].qualifier_constraints = [{ qualifier_set }];
      }
      break;
    }
    case 'deleteEdge': {
      const { id }: { id: string } = action.payload;
      delete newState.message.message.query_graph.edges[id];
      newState.rootNode = queryBuilderUtils.getRootNode(
        newState.message.message.query_graph as any,
        newState.rootNode
      );
      newState.message.message.query_graph = queryBuilderUtils.removeDetachedFromRoot(
        newState.message.message.query_graph as any,
        newState.rootNode
      );
      break;
    }
    case 'addHop': {
      const { nodeId }: { nodeId?: string } = action.payload;
      const newNodeId = queryBuilderUtils.getNextNodeID(newState.message.message.query_graph);
      const newEdgeId = queryBuilderUtils.getNextEdgeID(newState.message.message.query_graph);
      let subjectId = nodeId;
      if (nodeId === undefined) {
        const nodeKeys = Object.keys(newState.message.message.query_graph.nodes);
        subjectId = nodeKeys[nodeKeys.length - 1];
      }
      newState.message.message.query_graph.edges[newEdgeId] = getDefaultEdge(subjectId, newNodeId);
      newState.message.message.query_graph.nodes[newNodeId] = getDefaultNode();
      break;
    }
    case 'addNode': {
      const newNodeId = queryBuilderUtils.getNextNodeID(newState.message.message.query_graph);
      newState.message.message.query_graph.nodes[newNodeId] = getDefaultNode();
      break;
    }
    case 'editNode': {
      const { id, node }: { id: string; node?: QueryGraphNode } = action.payload;
      newState.message.message.query_graph.nodes[id] = node || getDefaultNode();
      break;
    }
    case 'resetGraph': {
      newState.message.message.query_graph = defaultQueryGraph;
      newState.rootNode = 'n0';
      break;
    }
    case 'deleteNode': {
      const { id }: { id: string } = action.payload;
      delete newState.message.message.query_graph.nodes[id];
      const trimmedQueryGraph = queryBuilderUtils.removeAttachedEdges(
        newState.message.message.query_graph as any,
        id
      );
      newState.rootNode = queryBuilderUtils.getRootNode(
        trimmedQueryGraph as any,
        newState.rootNode
      );
      newState.message.message.query_graph = queryBuilderUtils.removeDetachedFromRoot(
        trimmedQueryGraph as any,
        newState.rootNode
      );
      break;
    }
    case 'saveGraph': {
      newState.message.message.query_graph = queryGraphUtils.toCurrentTRAPI(
        action.payload.message.query_graph
      );
      newState.rootNode = queryBuilderUtils.getRootNode(
        newState.message.message.query_graph as any,
        null
      );
      break;
    }
    case 'restoreGraph': {
      newState.message.message.query_graph = action.payload;
      newState.rootNode = queryBuilderUtils.getRootNode(
        newState.message.message.query_graph as any,
        null
      );
      break;
    }
    default: {
      return newState;
    }
  }
  const { isValid, errMsg }: { isValid: boolean; errMsg: string } = queryBuilderUtils.isValidGraph(
    newState.message.message.query_graph
  );
  newState.isValid = isValid;
  newState.errMessage = errMsg;
  return newState;
}

/**
 * Query builder main store
 *
 * **The main source for the query graph**
 * - Handles all adding, deleting, modifying of nodes and edges
 */
export default function useQueryBuilder() {
  const { displayAlert } = useAlert();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!state.isValid && state.errMessage) {
      displayAlert('error', state.errMessage);
    }
  }, [state.isValid, state.errMessage]);

  /**
   * Any time the query graph changes, recompute the text editor rows
   *
   * Sets rows as: [ { subject: boolean, object: boolean } ]
   */
  const textEditorRows = useMemo(() => {
    if (!state.isValid) {
      return [] as TextEditorRow[];
    }
    // rows are an array of objects
    const rows: TextEditorRow[] = [];
    const { message, rootNode } = state;
    const { query_graph } = message.message;
    const nodeList = new Set<string>();
    const edgeIds = Object.keys(query_graph.edges);
    const firstEdgeIndex = edgeIds.findIndex((eId) => query_graph.edges[eId].subject === rootNode);
    if (firstEdgeIndex !== -1) {
      const [firstEdgeId] = edgeIds.splice(firstEdgeIndex, 1);
      edgeIds.unshift(firstEdgeId);
    }
    edgeIds.forEach((edgeId) => {
      const edge = query_graph.edges[edgeId];
      const row: TextEditorRow = {
        edgeId,
        subjectIsReference: nodeList.has(edge.subject ?? ''),
        objectIsReference: nodeList.has(edge.object ?? ''),
      };
      nodeList.add(edge.subject ?? '');
      nodeList.add(edge.object ?? '');

      rows.push(row);
    });
    return rows;
  }, [state]);

  return {
    state,
    query_graph: state.message.message.query_graph,
    textEditorRows,
    dispatch,
  };
}
