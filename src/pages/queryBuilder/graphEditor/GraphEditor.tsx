import React, { useReducer, useEffect, useState } from 'react';
import { Popover, Button, Paper, Tooltip } from '@mui/material';
import { useQueryBuilderContext } from '../../../context/queryBuilder';
import nodeUtils from '../../../utils/d3/nodes';
import DownloadDialog from '../../../components/DownloadDialog';
import { NodeOption } from '../textEditor/types';

import QueryGraph from './QueryGraph';
import NodeSelector from '../textEditor/textEditorRow/NodeSelector';
import PredicateSelector from '../textEditor/textEditorRow/PredicateSelector';

import './graphEditor.css';
import SaveQuery from '../saveQuery/SaveQuery';
import { useAuth } from '../../../context/AuthContext';

const width = 600;
const height = 400;

// Define types for click state
interface ClickState {
  creatingConnection: boolean;
  chosenTerms: string[];
  clickedId: string;
  popoverId: string;
  popoverAnchor: HTMLElement | null;
  popoverType: string;
}

// Define types for click actions
type ClickAction =
  | { type: 'startConnection'; payload: { anchor: HTMLElement } }
  | { type: 'connectTerm'; payload: { id: string } }
  | { type: 'connectionMade' }
  | { type: 'click'; payload: { id: string } }
  | { type: 'openEditor'; payload: { id: string; type: string; anchor: HTMLElement } }
  | { type: 'closeEditor' };

function clickReducer(state: ClickState, action: ClickAction): ClickState {
  switch (action.type) {
    case 'startConnection': {
      const { anchor } = action.payload;
      state.creatingConnection = true;
      state.popoverId = '';
      state.popoverAnchor = anchor;
      state.popoverType = 'newEdge';
      break;
    }
    case 'connectTerm': {
      const { id } = action.payload;
      state.chosenTerms = [...state.chosenTerms, id];
      break;
    }
    case 'connectionMade': {
      state.creatingConnection = false;
      state.chosenTerms = [];
      break;
    }
    case 'click': {
      const { id } = action.payload;
      state.clickedId = id;
      break;
    }
    case 'openEditor': {
      const { id, type, anchor } = action.payload;
      state.popoverId = id;
      state.popoverType = type;
      state.popoverAnchor = anchor;
      break;
    }
    case 'closeEditor': {
      state.popoverId = '';
      state.popoverType = '';
      state.popoverAnchor = null;
      break;
    }
    default: {
      return state;
    }
  }
  return { ...state };
}

/**
 * Query Builder graph editor interface
 */
export default function GraphEditor() {
  const queryBuilder = useQueryBuilderContext();
  const { user } = useAuth();

  const { query_graph } = queryBuilder;
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [showSaveQuery, toggleSaveQuery] = useState(false);

  const [clickState, clickDispatch] = useReducer(clickReducer, {
    creatingConnection: false,
    chosenTerms: [],
    clickedId: '',
    popoverId: '',
    popoverAnchor: null,
    popoverType: '',
  });

  function addEdge() {
    queryBuilder.dispatch({ type: 'addEdge', payload: clickState.chosenTerms });
  }

  function addHop() {
    console.log('Adding hop to query graph', query_graph);
    if (!Object.keys(query_graph.nodes).length) {
      // add a node to an empty graph
      console.log('Adding first node to empty graph');
      queryBuilder.dispatch({ type: 'addNode', payload: {} });
    } else {
      // add a node and edge
      console.log('Adding hop to existing graph');
      queryBuilder.dispatch({ type: 'addHop', payload: {} });
    }
  }

  function editNode(id: string, node: NodeOption | null) {
    queryBuilder.dispatch({ type: 'editNode', payload: { id, node } });
  }

  function clickNode() {
    const nodeIds = Object.keys(query_graph);
    const lastNodeId = nodeIds[nodeIds.length - 1];
    nodeUtils.clickNode(lastNodeId);
  }

  /**
   * When user selects two nodes while creating an edge, make a new edge
   * and reset click state
   */
  useEffect(() => {
    if (clickState.creatingConnection && clickState.chosenTerms.length >= 2) {
      addEdge();
      clickDispatch({ type: 'connectionMade' });
      // remove border from connected nodes
      nodeUtils.removeBorder();
    }
  }, [clickState]);

  return (
    <div id="queryGraphEditor">
      <div id="graphContainer" style={{ height: height + 50, width }}>
        <QueryGraph
          height={height}
          width={width}
          clickState={clickState}
          updateClickState={clickDispatch as any}
        />
        <div id="graphBottomButtons">
          <Button
            onClick={() => {
              addHop();
              // clickNode();
            }}
          >
            Add New Term
          </Button>
          <Button
            onClick={(e) => {
              clickDispatch({ type: 'startConnection', payload: { anchor: e.currentTarget } });
              // auto close after 5 seconds
              setTimeout(() => {
                clickDispatch({ type: 'closeEditor' });
              }, 5000);
            }}
          >
            Connect Terms
          </Button>
          <Tooltip title={user ? '' : 'Login to save your query'}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Button onClick={() => toggleSaveQuery(true)} disabled={!user}>
                Bookmark Graph
              </Button>
            </span>
          </Tooltip>
        </div>
        <Popover
          open={Boolean(clickState.popoverAnchor)}
          anchorEl={clickState.popoverAnchor}
          onClose={() => clickDispatch({ type: 'closeEditor' })}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          {(clickState.popoverType === 'editNode' || clickState.popoverType === 'newNode') && (
            <NodeSelector
              properties={query_graph.nodes[clickState.popoverId]}
              id={clickState.popoverId}
              update={(id: string, node: NodeOption | null) => editNode(id, node)}
              isReference={false}
              setReference={() => {}}
              options={{
                includeExistingNodes: false,
              }}
            />
          )}
          {clickState.popoverType === 'editEdge' && <PredicateSelector id={clickState.popoverId} />}
          {clickState.popoverType === 'newEdge' && (
            <Paper style={{ padding: '10px' }}>
              <p>Select two terms to connect!</p>
            </Paper>
          )}
        </Popover>
        <DownloadDialog
          open={downloadOpen}
          setOpen={setDownloadOpen}
          message={queryBuilder.query_graph}
          download_type="query"
        />
        <SaveQuery show={showSaveQuery} close={() => toggleSaveQuery(false)} />
      </div>
    </div>
  );
}
