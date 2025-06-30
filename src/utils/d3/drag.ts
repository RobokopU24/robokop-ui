import * as d3 from 'd3';
import graphUtils from './graph';

// Type definitions for D3 simulation and data
type D3Simulation = d3.Simulation<any, undefined>;

interface D3DragEvent {
  active: boolean;
  x: number;
  y: number;
  sourceEvent: {
    stopPropagation(): void;
  };
}

interface D3Node {
  id: string;
  x: number;
  y: number;
  fx: number | null;
  fy: number | null;
  [key: string]: any;
}

interface D3Edge {
  id: string;
  source: D3Node;
  target: D3Node;
  numEdges: number;
  index: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  [key: string]: any;
}

interface EdgeEndMapping {
  source: string;
  target: string;
}

/**
 * Handle node dragging
 */
function dragNode(simulation: D3Simulation) {
  function dragstarted(event: any, d: any) {
    if (!event.active) simulation.alphaTarget(0.01).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event: any, d: any) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event: any, d: any) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
}

function dragEdgeEnd(
  subject: D3Edge,
  simulation: D3Simulation,
  width: number,
  height: number,
  nodeRadius: number,
  updateEdge: (edgeId: string, endpoint: string, nodeId: string) => void
) {
  function dragstarted(event: any) {
    // stop simulation if user grabs an edge end
    if (!event.active) simulation.stop();
    event.sourceEvent.stopPropagation();
  }

  function dragged(this: Element, event: any, d: any) {
    const { id } = d;
    const type = d3.select(this).attr('class').split(' ')[0];
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
    const source = type === 'source' ? `${mouseX},${mouseY}` : `${x2},${y2}`;
    const target = type === 'source' ? `${x2},${y2}` : `${mouseX},${mouseY}`;
    const path = `M${source} ${target}`;
    let labelPath = path;
    // this is just to keep the predicate label right side up
    if ((type === 'source' && mouseX > x2) || (type === 'target' && mouseX < x2)) {
      labelPath = `M${target} ${source}`;
    }
    d3.select(`#${id}`)
      .call((e) => e.select('.edgePath').attr('d', path))
      .call((e) => e.select('.edgeTransparent').attr('d', labelPath))
      .call((e) => e.select(`.${type}`).attr('cx', mouseX).attr('cy', mouseY))
      .call((e) => e.select(`.${otherEdgeEnd}`).attr('cx', x2).attr('cy', y2));
  }

  function dragended(this: Element, event: any, d: any) {
    // see if edge was dropped on an edge
    const droppedCircle = d3
      .selectAll('.nodeCircle')
      .data()
      .find((n: any) => graphUtils.isInside(event.x, event.y, n.x, n.y, nodeRadius));
    const { id } = d;
    const type = d3.select(this).attr('class').split(' ')[0];
    if (droppedCircle && (droppedCircle as any).id) {
      // edge was on a node
      const mapping: EdgeEndMapping = {
        source: 'subject',
        target: 'object',
      };
      // no need to adjust anything internal because graph will be
      // redrawn
      updateEdge(id, mapping[type as keyof EdgeEndMapping], (droppedCircle as any).id);
    } else {
      // edge was dropped in space, put it back to previous nodes
      let {
        x1,
        y1,
        qx,
        qy,
        x2,
        y2, // eslint-disable-line prefer-const
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
      // make the predicate label right side up
      let labelPath = path;
      if (x1 > x2) {
        labelPath = `M${target}Q${qx},${qy} ${source}`;
      }
      d3.select(`#${id}`)
        .call((e) => e.select('.edgePath').attr('d', path))
        .call((e) => e.select('.edgeTransparent').attr('d', labelPath))
        .call((e) => e.select('.source').attr('cx', x1).attr('cy', y1))
        .call((e) => e.select('.target').attr('cx', x2).attr('cy', y2));
    }
  }

  return (
    d3
      .drag()
      // subject is how we know which edge end we've grabbed
      .subject(() => subject)
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended)
  );
}

export default {
  dragNode,
  dragEdgeEnd,
};
