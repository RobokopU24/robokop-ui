import React, { useState, useEffect } from 'react';

import {
  Dialog,
  DialogTitle,
  IconButton,
  DialogActions,
  DialogContent,
  Button,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import queryGraphUtils from '../../../utils/queryGraph';
import routes from '../../../API/routes';
import { useQueryBuilderContext } from '../../../context/queryBuilder';
import { useAlert } from '../../../components/AlertProvider';
import axios from 'axios';

function ShareQuery({ show, close }: { show: boolean; close: () => void }) {
  const { displayAlert } = useAlert();

  const [expiry, setExpiry] = useState('7d');

  const queryBuilder = useQueryBuilderContext();
  const prunedQueryGraph = queryGraphUtils.prune(queryBuilder.query_graph);

  const queryData = { message: { query_graph: prunedQueryGraph } };

  const handleCancel = () => {
    close();
  };

  const handleSave = () => {
    axios
      .post(`${routes.queryRoutes.share}`, {
        query: queryData,
        expiry,
      })
      .then((res) => {
        displayAlert('success', 'Query link copied to clipboard successfully');
        navigator.clipboard.writeText(`${window.location.origin}/share/${res.data.id}?type=share`);
        close();
      })
      .catch((error) => {
        // TODO: Handle error
        console.error('Error sharing query:', error);
      });
  };

  return (
    <Dialog open={show} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0 }}>Share Query</p>
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
        <p>
          Select how long you want the query link to be valid. You can bookmark a query and share it
          so that it never expires:
        </p>
        <InputLabel id="expiry">Expiry</InputLabel>
        <Select
          style={{ width: '100%' }}
          value={expiry}
          labelId="expiry"
          label="Expiry"
          onChange={(e) => setExpiry(e.target.value)}
        >
          <MenuItem value={'1d'}>1 Day</MenuItem>
          <MenuItem value={'7d'}>1 Week</MenuItem>
          <MenuItem value={'30d'}>30 Days</MenuItem>
          <MenuItem value={'90d'}>90 Days</MenuItem>
        </Select>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ShareQuery;
