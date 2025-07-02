/* eslint-disable indent */
import * as d3 from "d3";
import graphUtils from "./graph";
import dragUtils from "./drag";
import strings from "../strings";
import highlighter from "./highlighter";

const rectSize = {
  w: 50,
  h: 25,
};

const deleteRectOffset = {
  x: -54,
  y: -50,
};
const deleteTextOffset = {
  x: (deleteRectOffset.x + (deleteRectOffset.x + rectSize.w)) / 2,
  y: (deleteRectOffset.y + (deleteRectOffset.y + rectSize.h)) / 2,
};
const editRectOffset = {
  x: 4,
  y: -50,
};
const editTextOffset = {
  x: (editRectOffset.x + (editRectOffset.x + rectSize.w)) / 2,
  y: (editRectOffset.y + (editRectOffset.y + rectSize.h)) / 2,
};

/**
 * Find curve id regardless of node id order
 * @param {object[]} edgeCurves - list of edges with curve properties
 * @param {string} id - `{nodeId}--{nodeId}`
 * @returns {string} `{nodeId}--{nodeId}`
 */
function findCurveId(edgeCurves: any, id: any): any {
  const [subject, object] = id.split("--");
  const curveId = Object.keys(edgeCurves).find((curve: any) => {
    const nodeIds = curve.split("--");
    if (nodeIds.indexOf(subject) > -1 && nodeIds.indexOf(object) > -1) {
      return true;
    }
    return false;
  });
  return curveId;
}

const edgeCurveProps = {
  get: (edgeCurves: any, id: any): any => {
    const curveId = findCurveId(edgeCurves, id);
    let flip = false;
    if (curveId) {
      // n0--n1 != n1--n0
      // we need to flip in order to have all edges right side up
      if (curveId !== id) {
        flip = true;
      }
      // return existing edge curve props
      return { indices: edgeCurves[curveId], flip };
    }
    // return new edge curve props
    return { indices: [], flip };
  },
  set: (edgeCurves: any, id: any, val: any): any => {
    const curveId = findCurveId(edgeCurves, id);
    if (curveId) {
      edgeCurves[curveId] = val;
    } else {
      edgeCurves[id] = val;
    }
    return true;
  },
};

/**
 * Add numEdges, index, and strokeWidth to edge objects
 *
 * **Must modify the existing edges array to keep the same reference for d3**
 * @param {object[]} edges - list of graph edges
 * @returns {object[]} list of edges with properties for d3 curves
 */
function addEdgeCurveProperties(edges: any): any {
  const curveProps = new Proxy({}, edgeCurveProps);
  edges.forEach((e: any, i: any) => {
    const curve = curveProps[`${e.source.id}--${e.target.id}`];
    curve.indices.push(i);
    curveProps[`${e.source.id}--${e.target.id}`] = curve.indices;
  });
  edges.forEach((e: any, i: any) => {
    const curve = curveProps[`${e.source.id}--${e.target.id}`];
    e.numEdges = curve.indices.length;
    const edgeIndex = curve.indices.indexOf(i);
    e.index = edgeIndex;
    // if an even number of edges, move first middle edge to outside
    // to keep edges symmetrical
    if (curve.indices.length % 2 === 0 && edgeIndex === 0) {
      e.index = curve.indices.length - 1;
    }
    // if not the first index (0)
    if (edgeIndex) {
      // all even index should be one less and odd indices
      // should be flipped
      const edgeL = edgeIndex % 2;
      if (!edgeL) {
        e.index -= 1;
      } else {
        e.index = -e.index;
      }
    }
    // flip curve on any inverse edges
    if (curve.flip) {
      e.index = -e.index;
    }
    e.strokeWidth = "3";
  });
  return edges;
}

/**
 * Handle creation of edges
 * @param {obj} edge - d3 edge object
 */
