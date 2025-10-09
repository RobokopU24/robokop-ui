import React, { useReducer, useEffect, useState, cloneElement } from 'react';
import { Popover, Button, Paper, Tooltip } from '@mui/material';
import { useQueryBuilderContext } from '../../../context/queryBuilder';
import nodeUtils from '../../../utils/d3/nodes';
import DownloadDialog from '../../../components/DownloadDialog';
import { NodeOption } from '../textEditor/types';

import QueryGraph from './QueryGraph';
import NodeSelector from '../textEditor/textEditorRow/NodeSelector';
import PredicateSelector from '../textEditor/textEditorRow/PredicateSelector';
import queryGraphUtils from '../../../utils/queryGraph';

import './graphEditor.css';
import SaveQuery from '../saveQuery/SaveQuery';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../API/routes';
import axios from 'axios';
import ShareQuery from '../shareQuery/ShareQuery';

import AddIcon from '@mui/icons-material/Add';
import AddLinkIcon from '@mui/icons-material/AddLink';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ShareIcon from '@mui/icons-material/Share';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useAlert } from '../../../components/AlertProvider';
import RestartAlt from '@mui/icons-material/RestartAlt';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';

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
      if (!state.chosenTerms.includes(id)) {
        state.chosenTerms = [...state.chosenTerms, id];
      }
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

interface GraphEditorProps {
  editJson?: () => void;
  downloadQuery: () => void;
  onSubmit?: () => void;
  buttonOptions?: { label: string; onClick: () => void; disabled: boolean }[];
}

/**
 * Query Builder graph editor interface
 */
export default function GraphEditor({
  editJson,
  downloadQuery,
  onSubmit,
  buttonOptions,
}: GraphEditorProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const queryBuilder = useQueryBuilderContext();
  const { user } = useAuth();
  const { displayAlert } = useAlert();

  const { query_graph } = queryBuilder;
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [showSaveQuery, toggleSaveQuery] = useState(false);
  const [showShareQuery, toggleShareQuery] = useState(false);

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
    if (!Object.keys(query_graph.nodes).length) {
      // add a node to an empty graph
      queryBuilder.dispatch({ type: 'addNode', payload: {} });
    } else {
      // add a node and edge
      queryBuilder.dispatch({ type: 'addHop', payload: {} });
    }
  }

  function editNode(id: string, node: NodeOption | null) {
    queryBuilder.dispatch({ type: 'editNode', payload: { id, node } });
  }

  function resetGraph() {
    queryBuilder.dispatch({ type: 'resetGraph', payload: {} });
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

  const graphActions = [
    {
      tooltip: 'Add New Term',
      onClick: addHop,
      icon: <AddIcon />,
      disabled: false,
    },
    {
      tooltip: 'Connect Terms',
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        clickDispatch({ type: 'startConnection', payload: { anchor: e.currentTarget } });
        // auto close after 5 seconds
        setTimeout(() => {
          clickDispatch({ type: 'closeEditor' });
          nodeUtils.removeBorder();
        }, 5000);
      },
      icon: <AddLinkIcon />,
      disabled: false,
    },
    {
      tooltip: 'Edit JSON',
      onClick: editJson,
      icon: <EditIcon />,
      disabled: false,
    },
    {
      tooltip: 'Download Query',
      onClick: downloadQuery,
      icon: <DownloadIcon />,
      disabled: false,
    },
    {
      tooltip: 'Reset Graph',
      onClick: resetGraph,
      icon: <RestartAlt />,
      disabled: false,
    },
    {
      icon: 'divider',
    },
    {
      tooltip: user ? 'Bookmark Graph' : 'Login to save your query',
      onClick: () => toggleSaveQuery(true),
      icon: <BookmarkBorderIcon />,
      disabled: !user,
    },
    {
      tooltip: 'Share Graph',
      onClick: () => toggleShareQuery(true),
      icon: <ShareIcon />,
      disabled: false,
    },
    // {
    //   tooltip: 'Load example',
    //   onClick: () => {},
    //   icon: <img src="/react-icons/fiBookOpen.svg" alt="Example" />,
    //   disabled: false,
    // },
  ];

  const divRef = React.createRef<HTMLDivElement>();

  return (
    <div id="queryGraphEditor">
      <div
        id="graphContainer"
        style={{ height: '100%', width: '100%', position: 'relative', overflow: 'hidden' }}
        ref={divRef}
      >
        <div className="buttons-container">
          {graphActions.map((action, index) => (
            <>
              {action.icon !== 'divider' && typeof action.icon !== 'string' ? (
                <div
                  className="button-icon"
                  key={index}
                  onClick={
                    action.disabled
                      ? () => {
                          displayAlert('info', 'Please log in to use this feature.');
                        }
                      : action.onClick
                  }
                  style={{ opacity: action.disabled ? 0.5 : 1 }}
                >
                  <div className="icon">{cloneElement(action.icon, { className: '' })}</div>
                  <div className="icon-label">{action.tooltip}</div>
                </div>
              ) : (
                <div className="divider" key={index}></div>
              )}
            </>
          ))}
        </div>
        {/* <div
          style={{
            backgroundColor: 'rgb(121 90 252)',
            color: 'white',
            padding: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>Graph Visualization</p>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: '400', opacity: 0.8 }}>
              Interactive knowledge graph representation
            </p>
          </div>
          <div>
            {graphActions.map((action, index) => (
              <Tooltip title={action.tooltip} key={index}>
                <span>
                  <Button
                    onClick={action.onClick}
                    style={{
                      color: 'white',
                      borderColor: 'white',
                      minWidth: '30px',
                      padding: '6px',
                      marginLeft: index === 0 ? 0 : 8,
                      opacity: action.disabled ? 0.5 : 1,
                    }}
                    disabled={action.disabled}
                  >
                    {action.icon}
                  </Button>
                </span>
              </Tooltip>
            ))}
          </div>
        </div> */}
        <QueryGraph
          height={height}
          width={width}
          clickState={clickState}
          updateClickState={clickDispatch as any}
          graphRef={divRef}
        />
        {/* <div id="graphBottomButtons">
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
          <Button onClick={() => toggleShareQuery(true)}>Share Graph</Button>
        </div> */}
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
          message={queryBuilder.state.message}
          download_type="query"
        />
        <SaveQuery show={showSaveQuery} close={() => toggleSaveQuery(false)} />
        <ShareQuery show={showShareQuery} close={() => toggleShareQuery(false)} />
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            right: '50%',
            transform: 'translateX(50%)',
            display: 'flex',
            gap: '10px',
          }}
        >
          <button
            id="demo-positioned-button"
            aria-controls={open ? 'demo-positioned-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
            style={{
              backgroundColor: 'white',
              width: '270px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Load a query{' '}
            {open ? (
              <UnfoldLessIcon style={{ marginLeft: '8px' }} />
            ) : (
              <UnfoldMoreIcon style={{ marginLeft: '8px' }} />
            )}
          </button>
          <Menu
            id="demo-positioned-menu"
            aria-labelledby="demo-positioned-button"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            {buttonOptions?.map((option, index) => (
              <MenuItem
                key={index}
                onClick={() => {
                  option.onClick();
                  handleClose();
                }}
                disabled={option.disabled}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>
          <button className="primary-button" onClick={onSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
