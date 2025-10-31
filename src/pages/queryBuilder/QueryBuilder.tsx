import { Button, ButtonGroup } from '@mui/material';
import { withStyles } from '@mui/styles';
import { blue } from '@mui/material/colors';
import React, { useState, useEffect, useRef } from 'react';
import usePageStatus from '../../stores/usePageStatus';
import { useAuth } from '../../context/AuthContext';
import { usePasskey } from '../../hooks/usePasskey';
import ARAs from '../../API/services';
import { useAlert } from '../../components/AlertProvider';
import { useNavigate } from '@tanstack/react-router';
import queryGraphUtils from '../../utils/queryGraph';
import API from '../../API';
import { useQueryBuilderContext } from '../../context/queryBuilder';
import cloneDeep from 'lodash/cloneDeep';

import { set as idbSet } from 'idb-keyval';
import RegisterPasskeyDialog from '../../components/RegisterPasskeyDialog';
import TextEditor from './textEditor/TextEditor';
import GraphEditor from './graphEditor/GraphEditor';
import JsonEditor from './jsonEditor/JsonEditor';
import DownloadDialog from '../../components/DownloadDialog';
import './queryBuilder.css';
import ExampleModal from '../entryPoint/ExampleModal';
import TemplateModal from '../entryPoint/TemplateModal';
import BookmarkModal from '../entryPoint/BookmarkModal';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

/**
 * Query Builder parent component
 *
 * Displays the text, graph, and json editors
 */
export default function QueryBuilder() {
  const queryBuilder = useQueryBuilderContext();
  const { user } = useAuth();

  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [exampleModalOpen, setExampleModalOpen] = useState(false);
  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false);
  const buttonOptions = [
    {
      label: 'Load Example',
      onClick: () => {
        setSavedState(cloneDeep(queryBuilder.query_graph));
        setExampleModalOpen(true);
      },
      disabled: false,
    },
    {
      label: 'Load Template',
      onClick: () => {
        setSavedState(cloneDeep(queryBuilder.query_graph));
        setTemplateModalOpen(true);
      },
      disabled: false,
    },
    {
      label: 'Load Bookmark',
      onClick: () => {
        setSavedState(cloneDeep(queryBuilder.query_graph));
        setBookmarkModalOpen(true);
      },
      disabled: !user,
    },
  ];

  const pageStatus = usePageStatus(false);
  const { browserSupport } = usePasskey();
  const [showJson, toggleJson] = useState(false);
  const [registerPasskeyOpen, setRegisterPasskeyOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [ara] = useState(ARAs[0]);
  const { displayAlert } = useAlert();
  const navigate = useNavigate();
  const [savedState, setSavedState] = useState<any>(null);

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

  const handleCancel = () => {
    if (savedState) {
      queryBuilder.dispatch({
        type: 'restoreGraph',
        payload: savedState,
      });
    }
  };

  return (
    <>
      <pageStatus.Display />
      {pageStatus.displayPage && (
        <div id="queryBuilderContainer">
          <RegisterPasskeyDialog
            open={registerPasskeyOpen}
            onClose={() => setRegisterPasskeyOpen(false)}
          />
          <JsonEditor show={showJson} close={() => toggleJson(false)} />
          <DownloadDialog
            open={downloadOpen}
            setOpen={setDownloadOpen}
            message={queryBuilder.query_graph}
            download_type="all_queries"
          />
          <PanelGroup direction="horizontal">
            <Panel defaultSize={60} minSize={30} style={{ padding: '20px 20px 20px 0' }}>
              <TextEditor rows={queryBuilder.textEditorRows || []} />
            </Panel>
            <PanelResizeHandle
              className="resize-container"
              children={<div className="resize-handle">||</div>}
            />
            <Panel minSize={20} defaultSize={40} style={{ padding: '20px 2px 20px 20px' }}>
              <GraphEditor
                editJson={() => toggleJson(true)}
                downloadQuery={() => setDownloadOpen(true)}
                onSubmit={() => onQuickSubmit()}
                buttonOptions={buttonOptions}
              />
            </Panel>
          </PanelGroup>
          <ExampleModal
            isOpen={exampleModalOpen}
            onClose={() => setExampleModalOpen(false)}
            onCancel={handleCancel}
          />
          <TemplateModal
            isOpen={templateModalOpen}
            onClose={() => setTemplateModalOpen(false)}
            onCancel={handleCancel}
          />
          <BookmarkModal
            isOpen={bookmarkModalOpen}
            onClose={() => setBookmarkModalOpen(false)}
            onCancel={handleCancel}
          />
        </div>
      )}
    </>
  );
}