function enter(edge: any): any {
  return (
    edge
      .append("g")
      .attr("id", (d: any) => d.id)
      .attr("class", "edge")
      // visible line
      .call((e: any) =>
        e
          .append("path")
          .attr("stroke", "#999")
          .attr("fill", "none")
          .attr("stroke-width", (d: any) => d.strokeWidth)
          .attr("class", "edgePath")
          .attr("marker-end", (d: any) => (graphUtils.shouldShowArrow(d, d.symmetric) ? "url(#arrow)" : ""))
      )
      // wider clickable line
      .call((e: any) =>
        e
          .append("path")
          .attr("stroke", "transparent")
          .attr("fill", "none")
          .attr("stroke-width", 10)
          .attr("class", (d: any) => `edgeTransparent edge-${d.id}`)
          .attr("id", (d: any) => `edge${d.id}`)
          .call(() =>
            e
              .append("text")
              .attr("class", "edgeText")
              .attr("pointer-events", "none")
              .style("text-anchor", "middle")
              .attr("dy", (d: any) => -d.strokeWidth)
              .append("textPath")
              .attr("pointer-events", "none")
              .attr("xlink:href", (d: any) => `#edge${d.id}`)
              .style("user-select", "none")
              .attr("startOffset", "50%")
              .text((d: any) => (d.predicates ? d.predicates.map((p: any) => strings.displayPredicate(p)).join(", ") : ""))
          )
          .call((eLabel: any) => eLabel.append("title").text((d: any) => (d.predicates ? d.predicates.map((p: any) => strings.displayPredicate(p)).join(", ") : "")))
      )
      // source edge end circle
      .call((e: any) =>
        e
          .append("circle")
          .attr("r", 5)
          .attr("fill", "#B5D3E3")
          // .attr('fill', 'transparent')
          .attr("stroke", "#999")
          .attr("stroke-width", 1)
          .style("opacity", 0)
          .style("cursor", "pointer")
          // class is how we grab the attached node later
          .attr("class", "source edgeEnd")
          .on("mouseover", graphUtils.showElement)
          .on("mouseout", graphUtils.hideElement)
      )
      // target edge end circle
      .call((e: any) =>
        e
          .append("circle")
          .attr("r", 5)
          .attr("fill", "#B5D3E3")
          // .attr('fill', 'transparent')
          .attr("stroke", "#999")
          .attr("stroke-width", 1)
          .style("opacity", 0)
          .style("cursor", "pointer")
          // class is how we grab the attached node later
          .attr("class", "target edgeEnd")
          .on("mouseover", graphUtils.showElement)
          .on("mouseout", graphUtils.hideElement)
      )
      // edge button group
      .call((eg: any) =>
        eg
          .append("g")
          .attr("class", "edgeButtons")
          .call((e: any) =>
            e
              .append("rect")
              .attr("rx", 5)
              .attr("ry", 5)
              .attr("transform", `translate(${deleteRectOffset.x},${deleteRectOffset.y})`)
              .attr("width", rectSize.w)
              .attr("height", rectSize.h)
              .attr("stroke", "black")
              .attr("fill", "white")
              .style("filter", "url(#buttonShadow)")
              .style("display", "none")
              .attr("class", (d: any) => `${d.id} deleteRect`)
          )
          .call((e: any) =>
            e
              .append("text")
              .attr("dx", deleteTextOffset.x)
              .attr("dy", deleteTextOffset.y)
              .style("pointer-events", "none")
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "middle")
              .attr("class", (d: any) => `${d.id} deleteLabel`)
              .style("display", "none")
              .text("delete")
          )
          .call((e: any) =>
            e
              .append("rect")
              .attr("rx", 5)
              .attr("ry", 5)
              .attr("transform", `translate(${editRectOffset.x},${editRectOffset.y})`)
              .attr("width", rectSize.w)
              .attr("height", rectSize.h)
              .attr("stroke", "black")
              .attr("fill", "white")
              .style("filter", "url(#buttonShadow)")
              .style("display", "none")
              .attr("class", (d: any) => `${d.id} editRect`)
          )
          .call((e: any) =>
            e
              .append("text")
              .attr("dx", editTextOffset.x)
              .attr("dy", editTextOffset.y)
              .style("pointer-events", "none")
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "middle")
              .attr("class", (d: any) => `${d.id} editLabel`)
              .style("display", "none")
              .text("edit")
          )
      )
  );
}

