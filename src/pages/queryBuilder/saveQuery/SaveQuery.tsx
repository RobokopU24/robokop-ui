import React, { useState, useEffect } from 'react';

import {
  Dialog,
  DialogTitle,
  IconButton,
  DialogActions,
  DialogContent,
  Button,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import queryGraphUtils from '../../../utils/queryGraph';
import routes from '../../../API/routes';
import { useQueryBuilderContext } from '../../../context/queryBuilder';
import { authApi } from '../../../API/baseUrlProxy';
import { useAlert } from '../../../components/AlertProvider';

function SaveQuery({ show, close }: { show: boolean; close: () => void }) {
  const { displayAlert } = useAlert();

  const queryBuilder = useQueryBuilderContext();
  const prunedQueryGraph = queryGraphUtils.prune(queryBuilder.query_graph);

  const [queryName, setQueryName] = useState('');
  const queryData = { message: { query_graph: prunedQueryGraph } };
  useEffect(() => {
    if (!show) setQueryName('');
  }, [show]);

  const handleCancel = () => {
    close();
  };

  const handleSave = () => {
    authApi
      .post(routes.queryRoutes.base, {
        name: queryName,
        query: queryData,
      })
      .then(() => {
        displayAlert('success', 'Query bookmarked successfully');
        close();
      })
      .catch((error) => {
        // TODO: Handle error
        console.error('Error saving query:', error);
      });
  };

  return (
    <Dialog open={show} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0 }}>Bookmark Query</p>
          <IconButton
            style={{
              fontSize: '18px',
            }}
            title="Close Editor"
            onClick={close}
          >
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Query name"
          fullWidth
          value={queryName}
          onChange={(e) => setQueryName(e.target.value)}
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={!queryName.trim()}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SaveQuery;
