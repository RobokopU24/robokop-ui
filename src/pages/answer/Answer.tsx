import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { get as idbGet, del as idbDelete, set as idbSet } from 'idb-keyval';

import API from '../../API';
import trapiUtils from '../../utils/trapi';
import queryGraphUtils from '../../utils/queryGraph';
import usePageStatus from '../../stores/usePageStatus';
import { defaultAnswer } from '../../utils/cache';

import useAnswerStore from './useAnswerStore';
import useDisplayState from './useDisplayState';

import LeftDrawer from './leftDrawer/LeftDrawer';
import KgFull from './fullKg/KgFull';
import QueryGraph from './queryGraph/QueryGraph';
import ResultsTable from './resultsTable/ResultsTable';

import './answer.css';
import { useAlert } from '../../components/AlertProvider';

interface AnswerProps {
  answer_id?: string;
}

// --- Local Types ---

type AlertSeverity = 'success' | 'error' | 'info' | 'warning';

interface NodeType {
  id: string;
  name: string;
  categories: string[];
  score: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}
interface EdgeType {
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
    result?: any;
  };
  tableHeaders: any[];
  message: {
    results: any[];
    [key: string]: any;
  };
  selectRow: (row: any, id: string | number) => void;
}

interface DisplayStateItem {
  show: boolean;
  disabled: boolean;
  label: string;
}
interface DisplayState {
  qg: DisplayStateItem;
  kgFull: DisplayStateItem;
  results: DisplayStateItem;
  [key: string]: DisplayStateItem;
}
interface DisplayStateAction {
  type: 'toggle' | 'disable';
  payload: {
    component: string;
    show?: boolean;
  };
}

/**
 * Main Answer Page component
 *
 * Displays
 * - query graph
 * - knowledge graph bubble chart
 * - full knowledge graph
 * - results table
 */
