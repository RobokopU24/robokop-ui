import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import snakeCase from 'lodash/snakeCase.js';
import { q as queryGraphUtils, a as queryBuilderUtils } from './queryGraph-DEhAVldC.mjs';
import { u as useAlert } from './AlertProvider-wxvwEFCh.mjs';
import cloneDeep from 'lodash/cloneDeep.js';

function getDefaultNode() {
  return {
    categories: [],
    ids: []
  };
}
function getDefaultEdge(subject, object) {
  return {
    subject: subject || "",
    object: object || "",
    predicates: ["biolink:related_to"]
  };
}
const defaultQueryGraph = {
  nodes: {
    n0: getDefaultNode(),
    n1: getDefaultNode()
  },
  edges: {
    e0: getDefaultEdge("n0", "n1")
  }
};
const initialState = {
  message: {
    message: {
      query_graph: defaultQueryGraph
    }
  },
  rootNode: "n0",
  isValid: true,
  errMessage: ""
};
function reducer(state, action) {
  const newState = cloneDeep(state);
  switch (action.type) {
    case "addEdge": {
      const [subjectId, objectId] = action.payload;
      const newEdgeId = queryBuilderUtils.getNextEdgeID(newState.message.message.query_graph);
      newState.message.message.query_graph.edges[newEdgeId] = getDefaultEdge(subjectId, objectId);
      break;
    }
    case "editEdge": {
      const {
        edgeId,
        endpoint,
        nodeId
      } = action.payload;
      if (!nodeId) {
        const newNodeId = queryBuilderUtils.getNextNodeID(newState.message.message.query_graph);
        newState.message.message.query_graph.nodes[newNodeId] = getDefaultNode();
        newState.message.message.query_graph.edges[edgeId][endpoint] = newNodeId;
      } else {
        newState.message.message.query_graph.edges[edgeId][endpoint] = nodeId;
      }
      newState.rootNode = queryBuilderUtils.getRootNode(
        newState.message.message.query_graph,
        newState.rootNode
      );
      newState.message.message.query_graph = queryBuilderUtils.removeDetachedFromRoot(
        newState.message.message.query_graph,
        newState.rootNode
      );
      break;
    }
    case "editPredicate": {
      const { id, predicates } = action.payload;
      newState.message.message.query_graph.edges[id].predicates = predicates;
      break;
    }
    case "editQualifiers": {
      const { id, qualifiers } = action.payload;
      if (Object.keys(qualifiers).length !== 0) {
        const qualifier_set = Object.entries(qualifiers).map(([name, value]) => ({
          qualifier_type_id: `biolink:${snakeCase(name)}`,
          qualifier_value: name === "qualified predicate" ? `biolink:${snakeCase(value)}` : snakeCase(value)
        }));
        newState.message.message.query_graph.edges[id].qualifier_constraints = [{ qualifier_set }];
      }
      break;
    }
    case "deleteEdge": {
      const { id } = action.payload;
      delete newState.message.message.query_graph.edges[id];
      newState.rootNode = queryBuilderUtils.getRootNode(
        newState.message.message.query_graph,
        newState.rootNode
      );
      newState.message.message.query_graph = queryBuilderUtils.removeDetachedFromRoot(
        newState.message.message.query_graph,
        newState.rootNode
      );
      break;
    }
    case "addHop": {
      const { nodeId } = action.payload;
      const newNodeId = queryBuilderUtils.getNextNodeID(newState.message.message.query_graph);
      const newEdgeId = queryBuilderUtils.getNextEdgeID(newState.message.message.query_graph);
      let subjectId = nodeId;
      if (nodeId === void 0) {
        const nodeKeys = Object.keys(newState.message.message.query_graph.nodes);
        subjectId = nodeKeys[nodeKeys.length - 1];
      }
      newState.message.message.query_graph.edges[newEdgeId] = getDefaultEdge(subjectId, newNodeId);
      newState.message.message.query_graph.nodes[newNodeId] = getDefaultNode();
      break;
    }
    case "addNode": {
      const newNodeId = queryBuilderUtils.getNextNodeID(newState.message.message.query_graph);
      newState.message.message.query_graph.nodes[newNodeId] = getDefaultNode();
      break;
    }
    case "editNode": {
      const { id, node } = action.payload;
      newState.message.message.query_graph.nodes[id] = node || getDefaultNode();
      break;
    }
    case "deleteNode": {
      const { id } = action.payload;
      delete newState.message.message.query_graph.nodes[id];
      const trimmedQueryGraph = queryBuilderUtils.removeAttachedEdges(
        newState.message.message.query_graph,
        id
      );
      newState.rootNode = queryBuilderUtils.getRootNode(
        trimmedQueryGraph,
        newState.rootNode
      );
      newState.message.message.query_graph = queryBuilderUtils.removeDetachedFromRoot(
        trimmedQueryGraph,
        newState.rootNode
      );
      break;
    }
    case "saveGraph": {
      newState.message.message.query_graph = queryGraphUtils.toCurrentTRAPI(
        action.payload.message.query_graph
      );
      newState.rootNode = queryBuilderUtils.getRootNode(
        newState.message.message.query_graph,
        null
      );
      break;
    }
    default: {
      return newState;
    }
  }
  const { isValid, errMsg } = queryBuilderUtils.isValidGraph(
    newState.message.message.query_graph
  );
  newState.isValid = isValid;
  newState.errMessage = errMsg;
  return newState;
}
function useQueryBuilder() {
  const { displayAlert } = useAlert();
  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(() => {
    if (!state.isValid && state.errMessage) {
      displayAlert("error", state.errMessage);
    }
  }, [state.isValid, state.errMessage]);
  const textEditorRows = useMemo(() => {
    if (!state.isValid) {
      return [];
    }
    const rows = [];
    const { message, rootNode } = state;
    const { query_graph } = message.message;
    const nodeList = /* @__PURE__ */ new Set();
    const edgeIds = Object.keys(query_graph.edges);
    const firstEdgeIndex = edgeIds.findIndex((eId) => query_graph.edges[eId].subject === rootNode);
    if (firstEdgeIndex !== -1) {
      const [firstEdgeId] = edgeIds.splice(firstEdgeIndex, 1);
      edgeIds.unshift(firstEdgeId);
    }
    edgeIds.forEach((edgeId) => {
      var _a, _b, _c, _d;
      const edge = query_graph.edges[edgeId];
      const row = {
        edgeId,
        subjectIsReference: nodeList.has((_a = edge.subject) != null ? _a : ""),
        objectIsReference: nodeList.has((_b = edge.object) != null ? _b : "")
      };
      nodeList.add((_c = edge.subject) != null ? _c : "");
      nodeList.add((_d = edge.object) != null ? _d : "");
      rows.push(row);
    });
    return rows;
  }, [state]);
  return {
    state,
    query_graph: state.message.message.query_graph,
    textEditorRows,
    dispatch
  };
}
const QueryBuilderContext = createContext({});
const QueryBuilderProvider = ({ children }) => {
  const queryBuilder = useQueryBuilder();
  return React.createElement(QueryBuilderContext.Provider, { value: queryBuilder }, children);
};
const useQueryBuilderContext = () => {
  const context = useContext(QueryBuilderContext);
  if (!context) {
    throw new Error("useQueryBuilderContext must be used within a QueryBuilderProvider");
  }
  return context;
};

export { QueryBuilderProvider as Q, useQueryBuilderContext as u };
//# sourceMappingURL=queryBuilder-B0Yriqen.mjs.map
