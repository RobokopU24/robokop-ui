import React, { useState, useReducer, useEffect, useMemo, useRef } from 'react';
import {
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Collapse,
  ListItemButton,
  Skeleton,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
// @ts-ignore
import shortid from 'shortid';
import Markdown from 'react-markdown';
import { transformKGToMinimalDynamic } from './metaDataTransformation';
import { useQuery } from '@tanstack/react-query';
import { llmRoutes } from '../../../API/routes';
import { useAuth } from '../../../context/AuthContext';
import { isPremiumOrAdmin } from '../../../utils/roles';

interface ExpansionState {
  [key: string]: boolean;
}

interface ExpansionAction {
  type: 'toggle' | 'clear';
  key?: string;
}

interface MetaData {
  [key: string]: string[];
}

interface Result {
  [key: string]: any;
}

interface ResultMetaDataProps {
  metaData: MetaData;
  result: Result;
}

function expansionReducer(state: ExpansionState, action: ExpansionAction): ExpansionState {
  switch (action.type) {
    case 'toggle':
      if (!action.key) return state;
      return { ...state, [action.key]: !state[action.key] };
    case 'clear':
      return {};
    default:
      return state;
  }
}

/**
 * Show meta data of a selected result
 * @param {object} metaData - selected result edge metadata
 * @param {object} result - full node and edge result json from knowledge graph
 */
export default function ResultMetaData({ metaData, result }: ResultMetaDataProps) {
  const minifiedJson = transformKGToMinimalDynamic(result);
  const [expanded, updateExpanded] = useReducer(expansionReducer, {});
  const [showJSON, toggleJSONVisibility] = useState(false);
  const [showSummarizeResults, toggleSummarizeResults] = useState(false);
  const [streamedText, setStreamedText] = useState<string>('');

  useEffect(() => {
    // Whenever the user selects a new row, close all expanded rows
    updateExpanded({ type: 'clear' });
  }, [metaData]);

  const hasSupportPublications = useMemo(
    () => !!Object.values(metaData).find((pubs: string[]) => pubs.length > 0),
    [metaData]
  );

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (showSummarizeResults) setStreamedText('');
  }, [showSummarizeResults]);
  const { user } = useAuth();

  const { refetch } = useQuery({
    queryKey: ['summaryLinks', 'test'],
    enabled: false,
    queryFn: async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const token = localStorage.getItem('authToken');

      const response = await fetch(llmRoutes.summarizeKGNodes, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ minimalJson: minifiedJson }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let full = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          const chunk = decoder.decode(value);
          full += chunk;
          setStreamedText((prev) => prev + chunk);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Stream aborted');
          return '';
        }
        throw error;
      } finally {
        reader.releaseLock();
      }

      return full;
    },
  });

  useEffect(() => {
    if (showSummarizeResults) {
      refetch();
    } else {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    }
  }, [showSummarizeResults, refetch]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <Paper id="resultMetaData" elevation={3}>
      <div>
        <h4>
          Summarize Results with AI &nbsp;
          <IconButton onClick={() => toggleSummarizeResults(!showSummarizeResults)}>
            {!showSummarizeResults ? <ExpandMore /> : <ExpandLess />}
          </IconButton>
        </h4>
        {showSummarizeResults &&
          (!user ? (
            <>
              <p style={{ marginBottom: '16px' }}>
                Please log in to use the summarization feature.
              </p>
            </>
          ) : !isPremiumOrAdmin(user.role) ? (
            <>
              <p style={{ marginBottom: '16px' }}>
                This is a premium feature. Please upgrade your account to access AI-powered
                summarization.
              </p>
            </>
          ) : (
            <>
              <div
                style={{
                  height: '300px',
                  overflowY: 'auto',
                  marginBottom: '16px',
                }}
              >
                {streamedText ? (
                  <Markdown
                    components={{
                      h2: ({ node, ...props }) => <h2 style={{ marginTop: '0.5em' }} {...props} />,
                      h3: ({ node, ...props }) => <h3 style={{ marginTop: '0.5em' }} {...props} />,
                      p: ({ node, ...props }) => (
                        <p style={{ marginTop: '0.5em', marginBottom: '0.5em' }} {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul
                          style={{
                            paddingLeft: '1.5em',
                            marginTop: '0.5em',
                            marginBottom: '0.5em',
                          }}
                          {...props}
                        />
                      ),
                    }}
                  >
                    {streamedText}
                  </Markdown>
                ) : (
                  <>
                    {Array(3).fill(
                      <Skeleton variant="rounded" width="100%" height={20} sx={{ mb: 1 }} />
                    )}
                  </>
                )}
              </div>
            </>
          ))}
      </div>
      <div>
        <h4>Supporting Publications</h4>
        {hasSupportPublications ? (
          <List>
            {Object.entries(metaData).map(([metaKey, publications]) => (
              <React.Fragment key={metaKey}>
                {publications.length > 0 && (
                  <>
                    <ListItemButton
                      onClick={() => updateExpanded({ type: 'toggle', key: metaKey })}
                    >
                      <ListItemText primary={metaKey} />
                      {expanded[metaKey] ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={!!expanded[metaKey]} timeout="auto" unmountOnExit>
                      <List component="div">
                        {publications.map((publication) => (
                          <ListItem
                            key={`${metaKey}:${publication}`}
                            component="a"
                            href={publication}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ListItemText primary={publication} inset />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </>
                )}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <List>
            <ListItem>
              <ListItemText primary="No Supporting Publications Found" />
            </ListItem>
          </List>
        )}
      </div>
      <div>
        <h4>
          Result JSON &nbsp;
          <IconButton onClick={() => toggleJSONVisibility(!showJSON)}>
            {!showJSON ? <ExpandMore /> : <ExpandLess />}
          </IconButton>
        </h4>
        {showJSON && <pre id="resultJSONContainer">{JSON.stringify(result, null, 2)}</pre>}
      </div>
    </Paper>
  );
}
