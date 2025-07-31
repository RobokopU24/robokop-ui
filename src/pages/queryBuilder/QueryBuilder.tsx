import { Button } from '@mui/material';
import { withStyles } from '@mui/styles';
import { blue } from '@mui/material/colors';
import React, { useState, useEffect } from 'react';
import usePageStatus from '../../stores/usePageStatus';
import { useAuth } from '../../context/AuthContext';
import { usePasskey } from '../../hooks/usePasskey';
import ARAs from '../../API/services';
import { useAlert } from '../../components/AlertProvider';
import { useNavigate } from '@tanstack/react-router';
import queryGraphUtils from '../../utils/queryGraph';
import API from '../../API';
import { useQueryBuilderContext } from '../../context/queryBuilder';

import { set as idbSet } from 'idb-keyval';
import RegisterPasskeyDialog from '../../components/RegisterPasskeyDialog';
import TextEditor from './textEditor/TextEditor';
import GraphEditor from './graphEditor/GraphEditor';
import JsonEditor from './jsonEditor/JsonEditor';
import DownloadDialog from '../../components/DownloadDialog';
import './queryBuilder.css';
import TemplateQueriesModal from './templatedQueries/TemplateQueriesModal';

const SubmitButton = withStyles((theme) => ({
  root: {
    marginLeft: 'auto',
    color: theme.palette.getContrastText(blue[600]),
    backgroundColor: blue[600],
    '&:hover': {
      backgroundColor: blue[700],
    },
  },
}))(Button);

/**
 * Query Builder parent component
 *
 * Displays the text, graph, and json editors
 */
export default function QueryBuilder() {
  const queryBuilder = useQueryBuilderContext();
  const pageStatus = usePageStatus(false);
  const { user } = useAuth();
  const { browserSupport } = usePasskey();
  const [showJson, toggleJson] = useState(false);
  const [registerPasskeyOpen, setRegisterPasskeyOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [ara] = useState(ARAs[0]);
  const { displayAlert } = useAlert();
  const navigate = useNavigate();
  const [exampleQueriesOpen, setExampleQueriesOpen] = useState(false);

  const passkeyPopupDenied = localStorage.getItem('passkeyPopupDenied');

  // Display modal for the user to create a passkey if they don't have one
  useEffect(() => {
    if (user && browserSupport) {
      // eslint-disable-next-line no-underscore-dangle
      if (user._count?.WebAuthnCredential === 0 && passkeyPopupDenied !== 'true') {
        setRegisterPasskeyOpen(true);
      }
    }
  }, [user, browserSupport, passkeyPopupDenied]);

  /**
   * Submit this query directly to an ARA and then navigate to the answer page
   */
  async function onQuickSubmit() {
    pageStatus.setLoading('Fetching answer, this may take a while');
    const prunedQueryGraph = queryGraphUtils.prune(queryBuilder.query_graph);
    const response = await API.ara.getQuickAnswer(ara, {
      message: { query_graph: prunedQueryGraph },
    });

    if (response.status === 'error') {
      const failedToAnswer = 'Please try asking this question later.';
      displayAlert('error', `${response.message}. ${failedToAnswer}`);
      // go back to rendering query builder
      pageStatus.setSuccess();
    } else {
      // stringify to stay consistent with answer page json parsing
      idbSet('quick_message', JSON.stringify(response))
        .then(() => {
          displayAlert('success', 'Your answer is ready!');
          // once message is stored, navigate to answer page to load and display
          navigate({ to: '/answer' });
        })
        .catch((err) => {
          displayAlert(
            'error',
            `Failed to locally store this answer. Please try again later. Error: ${err}`
          );
          pageStatus.setSuccess();
        });
    }
  }

  return (
    <>
      <pageStatus.Display />
      {pageStatus.displayPage && (
        <div id="queryBuilderContainer">
          <div id="queryEditorContainer">
            <RegisterPasskeyDialog
              open={registerPasskeyOpen}
              onClose={() => setRegisterPasskeyOpen(false)}
            />
            <div style={{ flex: 1 }}>
              <TextEditor rows={queryBuilder.textEditorRows || []} />
            </div>
            <div>
              <GraphEditor />
              <div id="queryBuilderButtons">
                <Button onClick={() => setExampleQueriesOpen(true)} variant="outlined">
                  Load Query
                </Button>
                {/* <TemplatedQueriesModal
                  open={exampleQueriesOpen}
                  setOpen={setExampleQueriesOpen}
                /> */}
                <TemplateQueriesModal open={exampleQueriesOpen} setOpen={setExampleQueriesOpen} />
                <Button onClick={() => toggleJson(true)} variant="outlined">
                  Edit JSON
                </Button>
                <Button onClick={() => setDownloadOpen(true)} variant="outlined">
                  Download Query
                </Button>
                <div style={{ flexGrow: 1 }}></div>
                <SubmitButton onClick={() => onQuickSubmit()} variant="contained">
                  Submit
                </SubmitButton>
              </div>
            </div>
            <JsonEditor show={showJson} close={() => toggleJson(false)} />
            <DownloadDialog
              open={downloadOpen}
              setOpen={setDownloadOpen}
              message={queryBuilder.query_graph}
              download_type="all_queries"
            />
          </div>
        </div>
      )}
    </>
  );
}
