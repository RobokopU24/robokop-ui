/* eslint-disable indent, no-use-before-define, func-names, no-return-assign */
import * as d3 from 'd3';
import graphUtils from './graph';
import dragUtils from './drag';
import highlighter from './highlighter';

const rectSize = {
  w: 50,
  h: 25,
};

const deleteRectOffset = {
  x: -54,
  y: -90,
};
const deleteTextOffset = {
  x: (deleteRectOffset.x + (deleteRectOffset.x + rectSize.w)) / 2,
  y: (deleteRectOffset.y + (deleteRectOffset.y + rectSize.h)) / 2,
};
const editRectOffset = {
  x: 4,
  y: -90,
};
const editTextOffset = {
  x: (editRectOffset.x + (editRectOffset.x + rectSize.w)) / 2,
  y: (editRectOffset.y + (editRectOffset.y + rectSize.h)) / 2,
};

interface NodeData {
  id: string;
  name?: string;
  categories: any;
  x?: number;
  y?: number;
  is_set?: boolean;
}

interface NodeArgs {
  nodeRadius: number;
  colorMap: (categories: any) => any[];
}

/**
 * Handle creation of nodes
 * @param {obj} node - d3 node object
 * @param {obj} args - object of node properties
 */
function enter(node: any, args: NodeArgs) {
  const { nodeRadius, colorMap } = args;
  return (
    node
      .append('g')
      .attr('class', 'node')
      .attr('id', (d: NodeData) => d.id)
      // create node circle
      .call((nodeCircle: any) =>
        nodeCircle
          .append('circle')
          .attr('class', (d: NodeData) => `nodeCircle node-${d.id}`)
          .attr('r', nodeRadius)
          .attr('fill', (d: NodeData) => colorMap(d.categories)[1])
          .style('cursor', 'pointer')
          .call((n: any) =>
            n.append('title').text((d: NodeData) => {
              let title = d.id;
              if (d.name) {
                title += `: ${d.name}`;
              }
              return title;
            })
          )
      )
      // create node label
      .call((nodeLabel: any) =>
        nodeLabel
          .append('text')
          .attr('class', 'nodeLabel')
          .style('pointer-events', 'none')
          .attr('text-anchor', 'middle')
          .style('font-weight', 600)
          .attr('alignment-baseline', 'middle')
          .text((d: NodeData) => {
            const { name } = d;
            return name || 'Something';
          })
          .each(graphUtils.fitTextIntoCircle)
      )
      // create delete button
      .call((nodeDelete: any) =>
        nodeDelete
          .append('rect')
          .attr('rx', 5)
          .attr('ry', 5)
          .attr('transform', `translate(${deleteRectOffset.x},${deleteRectOffset.y})`)
          .attr('width', rectSize.w)
          .attr('height', rectSize.h)
          .attr('stroke', 'black')
          .attr('fill', 'white')
          .style('filter', 'url(#buttonShadow)')
          .style('display', 'none')
          .attr('class', (d: NodeData) => `${d.id} deleteRect`)
      )
      // add delete button label
      .call((nodeDeleteLabel: any) =>
        nodeDeleteLabel
          .append('text')
          .attr('dx', deleteTextOffset.x)
          .attr('dy', deleteTextOffset.y)
          .style('pointer-events', 'none')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('class', (d: NodeData) => `${d.id} deleteLabel`)
          .style('display', 'none')
          .text('delete')
      )
      // create edit button
      .call((nodeEdit: any) =>
        nodeEdit
          .append('rect')
          .attr('rx', 5)
          .attr('ry', 5)
          .attr('transform', `translate(${editRectOffset.x},${editRectOffset.y})`)
          .attr('width', rectSize.w)
          .attr('height', rectSize.h)
          .attr('stroke', 'black')
          .attr('fill', 'white')
          .style('filter', 'url(#buttonShadow)')
          .style('display', 'none')
          .attr('class', (d: NodeData) => `${d.id} editRect`)
      )
      // add edit button label
      .call((nodeEditLabel: any) =>
        nodeEditLabel
          .append('text')
          .attr('dx', editTextOffset.x)
          .attr('dy', editTextOffset.y)
          .style('pointer-events', 'none')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('class', (d: NodeData) => `${d.id} editLabel`)
          .style('display', 'none')
          .text('edit')
      )
  );
}

/**
 * Handle node updates
 * @param {obj} node - d3 node object
 * @param {obj} args - node circle properties
 */
function update(node: any, args: { colorMap: (categories: any) => any[] }) {
  const { colorMap } = args;
  return node
    .call((n: any) =>
      n.select('.nodeCircle').attr('fill', (d: NodeData) => colorMap(d.categories)[1])
    )
    .style('filter', (d: NodeData) => (d.is_set ? 'url(#setShadow)' : ''))
    .call((nodeCircle: any) =>
      nodeCircle.select('title').text((d: NodeData) => {
        let title = d.id;
        if (d.name) {
          title += `: ${d.name}`;
        }
        return title;
      })
    )
    .call((l: any) =>
      l
        .select('.nodeLabel')
        .text((d: NodeData) => {
          const { name } = d;
          return name || 'Something';
        })
        .each(graphUtils.fitTextIntoCircle)
    );
}

