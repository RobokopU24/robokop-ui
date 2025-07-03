import React, { useEffect, useContext, useRef, useState } from "react";
import * as d3 from "d3";
import { Paper, Box, Slider } from "@mui/material";

import BiolinkContext from "../../../context/biolink";
import dragUtils from "../../../utils/d3/drag";
import graphUtils from "../../../utils/d3/graph";
import edgeUtils from "../../../utils/d3/edges";
import stringUtils from "../../../utils/strings";
import useDebounce from "../../../stores/useDebounce";
import ResultMetaData from "./ResultMetaData";
import AttributesTable from "./AttributesTable";
import Popover from "../../../components/Popover";
import NodeAttributesTable from "../NodeAttributesTable";

interface BiolinkContextValue {
  colorMap?: (categories: string | string[]) => [string | null, string];
  hierarchies?: Record<string, any>;
  predicates?: Array<{
    predicate: string;
    domain: string;
    range: string;
    symmetric: boolean;
  }>;
}

const nodeRadius: number = 40;

interface NodeType extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  categories: string[];
  score: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface EdgeType extends d3.SimulationLinkDatum<NodeType> {
  id: string;
  source: string | NodeType;
  target: string | NodeType;
  predicate: string;
  strokeWidth?: number;
  numEdges?: number;
  index?: number;
  attributes?: any[];
  sources?: any[];
}

interface AnswerStoreType {
  numQgNodes: number;
  showNodePruneSlider: boolean;
  selectedResult: {
    nodes: { [id: string]: NodeType };
    edges: { [id: string]: EdgeType };
  };
  selectedRowId: string;
  metaData?: any;
  resultJSON: {
    knowledge_graph: {
      edges: { [id: string]: { attributes: any[]; sources: any[] } };
    };
  };
}

type PopoverType = "node" | "edge" | null;

type PopoverDataType = Pick<NodeType, "name" | "id" | "categories"> | Pick<EdgeType, "attributes" | "sources"> | {};

/**
 * Selected result graph
 * @param {object} answerStore - answer store hook
 */