export default function Answer({ answer_id }: AnswerProps) {
  const { displayAlert } = useAlert();
  const answerStore = useAnswerStore();

  const navigate = useNavigate();
  const { displayState, updateDisplayState } = useDisplayState() as {
    displayState: DisplayState;
    updateDisplayState: (action: DisplayStateAction) => void;
  };
  // const { isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();
  const [isAuthenticated, isLoading, getAccessTokenSilently]: [
    boolean,
    boolean,
    () => Promise<string>,
  ] = [false, false, () => Promise.resolve('')];
  const pageStatus = usePageStatus(isLoading, 'Loading Message...');
  const [owned, setOwned] = useState<boolean>(false);

  /**
   * Validate a TRAPI message and either display any errors or initialize the answer store
   * @param answerResponse - Either an object with error message or stringified message object
   */
  function validateAndInitializeMessage(answerResponse: any): void {
    if (answerResponse && answerResponse.status && answerResponse.status === 'error') {
      pageStatus.setFailure(answerResponse.message);
      return;
    }

    let answerResponseJSON: any;
    try {
      answerResponseJSON = JSON.parse(answerResponse);
    } catch (err) {
      console.error('Failed to parse answer response:', err);
      pageStatus.setFailure('Invalid answer JSON');
      return;
    }

    if (answerResponseJSON.status === 'error') {
      pageStatus.setFailure(`Error during answer processing: ${answerResponseJSON.message}`);
      return;
    }

    const validationErrors = trapiUtils.validateMessage(answerResponseJSON);
    if (validationErrors.length) {
      pageStatus.setFailure(`Found errors while parsing message: ${validationErrors.join(', ')}`);
      return;
    }

    try {
      answerResponseJSON.message.query_graph = queryGraphUtils.toCurrentTRAPI(
        answerResponseJSON.message.query_graph
      );
      try {
        answerStore.initialize(answerResponseJSON.message, updateDisplayState);
        pageStatus.setSuccess();
      } catch (err) {
        displayAlert('error', `Failed to initialize message. Please submit an issue: ${err}`);
      }
    } catch (err) {
      console.error('Failed to parse query graph:', err);
      displayAlert(
        'error',
        'Failed to parse this query graph. Please make sure it is TRAPI compliant.'
      );
    }
  }

  /**
   * Get a message by id from Robokache
   */
  async function fetchAnswerData(): Promise<void> {
    let accessToken: string | undefined;
    if (isAuthenticated) {
      try {
        accessToken = await getAccessTokenSilently();
      } catch (err) {
        displayAlert('error', `Failed to authenticate user: ${err}`);
      }
    }
    const answerResponse = await API.cache.getAnswerData(answer_id, accessToken);

    validateAndInitializeMessage(answerResponse);
  }

  /**
   * Get metadata of answer to see if current user owns it
   *
   * Disable the "Delete Answer" button if answer is not owned.
   */
  async function checkIfAnswerOwned(): Promise<void> {
    let accessToken: string | undefined;
    if (isAuthenticated) {
      try {
        accessToken = await getAccessTokenSilently();
      } catch (err) {
        displayAlert('error', `Failed to authenticate user: ${err}`);
      }
    }
    const answerResponse = await API.cache.getAnswer(answer_id ?? null, accessToken ?? null);
    if (answerResponse.status === 'error') {
      pageStatus.setFailure(answerResponse.message);
      return;
    }
    setOwned(answerResponse.owned);
  }

  /**
   * Get or reset stored message whenever the answer id or user changes
   */
  useEffect(() => {
    if (!isLoading) {
      pageStatus.setLoading('Loading Message...');
      if (answer_id) {
        idbDelete('quick_message');
        checkIfAnswerOwned();
        fetchAnswerData();
      } else {
        idbGet('quick_message')
          .then((val) => {
            if (val) {
              validateAndInitializeMessage(val);
            } else {
              // if quick_message === undefined
              answerStore.reset();
              // stop loading message
              pageStatus.setSuccess();
            }
          })
          .catch((err) => {
            answerStore.reset();
            displayAlert(
              'error',
              `Failed to load answer. Please try refreshing the page. Error: ${err}`
            );
            // stop loading message
            pageStatus.setSuccess();
          });
      }
    }
  }, [answer_id, isLoading]);

  /**
   * Upload a TRAPI message for viewing
   * @param {*} event - html file input event
   */
  function onUpload(event: React.ChangeEvent<HTMLInputElement>): void {
    const files = Array.from(event.target.files ?? []);
    files.forEach((file) => {
      const fr = new window.FileReader();
      fr.onloadstart = () => pageStatus.setLoading('Loading Message...');
      fr.onload = (e) => {
        if (!e.target) return;
        const fileContents = e.target.result;
        let msg: any = {};
        try {
          msg = JSON.parse(typeof fileContents === 'string' ? fileContents : '');
        } catch (err) {
          console.error('Failed to parse uploaded file:', err);
          displayAlert('error', 'Failed to read this message. Are you sure this is valid JSON?');
        }
        const errors = trapiUtils.validateMessage(msg);
        if (!errors.length) {
          try {
            msg.message.query_graph = queryGraphUtils.toCurrentTRAPI(msg.message.query_graph);
            try {
              idbSet('quick_message', JSON.stringify(msg));
              answerStore.initialize(msg.message, updateDisplayState);
              // user uploaded a new answer, reset the url
              if (answer_id) {
                navigate({ to: '/answer' });
              }
            } catch (err) {
              displayAlert('error', `Failed to initialize message. Please submit an issue: ${err}`);
              answerStore.reset();
            }
          } catch (err) {
            console.error('Failed to parse query graph:', err);
            displayAlert(
              'error',
              'Failed to parse this query graph. Please make sure it is TRAPI compliant.'
            );
          }
          pageStatus.setSuccess();
        } else {
          pageStatus.setFailure(errors.join(', '));
        }
      };
      fr.onerror = () => {
        displayAlert(
          'error',
          'Sorry but there was a problem uploading the file. The file may be invalid JSON.'
        );
        pageStatus.setSuccess();
      };
      fr.readAsText(file);
    });
    // This clears out the input value so you can upload a second time
    event.target.value = '';
  }

  /**
   * Save an uploaded answer to Robokache
   */
  async function saveAnswer(): Promise<void> {
    let accessToken: string | undefined;
    if (isAuthenticated) {
      try {
        accessToken = await getAccessTokenSilently();
      } catch (err) {
        displayAlert('error', `Failed to authenticate user: ${err}`);
      }
    } else {
      return displayAlert('warning', 'You need to be signed in to save an answer.');
    }
    let response = await API.cache.createAnswer(defaultAnswer, accessToken ?? null);
    if (response.status === 'error') {
      displayAlert('error', `Failed to create answer: ${response.message}`);
      return;
    }
    const answerId = response.id;
    response = await API.cache.setAnswerData(
      answerId,
      { message: answerStore.message },
      accessToken
    );
    if (response.status === 'error') {
      return displayAlert('error', `Failed to save answer: ${response.message}`);
    }
    return displayAlert('success', 'Your answer has been saved!');
  }

  /**
   * Delete an answer from Robokache
   *
   * Also check if the associated question has other answers
   * and set `hasAnswers` to false if it doesn't
   */
  async function deleteAnswer(): Promise<void> {
    let accessToken: string | undefined;
    if (isAuthenticated) {
      try {
        accessToken = await getAccessTokenSilently();
      } catch (err) {
        displayAlert('error', `Failed to authenticate user: ${err}`);
      }
    } else {
      return displayAlert('warning', 'You need to be signed in to delete an answer.');
    }
    // get associated question
    let response = await API.cache.getAnswer(answer_id ?? null, accessToken ?? null);
    if (response.status === 'error') {
      displayAlert('error', `Failed to fetch answer: ${response.message}`);
      return;
    }
    const questionId: string | undefined = response.parent;
    // delete answer from Robokache
    response = await API.cache.deleteAnswer(answer_id ?? null, accessToken ?? null);
    if (response.status === 'error') {
      displayAlert('error', `Failed to delete answer: ${response.message}`);
      return;
    }
    navigate({ to: '/answer' });
    let alertType: AlertSeverity = 'success';
    let alertText = 'Your answer has been deleted!';
    // check if question has other answers
    if (questionId) {
      response = await API.cache.getAnswers(questionId, accessToken ?? null);
      if (response.status === 'error') {
        alertType = 'error';
        alertText += ` However, failed to get sibling answers: ${response.message}`;
      } else if (!response.length) {
        // if question has no answers, set hasAnswers to false
        response = await API.cache.getQuestion(questionId, accessToken ?? null);
        if (response.status === 'error') {
          alertType = 'error';
          alertText += ` However, failed to get associated question data: ${response.message}`;
        } else {
          response.metadata.hasAnswers = false;
          response = await API.cache.updateQuestion(response, accessToken ?? null);
          if (response.status === 'error') {
            alertType = 'error';
            alertText += ' However, failed to update associated question to no answers.';
          }
        }
      }
    }
    return displayAlert(alertType, alertText);
  }

  return (
    <>
      <LeftDrawer
        answerStore={answerStore}
        displayState={displayState}
        updateDisplayState={updateDisplayState}
        onUpload={onUpload}
        message={answerStore.message}
        saveAnswer={saveAnswer}
        deleteAnswer={deleteAnswer}
        owned={owned}
      />
      <div id="answerContentContainer">
        <pageStatus.Display />
        {pageStatus.displayPage && (
          <>
            {Object.keys(answerStore.message).length ? (
              <>
                {displayState.qg.show && answerStore.message.query_graph && (
                  <QueryGraph query_graph={answerStore.message.query_graph} />
                )}
                {displayState.kgFull.show && answerStore.message.knowledge_graph && (
                  <KgFull
                    message={answerStore.message as { knowledge_graph: { nodes: any; edges: any } }}
                  />
                )}
                {displayState.results.show && (
                  <ResultsTable answerStore={answerStore as AnswerStoreType} />
                )}
              </>
            ) : (
              <div id="answerPageSplashMessage">
                <h2>Please upload an answer</h2>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