/**
 * Handle node deletion
 * @param {obj} node - d3 node object
 */
function exit(node: any) {
  return node
    .transition()
    .ease(d3.easeCircle)
    .duration(1000)
    .attr('transform', (d: NodeData) => `translate(${d.x},-40)`)
    .call((e: any) => e.select('circle').attr('fill', 'red'))
    .remove();
}

/**
 * Set node circle click listener to be able to add an edge
 * @param {function} addNodeToConnection - add node to edge connection
 */
function attachConnectionClick(addNodeToConnection: (id: string) => void) {
  d3.selectAll('.nodeCircle').on('click', function (e: any, d: any) {
    e.stopPropagation();
    d3.select(this).attr('stroke', '#e0dfdf').attr('stroke-width', '5');
    addNodeToConnection(d.id);
  });
}

/**
 * Set node click listener to show or hide buttons
 * @param {string} clickedId - current clicked id
 * @param {function} setClickedId - set current clicked id
 */
function attachNodeClick(clickedId: string, setClickedId: (id: string) => void) {
  d3.selectAll('.nodeCircle').on('click', (e: any, d: any) => {
    const { id } = d;
    // raise node to front of other nodes
    d3.select('#nodeContainer').raise();
    d3.select(`#${id}`).raise();
    if (clickedId !== id) {
      e.stopPropagation();
      d3.selectAll('.deleteRect,.deleteLabel,.editRect,.editLabel').style('display', 'none');
      // open node selector
      d3.selectAll(`.${id}`).style('display', 'inherit').raise();
      setClickedId(id);
      highlighter.clearAllNodes();
      highlighter.clearAllEdges();
      highlighter.highlightTextEditorNode(d.id);
      highlighter.highlightGraphNode(d.id);
    } else {
      // svg listener will hide buttons
      setClickedId('');
      d3.select('#edgeContainer').raise();
    }
  });
}

function clickNode(id: string) {
  d3.select(`.nodeCircle.node-${id}`).dispatch('click');
}

/**
 * Attach delete function to button
 * @param {function} deleteNode - delete node from graph
 * @param {function} setClickedId - set current clicked id
 */
function attachDeleteClick(deleteNode: (id: string) => void, setClickedId: (id: string) => void) {
  d3.selectAll('.deleteRect').on('click', (e: any, d: any) => {
    const { id } = d;
    d3.select('#edgeContainer').raise();
    setClickedId('');
    deleteNode(id);
  });
}

/**
 * Attach edit function to button
 * @param {function} openNodeEditor - open the node editor
 * @param {string} setClickedId - set current clicked id
 */
function attachEditClick(
  openEditor: (id: string, nodeAnchor: any, mode: string) => void,
  setClickedId: (id: string) => void
) {
  d3.selectAll('.editRect').on('click', (e: any, d: any) => {
    const { id } = d;
    const nodeAnchor = d3.select(`#${id} > .nodeCircle`).node();
    d3.select('#edgeContainer').raise();
    setClickedId('');
    openEditor(id, nodeAnchor, 'editNode');
  });
}

/**
 * Show and hide node border on hover
 * @param {string} clickedId - current edit id
 */
function attachMouseHover(clickedId: string) {
  d3.selectAll('.nodeCircle')
    .on('mouseover', (e: any, d: any) => {
      if (clickedId === d.id || !clickedId) {
        highlighter.highlightTextEditorNode(d.id);
        highlighter.highlightGraphNode(d.id);
      }
    })
    .on('mouseout', (e: any, d: any) => {
      if (clickedId !== d.id || !clickedId) {
        highlighter.clearTextEditorNode(d.id);
        highlighter.clearGraphNode(d.id);
      }
    });
}

/**
 * Attach drag handler to nodes
 * @param {obj} simulation - d3 simulation
 * @param {int} width - width of the svg
 * @param {int} height - height of the svg
 * @param {int} nodeRadius - radius of node circles
 */
function attachDrag(simulation: any, width: number, height: number, nodeRadius: number) {
  d3.selectAll('.node').call(dragUtils.dragNode(simulation) as any);
}

/**
 * Remove all click listeners from nodes
 */
function removeClicks() {
  d3.selectAll('.nodeCircle').on('click', null);
}

/**
 * Clear out all node hover listeners
 */
function removeMouseHover() {
  d3.selectAll('.nodeCircle').on('mouseover', null).on('mouseout', null);
}

/**
 * Remove node border after 2 seconds
 */
function removeBorder() {
  d3.selectAll('.nodeCircle').transition().delay(2000).duration(1000).attr('stroke-width', '0');
}

export default {
  enter,
  update,
  exit,

  attachConnectionClick,
  attachNodeClick,
  attachEditClick,
  attachDeleteClick,
  attachMouseHover,
  attachDrag,

  removeClicks,
  removeMouseHover,
  removeBorder,

  clickNode,
};