export default function ResultExplorer({ answerStore }: { answerStore: AnswerStoreType }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const svg = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);
  const width = useRef<number>(0);
  const height = useRef<number>(0);
  const node = useRef<d3.Selection<SVGGElement, NodeType, d3.BaseType, unknown> | null>(null);
  const edge = useRef<d3.Selection<SVGGElement, EdgeType, d3.BaseType, unknown> | null>(null);
  const simulation = useRef<d3.Simulation<NodeType, EdgeType> | null>(null);
  const { colorMap, predicates } = useContext(BiolinkContext) as BiolinkContextValue;
  const [numTrimmedNodes, setNumTrimmedNodes] = useState<number>(answerStore.numQgNodes);
  const debouncedTrimmedNodes = useDebounce(numTrimmedNodes, 500);
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [popoverOpen, setPopoverOpen] = useState<PopoverType | null>(null);
  const [popoverData, setPopoverData] = useState<PopoverDataType>({});
  const symmetricPredicates: string[] = (predicates || []).filter((predicate: any) => predicate && predicate.symmetric).map((predicate: any) => predicate.predicate);

  /**
   * Initialize svg object
   */
  useEffect(() => {
    if (!svgRef.current) return;
    svg.current = d3.select(svgRef.current);
    const { width: fullWidth, height: fullHeight } = svg.current.node()!.getBoundingClientRect();
    width.current = fullWidth;
    height.current = fullHeight;
    svg.current.attr("width", width.current).attr("height", height.current).attr("preserveAspectRatio", "xMinYMin meet").attr("viewBox", [0, 0, width.current, height.current]);
    if (svg.current.select("defs").empty()) {
      const defs = svg.current.append("defs");
      defs
        .append("marker")
        .attr("id", "arrow")
        .attr("viewBox", [0, 0, 20, 13])
        .attr("refX", 20)
        .attr("refY", 6.5)
        .attr("markerWidth", 6.5)
        .attr("markerHeight", 25)
        .attr("orient", "auto-start-reverse")
        .append("path")
        .attr(
          "d",
          d3.line()([
            [0, 0],
            [0, 13],
            [25, 6.5],
          ] as [number, number][])
        )
        .attr("fill", "#999");
    }
    if (svg.current.select("#nodeContainer").empty()) {
      svg.current.append("g").attr("id", "nodeContainer");
      node.current = svg.current.select("#nodeContainer").selectAll<SVGGElement, NodeType>("g");
    }
    if (svg.current.select("#edgeContainer").empty()) {
      svg.current.append("g").attr("id", "edgeContainer");
      edge.current = svg.current.select("#edgeContainer").selectAll<SVGGElement, EdgeType>("g");
    }
  }, []);

  /**
   * Move nodes and edges one 'tick' during simulation
   */
  function ticked() {
    if (!node.current || !edge.current) return;
    node.current.attr("transform", (d: NodeType) => {
      let padding = nodeRadius;
      if (d.fx !== null && d.fx !== undefined) {
        padding *= 0.5;
      }
      d.x = graphUtils.getBoundedValue(Number(d.x), Number(width.current) - padding, padding);
      d.y = graphUtils.getBoundedValue(Number(d.y), Number(height.current) - padding, padding);
      return `translate(${d.x}, ${d.y})`;
    });

    edge.current.select<SVGPathElement>(".result_edge").attr("d", (d: EdgeType) => {
      const { x1, y1, qx, qy, x2, y2 } = graphUtils.getCurvedEdgePos(
        Number((d.source as NodeType).x),
        Number((d.source as NodeType).y),
        Number((d.target as NodeType).x),
        Number((d.target as NodeType).y),
        Number(d.numEdges),
        Number(d.index),
        nodeRadius
      );
      return `M${x1},${y1}Q${qx},${qy} ${x2},${y2}`;
    });

    edge.current.select<SVGPathElement>(".result_edge_transparent").attr("d", (d: EdgeType) => {
      const { x1, y1, qx, qy, x2, y2 } = graphUtils.getCurvedEdgePos(
        Number((d.source as NodeType).x),
        Number((d.source as NodeType).y),
        Number((d.target as NodeType).x),
        Number((d.target as NodeType).y),
        Number(d.numEdges),
        Number(d.index),
        nodeRadius
      );
      const leftNode = x1 > x2 ? `${x2},${y2}` : `${x1},${y1}`;
      const rightNode = x1 > x2 ? `${x1},${y1}` : `${x2},${y2}`;
      return `M${leftNode}Q${qx},${qy} ${rightNode}`;
    });
  }

  /**
   * Initialize simulation object
   */
  useEffect(() => {
    simulation.current = d3
      .forceSimulation<NodeType, EdgeType>()
      .force("collide", d3.forceCollide<NodeType>().radius(nodeRadius * 2))
      .force(
        "link",
        d3
          .forceLink<NodeType, EdgeType>()
          .id((d: NodeType) => d.id)
          .distance(175)
          .strength(0)
      )
      .on("tick", ticked);
  }, []);

  /**
   * Draw the answer graph
   */
  function drawAnswerGraph() {
    if (!svg.current || !simulation.current) return;
    const { width: fullWidth, height: fullHeight } = svg.current.node()!.getBoundingClientRect();
    width.current = fullWidth;
    height.current = fullHeight;
    // set the svg size
    svg.current.attr("width", width.current).attr("height", height.current).attr("preserveAspectRatio", "xMinYMin meet").attr("viewBox", [0, 0, width.current, height.current]);
    // set the simulation gravity middle
    simulation.current.force("center", d3.forceCenter(width.current / 2, height.current / 2).strength(0.5)).force("forceY", d3.forceY(height.current / 2).strength(0.2));

    // keep positions of kept nodes
    const oldNodes = new Map((node.current ? node.current.data() : []).map((d: NodeType) => [d.id, { x: d.x, y: d.y }]));
    const sortedNodes = Object.values(answerStore.selectedResult.nodes).sort((a, b) => (b as NodeType).score - (a as NodeType).score);
    const trimmedNodes = (sortedNodes as NodeType[]).slice(0, answerStore.showNodePruneSlider ? Number(debouncedTrimmedNodes) : undefined);
    const nodes: NodeType[] = (trimmedNodes as NodeType[]).map((d) =>
      Object.assign(
        oldNodes.get(d.id) || {
          x: Math.random() * width.current,
          y: Math.random() * height.current,
        },
        d
      )
    );
    const trimmedNodeIds = (trimmedNodes as NodeType[]).map((n) => n.id);
    const trimmedEdges = Object.keys(answerStore.selectedResult.edges)
      .filter((key) => {
        const e = answerStore.selectedResult.edges[key];
        return trimmedNodeIds.includes(e.source as string) && trimmedNodeIds.includes(e.target as string);
      })
      .map((key) => ({
        ...answerStore.selectedResult.edges[key],
        attributes: answerStore.resultJSON.knowledge_graph.edges[key]?.attributes,
        sources: answerStore.resultJSON.knowledge_graph.edges[key]?.sources,
      }));
    const edges: EdgeType[] = trimmedEdges.map((d) => ({ ...d }));
    simulation.current.nodes(nodes);
    (simulation.current.force("link") as d3.ForceLink<NodeType, EdgeType>).links(edges);

    node.current = node
      .current!.data(nodes, (d) => d.id)
      .join(
        (enter) =>
          enter
            .append("g")
            .attr("class", "result_node")
            .call(dragUtils.dragNode(simulation.current!) as any)
            .call((n: d3.Selection<SVGGElement, NodeType, any, any>) =>
              n
                .append("circle")
                .attr("r", nodeRadius)
                .attr("fill", (d: NodeType) => (colorMap ? colorMap(d.categories)[1] : "#ccc"))
                .call((nCircle: d3.Selection<SVGCircleElement, NodeType, any, any>) => nCircle.append("title").text((d: NodeType) => d.name))
                .style("transition", "stroke-width 200ms ease-in-out, stroke 200ms ease-in-out, filter 200ms ease-in-out")
                .style("cursor", "pointer")
                .on("mouseover", function (this: SVGCircleElement) {
                  d3.select(this).attr("stroke", "#239cff").style("filter", "brightness(1.1)").attr("stroke-width", 3);
                })
                .on("mouseout", function (this: SVGCircleElement) {
                  d3.select(this).attr("stroke", "none").style("filter", "initial").attr("stroke-width", 0);
                })
                .on("click", function (this: SVGCircleElement) {
                  handleClickNode(d3.select(this).datum() as NodeType);
                })
            )
            .call((n: d3.Selection<SVGGElement, NodeType, any, any>) =>
              n
                .append("text")
                .attr("class", "result_node_label")
                .style("pointer-events", "none")
                .attr("text-anchor", "middle")
                .style("font-weight", 600)
                .attr("alignment-baseline", "middle")
                .text((d: NodeType) => d.name)
                .each(graphUtils.fitTextIntoCircle)
            ),
        (update) => update,
        (exit) =>
          exit
            .transition()
            .ease(d3.easeCircle)
            .duration(1000)
            .attr("transform", (d: NodeType) => `translate(${d.x},-40)`)
            .call((e: any) => e.select("circle").attr("fill", "red"))
            .remove()
      );

    const edgesWithCurves = edgeUtils.addEdgeCurveProperties(edges as any);
    edge.current = edge
      .current!.data(edgesWithCurves as any, (d: any) => (d as EdgeType).id)
      .join(
        (enter) =>
          enter
            .append("g")
            .call((e: d3.Selection<SVGGElement, EdgeType, any, any>) =>
              e
                .append("path")
                .attr("stroke", "transparent")
                .attr("fill", "none")
                .attr("stroke-width", 10)
                .attr("class", "result_edge_transparent")
                .attr("id", (d: EdgeType) => `result_explorer_edge${d.id}`)
                .call(() =>
                  e
                    .append("text")
                    .attr("stroke", "none")
                    .attr("class", "edgeText")
                    .attr("pointer-events", "none")
                    .style("text-anchor", "middle")
                    .attr("dy", (d: EdgeType) => -((d.strokeWidth as number) || 0))
                    .append("textPath")
                    .attr("pointer-events", "none")
                    .attr("xlink:href", (d: EdgeType) => `#result_explorer_edge${d.id}`)
                    .attr("startOffset", "50%")
                    .text((d: EdgeType) => stringUtils.displayPredicate(d.predicate))
                )
                .call((eLabel: any) => eLabel.append("title").text((d: any) => stringUtils.displayPredicate((d as any).predicate)))
            )
            .call((e: d3.Selection<SVGGElement, EdgeType, any, any>) =>
              e
                .append("path")
                .attr("stroke", "inherit")
                .attr("fill", "none")
                .attr("stroke-width", (d: EdgeType) => d.strokeWidth as number)
                .attr("class", "result_edge")
                .attr("marker-end", (d: EdgeType) => (graphUtils.shouldShowArrow(d as any, symmetricPredicates) ? "url(#arrow)" : ""))
            )
            .attr("fill", "black")
            .attr("stroke", "#999")
            .style("transition", "stroke 100ms ease-in-out, fill 100ms ease-in-out")
            .style("cursor", "pointer")
            .on("mouseover", function (this: SVGGElement) {
              d3.select(this).attr("fill", "#239cff").attr("stroke", "#239cff");
            })
            .on("mouseout", function (this: SVGGElement) {
              d3.select(this).attr("fill", "black").attr("stroke", "#999");
            })
            .on("click", function (event: MouseEvent) {
              handleClickEdge(event, d3.select(this).datum() as any);
            }),
        (update) =>
          update
            .call((e: d3.Selection<SVGGElement, EdgeType, any, any>) => e.select("title").text((d: any) => stringUtils.displayPredicate((d as any).predicate)))
            .call((e: d3.Selection<SVGGElement, EdgeType, any, any>) =>
              e
                .select("text")
                .select("textPath")
                .text((d: any) => stringUtils.displayPredicate((d as any).predicate))
            ),
        (exit) => exit.remove()
      );

    simulation.current.alpha(1).restart();
  }

  /**
   * Grow or shrink the answer explorer
   * and then draw the graph
   */
  function resize() {
    const container = d3.select("#resultExplorer");
    const fullWidth = 50;
    if (answerStore.selectedRowId !== "") {
      // get current width
      const currentWidth = parseInt(container.style("width"), 10);
      // find the difference in width
      const widthDifference = fullWidth - (currentWidth % (fullWidth + 1)); // plus one width for already full width cases
      // calculate transition duration
      const duration = 1000 * (widthDifference / fullWidth);
      // resize explorer and then draw the graph
      container.transition().ease(d3.easeCircle).duration(duration).style("width", `${fullWidth}%`).style("margin-left", "10px").on("end", drawAnswerGraph).style("overflow-y", "unset");
    } else {
      // hide graph
      container.style("overflow-y", "auto").transition().ease(d3.easeCircle).duration(1000).style("width", "0%");
      d3.select(svgRef.current).attr("width", "0");
    }
  }

  const handleClickEdge = (event: MouseEvent, data: EdgeType) => {
    setPopoverPosition({ x: event.clientX, y: event.clientY });

    setPopoverData(data);
    setPopoverOpen("edge");
  };

  const handleClickNode = (data: NodeType) => {
    if (!svgRef.current) return;
    const { top, left } = svgRef.current.getBoundingClientRect();
    setPopoverPosition({
      x: left + (data.x ?? 0),
      y: top + (data.y ?? 0),
    });
    setPopoverData({
      name: data.name,
      id: data.id,
      categories: data.categories,
    });
    setPopoverOpen("node");
  };

  useEffect(() => {
    resize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answerStore.selectedResult, answerStore.selectedRowId, debouncedTrimmedNodes, colorMap]);

  return (
    <Paper id="resultExplorer" elevation={3}>
      <h5 className="cardLabel">Answer Explorer</h5>
      {Boolean(answerStore.showNodePruneSlider) && (
        <Box width={200} id="nodeNumSlider">
          <Slider
            value={numTrimmedNodes}
            valueLabelDisplay="auto"
            min={answerStore.numQgNodes}
            max={answerStore.selectedResult.nodes ? Object.keys(answerStore.selectedResult.nodes).length : answerStore.numQgNodes}
            onChange={(_e, v) => setNumTrimmedNodes(v as number)}
          />
        </Box>
      )}
      <svg ref={svgRef} style={{ flex: 1, width: "100%" }} />
      {answerStore.metaData && <ResultMetaData metaData={answerStore.metaData} result={answerStore.resultJSON} />}

      <Popover open={popoverOpen === "edge"} onClose={() => setPopoverOpen(null)} anchorPosition={{ top: popoverPosition.y, left: popoverPosition.x }} above>
        {popoverOpen === "edge" && <AttributesTable attributes={(popoverData as any).attributes} sources={(popoverData as any).sources} />}
      </Popover>

      <Popover open={popoverOpen === "node"} onClose={() => setPopoverOpen(null)} anchorPosition={{ top: popoverPosition.y, left: popoverPosition.x }} above>
        {popoverOpen === "node" && <NodeAttributesTable nodeData={popoverData as any} />}
      </Popover>
    </Paper>
  );
}
