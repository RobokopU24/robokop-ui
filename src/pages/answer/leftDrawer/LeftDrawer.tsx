import React, { useState } from 'react';

import {
  Drawer,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  IconButton,
} from '@mui/material';

import PublishIcon from '@mui/icons-material/Publish';
import GetAppIcon from '@mui/icons-material/GetApp';

import DownloadDialog from '../../../components/DownloadDialog';

import './leftDrawer.css';

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
}: LeftDrawerProps) {
  const [downloadOpen, setDownloadOpen] = useState(false);

  function toggleDisplay(component: string, show: boolean) {
    updateDisplayState({ type: 'toggle', payload: { component, show } });
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
      </List>
      <DownloadDialog open={downloadOpen} setOpen={setDownloadOpen} message={message} />
    </Drawer>
  );
}
