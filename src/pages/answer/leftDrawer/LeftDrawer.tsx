import React, { useCallback, useEffect, useState } from 'react';
import { isPremiumOrAdmin } from '../../../utils/roles';
import {
  Drawer,
  Toolbar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  IconButton,
} from '@mui/material';

import PublishIcon from '@mui/icons-material/Publish';
import GetAppIcon from '@mui/icons-material/GetApp';
import SummarizeIcon from '@mui/icons-material/Summarize';

import DownloadDialog from '../../../components/DownloadDialog';

import './leftDrawer.css';
import { useQueryBuilderContext } from '../../../context/queryBuilder';
import SummarizeWithAIModal from './SummarizeWithAIModal';
import SummarizeTableWithAIModal from './SummarizeTableWithAIModal';
import { useAuth } from '../../../context/AuthContext';
import LoginWarning from './LoginWarning';

interface DisplayStateItem {
  show: boolean;
  disabled: boolean;
  label: string;
}

interface DisplayState {
  [key: string]: DisplayStateItem;
}

interface UpdateDisplayStateAction {
  type: 'toggle';
  payload: {
    component: string;
    show: boolean;
  };
}

interface LeftDrawerProps {
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  displayState: DisplayState;
  updateDisplayState: (action: UpdateDisplayStateAction) => void;
  message: Record<string, any>;
  saveAnswer: () => Promise<void>;
  deleteAnswer: () => Promise<void>;
  owned: boolean;
  answerStore: any;
}

/**
 * Main Drawer component on answer page
 * @param {function} onUpload - function to call when user uploads their own message
 * @param {object} displayState - state of card components
 * @param {function} updateDisplayState - dispatch function for changing which cards are shown
 * @param {object} message - full TRAPI message
 * @param {function} saveAnswer - save an answer to Robokache
 * @param {function} deleteAnswer - delete an answer from Robokache
 * @param {boolean} owned - does the user own this answer
 */
export default function LeftDrawer({
  onUpload,
  displayState,
  updateDisplayState,
  message,
  answerStore,
}: LeftDrawerProps) {
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [downloadQueryOpen, setDownloadQueryOpen] = useState(false);
  const [summarizeWithAIOpen, setSummarizeWithAIOpen] = useState(false);
  const [summarizeTableWithAIOpen, setSummarizeTableWithAIOpen] = useState(false);
  const [loginWarningOpen, setLoginWarningOpen] = useState(false);
  const [warningType, setWarningType] = useState<'login' | 'premium' | null>(null);

  function toggleDisplay(component: string, show: boolean) {
    updateDisplayState({ type: 'toggle', payload: { component, show } });
  }
  const queryBuilder = useQueryBuilderContext();
  const { user } = useAuth();

  function toggleSummarizeWithAI() {
    if (!user) {
      setWarningType('login');
      setLoginWarningOpen(true);
    } else {
      if (!isPremiumOrAdmin(user.role)) {
        setWarningType('premium');
        setLoginWarningOpen(true);
      } else {
        setSummarizeTableWithAIOpen(!summarizeTableWithAIOpen);
      }
    }
  }

  return (
    <Drawer
      container={document.getElementById('contentContainer')}
      variant="permanent"
      open
      classes={{
        paper: 'leftDrawer',
      }}
    >
      {loginWarningOpen && (
        <LoginWarning
          isOpen={loginWarningOpen}
          onClose={() => setLoginWarningOpen(false)}
          warningType={warningType}
        />
      )}
      <Toolbar />
      <List>
        {Object.entries(displayState).map(([key, val]) => (
          <ListItemButton
            key={key}
            onClick={() => toggleDisplay(key, !val.show)}
            disabled={val.disabled}
          >
            <ListItemIcon>
              <Checkbox checked={val.show} disableRipple />
            </ListItemIcon>
            <ListItemText primary={val.label} />
          </ListItemButton>
        ))}
        <ListItemButton
          disabled={!Object.keys(message).length}
          onClick={() => {
            setDownloadQueryOpen(true);
          }}
        >
          <ListItemIcon>
            <IconButton
              component="span"
              style={{ fontSize: '18px' }}
              title="Download"
              disableRipple
            >
              <GetAppIcon />
            </IconButton>
          </ListItemIcon>
          <ListItemText primary="Download Query" />
        </ListItemButton>
        <ListItemButton
          disabled={!Object.keys(message).length}
          onClick={() => {
            setDownloadOpen(true);
          }}
        >
          <ListItemIcon>
            <IconButton
              component="span"
              style={{ fontSize: '18px' }}
              title="Download"
              disableRipple
            >
              <GetAppIcon />
            </IconButton>
          </ListItemIcon>
          <ListItemText primary="Download Answer" />
        </ListItemButton>
        <ListItemButton component="label">
          <ListItemIcon>
            <IconButton
              component="span"
              style={{ fontSize: '18px' }}
              title="Upload Answer"
              disableRipple
            >
              <PublishIcon />
            </IconButton>
          </ListItemIcon>
          <ListItemText primary="Upload Answer" />
          <input
            accept=".json"
            hidden
            style={{ display: 'none' }}
            type="file"
            onChange={(e) => onUpload(e)}
          />
        </ListItemButton>
        <ListItemButton component="label" onClick={() => toggleSummarizeWithAI()}>
          <ListItemIcon>
            <IconButton
              component="span"
              style={{ fontSize: '18px' }}
              title="Summarize table with AI"
              disableRipple
            >
              <SummarizeIcon />
            </IconButton>
          </ListItemIcon>
          <ListItemText primary="Summarize table with AI" />
        </ListItemButton>
      </List>
      <DownloadDialog open={downloadOpen} setOpen={setDownloadOpen} message={message} />
      <DownloadDialog
        open={downloadQueryOpen}
        setOpen={setDownloadQueryOpen}
        message={queryBuilder.query_graph}
        download_type="all_queries"
      />
      {summarizeWithAIOpen && (
        <SummarizeWithAIModal
          isOpen={summarizeWithAIOpen}
          onModalClose={() => setSummarizeWithAIOpen(false)}
          answerStore={answerStore}
        />
      )}
      {summarizeTableWithAIOpen && (
        <SummarizeTableWithAIModal
          isOpen={summarizeTableWithAIOpen}
          onModalClose={() => setSummarizeTableWithAIOpen(false)}
          answerStore={answerStore}
        />
      )}
    </Drawer>
  );
}
