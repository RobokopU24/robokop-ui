import React, { useState, useContext, useEffect } from 'react';

import ReactJsonView, { InteractionProps } from 'react-json-view';

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import SaveIcon from '@mui/icons-material/Save';

import trapiUtils from '../../../utils/trapi';
import queryGraphUtils from '../../../utils/queryGraph';
import usePageStatus from '../../../stores/usePageStatus';
import { useQueryBuilderContext } from '../../../context/queryBuilder';
import ClipboardButton from '../../../components/shared/ClipboardButton';
import { useAlert } from '../../../components/AlertProvider';

// Local type for context value expected here
type QueryBuilderContextWithState = {
  state: { message: any };
  dispatch: (action: { type: string; payload: any }) => void;
};

// Type for TRAPI message structure expected by validateMessage
type TRAPIMessage = {
  constructor: ObjectConstructor;
  message: {
    query_graph: any;
    knowledge_graph: any;
    results: any;
    [key: string]: any;
  };
};

const emptyTRAPIMessage: TRAPIMessage = {
  constructor: Object,
  message: {
    query_graph: {},
    knowledge_graph: undefined,
    results: undefined,
  },
};

/**
 * Query Builder json editor interface
 * @param {bool} show - whether to show the json editor or not
 * @param {func} close - close the json editor
 */
export default function JsonEditor({ show, close }: { show: boolean; close: () => void }) {
  const queryBuilder = useQueryBuilderContext() as unknown as QueryBuilderContextWithState;
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const { message } = queryBuilder.state;
  const [localMessage, updateLocalMessage] = useState(message);
  const pageStatus = usePageStatus(false, '');
  const { displayAlert } = useAlert();

  function updateJson(e: InteractionProps) {
    const data = e.updated_src;
    setErrorMessages(trapiUtils.validateMessage(data as TRAPIMessage));
    updateLocalMessage(data);
  }

  function onUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const { files } = event.target;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const fr = new window.FileReader();
      fr.onloadstart = () => pageStatus.setLoading('Loading Query Graph');
      fr.onloadend = () => pageStatus.setSuccess();
      fr.onload = (e) => {
        const fileContents = e.target && e.target.result;
        try {
          const graph = JSON.parse(fileContents as string);
          // We only need the query graph, so delete any knowledge_graph and results in message
          if (graph.message && graph.message.knowledge_graph) {
            delete graph.message.knowledge_graph;
          }
          if (graph.message && graph.message.results) {
            delete graph.message.results;
          }
          const errors = trapiUtils.validateMessage(graph);
          setErrorMessages(errors);
          if (!errors.length) {
            graph.message.query_graph = queryGraphUtils.toCurrentTRAPI(graph.message.query_graph);
          }
          updateLocalMessage(graph);
        } catch (err) {
          console.error('Error reading query graph file:', err);
          displayAlert(
            'error',
            'Failed to read this query graph. Are you sure this is valid JSON?'
          );
        }
      };
      fr.onerror = () => {
        displayAlert(
          'error',
          'Sorry but there was a problem uploading the file. The file may be invalid JSON.'
        );
      };
      fr.readAsText(file);
    });
    // This clears out the input value so you can upload a second time
    event.target.value = '';
  }

  useEffect(() => {
    if (show) {
      setErrorMessages(trapiUtils.validateMessage(message));
      updateLocalMessage(message);
    }
  }, [show]);

  function saveGraph() {
    queryBuilder.dispatch({ type: 'saveGraph', payload: localMessage });
  }

  function copyQueryGraph() {
    const prunedQueryGraph = queryGraphUtils.prune(localMessage.message.query_graph);
    return JSON.stringify(
      {
        message: {
          ...localMessage.message,
          query_graph: prunedQueryGraph,
        },
      },
      null,
      2
    );
  }

  return (
    <Dialog
      open={show}
      fullWidth
      maxWidth="lg"
      onClose={() => {
        setErrorMessages([]);
        close();
      }}
    >
      <DialogTitle style={{ padding: 0 }}>
        <div id="jsonEditorTitle">
          <div>
            <label htmlFor="jsonEditorUpload" id="uploadIconLabel">
              <input
                accept=".json"
                style={{ display: 'none' }}
                type="file"
                id="jsonEditorUpload"
                onChange={(e) => onUpload(e)}
                disabled={!pageStatus.displayPage}
              />
              <Button
                component="span"
                variant="contained"
                disabled={!pageStatus.displayPage}
                style={{ margin: '0px 10px' }}
                title="Load Message"
                startIcon={<CloudUploadIcon />}
              >
                Upload
              </Button>
            </label>
            <ClipboardButton
              startIcon={<FileCopyIcon />}
              displayText="Copy"
              clipboardText={copyQueryGraph}
              notificationText="Copied JSON to clipboard!"
              disabled={!pageStatus.displayPage}
            />
          </div>
          <div style={{ color: '#777' }}>Query Graph JSON Editor</div>
          <IconButton
            style={{
              fontSize: '18px',
            }}
            title="Close Editor"
            onClick={() => {
              setErrorMessages([]);
              close();
            }}
          >
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent dividers style={{ padding: 0, height: '10000px' }}>
        <pageStatus.Display />
        {pageStatus.displayPage && (
          <div style={{ display: 'flex', height: '100%' }}>
            <div
              style={{
                overflowY: 'auto',
                paddingBottom: '5px',
                flexGrow: 1,
              }}
            >
              <ReactJsonView
                name={false}
                theme="rjv-default"
                collapseStringsAfterLength={15}
                indentWidth={2}
                iconStyle="triangle"
                enableClipboard={false}
                displayObjectSize={false}
                displayDataTypes={false}
                defaultValue=""
                src={localMessage}
                onEdit={updateJson}
                onAdd={updateJson}
                onDelete={updateJson}
              />
            </div>
            {errorMessages.length > 0 && (
              <div style={{ flexShrink: 1, paddingRight: '20px' }}>
                <h4>This query graph is not valid.</h4>
                {errorMessages.map((err, i) => (
                  <p key={i}>{err}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          startIcon={<SaveIcon />}
          disabled={errorMessages.length > 0 || !pageStatus.displayPage}
          variant="contained"
          title="Save Changes"
          onClick={() => {
            saveGraph();
            close();
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
