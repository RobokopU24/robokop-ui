import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import React, { useState, useEffect, useContext, useMemo, useReducer, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { del, get, set } from 'idb-keyval';
import { B as BiolinkContext, A as API } from './biolink-BMtGoYHa.mjs';
import { u as usePageStatus, t as trapiUtils, D as DownloadDialog, g as graphUtils, d as dragUtils, e as edgeUtils, a as useDebounce } from './trapi-sNuYVYIj.mjs';
import { q as queryGraphUtils, s as stringUtils, a as queryBuilderUtils } from './queryGraph-DEhAVldC.mjs';
import cloneDeep from 'lodash/cloneDeep.js';
import { Drawer, Toolbar, List, ListItemButton, ListItemIcon, Checkbox, ListItemText, IconButton, Paper, Box, CircularProgress, TableContainer, Table, TableHead, TableRow, TableCell, TableSortLabel, TableBody, TablePagination, Slider, Collapse, ListItem, Popover as Popover$1 } from '@mui/material';
import PublishIcon from '@mui/icons-material/Publish';
import GetAppIcon from '@mui/icons-material/GetApp';
import * as d3 from 'd3';
import { L as Loading } from './Loading-Df2nHO8-.mjs';
import { createColumnHelper, useReactTable, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, getCoreRowModel, flexRender } from '@tanstack/react-table';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import shortid from 'shortid';
import { styled } from '@mui/material/styles';
import { u as useAlert } from './AlertProvider-wxvwEFCh.mjs';

function useVisibility() {
  const visibilityMapping = {
    0: "Invisible",
    1: "Private",
    2: "Shareable",
    3: "Public"
  };
  function toString(key) {
    return visibilityMapping[key];
  }
  function toInt(val) {
    const entries = Object.entries(visibilityMapping);
    const foundEntry = entries.find(([_, value]) => value === val);
    return parseInt((foundEntry == null ? void 0 : foundEntry[0]) || "0", 10);
  }
  return {
    toString,
    toInt
  };
}
({
  visibility: useVisibility().toInt("Shareable")
});
const defaultAnswer = {
  parent: "",
  visibility: useVisibility().toInt("Shareable"),
  metadata: {
    name: "Uploaded Answer",
    answerOnly: true,
    hasAnswers: true
  }
};
function getNodeRadius(width2, height2, numQNodes, numResults) {
  const totalArea = width2 * height2 * 0.5;
  return (num) => {
    const numerator = totalArea * num;
    const circleArea = numerator / numResults / numQNodes;
    let radius = Math.sqrt(circleArea / Math.PI);
    radius = Math.min(radius, height2 / 2 * 0.9);
    return radius;
  };
}
function getRankedCategories(hierarchies, categories) {
  const rankedCategories = categories.sort((a, b) => {
    const aLength = hierarchies[a] && hierarchies[a].length || 0;
    const bLength = hierarchies[b] && hierarchies[b].length || 0;
    return aLength - bLength;
  });
  return rankedCategories;
}
function makeDisplayNodes(message, hierarchies) {
  const displayNodes = {};
  message.results.forEach((result) => {
    Object.values(result.node_bindings).forEach((kgObjects) => {
      kgObjects.forEach((kgObj) => {
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
  const kgNodes = Object.values(displayNodes);
  kgNodes.sort((a, b) => b.count - a.count);
  return kgNodes;
}
function getFullDisplay(message) {
  let { nodes, edges } = message.knowledge_graph;
  nodes = Object.entries(nodes).map(([nodeId, nodeProps]) => {
    const props = nodeProps;
    const node = {
      id: nodeId,
      name: props.name,
      categories: props.categories
    };
    if (node.categories && !Array.isArray(node.categories)) {
      node.categories = [node.categories];
    }
    return node;
  });
  edges = Object.entries(edges).map(([edgeId, edgeProps]) => {
    const eProps = edgeProps;
    const edge = {
      id: edgeId,
      source: eProps.subject,
      target: eProps.object,
      predicates: eProps.predicates
    };
    if (edge.predicates && !Array.isArray(edge.predicates)) {
      edge.predicates = [edge.predicates];
    }
    return edge;
  });
  return { nodes, edges };
}
const kgUtils = {
  makeDisplayNodes,
  getFullDisplay,
  getRankedCategories,
  getNodeRadius
};
function findStartingNode(query_graph) {
  var _a, _b;
  const nodes = Object.entries((_a = query_graph.nodes) != null ? _a : {}).map(([key, node]) => {
    var _a3;
    var _a2;
    return {
      key,
      pinned: !!(typeof node === "object" && node && Array.isArray(node.ids) && ((_a3 = (_a2 = node.ids) == null ? void 0 : _a2.length) != null ? _a3 : 0) > 0)
    };
  });
  const edgeNums = queryBuilderUtils.getNumEdgesPerNode({
    edges: (_b = query_graph.edges) != null ? _b : {}
  });
  const unpinnedNodes = nodes.filter((node) => !node.pinned && node.key in edgeNums);
  const pinnedNodes = nodes.filter((node) => node.pinned && node.key in edgeNums);
  let startingNode = nodes.length && nodes[0].key || null;
  if (pinnedNodes.length) {
    pinnedNodes.sort((a, b) => edgeNums[a.key] - edgeNums[b.key]);
    startingNode = pinnedNodes[0].key;
  } else if (unpinnedNodes.length) {
    unpinnedNodes.sort((a, b) => edgeNums[a.key] - edgeNums[b.key]);
    startingNode = unpinnedNodes[0].key;
  }
  return startingNode;
}
function findConnectedNodes(edges, nodeList) {
  const nodeId = nodeList[nodeList.length - 1];
  const connectedEdgeIds = Object.keys(edges).filter((edgeId) => {
    const edge = edges[edgeId];
    return edge.subject === nodeId || edge.object === nodeId;
  });
  connectedEdgeIds.forEach((edgeId) => {
    const { subject, object } = edges[edgeId];
    const subjectIndex = nodeList.indexOf(subject);
    const objectIndex = nodeList.indexOf(object);
    if (objectIndex === -1) {
      nodeList.push(object);
      findConnectedNodes(edges, nodeList);
    }
    if (subjectIndex === -1) {
      nodeList.push(subject);
      findConnectedNodes(edges, nodeList);
    }
  });
}
function sortNodes(query_graph, startingNode) {
  const sortedNodes = [startingNode];
  findConnectedNodes(query_graph.edges, sortedNodes);
  const extraNodes = Object.keys(query_graph.nodes).filter(
    (nodeId) => sortedNodes.indexOf(nodeId) === -1
  );
  return [...sortedNodes, ...extraNodes];
}
function getColumnWidth(rows, qg_id, kg_nodes, headerText) {
  const maxWidth = 400;
  const magicSpacing = 10;
  const cellLength = Math.max(
    ...rows.map(
      (row) => (kg_nodes[row.node_bindings[qg_id][0].id].name || "").length
    ),
    headerText.length
  );
  return Math.min(maxWidth, cellLength * magicSpacing);
}
function makeTableHeaders(message, colorMap) {
  const { query_graph, knowledge_graph, results } = message;
  const startingNode = findStartingNode(query_graph);
  if (!startingNode) {
    return [];
  }
  const sortedNodes = sortNodes(query_graph, startingNode);
  const headerColumns = sortedNodes.map((id) => {
    const qgNode = query_graph.nodes[id];
    const backgroundColor = colorMap(qgNode.categories)[1];
    const nodeIdLabel = queryGraphUtils.getTableHeaderLabel(qgNode);
    const headerText = qgNode.name || nodeIdLabel || stringUtils.displayCategory(qgNode.categories) || "Something";
    const width2 = getColumnWidth(results, id, knowledge_graph.nodes, headerText);
    return {
      Header: `${headerText} (${id})`,
      color: backgroundColor,
      id,
      accessor: (row) => {
        const nodeBinding = row.node_bindings[id];
        if (!nodeBinding || nodeBinding.length === 0) return "";
        if (nodeBinding.length > 1) {
          return `Set of ${stringUtils.displayCategory(qgNode.categories)} [${nodeBinding.length}]`;
        }
        return knowledge_graph.nodes[nodeBinding[0].id].name || nodeBinding[0].id;
      },
      Cell: ({ value }) => value || "Unknown",
      disableSortBy: true,
      width: width2,
      filter: "equals"
    };
  });
  if (results.length && results[0].score) {
    const scoreColumn = {
      Header: "Score",
      color: void 0,
      id: "score",
      accessor: (row) => typeof row.score === "number" ? Math.round(row.score * 1e3) / 1e3 : void 0,
      Cell: ({ value }) => value != null ? value : "Unknown",
      disableSortBy: false,
      width: 30,
      filter: "equals",
      sortDescFirst: true,
      disableFilters: true
    };
    headerColumns.push(scoreColumn);
  }
  return headerColumns;
}
const pubmedUrl = "https://www.ncbi.nlm.nih.gov/pubmed/";
function getPublications(kgObj) {
  const publications = [];
  const publicationsAttributes = kgObj.attributes && Array.isArray(kgObj.attributes) && // TRAPI for publications attributes is not standardized
  kgObj.attributes.filter(
    (att) => att.attribute_type_id === "biolink:publications" || att.attribute_type_id === "biolink:Publication" || att.attribute_type_id === "publications" || att.type === "EDAM:data_0971"
  );
  if (Array.isArray(publicationsAttributes)) {
    publicationsAttributes.forEach((attribute) => {
      if (attribute.value_url) {
        publications.push(attribute.value_url);
      } else if (attribute.value) {
        if (!Array.isArray(attribute.value)) {
          attribute.value = [attribute.value];
        }
        attribute.value.forEach((publicationId) => {
          if (typeof publicationId === "string" && publicationId.startsWith("PMID:")) {
            publications.push(pubmedUrl + publicationId.split(":")[1]);
          }
        });
      }
    });
  }
  return publications;
}
const resultsUtils = {
  makeTableHeaders,
  getPublications
};
function useAnswerStore() {
  const [message, setMessage] = useState({});
  const [kgNodes, setKgNodes] = useState([]);
  const [selectedResult, setSelectedResult] = useState({ nodes: {}, edges: {} });
  const [selectedRowId, setSelectedRowId] = useState("");
  const [metaData, setMetaData] = useState({});
  const [resultJSON, setResultJSON] = useState({});
  const { colorMap, hierarchies } = useContext(BiolinkContext) || {};
  function resetAnswerExplorer() {
    setSelectedResult({ nodes: {}, edges: {} });
    setSelectedRowId("");
    setMetaData({});
    setResultJSON({});
  }
  function averageAnalysesScores(msg) {
    if (!msg.results) return msg;
    const resultsWithScore = msg.results.map((result) => {
      const score = result.analyses.reduce((sum, analysis) => sum + analysis.score, 0) / result.analyses.length;
      return {
        ...result,
        score
      };
    });
    return {
      ...msg,
      results: resultsWithScore
    };
  }
  function initialize(msg, updateDisplayState) {
    setMessage(averageAnalysesScores(msg));
    if (msg.knowledge_graph && msg.results) {
      setKgNodes(kgUtils.makeDisplayNodes(msg, hierarchies || {}));
      updateDisplayState({ type: "toggle", payload: { component: "results", show: true } });
    } else {
      updateDisplayState({ type: "disable", payload: { component: "results" } });
    }
    resetAnswerExplorer();
  }
  function reset() {
    setMessage({});
    setKgNodes([]);
    resetAnswerExplorer();
  }
  function selectRow(row, rowId) {
    if (rowId === selectedRowId) {
      resetAnswerExplorer();
    } else {
      const publications = {};
      const nodes = {};
      const nodesJSON = {};
      Object.entries(row.node_bindings).forEach(([qg_id, value]) => {
        const kgIdLength = value.length;
        value.forEach((kgObject) => {
          var _a;
          const kgNode = (_a = message.knowledge_graph) == null ? void 0 : _a.nodes[kgObject.id];
          nodesJSON[kgObject.id] = kgNode || "Unknown";
          if (kgNode) {
            let { categories } = kgNode;
            if (categories && !Array.isArray(categories)) {
              categories = [categories];
            }
            categories = kgUtils.getRankedCategories(hierarchies || {}, Array.isArray(categories) ? categories : categories ? [categories] : []);
            const graphNode = {
              id: kgObject.id,
              name: kgNode.name || kgObject.id || categories[0] || "",
              categories: categories || [],
              qg_id,
              is_set: false,
              score: kgIdLength > 1 ? 0 : Infinity
            };
            nodes[kgObject.id] = graphNode;
          }
        });
      });
      const edges = {};
      const edgesJSON = {};
      row.analyses.forEach((analysis) => {
        const edge_bindings = Object.values(analysis.edge_bindings).flat();
        const support_graph_edge_bindings = [];
        if (Array.isArray(analysis.support_graphs)) {
          analysis.support_graphs.forEach((supportGraphId) => {
            var _a;
            const supportGraph = (_a = message.auxiliary_graphs) == null ? void 0 : _a[supportGraphId];
            if (supportGraph) {
              support_graph_edge_bindings.push(...supportGraph.edges.map((e) => ({ id: e })));
            }
          });
        }
        [...edge_bindings, ...support_graph_edge_bindings].forEach((binding) => {
          var _a, _b, _c;
          const kgEdge = (_a = message.knowledge_graph) == null ? void 0 : _a.edges[binding.id];
          edgesJSON[binding.id] = kgEdge || "Unknown";
          if (kgEdge) {
            const graphEdge = {
              id: binding.id,
              source: kgEdge.subject,
              target: kgEdge.object,
              predicate: kgEdge.predicate
            };
            edges[binding.id] = graphEdge;
            if (kgEdge.subject in nodes) {
              nodes[kgEdge.subject].score += 1;
            }
            if (kgEdge.object in nodes) {
              nodes[kgEdge.object].score += 1;
            }
            const subjectNode = (_b = message.knowledge_graph) == null ? void 0 : _b.nodes[kgEdge.subject];
            const objectNode = (_c = message.knowledge_graph) == null ? void 0 : _c.nodes[kgEdge.object];
            const edgeKey = `${(subjectNode == null ? void 0 : subjectNode.name) || kgEdge.subject} ${stringUtils.displayPredicate(kgEdge.predicate)} ${(objectNode == null ? void 0 : objectNode.name) || kgEdge.object}`;
            publications[edgeKey] = resultsUtils.getPublications(kgEdge);
          }
        });
      });
      setSelectedResult({ nodes, edges });
      setSelectedRowId(rowId);
      setMetaData(publications);
      setResultJSON({ knowledge_graph: { nodes: nodesJSON, edges: edgesJSON }, result: row });
    }
  }
  const tableHeaders = useMemo(() => {
    if (message.query_graph && message.knowledge_graph && message.results) {
      return resultsUtils.makeTableHeaders(message, colorMap || (() => [null, ""]));
    }
    return [];
  }, [message, colorMap]);
  const showNodePruneSlider = useMemo(
    () => Object.keys(resultJSON).length > 0 && resultJSON.result && Object.values(resultJSON.result.node_bindings).some((kgIdList) => kgIdList.length > 3),
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
    metaData
  };
}
function reducer(state, action) {
  switch (action.type) {
    case "toggle": {
      const { component, show } = action.payload;
      state[component].show = show;
      state[component].disabled = false;
      break;
    }
    case "disable": {
      const { component } = action.payload;
      state[component].show = false;
      state[component].disabled = true;
      break;
    }
    default: {
      return { ...state };
    }
  }
  return { ...state };
}
function useDisplayState() {
  const [state, dispatch] = useReducer(reducer, {
    qg: { show: true, label: "Query Graph" },
    kgFull: { show: false, label: "Knowledge Graph", disabled: true },
    results: { show: true, label: "Results Table" }
  });
  return {
    displayState: state,
    updateDisplayState: dispatch
  };
}
function LeftDrawer({ onUpload, displayState, updateDisplayState, message, saveAnswer, deleteAnswer, owned }) {
  const [downloadOpen, setDownloadOpen] = useState(false);
  function toggleDisplay(component, show) {
    updateDisplayState({ type: "toggle", payload: { component, show } });
  }
  return /* @__PURE__ */ jsxs(
    Drawer,
    {
      container: document.getElementById("contentContainer"),
      variant: "permanent",
      open: true,
      classes: {
        paper: "leftDrawer"
      },
      children: [
        /* @__PURE__ */ jsx(Toolbar, {}),
        /* @__PURE__ */ jsxs(List, { children: [
          Object.entries(displayState).map(([key, val]) => /* @__PURE__ */ jsxs(ListItemButton, { onClick: () => toggleDisplay(key, !val.show), disabled: val.disabled, children: [
            /* @__PURE__ */ jsx(ListItemIcon, { children: /* @__PURE__ */ jsx(Checkbox, { checked: val.show, disableRipple: true }) }),
            /* @__PURE__ */ jsx(ListItemText, { primary: val.label })
          ] }, key)),
          /* @__PURE__ */ jsxs(
            ListItemButton,
            {
              disabled: !Object.keys(message).length,
              onClick: () => {
                setDownloadOpen(true);
              },
              children: [
                /* @__PURE__ */ jsx(ListItemIcon, { children: /* @__PURE__ */ jsx(IconButton, { component: "span", style: { fontSize: "18px" }, title: "Download", disableRipple: true, children: /* @__PURE__ */ jsx(GetAppIcon, {}) }) }),
                /* @__PURE__ */ jsx(ListItemText, { primary: "Download Query" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            ListItemButton,
            {
              disabled: !Object.keys(message).length,
              onClick: () => {
                setDownloadOpen(true);
              },
              children: [
                /* @__PURE__ */ jsx(ListItemIcon, { children: /* @__PURE__ */ jsx(IconButton, { component: "span", style: { fontSize: "18px" }, title: "Download", disableRipple: true, children: /* @__PURE__ */ jsx(GetAppIcon, {}) }) }),
                /* @__PURE__ */ jsx(ListItemText, { primary: "Download Answer" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(ListItemButton, { component: "label", children: [
            /* @__PURE__ */ jsx(ListItemIcon, { children: /* @__PURE__ */ jsx(IconButton, { component: "span", style: { fontSize: "18px" }, title: "Upload Answer", disableRipple: true, children: /* @__PURE__ */ jsx(PublishIcon, {}) }) }),
            /* @__PURE__ */ jsx(ListItemText, { primary: "Upload Answer" }),
            /* @__PURE__ */ jsx("input", { accept: ".json", hidden: true, style: { display: "none" }, type: "file", onChange: (e) => onUpload(e) })
          ] })
        ] }),
        /* @__PURE__ */ jsx(DownloadDialog, { open: downloadOpen, setOpen: setDownloadOpen, message })
      ]
    }
  );
}
function WorkerWrapper(options) {
  return new Worker(
    "/assets/simulation.worker-D4TtnuFj.js",
    {
      name: options == null ? void 0 : options.name
    }
  );
}
const height = 400;
const width = 400;
function KgFull({ message }) {
  const canvasRef = useRef(null);
  const [loading, toggleLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { colorMap, hierarchies } = useContext(BiolinkContext);
  function displayCanvas(data) {
    var _a;
    const canvas = d3.select(canvasRef.current).attr("width", width).attr("height", height);
    const context = (_a = canvas.node()) == null ? void 0 : _a.getContext("2d");
    if (!context) return;
    const { nodes, edges } = data;
    context.clearRect(0, 0, width, height);
    context.save();
    context.translate(width / 2, height / 2);
    function drawEdge(d) {
      if (context) {
        context.moveTo(d.source.x, d.source.y);
        context.lineTo(d.target.x, d.target.y);
      }
    }
    function drawNode(d) {
      if (!context) return;
      context.beginPath();
      context.moveTo(d.x + 5, d.y);
      context.arc(d.x, d.y, 5, 0, 2 * Math.PI);
      if (d.categories && Array.isArray(d.categories)) {
        d.categories = kgUtils.getRankedCategories(hierarchies || {}, d.categories);
      }
      const color = colorMap && d.categories ? colorMap(d.categories)[1] : "#000";
      context.strokeStyle = color;
      context.fillStyle = color;
      context.fill();
      context.stroke();
    }
    context.beginPath();
    edges.forEach(drawEdge);
    context.strokeStyle = "#aaa";
    context.stroke();
    nodes.forEach(drawNode);
    context.restore();
  }
  function getGraphFromWorker() {
    const simulationWorker = new WorkerWrapper();
    const kgLists = kgUtils.getFullDisplay(message);
    toggleLoading(true);
    simulationWorker.onmessage = (e) => {
      switch (e.data.type) {
        case "display": {
          displayCanvas(e.data);
          toggleLoading(false);
          simulationWorker.terminate();
          break;
        }
        case "tick": {
          if (e.data.progress !== void 0) {
            setProgress(e.data.progress);
          }
          break;
        }
        default:
          console.log("unhandled worker message");
      }
    };
    simulationWorker.postMessage(kgLists);
  }
  useEffect(() => {
    if (canvasRef.current) {
      d3.select(canvasRef.current).attr("width", 0).attr("height", 0);
    }
    if (Object.keys(message).length) {
      getGraphFromWorker();
    }
  }, [message]);
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { id: "kgFullContainer", style: { height, width, display: "inline-block" }, children: [
    loading && /* @__PURE__ */ jsxs(Box, { position: "relative", display: "inline-flex", children: [
      /* @__PURE__ */ jsx(CircularProgress, { variant: "determinate", value: progress, size: 150 }),
      /* @__PURE__ */ jsx(
        Box,
        {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          children: `${Math.round(progress)}%`
        }
      )
    ] }),
    /* @__PURE__ */ jsx("canvas", { ref: canvasRef })
  ] }) });
}
const nodeRadius$1 = 48;
const edgeLength = 225;
function QueryGraph({ query_graph }) {
  const svgRef = useRef(null);
  const { colorMap, predicates = [] } = useContext(BiolinkContext);
  const [drawing, setDrawing] = useState(false);
  const symmetricPredicates = predicates.filter((predicate) => predicate.symmetric).map((predicate) => predicate.predicate);
  function setSvgSize() {
    var _a, _b;
    const svgElem = svgRef.current;
    if (!svgElem) return;
    const svg = d3.select(svgElem);
    const { width: width2, height: height2 } = (_b = (_a = svg.node()) == null ? void 0 : _a.parentNode) == null ? void 0 : _b.getBoundingClientRect();
    svg.attr("width", width2).attr("height", height2).attr("preserveAspectRatio", "xMinYMin meet").attr("viewBox", [0, 0, width2, height2]);
  }
  useEffect(() => {
    setSvgSize();
  }, []);
  function drawQueryGraph() {
    var _a, _b;
    let { nodes, edges } = queryGraphUtils.getNodeAndEdgeListsForDisplay(query_graph);
    const svg = d3.select(svgRef.current);
    const { width: width2, height: height2 } = (_b = (_a = svg.node()) == null ? void 0 : _a.parentNode) == null ? void 0 : _b.getBoundingClientRect();
    svg.selectAll("*").remove();
    const defs = svg.append("defs");
    defs.append("marker").attr("id", "arrow").attr("viewBox", [0, 0, 20, 13]).attr("refX", 20).attr("refY", 6.5).attr("markerWidth", 6.5).attr("markerHeight", 25).attr("orient", "auto-start-reverse").append("path").attr(
      "d",
      d3.line()([
        [0, 0],
        [0, 13],
        [25, 6.5]
      ])
    ).attr("fill", "#999");
    let node = svg.append("g").attr("id", "nodeContainer").selectAll("g");
    let edge = svg.append("g").attr("id", "edgeContainer").selectAll("g");
    nodes = nodes.map((d) => ({ ...d, x: Math.random() * width2, y: Math.random() * height2 }));
    const simulation = d3.forceSimulation(nodes).force("center", d3.forceCenter(width2 / 2, height2 / 2).strength(0.5)).force("forceY", d3.forceY(height2 / 2).strength(0.2)).force("collide", d3.forceCollide().radius(nodeRadius$1 * 2)).force(
      "link",
      d3.forceLink(edges).id((d) => d.id).distance(edgeLength).strength(0)
    ).on("tick", () => {
      node.attr("transform", (d) => {
        let padding = nodeRadius$1;
        if (d.fx !== null && d.fx !== void 0) {
          padding *= 0.5;
        }
        d.x = graphUtils.getBoundedValue(d.x, width2 - padding, padding);
        d.y = graphUtils.getBoundedValue(d.y, height2 - padding, padding);
        return `translate(${d.x}, ${d.y})`;
      });
      edge.select(".edge").attr("d", (d) => {
        const { x1, y1, qx, qy, x2, y2 } = graphUtils.getCurvedEdgePos(
          d.source.x,
          d.source.y,
          d.target.x,
          d.target.y,
          d.numEdges,
          d.index,
          nodeRadius$1
        );
        return `M${x1},${y1}Q${qx},${qy} ${x2},${y2}`;
      });
      edge.select(".edgeTransparent").attr("d", (d) => {
        const { x1, y1, qx, qy, x2, y2 } = graphUtils.getCurvedEdgePos(
          d.source.x,
          d.source.y,
          d.target.x,
          d.target.y,
          d.numEdges,
          d.index,
          nodeRadius$1
        );
        const leftNode = x1 > x2 ? `${x2},${y2}` : `${x1},${y1}`;
        const rightNode = x1 > x2 ? `${x1},${y1}` : `${x2},${y2}`;
        return `M${leftNode}Q${qx},${qy} ${rightNode}`;
      });
    });
    node = node.data(nodes).enter().append("g").attr("class", "node").call(dragUtils.dragNode(simulation)).call(
      (n) => n.append("circle").attr("r", nodeRadius$1).attr("fill", (d) => colorMap(d.categories)[1]).call((nCircle) => nCircle.append("title").text((d) => d.name))
    ).call(
      (n) => n.append("text").attr("class", "nodeLabel").style("pointer-events", "none").attr("text-anchor", "middle").style("font-weight", 600).attr("alignment-baseline", "middle").text((d) => {
        const { name } = d;
        return name || "Any";
      }).each(graphUtils.fitTextIntoCircle)
    );
    edges = edgeUtils.addEdgeCurveProperties(edges);
    edge = edge.data(edges).enter().append("g").call(
      (e) => e.append("path").attr("stroke", "#999").attr("fill", "none").attr("stroke-width", (d) => d.strokeWidth).attr("class", "edge").attr(
        "marker-end",
        (d) => graphUtils.shouldShowArrow(d, symmetricPredicates) ? "url(#arrow)" : ""
      )
    ).call(
      (e) => e.append("path").attr("stroke", "transparent").attr("fill", "none").attr("stroke-width", 10).attr("class", "edgeTransparent").attr("id", (d) => `edge${d.id}`).call(
        () => e.append("text").attr("class", "edgeText").attr("pointer-events", "none").style("text-anchor", "middle").attr("dy", (d) => -d.strokeWidth).append("textPath").attr("pointer-events", "none").attr("xlink:href", (d) => `#edge${d.id}`).attr("startOffset", "50%").text(
          (d) => d.predicates ? d.predicates.map((p) => stringUtils.displayPredicate(p)).join(" or ") : ""
        )
      ).call(
        (eLabel) => eLabel.append("title").text(
          (d) => d.predicates ? d.predicates.map((p) => stringUtils.displayPredicate(p)).join(" or ") : ""
        )
      )
    );
    simulation.alpha(1).restart();
  }
  useEffect(() => {
    if (query_graph) {
      drawQueryGraph();
    }
  }, [query_graph, colorMap]);
  useEffect(() => {
    let timer;
    function handleResize() {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();
      setDrawing(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        setSvgSize();
        drawQueryGraph();
        setDrawing(false);
      }, 1e3);
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [query_graph]);
  return /* @__PURE__ */ jsxs(Paper, { id: "queryGraphContainer", elevation: 3, children: [
    /* @__PURE__ */ jsx("h5", { className: "cardLabel", children: "Question Graph" }),
    drawing && /* @__PURE__ */ jsx(Loading, { positionStatic: true, message: "Redrawing question graph..." }),
    /* @__PURE__ */ jsx("svg", { ref: svgRef })
  ] });
}
function expansionReducer(state, action) {
  switch (action.type) {
    case "toggle":
      if (action.key) {
        state[action.key] = !state[action.key];
      }
      break;
    case "clear":
      return {};
  }
  return { ...state };
}
function ResultMetaData({ metaData, result }) {
  const [expanded, updateExpanded] = useReducer(expansionReducer, {});
  const [showJSON, toggleJSONVisibility] = useState(false);
  useEffect(() => {
    updateExpanded({ type: "clear" });
  }, [metaData]);
  const hasSupportPublications = useMemo(
    () => !!Object.values(metaData).find((pubs) => pubs.length > 0),
    [metaData]
  );
  return /* @__PURE__ */ jsxs(Paper, { id: "resultMetaData", elevation: 3, children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h4", { children: "Supporting Publications" }),
      hasSupportPublications ? /* @__PURE__ */ jsx(List, { children: Object.entries(metaData).map(([key, publications]) => /* @__PURE__ */ jsx(React.Fragment, { children: publications.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs(ListItemButton, { onClick: () => updateExpanded({ type: "toggle", key }), children: [
          /* @__PURE__ */ jsx(ListItemText, { primary: key }),
          expanded[key] ? /* @__PURE__ */ jsx(ExpandLess, {}) : /* @__PURE__ */ jsx(ExpandMore, {})
        ] }),
        /* @__PURE__ */ jsx(Collapse, { in: expanded[key], timeout: "auto", unmountOnExit: true, children: /* @__PURE__ */ jsx(List, { component: "div", children: publications.map((publication) => /* @__PURE__ */ jsx(
          ListItem,
          {
            component: "a",
            href: publication,
            target: "_blank",
            rel: "noreferrer",
            children: /* @__PURE__ */ jsx(ListItemText, { primary: publication, inset: true })
          },
          shortid.generate()
        )) }) })
      ] }) }, shortid.generate())) }) : /* @__PURE__ */ jsx(List, { children: /* @__PURE__ */ jsx(ListItem, { children: /* @__PURE__ */ jsx(ListItemText, { primary: "No Supporting Publications Found" }) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("h4", { children: [
        "Result JSON \xA0",
        /* @__PURE__ */ jsx(IconButton, { onClick: () => toggleJSONVisibility(!showJSON), children: !showJSON ? /* @__PURE__ */ jsx(ExpandMore, {}) : /* @__PURE__ */ jsx(ExpandLess, {}) })
      ] }),
      showJSON && /* @__PURE__ */ jsx("pre", { id: "resultJSONContainer", children: JSON.stringify(result, null, 2) })
    ] })
  ] });
}
const headerStyles = { fontWeight: "bold", backgroundColor: "#eee" };
const StyledTableBody$1 = styled(TableBody)(() => ({
  "& .MuiTableRow-root:last-of-type .MuiTableCell-root": {
    borderBottom: "none"
  }
}));
const ValueCell$1 = ({ value }) => /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("ul", { style: { padding: 0, margin: 0, listStyleType: "none" }, children: Array.isArray(value) ? value.map((valueItem, valueItemIndex) => /* @__PURE__ */ jsx("li", { children: valueItem }, valueItemIndex)) : /* @__PURE__ */ jsx("li", { children: value }) }) });
const PublicationLinkCell = ({ value }) => {
  const getLinkFromValue = (pmidValue) => {
    const pmid = pmidValue.split(":");
    if (pmid.length !== 2) return null;
    return pmid[0] === "PMC" ? `https://pmc.ncbi.nlm.nih.gov/articles/${pmid[0]}${pmid[1]}/` : pmid[0] === "PMID" ? `https://pubmed.ncbi.nlm.nih.gov/${pmid[1]}/` : null;
  };
  return /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("ul", { style: { padding: 0, margin: 0, listStyleType: "none" }, children: Array.isArray(value) ? value.map((valueItem, valueItemIndex) => {
    const link = getLinkFromValue(valueItem);
    return /* @__PURE__ */ jsx("li", { children: link === null ? valueItem : /* @__PURE__ */ jsx("a", { href: link, target: "_blank", rel: "noreferrer", children: valueItem }) }, valueItemIndex);
  }) : /* @__PURE__ */ jsx("li", { children: getLinkFromValue(value) === null ? value : /* @__PURE__ */ jsx("a", { href: getLinkFromValue(value) || "#", target: "_blank", rel: "noreferrer", children: value }) }) }) });
};
const AttributesTable = ({ attributes, sources }) => /* @__PURE__ */ jsx(Box, { style: { maxHeight: 500, overflow: "auto" }, children: /* @__PURE__ */ jsxs(Table, { size: "small", "aria-label": "edge attributes table", children: [
  /* @__PURE__ */ jsx(TableHead, { style: { position: "sticky", top: 0 }, children: /* @__PURE__ */ jsxs(TableRow, { children: [
    /* @__PURE__ */ jsx(TableCell, { style: headerStyles, children: "attribute_type_id" }),
    /* @__PURE__ */ jsx(TableCell, { style: headerStyles, children: "value" })
  ] }) }),
  /* @__PURE__ */ jsxs(StyledTableBody$1, { children: [
    attributes.map((attribute, index) => /* @__PURE__ */ jsxs(TableRow, { children: [
      /* @__PURE__ */ jsx(TableCell, { style: { verticalAlign: "top" }, children: attribute.attribute_type_id }),
      attribute.attribute_type_id === "biolink:publications" ? /* @__PURE__ */ jsx(PublicationLinkCell, { value: attribute.value }) : /* @__PURE__ */ jsx(ValueCell$1, { value: attribute.value })
    ] }, index)),
    /* @__PURE__ */ jsxs(TableRow, { children: [
      /* @__PURE__ */ jsx(TableCell, { children: "Sources" }),
      /* @__PURE__ */ jsx(TableCell, { children: Array.isArray(sources) && sources.map((source, i) => /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsx("p", { style: { marginBottom: "0px", fontStyle: "italic" }, children: source.resource_id }),
        /* @__PURE__ */ jsx("p", { style: { filter: "opacity(0.75)", fontSize: "0.8em" }, children: source.resource_role }),
        Boolean(source.upstream_resource_ids) && Array.isArray(source.upstream_resource_ids) && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("p", { style: { marginBottom: "0px" }, children: "Upstream resource ids:" }),
          /* @__PURE__ */ jsx("ul", { children: source.upstream_resource_ids.map((urid, j) => /* @__PURE__ */ jsx("li", { children: urid }, j)) })
        ] }),
        i === sources.length - 1 ? null : /* @__PURE__ */ jsx("hr", {})
      ] }, i)) })
    ] })
  ] })
] }) });
const PopoverPaper = styled(Paper)(({ theme }) => ({
  filter: "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.3))",
  position: "relative",
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    bottom: "-15px",
    left: "0",
    right: "0",
    margin: "0 auto",
    clipPath: "path('M 0 0 L 20 0 L 10 15 Z')",
    width: "20px",
    height: "15px",
    backgroundColor: theme.palette.background.paper
  }
}));
const PopoverPaperBelow = styled(PopoverPaper)(() => ({
  "&::before": {
    top: "-15px",
    bottom: "unset",
    clipPath: "path('M 0 15 L 20 15 L 10 0 Z')"
  }
}));
const Popover = ({ children, open, onClose, anchorPosition, above }) => {
  let PositionedPaper = PopoverPaperBelow;
  if (above) PositionedPaper = PopoverPaper;
  let anchorOriginVertical = "bottom";
  if (above) anchorOriginVertical = "top";
  let transformOriginVertical = "top";
  if (above) transformOriginVertical = "bottom";
  let marginBlockStart = "28px";
  if (above) marginBlockStart = "-28px";
  return /* @__PURE__ */ jsx(
    Popover$1,
    {
      anchorReference: "anchorPosition",
      anchorPosition,
      open,
      onClose,
      anchorOrigin: {
        vertical: anchorOriginVertical,
        horizontal: "center"
      },
      transformOrigin: {
        vertical: transformOriginVertical,
        horizontal: "center"
      },
      PaperProps: {
        style: {
          boxShadow: "none",
          overflow: "visible",
          marginBlockStart
        }
      },
      children: /* @__PURE__ */ jsx(PositionedPaper, { children })
    }
  );
};
const StyledTableBody = styled(TableBody)(() => ({
  "& .MuiTableRow-root:last-of-type .MuiTableCell-root": {
    borderBottom: "none"
  }
}));
const ValueCell = ({ value }) => /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("ul", { style: { padding: 0, margin: 0, listStyleType: "none" }, children: Array.isArray(value) ? value.map((valueItem, valueItemIndex) => /* @__PURE__ */ jsx("li", { children: valueItem }, valueItemIndex)) : /* @__PURE__ */ jsx("li", { children: value }) }) });
const NodeAttributesTable = ({ nodeData }) => {
  const { name, id, categories, count } = nodeData;
  return /* @__PURE__ */ jsx(Box, { style: { maxHeight: 500, overflow: "auto" }, children: /* @__PURE__ */ jsx(Table, { size: "small", "aria-label": "node attributes table", children: /* @__PURE__ */ jsxs(StyledTableBody, { children: [
    Boolean(name) && /* @__PURE__ */ jsxs(TableRow, { style: { verticalAlign: "top" }, children: [
      /* @__PURE__ */ jsx(TableCell, { children: "Name" }),
      /* @__PURE__ */ jsx(ValueCell, { value: name })
    ] }),
    Boolean(id) && /* @__PURE__ */ jsxs(TableRow, { style: { verticalAlign: "top" }, children: [
      /* @__PURE__ */ jsx(TableCell, { children: "ID" }),
      /* @__PURE__ */ jsx(ValueCell, { value: id })
    ] }),
    Boolean(categories) && /* @__PURE__ */ jsxs(TableRow, { style: { verticalAlign: "top" }, children: [
      /* @__PURE__ */ jsx(TableCell, { children: "Categories" }),
      /* @__PURE__ */ jsx(ValueCell, { value: categories })
    ] }),
    Boolean(count) && /* @__PURE__ */ jsxs(TableRow, { style: { verticalAlign: "top" }, children: [
      /* @__PURE__ */ jsx(TableCell, { children: "Count" }),
      /* @__PURE__ */ jsx(ValueCell, { value: count })
    ] })
  ] }) }) });
};
const nodeRadius = 40;
function ResultExplorer({ answerStore }) {
  const svgRef = useRef(null);
  const svg = useRef(null);
  const width2 = useRef(0);
  const height2 = useRef(0);
  const node = useRef(null);
  const edge = useRef(null);
  const simulation = useRef(null);
  const { colorMap, predicates } = useContext(BiolinkContext);
  const [numTrimmedNodes, setNumTrimmedNodes] = useState(answerStore.numQgNodes);
  const debouncedTrimmedNodes = useDebounce(numTrimmedNodes, 500);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [popoverOpen, setPopoverOpen] = useState(null);
  const [popoverData, setPopoverData] = useState({});
  const symmetricPredicates = (predicates || []).filter((predicate) => predicate && predicate.symmetric).map((predicate) => predicate.predicate);
  useEffect(() => {
    if (!svgRef.current) return;
    svg.current = d3.select(svgRef.current);
    const { width: fullWidth, height: fullHeight } = svg.current.node().getBoundingClientRect();
    width2.current = fullWidth;
    height2.current = fullHeight;
    svg.current.attr("width", width2.current).attr("height", height2.current).attr("preserveAspectRatio", "xMinYMin meet").attr("viewBox", [0, 0, width2.current, height2.current]);
    if (svg.current.select("defs").empty()) {
      const defs = svg.current.append("defs");
      defs.append("marker").attr("id", "arrow").attr("viewBox", [0, 0, 20, 13]).attr("refX", 20).attr("refY", 6.5).attr("markerWidth", 6.5).attr("markerHeight", 25).attr("orient", "auto-start-reverse").append("path").attr(
        "d",
        d3.line()([
          [0, 0],
          [0, 13],
          [25, 6.5]
        ])
      ).attr("fill", "#999");
    }
    if (svg.current.select("#nodeContainer").empty()) {
      svg.current.append("g").attr("id", "nodeContainer");
      node.current = svg.current.select("#nodeContainer").selectAll("g");
    }
    if (svg.current.select("#edgeContainer").empty()) {
      svg.current.append("g").attr("id", "edgeContainer");
      edge.current = svg.current.select("#edgeContainer").selectAll("g");
    }
  }, []);
  function ticked() {
    if (!node.current || !edge.current) return;
    node.current.attr("transform", (d) => {
      let padding = nodeRadius;
      if (d.fx !== null && d.fx !== void 0) {
        padding *= 0.5;
      }
      d.x = graphUtils.getBoundedValue(Number(d.x), Number(width2.current) - padding, padding);
      d.y = graphUtils.getBoundedValue(Number(d.y), Number(height2.current) - padding, padding);
      return `translate(${d.x}, ${d.y})`;
    });
    edge.current.select(".result_edge").attr("d", (d) => {
      const { x1, y1, qx, qy, x2, y2 } = graphUtils.getCurvedEdgePos(
        Number(d.source.x),
        Number(d.source.y),
        Number(d.target.x),
        Number(d.target.y),
        Number(d.numEdges),
        Number(d.index),
        nodeRadius
      );
      return `M${x1},${y1}Q${qx},${qy} ${x2},${y2}`;
    });
    edge.current.select(".result_edge_transparent").attr("d", (d) => {
      const { x1, y1, qx, qy, x2, y2 } = graphUtils.getCurvedEdgePos(
        Number(d.source.x),
        Number(d.source.y),
        Number(d.target.x),
        Number(d.target.y),
        Number(d.numEdges),
        Number(d.index),
        nodeRadius
      );
      const leftNode = x1 > x2 ? `${x2},${y2}` : `${x1},${y1}`;
      const rightNode = x1 > x2 ? `${x1},${y1}` : `${x2},${y2}`;
      return `M${leftNode}Q${qx},${qy} ${rightNode}`;
    });
  }
  useEffect(() => {
    simulation.current = d3.forceSimulation().force("collide", d3.forceCollide().radius(nodeRadius * 2)).force(
      "link",
      d3.forceLink().id((d) => d.id).distance(175).strength(0)
    ).on("tick", ticked);
  }, []);
  function drawAnswerGraph() {
    if (!svg.current || !simulation.current) return;
    const { width: fullWidth, height: fullHeight } = svg.current.node().getBoundingClientRect();
    width2.current = fullWidth;
    height2.current = fullHeight;
    svg.current.attr("width", width2.current).attr("height", height2.current).attr("preserveAspectRatio", "xMinYMin meet").attr("viewBox", [0, 0, width2.current, height2.current]);
    simulation.current.force("center", d3.forceCenter(width2.current / 2, height2.current / 2).strength(0.5)).force("forceY", d3.forceY(height2.current / 2).strength(0.2));
    const oldNodes = new Map((node.current ? node.current.data() : []).map((d) => [d.id, { x: d.x, y: d.y }]));
    const sortedNodes = Object.values(answerStore.selectedResult.nodes).sort((a, b) => b.score - a.score);
    const trimmedNodes = sortedNodes.slice(0, answerStore.showNodePruneSlider ? Number(debouncedTrimmedNodes) : void 0);
    const nodes = trimmedNodes.map(
      (d) => Object.assign(
        oldNodes.get(d.id) || {
          x: Math.random() * width2.current,
          y: Math.random() * height2.current
        },
        d
      )
    );
    const trimmedNodeIds = trimmedNodes.map((n) => n.id);
    const trimmedEdges = Object.keys(answerStore.selectedResult.edges).filter((key) => {
      const e = answerStore.selectedResult.edges[key];
      return trimmedNodeIds.includes(e.source) && trimmedNodeIds.includes(e.target);
    }).map((key) => {
      var _a, _b;
      return {
        ...answerStore.selectedResult.edges[key],
        attributes: (_a = answerStore.resultJSON.knowledge_graph.edges[key]) == null ? void 0 : _a.attributes,
        sources: (_b = answerStore.resultJSON.knowledge_graph.edges[key]) == null ? void 0 : _b.sources
      };
    });
    const edges = trimmedEdges.map((d) => ({ ...d }));
    simulation.current.nodes(nodes);
    simulation.current.force("link").links(edges);
    node.current = node.current.data(nodes, (d) => d.id).join(
      (enter) => enter.append("g").attr("class", "result_node").call(dragUtils.dragNode(simulation.current)).call(
        (n) => n.append("circle").attr("r", nodeRadius).attr("fill", (d) => colorMap ? colorMap(d.categories)[1] : "#ccc").call((nCircle) => nCircle.append("title").text((d) => d.name)).style("transition", "stroke-width 200ms ease-in-out, stroke 200ms ease-in-out, filter 200ms ease-in-out").style("cursor", "pointer").on("mouseover", function() {
          d3.select(this).attr("stroke", "#239cff").style("filter", "brightness(1.1)").attr("stroke-width", 3);
        }).on("mouseout", function() {
          d3.select(this).attr("stroke", "none").style("filter", "initial").attr("stroke-width", 0);
        }).on("click", function() {
          handleClickNode(d3.select(this).datum());
        })
      ).call(
        (n) => n.append("text").attr("class", "result_node_label").style("pointer-events", "none").attr("text-anchor", "middle").style("font-weight", 600).attr("alignment-baseline", "middle").text((d) => d.name).each(graphUtils.fitTextIntoCircle)
      ),
      (update) => update,
      (exit) => exit.transition().ease(d3.easeCircle).duration(1e3).attr("transform", (d) => `translate(${d.x},-40)`).call((e) => e.select("circle").attr("fill", "red")).remove()
    );
    const edgesWithCurves = edgeUtils.addEdgeCurveProperties(edges);
    edge.current = edge.current.data(edgesWithCurves, (d) => d.id).join(
      (enter) => enter.append("g").call(
        (e) => e.append("path").attr("stroke", "transparent").attr("fill", "none").attr("stroke-width", 10).attr("class", "result_edge_transparent").attr("id", (d) => `result_explorer_edge${d.id}`).call(
          () => e.append("text").attr("stroke", "none").attr("class", "edgeText").attr("pointer-events", "none").style("text-anchor", "middle").attr("dy", (d) => -(d.strokeWidth || 0)).append("textPath").attr("pointer-events", "none").attr("xlink:href", (d) => `#result_explorer_edge${d.id}`).attr("startOffset", "50%").text((d) => stringUtils.displayPredicate(d.predicate))
        ).call((eLabel) => eLabel.append("title").text((d) => stringUtils.displayPredicate(d.predicate)))
      ).call(
        (e) => e.append("path").attr("stroke", "inherit").attr("fill", "none").attr("stroke-width", (d) => d.strokeWidth).attr("class", "result_edge").attr("marker-end", (d) => graphUtils.shouldShowArrow(d, symmetricPredicates) ? "url(#arrow)" : "")
      ).attr("fill", "black").attr("stroke", "#999").style("transition", "stroke 100ms ease-in-out, fill 100ms ease-in-out").style("cursor", "pointer").on("mouseover", function() {
        d3.select(this).attr("fill", "#239cff").attr("stroke", "#239cff");
      }).on("mouseout", function() {
        d3.select(this).attr("fill", "black").attr("stroke", "#999");
      }).on("click", function(event) {
        handleClickEdge(event, d3.select(this).datum());
      }),
      (update) => update.call((e) => e.select("title").text((d) => stringUtils.displayPredicate(d.predicate))).call(
        (e) => e.select("text").select("textPath").text((d) => stringUtils.displayPredicate(d.predicate))
      ),
      (exit) => exit.remove()
    );
    simulation.current.alpha(1).restart();
  }
  function resize() {
    const container = d3.select("#resultExplorer");
    const fullWidth = 50;
    if (answerStore.selectedRowId !== "") {
      const currentWidth = parseInt(container.style("width"), 10);
      const widthDifference = fullWidth - currentWidth % (fullWidth + 1);
      const duration = 1e3 * (widthDifference / fullWidth);
      container.transition().ease(d3.easeCircle).duration(duration).style("width", `${fullWidth}%`).style("margin-left", "10px").on("end", drawAnswerGraph).style("overflow-y", "unset");
    } else {
      container.style("overflow-y", "auto").transition().ease(d3.easeCircle).duration(1e3).style("width", "0%");
      d3.select(svgRef.current).attr("width", "0");
    }
  }
  const handleClickEdge = (event, data) => {
    setPopoverPosition({ x: event.clientX, y: event.clientY });
    setPopoverData(data);
    setPopoverOpen("edge");
  };
  const handleClickNode = (data) => {
    var _a, _b;
    if (!svgRef.current) return;
    const { top, left } = svgRef.current.getBoundingClientRect();
    setPopoverPosition({
      x: left + ((_a = data.x) != null ? _a : 0),
      y: top + ((_b = data.y) != null ? _b : 0)
    });
    setPopoverData({
      name: data.name,
      id: data.id,
      categories: data.categories
    });
    setPopoverOpen("node");
  };
  useEffect(() => {
    resize();
  }, [answerStore.selectedResult, answerStore.selectedRowId, debouncedTrimmedNodes, colorMap]);
  return /* @__PURE__ */ jsxs(Paper, { id: "resultExplorer", elevation: 3, children: [
    /* @__PURE__ */ jsx("h5", { className: "cardLabel", children: "Answer Explorer" }),
    Boolean(answerStore.showNodePruneSlider) && /* @__PURE__ */ jsx(Box, { width: 200, id: "nodeNumSlider", children: /* @__PURE__ */ jsx(
      Slider,
      {
        value: numTrimmedNodes,
        valueLabelDisplay: "auto",
        min: answerStore.numQgNodes,
        max: answerStore.selectedResult.nodes ? Object.keys(answerStore.selectedResult.nodes).length : answerStore.numQgNodes,
        onChange: (_e, v) => setNumTrimmedNodes(v)
      }
    ) }),
    /* @__PURE__ */ jsx("svg", { ref: svgRef, style: { flex: 1, width: "100%" } }),
    answerStore.metaData && /* @__PURE__ */ jsx(ResultMetaData, { metaData: answerStore.metaData, result: answerStore.resultJSON }),
    /* @__PURE__ */ jsx(Popover, { open: popoverOpen === "edge", onClose: () => setPopoverOpen(null), anchorPosition: { top: popoverPosition.y, left: popoverPosition.x }, above: true, children: popoverOpen === "edge" && /* @__PURE__ */ jsx(AttributesTable, { attributes: popoverData.attributes, sources: popoverData.sources }) }),
    /* @__PURE__ */ jsx(Popover, { open: popoverOpen === "node", onClose: () => setPopoverOpen(null), anchorPosition: { top: popoverPosition.y, left: popoverPosition.x }, above: true, children: popoverOpen === "node" && /* @__PURE__ */ jsx(NodeAttributesTable, { nodeData: popoverData }) })
  ] });
}
function makeEmptyArray(num) {
  const emptyArray = [];
  for (let i = 0; i < num; i += 1) {
    emptyArray.push("");
  }
  return emptyArray;
}
function EmptyTable({ numRows, numCells, text }) {
  const emptyRows = makeEmptyArray(numRows);
  const emptyCells = makeEmptyArray(numCells);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    emptyRows.map((row, i) => /* @__PURE__ */ jsx(TableRow, { children: emptyCells.map((cell, j) => /* @__PURE__ */ jsx(TableCell, { className: "emptyCell", children: " " }, `empty-cell-${j}`)) }, `empty-row-${i}`)),
    /* @__PURE__ */ jsx(TableRow, { id: "emptyTableRowsText", children: /* @__PURE__ */ jsx(TableCell, { children: text }) })
  ] });
}
function ResultsTable({ answerStore }) {
  const [sorting, setSorting] = React.useState([
    {
      id: "score",
      desc: true
    }
  ]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 15
  });
  const data = useMemo(() => answerStore.message.results, [answerStore.message]);
  createColumnHelper();
  const columns = useMemo(() => {
    return answerStore.tableHeaders.map((header) => {
      const columnDef = {
        id: header.id || (typeof header.accessor === "string" ? header.accessor : header.id),
        header: header.Header,
        cell: header.Cell ? (info) => header.Cell({ value: info.getValue() }) : void 0,
        enableSorting: !header.disableSortBy,
        enableColumnFilter: !header.disableFilters,
        meta: {
          color: header.color,
          width: header.width
        }
      };
      if (typeof header.accessor === "function") {
        columnDef.accessorFn = header.accessor;
      } else if (typeof header.accessor === "string") {
        columnDef.accessorKey = header.accessor;
      }
      if (header.filter === "equals") {
        columnDef.filterFn = "equals";
      }
      return columnDef;
    });
  }, [answerStore.tableHeaders]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      pagination
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 15
      },
      sorting: [
        {
          id: "score",
          desc: true
        }
      ]
    }
  });
  const handleChangePage = (_event, newPage) => {
    table.setPageIndex(newPage);
  };
  const handleChangeRowsPerPage = (e) => {
    const newPageSize = Number(e.target.value);
    table.setPageSize(newPageSize);
  };
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { id: "resultsContainer", children: [
    /* @__PURE__ */ jsxs(Paper, { id: "resultsTable", elevation: 3, children: [
      /* @__PURE__ */ jsx(TableContainer, { children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHead, { children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsx(TableRow, { children: headerGroup.headers.map((header) => {
          var _a, _b;
          return /* @__PURE__ */ jsx(
            TableCell,
            {
              className: "resultsTableHeader",
              style: {
                backgroundColor: (_a = header.column.columnDef.meta) == null ? void 0 : _a.color,
                cursor: header.column.getCanSort() ? "pointer" : "",
                width: (_b = header.column.columnDef.meta) == null ? void 0 : _b.width
              },
              children: header.isPlaceholder ? null : /* @__PURE__ */ jsxs(Fragment, { children: [
                header.column.getCanSort() ? /* @__PURE__ */ jsx(
                  TableSortLabel,
                  {
                    active: !!header.column.getIsSorted(),
                    direction: header.column.getIsSorted() === "desc" ? "desc" : "asc",
                    onClick: header.column.getToggleSortingHandler(),
                    children: flexRender(header.column.columnDef.header, header.getContext())
                  }
                ) : /* @__PURE__ */ jsx(Fragment, { children: flexRender(header.column.columnDef.header, header.getContext()) }),
                /* @__PURE__ */ jsx("div", { children: header.column.getCanFilter() && /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: header.column.getFilterValue() || "",
                    onChange: (e) => {
                      header.column.setFilterValue(e.target.value || void 0);
                    },
                    className: "resultsFilterSelect",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "", children: "All" }),
                      Array.from(
                        new Set(
                          table.getPreFilteredRowModel().rows.map((row) => {
                            const value = row.getValue(header.column.id);
                            return value ? String(value) : null;
                          }).filter(Boolean)
                        )
                      ).map((option, i) => /* @__PURE__ */ jsx("option", { value: option != null ? option : "", children: option != null ? option : "\u2014" }, i))
                    ]
                  }
                ) })
              ] })
            },
            header.id
          );
        }) }, headerGroup.id)) }),
        /* @__PURE__ */ jsx(TableBody, { style: { position: "relative" }, children: table.getRowModel().rows.length > 0 ? /* @__PURE__ */ jsx(Fragment, { children: table.getRowModel().rows.map((row) => /* @__PURE__ */ jsx(TableRow, { hover: true, selected: answerStore.selectedRowId === row.id, onClick: () => answerStore.selectRow(row.original, row.id), role: "button", children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsx(TableCell, { children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id)) }, row.id)) }) : /* @__PURE__ */ jsx(EmptyTable, { numRows: 15, numCells: columns.length, text: "No Results" }) })
      ] }) }),
      /* @__PURE__ */ jsx(
        TablePagination,
        {
          rowsPerPageOptions: [5, 10, 15, 50, 100],
          count: data.length,
          rowsPerPage: table.getState().pagination.pageSize,
          page: table.getState().pagination.pageIndex,
          onPageChange: handleChangePage,
          onRowsPerPageChange: handleChangeRowsPerPage,
          component: "div"
        }
      )
    ] }),
    /* @__PURE__ */ jsx(ResultExplorer, { answerStore })
  ] }) });
}
function Answer({ answer_id }) {
  const { displayAlert } = useAlert();
  const answerStore = useAnswerStore();
  const navigate = useNavigate();
  const { displayState, updateDisplayState } = useDisplayState();
  const [isAuthenticated, isLoading, getAccessTokenSilently] = [false, false, () => Promise.resolve("")];
  const pageStatus = usePageStatus(isLoading, "Loading Message...");
  const [owned, setOwned] = useState(false);
  function validateAndInitializeMessage(answerResponse) {
    if (answerResponse && answerResponse.status && answerResponse.status === "error") {
      pageStatus.setFailure(answerResponse.message);
      return;
    }
    let answerResponseJSON;
    try {
      answerResponseJSON = JSON.parse(answerResponse);
    } catch (err) {
      console.error("Failed to parse answer response:", err);
      pageStatus.setFailure("Invalid answer JSON");
      return;
    }
    if (answerResponseJSON.status === "error") {
      pageStatus.setFailure(`Error during answer processing: ${answerResponseJSON.message}`);
      return;
    }
    const validationErrors = trapiUtils.validateMessage(answerResponseJSON);
    if (validationErrors.length) {
      pageStatus.setFailure(`Found errors while parsing message: ${validationErrors.join(", ")}`);
      return;
    }
    try {
      answerResponseJSON.message.query_graph = queryGraphUtils.toCurrentTRAPI(answerResponseJSON.message.query_graph);
      try {
        answerStore.initialize(answerResponseJSON.message, updateDisplayState);
        pageStatus.setSuccess();
      } catch (err) {
        displayAlert("error", `Failed to initialize message. Please submit an issue: ${err}`);
      }
    } catch (err) {
      console.error("Failed to parse query graph:", err);
      displayAlert("error", "Failed to parse this query graph. Please make sure it is TRAPI compliant.");
    }
  }
  async function fetchAnswerData() {
    let accessToken;
    if (isAuthenticated) {
      try {
        accessToken = await getAccessTokenSilently();
      } catch (err) {
        displayAlert("error", `Failed to authenticate user: ${err}`);
      }
    }
    const answerResponse = await API.cache.getAnswerData(answer_id, accessToken);
    validateAndInitializeMessage(answerResponse);
  }
  async function checkIfAnswerOwned() {
    let accessToken;
    if (isAuthenticated) {
      try {
        accessToken = await getAccessTokenSilently();
      } catch (err) {
        displayAlert("error", `Failed to authenticate user: ${err}`);
      }
    }
    const answerResponse = await API.cache.getAnswer(answer_id != null ? answer_id : null, accessToken != null ? accessToken : null);
    if (answerResponse.status === "error") {
      pageStatus.setFailure(answerResponse.message);
      return;
    }
    setOwned(answerResponse.owned);
  }
  useEffect(() => {
    if (!isLoading) {
      pageStatus.setLoading("Loading Message...");
      if (answer_id) {
        del("quick_message");
        checkIfAnswerOwned();
        fetchAnswerData();
      } else {
        get("quick_message").then((val) => {
          if (val) {
            validateAndInitializeMessage(val);
          } else {
            answerStore.reset();
            pageStatus.setSuccess();
          }
        }).catch((err) => {
          answerStore.reset();
          displayAlert("error", `Failed to load answer. Please try refreshing the page. Error: ${err}`);
          pageStatus.setSuccess();
        });
      }
    }
  }, [answer_id, isLoading]);
  function onUpload(event) {
    var _a;
    const files = Array.from((_a = event.target.files) != null ? _a : []);
    files.forEach((file) => {
      const fr = new window.FileReader();
      fr.onloadstart = () => pageStatus.setLoading("Loading Message...");
      fr.onload = (e) => {
        if (!e.target) return;
        const fileContents = e.target.result;
        let msg = {};
        try {
          msg = JSON.parse(typeof fileContents === "string" ? fileContents : "");
        } catch (err) {
          console.error("Failed to parse uploaded file:", err);
          displayAlert("error", "Failed to read this message. Are you sure this is valid JSON?");
        }
        const errors = trapiUtils.validateMessage(msg);
        if (!errors.length) {
          try {
            msg.message.query_graph = queryGraphUtils.toCurrentTRAPI(msg.message.query_graph);
            try {
              set("quick_message", JSON.stringify(msg));
              answerStore.initialize(msg.message, updateDisplayState);
              if (answer_id) {
                navigate({ to: "/answer" });
              }
            } catch (err) {
              displayAlert("error", `Failed to initialize message. Please submit an issue: ${err}`);
              answerStore.reset();
            }
          } catch (err) {
            console.error("Failed to parse query graph:", err);
            displayAlert("error", "Failed to parse this query graph. Please make sure it is TRAPI compliant.");
          }
          pageStatus.setSuccess();
        } else {
          pageStatus.setFailure(errors.join(", "));
        }
      };
      fr.onerror = () => {
        displayAlert("error", "Sorry but there was a problem uploading the file. The file may be invalid JSON.");
        pageStatus.setSuccess();
      };
      fr.readAsText(file);
    });
    event.target.value = "";
  }
  async function saveAnswer() {
    let accessToken;
    if (isAuthenticated) {
      try {
        accessToken = await getAccessTokenSilently();
      } catch (err) {
        displayAlert("error", `Failed to authenticate user: ${err}`);
      }
    } else {
      return displayAlert("warning", "You need to be signed in to save an answer.");
    }
    let response = await API.cache.createAnswer(defaultAnswer, accessToken != null ? accessToken : null);
    if (response.status === "error") {
      displayAlert("error", `Failed to create answer: ${response.message}`);
      return;
    }
    const answerId = response.id;
    response = await API.cache.setAnswerData(answerId, { message: answerStore.message }, accessToken);
    if (response.status === "error") {
      return displayAlert("error", `Failed to save answer: ${response.message}`);
    }
    return displayAlert("success", "Your answer has been saved!");
  }
  async function deleteAnswer() {
    let accessToken;
    if (isAuthenticated) {
      try {
        accessToken = await getAccessTokenSilently();
      } catch (err) {
        displayAlert("error", `Failed to authenticate user: ${err}`);
      }
    } else {
      return displayAlert("warning", "You need to be signed in to delete an answer.");
    }
    let response = await API.cache.getAnswer(answer_id != null ? answer_id : null, accessToken != null ? accessToken : null);
    if (response.status === "error") {
      displayAlert("error", `Failed to fetch answer: ${response.message}`);
      return;
    }
    const questionId = response.parent;
    response = await API.cache.deleteAnswer(answer_id != null ? answer_id : null, accessToken != null ? accessToken : null);
    if (response.status === "error") {
      displayAlert("error", `Failed to delete answer: ${response.message}`);
      return;
    }
    navigate({ to: "/answer" });
    let alertType = "success";
    let alertText = "Your answer has been deleted!";
    if (questionId) {
      response = await API.cache.getAnswers(questionId, accessToken != null ? accessToken : null);
      if (response.status === "error") {
        alertType = "error";
        alertText += ` However, failed to get sibling answers: ${response.message}`;
      } else if (!response.length) {
        response = await API.cache.getQuestion(questionId, accessToken != null ? accessToken : null);
        if (response.status === "error") {
          alertType = "error";
          alertText += ` However, failed to get associated question data: ${response.message}`;
        } else {
          response.metadata.hasAnswers = false;
          response = await API.cache.updateQuestion(response, accessToken != null ? accessToken : null);
          if (response.status === "error") {
            alertType = "error";
            alertText += " However, failed to update associated question to no answers.";
          }
        }
      }
    }
    return displayAlert(alertType, alertText);
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      LeftDrawer,
      {
        displayState,
        updateDisplayState,
        onUpload,
        message: answerStore.message,
        saveAnswer,
        deleteAnswer,
        owned
      }
    ),
    /* @__PURE__ */ jsxs("div", { id: "answerContentContainer", children: [
      /* @__PURE__ */ jsx(pageStatus.Display, {}),
      pageStatus.displayPage && /* @__PURE__ */ jsx(Fragment, { children: Object.keys(answerStore.message).length ? /* @__PURE__ */ jsxs(Fragment, { children: [
        displayState.qg.show && answerStore.message.query_graph && /* @__PURE__ */ jsx(QueryGraph, { query_graph: answerStore.message.query_graph }),
        displayState.kgFull.show && answerStore.message.knowledge_graph && /* @__PURE__ */ jsx(KgFull, { message: answerStore.message }),
        displayState.results.show && /* @__PURE__ */ jsx(ResultsTable, { answerStore })
      ] }) : /* @__PURE__ */ jsx("div", { id: "answerPageSplashMessage", children: /* @__PURE__ */ jsx("h2", { children: "Please upload an answer" }) }) })
    ] })
  ] });
}

export { Answer as A };
//# sourceMappingURL=Answer-BCunQMre.mjs.map
