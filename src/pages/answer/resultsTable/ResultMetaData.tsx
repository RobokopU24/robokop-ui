import React, { useState, useReducer, useEffect, useMemo } from 'react';
import {
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Collapse,
  ListItemButton,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
// @ts-ignore
import shortid from 'shortid';

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
  const [expanded, updateExpanded] = useReducer(expansionReducer, {});
  const [showJSON, toggleJSONVisibility] = useState(false);

  useEffect(() => {
    // Whenever the user selects a new row, close all expanded rows
    updateExpanded({ type: 'clear' });
  }, [metaData]);

  const hasSupportPublications = useMemo(
    () => !!Object.values(metaData).find((pubs: string[]) => pubs.length > 0),
    [metaData]
  );

  return (
    <Paper id="resultMetaData" elevation={3}>
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
