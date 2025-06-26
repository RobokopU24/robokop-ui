import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  List,
  ListItemText,
  IconButton,
  Divider,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Tabs,
  Tab,
  ListItemButton,
  ListItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import ReactJsonView from 'react-json-view';
import { useAuth } from '../context/AuthContext';
import API from '../API/routes';
import { authApi } from '../API/baseUrlProxy';
import { useAlert } from '../components/AlertProvider';
import { usePasskey } from '../hooks/usePasskey';

function DeletePasskeyDialog({ open, onClose, onConfirm, deviceType }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Delete Passkey</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete this passkey {deviceType ? `(${deviceType})` : ''}? This
          action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="primary">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DeleteQueryDialog({ open, onClose, onConfirm, queryName }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Delete Query</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete the query "{queryName}"? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="primary">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Profile() {
  const { user } = useAuth();
  const { displayAlert } = useAlert();
  const { registerPasskey } = usePasskey();
  const [passkeys, setPasskeys] = useState([]);
  const [savedQueries, setSavedQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passkeyToDelete, setPasskeyToDelete] = useState(null);
  const [deleteQueryDialogOpen, setDeleteQueryDialogOpen] = useState(false);
  const [queryToDelete, setQueryToDelete] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [passkeysRes, queriesRes] = await Promise.all([
          authApi.get(API.passkeyRoutes.list),
          authApi.get(API.queryRoutes.base),
        ]);
        setPasskeys(passkeysRes.data);
        setSavedQueries(queriesRes.data);
      } catch (err) {
        console.error('Failed to load profile data:', err);
        displayAlert('error', 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [displayAlert]);

  const handleDeleteClick = (passkey) => {
    setPasskeyToDelete(passkey);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await authApi.delete(`${API.passkeyRoutes.base}/${passkeyToDelete.id}`);
      setPasskeys(passkeys.filter((pk) => pk.id !== passkeyToDelete.id));
      displayAlert('success', 'Passkey deleted');
    } catch {
      displayAlert('error', 'Failed to delete passkey');
    } finally {
      setDeleteDialogOpen(false);
      setPasskeyToDelete(null);
    }
  };

  const handleQueryDeleteClick = (query) => {
    setQueryToDelete(query);
    setDeleteQueryDialogOpen(true);
  };

  const handleQueryDeleteConfirm = async () => {
    try {
      await authApi.delete(`${API.queryRoutes.base}/${queryToDelete.id}`);
      setSavedQueries(savedQueries.filter((q) => q.id !== queryToDelete.id));
      setSelectedQuery(null);
      displayAlert('success', 'Query deleted');
    } catch {
      displayAlert('error', 'Failed to delete query');
    } finally {
      setDeleteQueryDialogOpen(false);
      setQueryToDelete(null);
    }
  };

  const registerNewPasskey = async () => {
    try {
      await registerPasskey();
      displayAlert('success', 'Passkey registered');
      const { data } = await authApi.get(API.passkeyRoutes.list);
      setPasskeys(data);
    } catch (err) {
      displayAlert('error', err.message || 'Failed to register passkey');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container direction="column" spacing={3} sx={{ px: 4, pb: 4 }}>
      <Grid item>
        <Paper sx={{ p: 4, width: '100%' }}>
          <Box display="flex" alignItems="center" flexWrap="wrap" gap={3}>
            <Avatar src={user.profilePicture} alt={user.name} sx={{ width: 100, height: 100 }} />
            <Box>
              <Typography variant="h4">{user.name}</Typography>
              <Typography>Email: {user.email}</Typography>
              <Typography variant="body2" color="text.secondary">
                Member since: {new Date(user.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>

      <Grid item>
        <Paper sx={{ p: 4, width: '100%' }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            indicatorColor="primary"
            textColor="primary"
            sx={{ mb: 2 }}
          >
            <Tab label="Saved Queries" />
            <Tab label="Passkeys" />
          </Tabs>

          {activeTab === 0 && (
            <Box display="flex" sx={{ height: 600 }}>
              <List sx={{ width: 350, overflowY: 'auto', borderRight: 1, borderColor: 'divider' }}>
                {savedQueries.length === 0 ? (
                  <Typography color="text.secondary" sx={{ p: 2 }}>
                    No saved queries
                  </Typography>
                ) : (
                  savedQueries.map((query) => (
                    <ListItemButton
                      key={query.id}
                      selected={selectedQuery?.id === query.id}
                      onClick={() => setSelectedQuery(query)}
                    >
                      <ListItem
                        sx={{ p: 0 }}
                        secondaryAction={
                          <IconButton edge="end" onClick={() => handleQueryDeleteClick(query)}>
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={query.name}
                          secondary={new Date(query.createdAt).toLocaleDateString()}
                        />
                      </ListItem>
                    </ListItemButton>
                  ))
                )}
              </List>
              <Box flex={1} sx={{ p: 2, overflowY: 'auto' }}>
                {selectedQuery ? (
                  <ReactJsonView
                    src={selectedQuery.query.message.query_graph}
                    name={false}
                    theme="rjv-default"
                    collapseStringsAfterLength={15}
                    indentWidth={2}
                    iconStyle="triangle"
                    enableClipboard={false}
                    displayObjectSize={false}
                    displayDataTypes={false}
                  />
                ) : (
                  <Typography
                    sx={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontStyle: 'italic',
                      color: 'text.disabled',
                    }}
                  >
                    Please select a query from the list
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {activeTab === 1 && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Passkeys</Typography>
                <Button variant="contained" onClick={registerNewPasskey}>
                  Add Passkey
                </Button>
              </Box>
              {passkeys.length === 0 ? (
                <Typography color="text.secondary">No passkeys registered</Typography>
              ) : (
                <List>
                  {passkeys.map((passkey, index) => (
                    <React.Fragment key={passkey.id}>
                      <ListItem
                        secondaryAction={
                          <IconButton edge="end" onClick={() => handleDeleteClick(passkey)}>
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={passkey.deviceType || 'Unknown Device'}
                          secondary={`Created: ${new Date(passkey.createdAt).toLocaleDateString()}`}
                        />
                      </ListItem>
                      {index < passkeys.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </>
          )}
        </Paper>
      </Grid>

      <DeletePasskeyDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setPasskeyToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        deviceType={passkeyToDelete?.deviceType}
      />

      <DeleteQueryDialog
        open={deleteQueryDialogOpen}
        onClose={() => {
          setDeleteQueryDialogOpen(false);
          setQueryToDelete(null);
        }}
        onConfirm={handleQueryDeleteConfirm}
        queryName={queryToDelete?.name}
      />
    </Grid>
  );
}

export default Profile;
