import React, { useState, useEffect, useMemo } from 'react';
import {
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import ReactJsonView from 'react-json-view';
import { useAuth } from '../context/AuthContext';
import API from '../API/routes';
import { authApi } from '../API/baseUrlProxy';
import { useAlert } from '../components/AlertProvider';
import { usePasskey } from '../hooks/usePasskey';

interface Passkey {
  id: string;
  deviceType?: string;
  createdAt: string;
}

interface SavedQuery {
  id: string;
  name: string;
  createdAt: string;
  query: { message: { query_graph: Record<string, any> } };
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  onConfirm,
  onClose,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">{title}</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
    </DialogTitle>
    <DialogContent>
      <Typography>{description}</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="secondary">
        Cancel
      </Button>
      <Button onClick={onConfirm} variant="contained" color="primary">
        Confirm
      </Button>
    </DialogActions>
  </Dialog>
);

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { displayAlert } = useAlert();
  const { registerPasskey } = usePasskey();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<SavedQuery | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState<{
    type: 'passkey' | 'query' | null;
    targetId?: string;
    targetName?: string;
  }>({ type: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pkRes, qRes] = await Promise.all([
          authApi.get(API.passkeyRoutes.list),
          authApi.get(API.queryRoutes.base),
        ]);
        setPasskeys(pkRes.data);
        setSavedQueries(qRes.data);
      } catch (err) {
        console.error(err);
        displayAlert('error', 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [displayAlert]);

  const handleDelete = (type: 'passkey' | 'query', targetId: string, name?: string) => {
    setConfirmData({ type, targetId, targetName: name });
    setConfirmOpen(true);
  };

  const confirmDeletion = async () => {
    if (!confirmData.type || !confirmData.targetId) return;

    try {
      if (confirmData.type === 'passkey') {
        await authApi.delete(`${API.passkeyRoutes.base}/${confirmData.targetId}`);
        setPasskeys((prev) => prev.filter((p) => p.id !== confirmData.targetId));
        displayAlert('success', 'Passkey deleted');
      } else {
        await authApi.delete(`${API.queryRoutes.base}/${confirmData.targetId}`);
        setSavedQueries((prev) => prev.filter((q) => q.id !== confirmData.targetId));
        setSelectedQuery(null);
        displayAlert('success', 'Query deleted');
      }
    } catch {
      displayAlert('error', `Failed to delete ${confirmData.type}`);
    } finally {
      setConfirmOpen(false);
      setConfirmData({ type: null });
    }
  };

  const registerNewPasskey = async () => {
    try {
      await registerPasskey();
      displayAlert('success', 'Passkey registered');
      const { data } = await authApi.get(API.passkeyRoutes.list);
      setPasskeys(data);
    } catch (err: any) {
      displayAlert('error', err.message || 'Failed to register passkey');
    }
  };

  const memberSince = useMemo(
    () =>
      user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : '',
    [user?.createdAt]
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid
      container
      direction="column"
      spacing={3}
      sx={{ px: 4, pb: 4, maxWidth: 1300, mx: 'auto', mt: 4 }}
    >
      {/* User Info */}
      <Grid>
        <Paper sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" flexWrap="wrap" gap={3}>
            <Avatar src={user?.profilePicture} alt={user?.name} sx={{ width: 100, height: 100 }} />
            <Box>
              <Typography variant="h4">{user?.name}</Typography>
              <Typography color="text.secondary">{user?.email}</Typography>
              {memberSince && (
                <Typography variant="body2" color="text.secondary">
                  Member since {memberSince}
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>
      </Grid>

      {/* Tabs */}
      <Grid>
        <Paper sx={{ p: 4 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            indicatorColor="primary"
            textColor="primary"
            sx={{ mb: 2 }}
          >
            <Tab label="Saved Queries" />
            <Tab label="Passkeys" />
          </Tabs>

          {activeTab === 0 && (
            <Box display="flex" sx={{ height: 600 }}>
              <List
                sx={{
                  width: 350,
                  overflowY: 'auto',
                  borderRight: 1,
                  borderColor: 'divider',
                }}
              >
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
                      sx={{ py: 1 }}
                    >
                      <ListItem
                        sx={{ p: 0 }}
                        secondaryAction={
                          <IconButton onClick={() => handleDelete('query', query.id, query.name)}>
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
                    Select a query to view details
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {activeTab === 1 && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Passkeys</Typography>
                <Button variant="contained" onClick={registerNewPasskey}>
                  Add Passkey
                </Button>
              </Box>

              {passkeys.length === 0 ? (
                <Typography color="text.secondary">No passkeys registered</Typography>
              ) : (
                <List>
                  {passkeys.map((pk, idx) => (
                    <React.Fragment key={pk.id}>
                      <ListItem
                        secondaryAction={
                          <IconButton onClick={() => handleDelete('passkey', pk.id, pk.deviceType)}>
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={pk.deviceType || 'Unknown Device'}
                          secondary={`Created: ${new Date(pk.createdAt).toLocaleDateString()}`}
                        />
                      </ListItem>
                      {idx < passkeys.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </>
          )}
        </Paper>
      </Grid>

      <ConfirmDialog
        open={confirmOpen}
        title={confirmData.type === 'passkey' ? 'Delete Passkey' : 'Delete Query'}
        description={
          confirmData.type === 'passkey'
            ? `Are you sure you want to delete this passkey ${
                confirmData.targetName ? `(${confirmData.targetName})` : ''
              }?`
            : `Are you sure you want to delete the query "${confirmData.targetName}"?`
        }
        onConfirm={confirmDeletion}
        onClose={() => setConfirmOpen(false)}
      />
    </Grid>
  );
};

export default Profile;