/**
 * Update an edge label, arrow, and tooltip
 * @param {object} edge - d3 edge object
 */
function update(edge: any): any {
  return edge
    .call((e: any) => e.select("title").text((d: any) => (d.predicates ? d.predicates.map((p: any) => strings.displayPredicate(p)).join(", ") : "")))
    .call((e: any) =>
      e
        .select(".edgePath")
        // .attr('stroke-width', (d) => d.strokeWidth)
        .attr("marker-end", (d: any) => (graphUtils.shouldShowArrow(d, d.symmetric) ? "url(#arrow)" : ""))
    )
    .call((e: any) =>
      e
        .select("text")
        .select("textPath")
        .text((d: any) => (d.predicates ? d.predicates.map((p: any) => strings.displayPredicate(p)).join(", ") : ""))
    );
  //   .attr('dy', (d) => -d.strokeWidth));
}

/**
 * Remove and edge
 * @param {object} edge - d3 edge object
 */
function exit(edge: any): any {
  return edge.remove();
}

/**
 * Add click listener to edge
 * @param {string} editId - current edit id
 * @param {function} setEditId - set current edit id
 */
function attachEdgeClick(editId: any, setEditId: any): void {
  d3.selectAll(".edgeTransparent").on("click", (event: any, d: any) => {
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

/**
 * Attach delete function to button
 * @param {function} deleteEdge - delete an edge
 * @param {function} setEditId - set current edit id
 */
function attachDeleteClick(deleteEdge: any, setEditId: any): void {
  d3.selectAll(".edgeButtons > .deleteRect").on("click", (event: any, d: any) => {
    const { id } = d;
    setEditId("");
    deleteEdge(id);
  });
}

/**
 * Attach listener to edit button
 * @param {function} openEditor - open the edge editor
 * @param {function} setEditId - set current edit id
 */
function attachEditClick(openEditor: any, setEditId: any): void {
  d3.selectAll(".edgeButtons > .editRect").on("click", (event: any, d: any) => {
    const { id } = d;
    const edgeAnchor = d3.select(`#${id} > .source`).node();
    setEditId("");
    openEditor(id, edgeAnchor, "editEdge");
  });
}

/**
 * Attach hover functionality to edge
 * @param {string} editId - current edit id
 */
function attachMouseHover(editId: any): void {
  d3.selectAll(".edgeTransparent")
    .on("mouseover", (event: any, d: any) => {
      const { id } = d;
      d3.selectAll(`#${id} > .source, #${id} > .target`).transition().duration(500).style("opacity", 1);
      if (editId === id || !editId) {
        highlighter.highlightTextEditorEdge(id);
        highlighter.highlightGraphEdge(id);
      }
    })
    .on("mouseout", (event: any, d: any) => {
      const { id } = d;
      d3.selectAll(`#${id} > .source, #${id} > .target`).transition().duration(1000).style("opacity", 0);
      if (editId !== id || !editId) {
        highlighter.clearTextEditorEdge(id);
        highlighter.clearGraphEdge(id);
      }
    });
}

/**
 * Attach drag handlers to edge ends
 * @param {object} simulation - d3 simulation
 * @param {integer} width - width of svg
 * @param {integer} height - height of svg
 * @param {integer} nodeRadius - radius of node circles
 * @param {function} updateEdge - update edge in query graph
 */
function attachDrag(simulation: any, width: any, height: any, nodeRadius: any, updateEdge: any): void {
  d3.selectAll(".edge").call((e: any) => e.selectAll(".edgeEnd").call(dragUtils.dragEdgeEnd(e, simulation, width, height, nodeRadius, updateEdge) as any));
}

/**
 * Remove all hover edge effects
 */
function removeMouseHover(): void {
  d3.selectAll(".edgeTransparent").on("mouseover", null).on("mouseout", null);
}

/**
 * Remove all edge click listeners
 */
function removeClicks(): void {
  d3.selectAll(".edgeTransparent").on("click", null);
}

export default {
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
  removeMouseHover,
};
