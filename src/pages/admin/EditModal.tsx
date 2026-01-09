import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  Divider,
} from '@mui/material';
import { updateUserRole, User } from '../../functions/userFunctions';
import { ROLE_OPTIONS } from '../../utils/roles';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: User;
}

function EditModal({ isOpen, onClose, selectedUser }: EditModalProps) {
  const roleOptions = useMemo(() => ROLE_OPTIONS, []);

  const [role, setRole] = useState<User['role']>(selectedUser?.role ?? 'user');
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (isOpen && selectedUser) {
      setRole(selectedUser.role);
    }
  }, [isOpen, selectedUser]);

  const handleSave = async () => {
    const res = await updateUserRole(selectedUser.id, role);
    console.log('Updated user role', res);
    onClose();
  };

  const handleDelete = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    console.log('Deleting user', { userId: selectedUser.id, email: selectedUser.email });
    setConfirmOpen(false);
    onClose();
  };

  const handleCancelDelete = () => setConfirmOpen(false);

  const hasChanges = role !== selectedUser.role;

  return (
    <>
      {/* Primary editing dialog */}
      <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={selectedUser.profilePicture}
                alt={selectedUser.name || selectedUser.email}
                sx={{ width: 48, height: 48 }}
              />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {selectedUser.name || selectedUser.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedUser.name ? selectedUser.email : 'ID: ' + selectedUser.id}
                </Typography>
                {selectedUser.name && (
                  <Typography variant="caption" color="text.secondary">
                    ID: {selectedUser.id}
                  </Typography>
                )}
              </Box>
            </Stack>

            <Divider />

            <FormControl fullWidth>
              <InputLabel id="user-role-label">Role</InputLabel>
              <Select
                labelId="user-role-label"
                value={role}
                label="Role"
                onChange={(e) => setRole(e.target.value as User['role'])}
              >
                {roleOptions.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={handleDelete} variant="outlined">
            Delete User
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!hasChanges} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={confirmOpen} onClose={handleCancelDelete} maxWidth="xs" fullWidth>
        <DialogTitle>Delete User?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedUser.name || selectedUser.email}? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default EditModal;
