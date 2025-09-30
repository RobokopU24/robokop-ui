import { jsx, jsxs } from 'react/jsx-runtime';
import { Box, Dialog, DialogTitle, DialogContent, TextField, FormControl, RadioGroup, FormControlLabel, Radio, DialogContentText, DialogActions, Button, Alert } from '@mui/material';
import { withStyles } from '@mui/styles';
import React, { useState, useCallback, useEffect } from 'react';
import { L as Loading } from './Loading-Df2nHO8-.mjs';
import Papa from 'papaparse';
import * as d3 from 'd3';
import { s as stringUtils } from './queryGraph-DEhAVldC.mjs';

const CenteredAlert = withStyles({
  root: { justifyContent: "center" }
})(Alert);
function usePageStatus(startAsLoading, initialLoadingMessage) {
  const [loading, toggleLoading] = useState(!!startAsLoading);
  const [loadingMessage, setLoadingMessage] = useState(initialLoadingMessage || "");
  const [error, setError] = useState("");
  function setLoading(msg) {
    setError("");
    if (msg) {
      setLoadingMessage(msg);
    }
    toggleLoading(true);
  }
  function setSuccess() {
    setError("");
    setLoadingMessage("");
    toggleLoading(false);
  }
  function setFailure(newErr) {
    setError(newErr);
    toggleLoading(false);
  }
  function Display() {
    if (error) {
      return /* @__PURE__ */ jsx(Box, { mt: 10, children: /* @__PURE__ */ jsx(CenteredAlert, { severity: "error", children: error }) });
    }
    if (loading) {
      return /* @__PURE__ */ jsx(Box, { mt: 10, children: /* @__PURE__ */ jsx(Loading, { positionStatic: true, message: loadingMessage }) });
    }
    return null;
  }
  return {
    setLoading,
    setSuccess,
    setFailure,
    Display: useCallback(Display, [loading, error]),
    displayPage: !loading && !error
  };
}
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const debounce = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(debounce);
    };
  }, [value]);
  return debouncedValue;
}
const orangeHighlight = "rgb(255, 172, 30)";
const opaqueOrangeHighlight = "rgba(255, 172, 30, 0.4)";
function highlightTextEditorNode(nodeId) {
  d3.selectAll(`.nodeSelector-${nodeId} > fieldset`).style("border-width", "3px").style("border-color", orangeHighlight);
  d3.selectAll(`.highlight-${nodeId}:not(.referenceNode) > .nodeDropdown`).style(
    "background-color",
    opaqueOrangeHighlight
  );
}
function clearTextEditorNode(nodeId) {
  d3.selectAll(`.nodeSelector-${nodeId} > fieldset`).style("border-width", null).style("border-color", null);
  d3.selectAll(`.highlight-${nodeId}:not(.referenceNode) > .nodeDropdown`).style(
    "background-color",
    null
  );
}
function highlightGraphNode(nodeId) {
  d3.selectAll(`.node-${nodeId}`).attr("stroke-width", "3px").attr("stroke", orangeHighlight);
}
function clearGraphNode(nodeId) {
  d3.selectAll(`.node-${nodeId}`).attr("stroke-width", "0px");
}
function clearAllNodes() {
  d3.selectAll(".nodeCircle").attr("stroke-width", "0px");
  d3.selectAll(".nodeDropdown").style("background-color", null);
  d3.selectAll(".nodeSelector > fieldset").style("border-width", null).style("border-color", null);
}
function highlightTextEditorEdge(edgeId) {
  d3.selectAll(`.edgeSelector-${edgeId} > fieldset`).style("border-width", "3px").style("border-color", orangeHighlight);
  d3.selectAll(`.highlight-${edgeId} > .edgeDropdown`).style(
    "background-color",
    opaqueOrangeHighlight
  );
}
function clearTextEditorEdge(edgeId) {
  d3.selectAll(`.edgeSelector-${edgeId} > fieldset`).style("border-width", null).style("border-color", null);
  d3.selectAll(`.highlight-${edgeId} > .edgeDropdown`).style("background-color", null);
}
function highlightGraphEdge(edgeId) {
  d3.selectAll(`.edge-${edgeId}`).attr("stroke", opaqueOrangeHighlight);
}
function clearGraphEdge(edgeId) {
  d3.selectAll(`.edge-${edgeId}`).attr("stroke", "transparent");
}
function clearAllEdges() {
  d3.selectAll(".edgeTransparent").attr("stroke", "transparent");
  d3.selectAll(".edgeSelector > fieldset").style("border-width", null).style("border-color", null);
  d3.selectAll(".edgeDropdown").style("background-color", null);
}
const highlighter = {
  highlightTextEditorNode,
  highlightGraphNode,
  clearTextEditorNode,
  clearGraphNode,
  clearAllNodes,
  highlightTextEditorEdge,
  highlightGraphEdge,
  clearTextEditorEdge,
  clearGraphEdge,
  clearAllEdges
};
function getOtherEdgeEnd(edgeEnd) {
  return edgeEnd === "target" ? "source" : "target";
}
function getAngle(x1, y1, x2, y2) {
  const delta_x = x2 - x1;
  const delta_y = y2 - y1;
  const theta_radians = Math.atan2(delta_y, delta_x);
  return theta_radians;
}
function getCurvedEdgePos(sourceX, sourceY, targetX, targetY, numEdges, index, nodeRadius) {
  const arcWidth = Math.PI / 3;
  const edgeStep = arcWidth / 5;
  const theta = getAngle(sourceX, sourceY, targetX, targetY);
  const arc_p1 = theta + edgeStep * index;
  const arc_p2 = theta + Math.PI - edgeStep * index;
  const x1 = sourceX + Math.cos(arc_p1) * nodeRadius;
  const y1 = sourceY + Math.sin(arc_p1) * nodeRadius;
  const x2 = targetX + Math.cos(arc_p2) * nodeRadius;
  const y2 = targetY + Math.sin(arc_p2) * nodeRadius;
  const alpha = 50;
  let l = index * 0.1 + index * 0.3;
  if (index === 1 || index === -1) {
    l += index * 0.4;
  }
  const bx = (x1 + x2) / 2;
  const by = (y1 + y2) / 2;
  const vx = x2 - x1;
  const vy = y2 - y1;
  const norm_v = Math.sqrt(vx ** 2 + vy ** 2);
  const vx_norm = vx / norm_v;
  const vy_norm = vy / norm_v;
  const vx_perp = -vy_norm;
  const vy_perp = vx_norm;
  const qx = bx + alpha * l * vx_perp;
  const qy = by + alpha * l * vy_perp;
  return {
    x1,
    y1,
    qx,
    qy,
    x2,
    y2
  };
}
function getShortenedLineEnd(x1, y1, x2, y2, offset) {
  const angle = getAngle(x1, y1, x2, y2);
  const x = x1 + Math.cos(angle) * offset;
  const y = y1 + Math.sin(angle) * offset;
  return { x, y };
}
function getBoundedValue(value, upperBound, lowerBound = 0) {
  return Math.max(lowerBound, Math.min(value, upperBound));
}
function fitTextWithEllipsis(text, el, nodeRadius, fontSize, dy) {
  const textStr = typeof text === "string" ? text : String(text != null ? text : "");
  const svg = d3.select("body").append("svg").attr("width", 300).attr("height", 300);
  const tempText = svg.append("text").attr("font-size", fontSize).style("visibility", "hidden").text(textStr);
  const targetLength = Number(nodeRadius) * 2 * 0.9;
  let finalText = textStr;
  let textLength = 0;
  const tempTextNode = tempText.node();
  if (tempTextNode) {
    textLength = tempTextNode.getComputedTextLength();
    if (textLength > Number(nodeRadius) * 2 * 1.25) {
      while (textLength > targetLength && finalText.length > 0) {
        finalText = finalText.slice(0, -1);
        tempText.text(`${finalText.slice(0, -1)}...`);
        textLength = tempTextNode.getComputedTextLength();
      }
      finalText = `${finalText}...`;
    }
  }
  tempText.remove();
  svg.remove();
  el.append("tspan").attr("x", 0).attr("dy", dy).text(finalText);
}
function fitTextIntoCircle() {
  const el = d3.select(this);
  const node = el.node();
  if (!node) return;
  const textLength = node.getComputedTextLength();
  const text = el.text();
  const parent = node.parentNode;
  if (!parent) return;
  const circle = d3.select(parent).select("circle");
  const nodeRadiusStr = circle.attr("r");
  const nodeRadius = Number(nodeRadiusStr);
  if (isNaN(nodeRadius)) return;
  const maxFontSize = nodeRadius * 0.4;
  const minFontSize = 9;
  const diameter = nodeRadius * 2;
  const fontSize = `${Math.max(
    minFontSize,
    Math.min(maxFontSize, diameter / Math.sqrt(Math.max(textLength, 1)))
  )}px`;
  el.style("font-size", fontSize);
  el.text("");
  const words = text.split(" ");
  if (words.length === 1 || textLength < 10) {
    fitTextWithEllipsis(
      text,
      el,
      nodeRadius,
      fontSize,
      "0em"
    );
  } else {
    const middle = Math.ceil(words.length / 2);
    const firstLine = words.slice(0, middle).join(" ");
    const secondLine = words.slice(middle).join(" ");
    fitTextWithEllipsis(
      firstLine,
      el,
      nodeRadius,
      fontSize,
      "-0.4em"
    );
    fitTextWithEllipsis(
      secondLine,
      el,
      nodeRadius,
      fontSize,
      "1.2em"
    );
  }
}
function ellipsisOverflow() {
  const el = d3.select(this);
  const node = el.node();
  if (!node) return;
  let textLength = node.getComputedTextLength();
  let text = el.text();
  const parent = node.parentNode;
  if (!parent) return;
  const circle = d3.select(parent).select("circle");
  const nodeRadiusStr = circle.attr("r");
  const nodeRadius = Number(nodeRadiusStr);
  if (isNaN(nodeRadius)) return;
  const diameter = nodeRadius * 2;
  const targetLength = diameter * 0.9;
  while (textLength > targetLength && text.length > 0) {
    text = text.slice(0, -1);
    el.text(`${text}...`);
    const updatedNode = el.node();
    textLength = updatedNode ? updatedNode.getComputedTextLength() : 0;
  }
}
function getEdgeMidpoint(edge) {
  const { source, target } = edge;
  const midX = (source.x + target.x) / 2;
  const midY = (source.y + target.y) / 2;
  return { x: midX, y: midY };
}
function isInside(x, y, cx, cy, r) {
  return (x - cx) ** 2 + (y - cy) ** 2 <= r ** 2;
}
function shouldShowArrow(edge, symmetricPredicates = ["biolink:related_to"]) {
  return edge.predicates && edge.predicates.findIndex((p) => !symmetricPredicates.includes(p)) > -1 || edge.predicate && !symmetricPredicates.includes(edge.predicate);
}
function showElement() {
  d3.select(this).transition().duration(500).style("opacity", 1);
}
function hideElement() {
  d3.select(this).transition().duration(1e3).style("opacity", 0);
}
const graphUtils = {
  getOtherEdgeEnd,
  getCurvedEdgePos,
  getShortenedLineEnd,
  getBoundedValue,
  ellipsisOverflow,
  getEdgeMidpoint,
  fitTextIntoCircle,
  isInside,
  shouldShowArrow,
  showElement,
  hideElement
};
function dragNode(simulation) {
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.01).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
}
function dragEdgeEnd(subject, simulation, width, height, nodeRadius, updateEdge) {
  function dragstarted(event) {
    if (!event.active) simulation.stop();
    event.sourceEvent.stopPropagation();
  }
  function dragged(event, d) {
    const { id } = d;
    const type = d3.select(this).attr("class").split(" ")[0];
    const otherEdgeEnd = graphUtils.getOtherEdgeEnd(type);
    const otherEndX = d[otherEdgeEnd].x;
    const otherEndY = d[otherEdgeEnd].y;
    const targetX = graphUtils.getBoundedValue(otherEndX, width);
    const targetY = graphUtils.getBoundedValue(otherEndY, height);
    const mouseX = graphUtils.getBoundedValue(event.x, width);
    const mouseY = graphUtils.getBoundedValue(event.y, height);
    const { x: x2, y: y2 } = graphUtils.getShortenedLineEnd(
      targetX,
      targetY,
      mouseX,
      mouseY,
      nodeRadius
    );
    const source = type === "source" ? `${mouseX},${mouseY}` : `${x2},${y2}`;
    const target = type === "source" ? `${x2},${y2}` : `${mouseX},${mouseY}`;
    const path = `M${source} ${target}`;
    let labelPath = path;
    if (type === "source" && mouseX > x2 || type === "target" && mouseX < x2) {
      labelPath = `M${target} ${source}`;
    }
    d3.select(`#${id}`).call((e) => e.select(".edgePath").attr("d", path)).call((e) => e.select(".edgeTransparent").attr("d", labelPath)).call((e) => e.select(`.${type}`).attr("cx", mouseX).attr("cy", mouseY)).call((e) => e.select(`.${otherEdgeEnd}`).attr("cx", x2).attr("cy", y2));
  }
  function dragended(event, d) {
    const droppedCircle = d3.selectAll(".nodeCircle").data().find((n) => graphUtils.isInside(event.x, event.y, n.x, n.y, nodeRadius));
    const { id } = d;
    const type = d3.select(this).attr("class").split(" ")[0];
    if (droppedCircle && droppedCircle.id) {
      const mapping = {
        source: "subject",
        target: "object"
      };
      updateEdge(id, mapping[type], droppedCircle.id);
    } else {
      let {
        x1,
        y1,
        qx,
        qy,
        x2,
        y2
        // eslint-disable-line prefer-const
      } = graphUtils.getCurvedEdgePos(
        d.source.x,
        d.source.y,
        d.target.x,
        d.target.y,
        d.numEdges,
        d.index,
        nodeRadius
      );
      x2 = graphUtils.getBoundedValue(x2, width);
      y2 = graphUtils.getBoundedValue(y2, height);
      x1 = graphUtils.getBoundedValue(x1, width);
      y1 = graphUtils.getBoundedValue(y1, height);
      const source = `${x1},${y1}`;
      const target = `${x2},${y2}`;
      const path = `M${source}Q${qx},${qy} ${target}`;
      let labelPath = path;
      if (x1 > x2) {
        labelPath = `M${target}Q${qx},${qy} ${source}`;
      }
      d3.select(`#${id}`).call((e) => e.select(".edgePath").attr("d", path)).call((e) => e.select(".edgeTransparent").attr("d", labelPath)).call((e) => e.select(".source").attr("cx", x1).attr("cy", y1)).call((e) => e.select(".target").attr("cx", x2).attr("cy", y2));
    }
  }
  return d3.drag().subject(() => subject).on("start", dragstarted).on("drag", dragged).on("end", dragended);
}
const dragUtils = {
  dragNode,
  dragEdgeEnd
};
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };
  return [storedValue, setValue];
};
const jsonToCsvString = (json) => Promise.resolve(Papa.unparse(json));
const constructPmidOrPmcLink = (id) => {
  if (id.startsWith("PMID")) {
    return `https://pubmed.ncbi.nlm.nih.gov/${id.split(":")[1]}`;
  }
  if (id.startsWith("PMC")) {
    return `https://pmc.ncbi.nlm.nih.gov/articles/${id.split(":")[1]}`;
  }
  return "";
};
const getConcatPublicationsForResult = (result, message) => {
  const edgeIds = Object.values(result.analyses[0].edge_bindings).flat().map((e) => e.id);
  const publications = edgeIds.flatMap(
    (edgeId) => message.knowledge_graph.edges[edgeId].attributes.filter(
      (attr) => attr.attribute_type_id === "biolink:publications"
    ).flatMap((attr) => attr.value)
  ).map(constructPmidOrPmcLink);
  return publications;
};
const constructCsvObj = (message) => {
  const nodeLabelHeaders = Object.keys(message.results[0].node_bindings).flatMap((node_label) => [
    `${node_label} (Name)`,
    `${node_label} (CURIE)`
  ]);
  let csvHeaderEdgeLabelsMerged = /* @__PURE__ */ new Set();
  message.results.forEach(
    (result) => {
      const curieToNodeLabel = {};
      Object.entries(result.node_bindings).forEach(([nodeLabel, nb]) => {
        const curie = nb[0].id;
        curieToNodeLabel[curie] = nodeLabel;
      });
      Object.values(result.analyses[0].edge_bindings).flat().forEach((eb) => {
        const { subject, object } = message.knowledge_graph.edges[eb.id];
        const subjectLabel = curieToNodeLabel[subject];
        const objectLabel = curieToNodeLabel[object];
        const csvHeaderEdgeLabel = `${subjectLabel} -> ${objectLabel}`;
        if (subjectLabel && objectLabel) {
          csvHeaderEdgeLabelsMerged.add(csvHeaderEdgeLabel);
        }
      });
    }
  );
  const csvHeaderEdgeLabelsMergedArray = Array.from(csvHeaderEdgeLabelsMerged);
  const header = [...nodeLabelHeaders, ...csvHeaderEdgeLabelsMergedArray, "Score", "Publications"];
  const body = message.results.map(
    (result) => {
      const row = new Array(header.length).fill("");
      const curieToNodeLabel = {};
      Object.entries(result.node_bindings).forEach(([nodeLabel, nb], i) => {
        const curie = nb[0].id;
        curieToNodeLabel[curie] = nodeLabel;
        const node = message.knowledge_graph.nodes[curie];
        row[i * 2] = node.name || node.categories[0];
        row[i * 2 + 1] = curie;
      });
      Object.values(result.analyses[0].edge_bindings).flat().forEach((eb) => {
        const { subject, object, predicate, sources } = message.knowledge_graph.edges[eb.id];
        const subjectLabel = curieToNodeLabel[subject];
        const objectLabel = curieToNodeLabel[object];
        if (subjectLabel && objectLabel) {
          const csvHeaderEdgeLabel = `${curieToNodeLabel[subject]} -> ${curieToNodeLabel[object]}`;
          const edgeHeaderIndex = header.findIndex((h) => h === csvHeaderEdgeLabel);
          const primarySourceObj = sources.find(
            (s) => s.resource_role === "primary_knowledge_source"
          );
          const primarySource = primarySourceObj && primarySourceObj.resource_id || void 0;
          row[edgeHeaderIndex] += `${row[edgeHeaderIndex].length > 0 ? "\n" : ""}${predicate}${primarySource ? ` (${primarySource})` : ""}`;
        }
      });
      row[row.length - 2] = result.score;
      row[row.length - 1] = getConcatPublicationsForResult(result, message).join("\n");
      return row;
    }
  );
  return [header, ...body];
};
function DownloadDialog({
  open,
  setOpen,
  message,
  download_type = "answer"
}) {
  const [type, setType] = React.useState("json");
  const [fileName, setFileName] = React.useState("ROBOKOP_message");
  const [queryHistory, setQueryHistory] = useLocalStorage("query_history", {});
  const handleClose = () => {
    setOpen(false);
  };
  const handleClickDownload = async () => {
    switch (download_type) {
      case "answer": {
        let blob;
        if (type === "json") {
          blob = new Blob([JSON.stringify({ message }, null, 2)], { type: "application/json" });
        }
        if (type === "csv") {
          const csvString = await jsonToCsvString(constructCsvObj(message));
          blob = new Blob([csvString], { type: "text/csv" });
        }
        if (!blob) {
          break;
        }
        const a = document.createElement("a");
        a.download = `${fileName}.${type}`;
        a.href = window.URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        a.remove();
        break;
      }
      case "all_queries": {
        const raw = window.localStorage.getItem("query_history");
        const parsed = raw ? JSON.parse(raw) : {};
        const blob = new Blob([JSON.stringify({ bookmarked_queries: parsed }, null, 2)], {
          type: "application/json"
        });
        const a = document.createElement("a");
        a.download = `${fileName}.${type}`;
        a.href = window.URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        a.remove();
        break;
      }
      case "query": {
        if (!(fileName in queryHistory)) {
          setQueryHistory((prev) => ({
            ...prev,
            [fileName]: {
              query_graph: message
            }
          }));
        }
        break;
      }
      default: {
        handleClose();
      }
    }
    handleClose();
  };
  return /* @__PURE__ */ jsxs(Dialog, { open, onClose: handleClose, "aria-labelledby": "alert-dialog-title", children: [
    /* @__PURE__ */ jsx(DialogTitle, { id: "alert-dialog-title", children: "Download Answer" }),
    /* @__PURE__ */ jsxs(DialogContent, { style: { width: 600, paddingTop: "1rem" }, children: [
      /* @__PURE__ */ jsx(
        TextField,
        {
          label: ["answer", "all_queries"].includes(download_type) ? "File name" : "Query Graph Name",
          variant: "outlined",
          style: { marginBottom: "1rem", width: "90%" },
          value: fileName,
          onChange: (e) => {
            setFileName(e.target.value);
          }
        }
      ),
      // Show the radio group only when the download type is answers.
      download_type === "answer" && /* @__PURE__ */ jsx(FormControl, { component: "fieldset", children: /* @__PURE__ */ jsxs(
        RadioGroup,
        {
          "aria-label": "gender",
          name: "gender1",
          value: type,
          onChange: (e) => {
            setType(e.target.value);
          },
          children: [
            /* @__PURE__ */ jsx(FormControlLabel, { value: "json", control: /* @__PURE__ */ jsx(Radio, {}), label: "JSON" }),
            /* @__PURE__ */ jsx(FormControlLabel, { value: "csv", control: /* @__PURE__ */ jsx(Radio, {}), label: "CSV" })
          ]
        }
      ) }),
      type === "csv" && /* @__PURE__ */ jsx(DialogContentText, { style: { fontSize: "1em" }, children: "The CSV download contains a smaller subset of the answer information. To analyze the complete properties of the answer graphs, consider using JSON." })
    ] }),
    /* @__PURE__ */ jsxs(DialogActions, { children: [
      /* @__PURE__ */ jsx(Button, { onClick: handleClose, color: "primary", children: "Cancel" }),
      /* @__PURE__ */ jsx(Button, { onClick: handleClickDownload, color: "primary", variant: "contained", children: ["answer", "all_queries"].includes(download_type) ? "Download" : "Bookmark" })
    ] })
  ] });
}
const rectSize = {
  w: 50,
  h: 25
};
const deleteRectOffset = {
  x: -54,
  y: -50
};
const deleteTextOffset = {
  x: (deleteRectOffset.x + (deleteRectOffset.x + rectSize.w)) / 2,
  y: (deleteRectOffset.y + (deleteRectOffset.y + rectSize.h)) / 2
};
const editRectOffset = {
  x: 4,
  y: -50
};
const editTextOffset = {
  x: (editRectOffset.x + (editRectOffset.x + rectSize.w)) / 2,
  y: (editRectOffset.y + (editRectOffset.y + rectSize.h)) / 2
};
function findCurveId(edgeCurves, id) {
  const [subject, object] = id.split("--");
  const curveId = Object.keys(edgeCurves).find((curve) => {
    const nodeIds = curve.split("--");
    if (nodeIds.indexOf(subject) > -1 && nodeIds.indexOf(object) > -1) {
      return true;
    }
    return false;
  });
  return curveId;
}
const edgeCurveProps = {
  get: (edgeCurves, id) => {
    const curveId = findCurveId(edgeCurves, id);
    let flip = false;
    if (curveId) {
      if (curveId !== id) {
        flip = true;
      }
      return { indices: edgeCurves[curveId], flip };
    }
    return { indices: [], flip };
  },
  set: (edgeCurves, id, val) => {
    const curveId = findCurveId(edgeCurves, id);
    if (curveId) {
      edgeCurves[curveId] = val;
    } else {
      edgeCurves[id] = val;
    }
    return true;
  }
};
function addEdgeCurveProperties(edges) {
  const curveProps = new Proxy({}, edgeCurveProps);
  edges.forEach((e, i) => {
    const curve = curveProps[`${e.source.id}--${e.target.id}`];
    curve.indices.push(i);
    curveProps[`${e.source.id}--${e.target.id}`] = curve.indices;
  });
  edges.forEach((e, i) => {
    const curve = curveProps[`${e.source.id}--${e.target.id}`];
    e.numEdges = curve.indices.length;
    const edgeIndex = curve.indices.indexOf(i);
    e.index = edgeIndex;
    if (curve.indices.length % 2 === 0 && edgeIndex === 0) {
      e.index = curve.indices.length - 1;
    }
    if (edgeIndex) {
      const edgeL = edgeIndex % 2;
      if (!edgeL) {
        e.index -= 1;
      } else {
        e.index = -e.index;
      }
    }
    if (curve.flip) {
      e.index = -e.index;
    }
    e.strokeWidth = "3";
  });
  return edges;
}
function enter(edge) {
  return edge.append("g").attr("id", (d) => d.id).attr("class", "edge").call(
    (e) => e.append("path").attr("stroke", "#999").attr("fill", "none").attr("stroke-width", (d) => d.strokeWidth).attr("class", "edgePath").attr("marker-end", (d) => graphUtils.shouldShowArrow(d, d.symmetric) ? "url(#arrow)" : "")
  ).call(
    (e) => e.append("path").attr("stroke", "transparent").attr("fill", "none").attr("stroke-width", 10).attr("class", (d) => `edgeTransparent edge-${d.id}`).attr("id", (d) => `edge${d.id}`).call(
      () => e.append("text").attr("class", "edgeText").attr("pointer-events", "none").style("text-anchor", "middle").attr("dy", (d) => -d.strokeWidth).append("textPath").attr("pointer-events", "none").attr("xlink:href", (d) => `#edge${d.id}`).style("user-select", "none").attr("startOffset", "50%").text((d) => d.predicates ? d.predicates.map((p) => stringUtils.displayPredicate(p)).join(", ") : "")
    ).call((eLabel) => eLabel.append("title").text((d) => d.predicates ? d.predicates.map((p) => stringUtils.displayPredicate(p)).join(", ") : ""))
  ).call(
    (e) => e.append("circle").attr("r", 5).attr("fill", "#B5D3E3").attr("stroke", "#999").attr("stroke-width", 1).style("opacity", 0).style("cursor", "pointer").attr("class", "source edgeEnd").on("mouseover", graphUtils.showElement).on("mouseout", graphUtils.hideElement)
  ).call(
    (e) => e.append("circle").attr("r", 5).attr("fill", "#B5D3E3").attr("stroke", "#999").attr("stroke-width", 1).style("opacity", 0).style("cursor", "pointer").attr("class", "target edgeEnd").on("mouseover", graphUtils.showElement).on("mouseout", graphUtils.hideElement)
  ).call(
    (eg) => eg.append("g").attr("class", "edgeButtons").call(
      (e) => e.append("rect").attr("rx", 5).attr("ry", 5).attr("transform", `translate(${deleteRectOffset.x},${deleteRectOffset.y})`).attr("width", rectSize.w).attr("height", rectSize.h).attr("stroke", "black").attr("fill", "white").style("filter", "url(#buttonShadow)").style("display", "none").attr("class", (d) => `${d.id} deleteRect`)
    ).call(
      (e) => e.append("text").attr("dx", deleteTextOffset.x).attr("dy", deleteTextOffset.y).style("pointer-events", "none").attr("text-anchor", "middle").attr("dominant-baseline", "middle").attr("class", (d) => `${d.id} deleteLabel`).style("display", "none").text("delete")
    ).call(
      (e) => e.append("rect").attr("rx", 5).attr("ry", 5).attr("transform", `translate(${editRectOffset.x},${editRectOffset.y})`).attr("width", rectSize.w).attr("height", rectSize.h).attr("stroke", "black").attr("fill", "white").style("filter", "url(#buttonShadow)").style("display", "none").attr("class", (d) => `${d.id} editRect`)
    ).call(
      (e) => e.append("text").attr("dx", editTextOffset.x).attr("dy", editTextOffset.y).style("pointer-events", "none").attr("text-anchor", "middle").attr("dominant-baseline", "middle").attr("class", (d) => `${d.id} editLabel`).style("display", "none").text("edit")
    )
  );
}
function update(edge) {
  return edge.call((e) => e.select("title").text((d) => d.predicates ? d.predicates.map((p) => stringUtils.displayPredicate(p)).join(", ") : "")).call(
    (e) => e.select(".edgePath").attr("marker-end", (d) => graphUtils.shouldShowArrow(d, d.symmetric) ? "url(#arrow)" : "")
  ).call(
    (e) => e.select("text").select("textPath").text((d) => d.predicates ? d.predicates.map((p) => stringUtils.displayPredicate(p)).join(", ") : "")
  );
}
function exit(edge) {
  return edge.remove();
}
function attachEdgeClick(editId, setEditId) {
  d3.selectAll(".edgeTransparent").on("click", (event, d) => {
    if (editId !== d.id) {
      event.stopPropagation();
      d3.selectAll(".deleteRect,.deleteLabel,.editRect,.editLabel").style("display", "none");
      d3.selectAll(`.${d.id}`).style("display", "inherit").raise();
      setEditId(d.id);
      d3.select(`#${d.id}`).raise();
      highlighter.clearAllEdges();
      highlighter.clearAllNodes();
      highlighter.highlightTextEditorEdge(d.id);
      highlighter.highlightGraphEdge(d.id);
    } else {
      setEditId("");
    }
  });
}
function attachDeleteClick(deleteEdge, setEditId) {
  d3.selectAll(".edgeButtons > .deleteRect").on("click", (event, d) => {
    const { id } = d;
    setEditId("");
    deleteEdge(id);
  });
}
function attachEditClick(openEditor, setEditId) {
  d3.selectAll(".edgeButtons > .editRect").on("click", (event, d) => {
    const { id } = d;
    const edgeAnchor = d3.select(`#${id} > .source`).node();
    setEditId("");
    openEditor(id, edgeAnchor, "editEdge");
  });
}
function attachMouseHover(editId) {
  d3.selectAll(".edgeTransparent").on("mouseover", (event, d) => {
    const { id } = d;
    d3.selectAll(`#${id} > .source, #${id} > .target`).transition().duration(500).style("opacity", 1);
    if (editId === id || !editId) {
      highlighter.highlightTextEditorEdge(id);
      highlighter.highlightGraphEdge(id);
    }
  }).on("mouseout", (event, d) => {
    const { id } = d;
    d3.selectAll(`#${id} > .source, #${id} > .target`).transition().duration(1e3).style("opacity", 0);
    if (editId !== id || !editId) {
      highlighter.clearTextEditorEdge(id);
      highlighter.clearGraphEdge(id);
    }
  });
}
function attachDrag(simulation, width, height, nodeRadius, updateEdge) {
  d3.selectAll(".edge").call((e) => e.selectAll(".edgeEnd").call(dragUtils.dragEdgeEnd(e, simulation, width, height, nodeRadius, updateEdge)));
}
function removeMouseHover() {
  d3.selectAll(".edgeTransparent").on("mouseover", null).on("mouseout", null);
}
function removeClicks() {
  d3.selectAll(".edgeTransparent").on("click", null);
}
const edgeUtils = {
  enter,
  update,
  exit,
  addEdgeCurveProperties,
  attachEdgeClick,
  attachDeleteClick,
  attachEditClick,
  attachMouseHover,
  attachDrag,
  removeClicks,
  removeMouseHover
};
function validateGraph(graph, graphName) {
  const errors = [];
  if (!graph || graph.constructor !== Object) {
    errors.push(`${graphName} is not a valid JSON object`);
    return errors;
  }
  if (!graph.nodes) {
    errors.push(`${graphName} requires a "nodes" property`);
    return errors;
  }
  if (Array.isArray(graph.nodes)) {
    errors.push(`${graphName} nodes should be an object`);
    return errors;
  }
  const nodeIds = new Set(Object.keys(graph.nodes));
  const hasUniqueNodeIds = nodeIds.size === Object.keys(graph.nodes).length;
  if (!hasUniqueNodeIds) {
    errors.push(`There are multiple ${graphName.toLowerCase()} nodes with the same ID`);
  }
  if (!graph.edges) {
    errors.push(`${graphName} requires an "edges" property`);
    return errors;
  }
  if (Array.isArray(graph.edges)) {
    errors.push(`${graphName} edges should be an object`);
    return errors;
  }
  const edgesHaveIds = Object.keys(graph.edges).reduce((val, e) => {
    const edge = graph.edges[e];
    return val && edge && edge.subject && edge.object && graph.nodes && graph.nodes[edge.subject] && graph.nodes[edge.object];
  }, true);
  if (!edgesHaveIds) {
    errors.push(
      `Each ${graphName.toLowerCase()} edge must have a valid "subject" and "object" property`
    );
  }
  return errors;
}
function validateResults(results) {
  const errors = [];
  if (!Array.isArray(results)) {
    errors.push("Message results should be an array");
    return errors;
  }
  for (let i = 0; i < results.length; i += 1) {
    if (!("node_bindings" in results[i])) {
      errors.push("No node_bindings in result object");
    } else if (results[i].node_bindings.constructor !== Object) {
      errors.push("Results node_bindings is not a valid JSON object");
    }
    if (!("analyses" in results[i])) {
      errors.push("No analyses in result object");
    } else if (!Array.isArray(results[i].analyses)) {
      errors.push("Results analyses is not an array");
    }
    if (errors.length) {
      break;
    }
  }
  return errors;
}
function validateMessage(message) {
  if (!message || message.constructor !== Object) {
    return ["The uploaded message isn't a valid JSON object."];
  }
  if (!("message" in message)) {
    return ['The uploaded message should have a parent property of "message".'];
  }
  let errors = validateGraph(message.message.query_graph, "Query Graph");
  if (message.message.knowledge_graph) {
    errors = [...errors, ...validateGraph(message.message.knowledge_graph, "Knowledge Graph")];
  }
  if (message.message.results) {
    errors = [...errors, ...validateResults(message.message.results)];
  }
  return errors;
}
const trapiUtils = {
  validateGraph,
  validateMessage
};

export { DownloadDialog as D, useDebounce as a, dragUtils as d, edgeUtils as e, graphUtils as g, highlighter as h, trapiUtils as t, usePageStatus as u };
//# sourceMappingURL=trapi-sNuYVYIj.mjs.map
