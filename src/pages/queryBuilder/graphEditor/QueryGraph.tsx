import React, { useEffect, useContext, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import graphUtils from '../../../utils/d3/graph';
import nodeUtils from '../../../utils/d3/nodes';
import edgeUtils from '../../../utils/d3/edges';
import highlighter from '../../../utils/d3/highlighter';
import BiolinkContext from '../../../context/biolink';
import { useQueryBuilderContext } from '../../../context/queryBuilder';
import queryGraphUtils from '../../../utils/queryGraph';

const nodeRadius = 48;
const edgeLength = 225;

const EXTRA_PADDING = 0;

// Type definitions
interface BiolinkPredicate {
  predicate: string;
  domain: string;
  range: string;
  symmetric: boolean;
}

interface BiolinkContextType {
  colorMap?: (categories: string | string[]) => [string | null, string];
  hierarchies?: Record<string, any>;
  predicates?: BiolinkPredicate[];
  ancestorsMap?: Record<string, string[]>;
}

interface QueryGraphNode {
  id: string;
  name?: string;
  categories?: string[];
  is_set?: boolean;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  [key: string]: any;
}

interface QueryGraphEdge {
  id: string;
  subject: string;
  object: string;
  predicates?: string[];
  source: QueryGraphNode;
  target: QueryGraphNode;
  numEdges?: number;
  index?: number;
  strokeWidth?: string;
  symmetric?: string[];
  x?: number;
  y?: number;
  [key: string]: any;
}

interface QueryGraphProps {
  height: number;
  width: number;
  clickState: { clickedId: string; creatingConnection: boolean; [key: string]: any };
  updateClickState: (action: { type: string; payload: any }) => void;
  graphRef?: React.RefObject<HTMLDivElement | null>;
}

interface NodeArgs {
  nodeRadius: number;
  colorMap: (categories: any) => any[];
}

/**
 * Main D3 query graph component
 */
export default function QueryGraph({
  height,
  width,
  clickState,
  updateClickState,
  graphRef,
}: QueryGraphProps) {
  // Local dimensions that track the parent container’s actual size
  const [dimensions, setDimensions] = React.useState({ height, width });

  // Keep the latest dimensions in a ref for closures (ticked, drag handlers, etc.)
  const sizeRef = useRef({ width, height });
  useEffect(() => {
    sizeRef.current = { width: dimensions.width, height: dimensions.height };
  }, [dimensions]);

  // Observe the parent container for resizes
  useEffect(() => {
    if (!graphRef?.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentBoxSize) {
          const newWidth = entry.contentRect.width;
          const newHeight = entry.contentRect.height;
          setDimensions({ width: newWidth, height: newHeight - EXTRA_PADDING });
        }
      }
    });
    observer.observe(graphRef.current);
    return () => observer.disconnect();
  }, [graphRef]);

  const { colorMap, predicates = [] } = useContext(BiolinkContext) as BiolinkContextType;
  const symmetricPredicates = predicates?.filter((p) => p?.symmetric)?.map((p) => p?.predicate);

  const queryBuilder = useQueryBuilderContext();
  const { query_graph } = queryBuilder;

  const { nodes, edges } = useMemo(
    () => queryGraphUtils.getNodeAndEdgeListsForDisplay(query_graph),
    [queryBuilder.state] // state changes when graph changes
  );

  // D3 refs
  const svgRef = useRef<SVGSVGElement>(null);
  const svgSel = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);
  const node = useRef<d3.Selection<SVGGElement, QueryGraphNode, SVGGElement, unknown> | any>(null);
  const edge = useRef<d3.Selection<SVGGElement, QueryGraphEdge, SVGGElement, unknown> | any>(null);
  const simulation = useRef<d3.Simulation<QueryGraphNode, QueryGraphEdge> | null>(null);

  const nodeArgs: NodeArgs = {
    nodeRadius,
    colorMap: colorMap || (() => ['', '']),
  };

  /**
   * Initialize once: svg, defs, containers, simulation, and tick handler
   */
  useEffect(() => {
    if (!svgRef.current) return;

    // Base SVG selection
    svgSel.current = d3.select(svgRef.current);
    svgSel.current
      .attr('width', dimensions.width)
      .attr('height', dimensions.height - EXTRA_PADDING)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', [0, 0, dimensions.width, dimensions.height - EXTRA_PADDING] as any);

    // Containers
    if (svgSel.current.select('#edgeContainer').empty()) {
      svgSel.current.append('g').attr('id', 'edgeContainer');
    }
    if (svgSel.current.select('#nodeContainer').empty()) {
      svgSel.current.append('g').attr('id', 'nodeContainer');
    }
    edge.current = svgSel.current
      .select('#edgeContainer')
      .selectAll<SVGGElement, QueryGraphEdge>('g');
    node.current = svgSel.current
      .select('#nodeContainer')
      .selectAll<SVGGElement, QueryGraphNode>('g');

    // Defs (arrows, shadows) – only once
    if (svgSel.current.select('defs').empty()) {
      const defs = svgSel.current.append('defs');

      // Arrow marker
      defs
        .append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', [0, 0, 20, 13])
        .attr('refX', 20)
        .attr('refY', 6.5)
        .attr('markerWidth', 6.5)
        .attr('markerHeight', 25)
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr(
          'd',
          d3.line()([
            [0, 0],
            [0, 13],
            [25, 6.5],
          ] as any)
        )
        .attr('fill', '#999');

      // Set nodes shadow
      const shadow = defs
        .append('filter')
        .attr('id', 'setShadow')
        .attr('width', '250%')
        .attr('height', '250%');
      shadow
        .append('feGaussianBlur')
        .attr('in', 'SourceAlpha')
        .attr('stdDeviation', 5)
        .attr('result', 'blur');
      shadow
        .append('feOffset')
        .attr('in', 'blur')
        .attr('dx', 0)
        .attr('dy', 0)
        .attr('result', 'offsetBlur');
      const feMerge = shadow.append('feMerge');
      feMerge.append('feMergeNode').attr('in', 'offsetBlur');
      feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

      // Button shadow
      const buttonShadow = defs
        .append('filter')
        .attr('id', 'buttonShadow')
        .attr('width', '130%')
        .attr('height', '130%');
      buttonShadow
        .append('feGaussianBlur')
        .attr('in', 'SourceAlpha')
        .attr('stdDeviation', 1)
        .attr('result', 'blur');
      buttonShadow
        .append('feOffset')
        .attr('in', 'blur')
        .attr('dx', 2)
        .attr('dy', 2)
        .attr('result', 'offsetBlur');
      const feMergeBtn = buttonShadow.append('feMerge');
      feMergeBtn.append('feMergeNode').attr('in', 'offsetBlur');
      feMergeBtn.append('feMergeNode').attr('in', 'SourceGraphic');
    }

    // Simulation (create once)
    simulation.current = d3
      .forceSimulation<QueryGraphNode, QueryGraphEdge>()
      .force('collide', d3.forceCollide<QueryGraphNode>().radius(nodeRadius))
      .force(
        'link',
        d3
          .forceLink<QueryGraphNode, QueryGraphEdge>()
          .id((d: QueryGraphNode) => d.id)
          .distance(edgeLength)
          .strength(1)
      )
      .force(
        'center',
        d3.forceCenter<QueryGraphNode>(dimensions.width / 2, dimensions.height / 2).strength(0.05)
      )
      .on('tick', ticked);

    // Global SVG click for clearing highlights, etc.
    svgSel.current.on('click', (e: MouseEvent) => {
      d3.selectAll('.deleteRect,.deleteLabel,.editRect,.editLabel').style('display', 'none');
      d3.select('#edgeContainer').raise();
      highlighter.clearAllNodes();
      highlighter.clearAllEdges();
      if (clickState.clickedId !== '') {
        updateClickState({ type: 'click', payload: { id: '' } });
      }
      // prevent bubbling out of the svg
      e.stopPropagation();
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // init once

  /**
   * When the SVG's container size changes, update svg size + center force
   */
  useEffect(() => {
    if (!svgSel.current || !simulation.current) return;

    svgSel.current
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('viewBox', [0, 0, dimensions.width, dimensions.height] as any);

    const center = simulation.current.force('center') as d3.ForceCenter<QueryGraphNode>;
    center.x(dimensions.width / 2).y(dimensions.height / 2);

    // Nudge the simulation so nodes move toward the new center
    simulation.current.alpha(0.5).restart();
  }, [dimensions]);

  /**
   * Tick handler — uses the latest dimensions from sizeRef
   */
  function ticked() {
    const { width: W, height: H } = sizeRef.current;

    if (node.current) {
      node.current.attr('transform', (d: QueryGraphNode) => {
        let padding = nodeRadius;
        // Allow dragged (fixed) nodes to push slightly into bounds
        if (d.fx !== null && d.fx !== undefined) {
          padding *= 0.5;
        }
        d.x = graphUtils.getBoundedValue(d.x ?? 0, W - padding, padding);
        d.y = graphUtils.getBoundedValue(d.y ?? 0, H - padding, padding);
        return `translate(${d.x},${d.y})`;
      });
    }

    if (edge.current) {
      edge.current.select('.edgePath').attr('d', (d: QueryGraphEdge) => {
        const { x1, y1, qx, qy, x2, y2 } = graphUtils.getCurvedEdgePos(
          d.source?.x ?? 0,
          d.source?.y ?? 0,
          d.target?.x ?? 0,
          d.target?.y ?? 0,
          d.numEdges ?? 1,
          d.index ?? 0,
          nodeRadius
        );
        return `M${x1},${y1}Q${qx},${qy} ${x2},${y2}`;
      });

      edge.current.select('.edgeTransparent').attr('d', (d: QueryGraphEdge) => {
        const { x1, y1, qx, qy, x2, y2 } = graphUtils.getCurvedEdgePos(
          d.source?.x ?? 0,
          d.source?.y ?? 0,
          d.target?.x ?? 0,
          d.target?.y ?? 0,
          d.numEdges ?? 1,
          d.index ?? 0,
          nodeRadius
        );
        const leftNode = x1 > x2 ? `${x2},${y2}` : `${x1},${y1}`;
        const rightNode = x1 > x2 ? `${x1},${y1}` : `${x2},${y2}`;
        return `M${leftNode}Q${qx},${qy} ${rightNode}`;
      });

      edge.current
        .select('.source')
        .attr('cx', (d: QueryGraphEdge) => {
          const { x1 } = graphUtils.getCurvedEdgePos(
            d.source?.x ?? 0,
            d.source?.y ?? 0,
            d.target?.x ?? 0,
            d.target?.y ?? 0,
            d.numEdges ?? 1,
            d.index ?? 0,
            nodeRadius
          );
          const boundedVal = graphUtils.getBoundedValue(x1, W);
          d.x = boundedVal; // store internal x
          return boundedVal;
        })
        .attr('cy', (d: QueryGraphEdge) => {
          const { y1 } = graphUtils.getCurvedEdgePos(
            d.source?.x ?? 0,
            d.source?.y ?? 0,
            d.target?.x ?? 0,
            d.target?.y ?? 0,
            d.numEdges ?? 1,
            d.index ?? 0,
            nodeRadius
          );
          const boundedVal = graphUtils.getBoundedValue(y1, H);
          d.y = boundedVal; // store internal y
          return boundedVal;
        });

      edge.current
        .select('.target')
        .attr('cx', (d: QueryGraphEdge) => {
          const { x2 } = graphUtils.getCurvedEdgePos(
            d.source?.x ?? 0,
            d.source?.y ?? 0,
            d.target?.x ?? 0,
            d.target?.y ?? 0,
            d.numEdges ?? 1,
            d.index ?? 0,
            nodeRadius
          );
          const boundedVal = graphUtils.getBoundedValue(x2, W);
          d.x = boundedVal;
          return boundedVal;
        })
        .attr('cy', (d: QueryGraphEdge) => {
          const { y2 } = graphUtils.getCurvedEdgePos(
            d.source?.x ?? 0,
            d.source?.y ?? 0,
            d.target?.x ?? 0,
            d.target?.y ?? 0,
            d.numEdges ?? 1,
            d.index ?? 0,
            nodeRadius
          );
          const boundedVal = graphUtils.getBoundedValue(y2, H);
          d.y = boundedVal;
          return boundedVal;
        });

      edge.current.select('.edgeButtons').attr('transform', (d: QueryGraphEdge) => {
        const { x, y } = graphUtils.getEdgeMidpoint(d);
        return `translate(${x},${y})`;
      });
    }
  }

  /**
   * Update displayed query graph when node/edge arrays change
   */
  useEffect(() => {
    if (!simulation.current) return;

    // Preserve node positions by mapping previous nodes by id
    const oldPositions = new Map(
      node.current?.data?.().map?.((d: QueryGraphNode) => [d.id, { x: d.x, y: d.y }]) ?? []
    );

    const { width: W, height: H } = sizeRef.current;

    const newNodes: QueryGraphNode[] = nodes.map((d: QueryGraphNode) =>
      Object.assign(oldPositions.get(d.id) || { x: Math.random() * W, y: Math.random() * H }, d)
    );

    // Shallow copy edges to preserve internal props the utils may mutate
    const newEdges: QueryGraphEdge[] = edges.map((e: any) => ({ ...e }));

    // Hook up simulation data
    simulation.current.nodes(newNodes);
    (simulation.current.force('link') as d3.ForceLink<QueryGraphNode, QueryGraphEdge>).links(
      newEdges
    );

    // Selections
    node.current = node.current
      .data(newNodes, (d: QueryGraphNode) => d.id)
      .join(
        (n: any) => nodeUtils.enter(n, nodeArgs),
        (n: any) => nodeUtils.update(n, nodeArgs),
        (n: any) => nodeUtils.exit(n)
      );

    const edgesWithCurves = edgeUtils.addEdgeCurveProperties(newEdges);
    edgesWithCurves.forEach((e: QueryGraphEdge) => {
      e.symmetric = symmetricPredicates;
    });

    edge.current = edge.current
      .data(edgesWithCurves, (d: QueryGraphEdge) => d.id)
      .join(edgeUtils.enter, edgeUtils.update, edgeUtils.exit);

    // Kick the layout to settle with new data
    simulation.current.alpha(1).restart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, symmetricPredicates]);

  function updateEdge(edgeId: string, endpoint: string, nodeId: string) {
    queryBuilder.dispatch({ type: 'editEdge', payload: { edgeId, endpoint, nodeId } });
    if (!queryBuilder.state.isValid) {
      // Nudge to recompute positions (e.g., after invalid state temporarily)
      simulation.current?.alpha(0.001).restart();
    }
  }

  /**
   * Click / hover / drag handlers — refresh when interaction state or data changes
   */
  useEffect(() => {
    const { width: W, height: H } = sizeRef.current;

    if (clickState.creatingConnection) {
      const addNodeToConnection = (id: string) =>
        updateClickState({ type: 'connectTerm', payload: { id } });

      nodeUtils.attachConnectionClick(addNodeToConnection);
      nodeUtils.removeMouseHover();

      edgeUtils.removeClicks();
      edgeUtils.removeMouseHover();
    } else {
      const { clickedId } = clickState;
      const setClickedId = (id: string) => updateClickState({ type: 'click', payload: { id } });
      const openEditor = (id: string, anchor: any, type: string) =>
        updateClickState({ type: 'openEditor', payload: { id, anchor, type } });

      nodeUtils.attachNodeClick(clickedId, setClickedId);
      nodeUtils.attachEditClick(openEditor, setClickedId);
      nodeUtils.attachDeleteClick(
        (id: string) => queryBuilder.dispatch({ type: 'deleteNode', payload: { id } }),
        setClickedId
      );
      nodeUtils.attachMouseHover(clickedId);

      // Important: pass current canvas size to drag so bounds are up-to-date
      nodeUtils.attachDrag(simulation.current, W, H, nodeRadius);

      edgeUtils.attachEdgeClick(clickedId, setClickedId);
      edgeUtils.attachEditClick(openEditor, setClickedId);
      edgeUtils.attachDeleteClick(
        (id: string) => queryBuilder.dispatch({ type: 'deleteEdge', payload: { id } }),
        setClickedId
      );
      edgeUtils.attachMouseHover(clickedId);
      edgeUtils.attachDrag(simulation.current, W, H, nodeRadius, updateEdge);
    }
  }, [clickState, nodes, edges, updateClickState, queryBuilder]);

  return <svg ref={svgRef} />;
}
