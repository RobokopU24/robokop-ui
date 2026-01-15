import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUsersRole, User } from '../../functions/userFunctions';
import { ROLE_OPTIONS } from '../../utils/roles';
import { useAlert } from '../../components/AlertProvider';

interface ChangeSelectedUserRolesProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUsers: User[];
  onSuccess: () => void;
}

function ChangeSelectedUserRoles({
  isOpen,
  onClose,
  selectedUsers,
  onSuccess,
}: ChangeSelectedUserRolesProps) {
  const queryClient = useQueryClient();
  const { displayAlert } = useAlert();
  const roleOptions = useMemo(() => ROLE_OPTIONS, []);
  const [newRole, setNewRole] = useState<User['role']>('user');

  const updateRoleMutation = useMutation({
    mutationFn: ({ userIds, role }: { userIds: string[]; role: User['role'] }) =>
      updateUsersRole(userIds, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      displayAlert(
        'success',
        `Successfully updated role for ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}`
      );
      onSuccess();
      onClose();
    },
  });

  const handleSave = () => {
    updateRoleMutation.mutate({ userIds: selectedUsers.map((u) => u.id), role: newRole });
  };

  const handleClose = () => {
    if (!updateRoleMutation.isPending) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Change Role for Selected Users</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          You are about to change the role for {selectedUsers.length} user
          {selectedUsers.length > 1 ? 's' : ''}:
        </Typography>

        <Box
          sx={{
            maxHeight: 200,
            overflow: 'auto',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            mb: 3,
          }}
        >
          <List dense disablePadding>
            {selectedUsers.map((user) => (
              <ListItem key={user.id} divider>
                <ListItemAvatar>
                  <Avatar src={user.profilePicture} alt={user.name || user.email} sx={{ width: 32, height: 32 }} />
                </ListItemAvatar>
                <ListItemText
                  primary={user.name || user.email}
                  secondary={user.name ? user.email : undefined}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                <Chip
                  label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  size="small"
                  variant="outlined"
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <FormControl fullWidth>
          <InputLabel id="new-role-label">New Role</InputLabel>
          <Select
            labelId="new-role-label"
            id="new-role"
            value={newRole}
            label="New Role"
            onChange={(e) => setNewRole(e.target.value as User['role'])}
          >
            {roleOptions.map((role) => (
              <MenuItem key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {updateRoleMutation.isError && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            Error: {updateRoleMutation.error?.message || 'Failed to update roles'}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={updateRoleMutation.isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={updateRoleMutation.isPending}
          startIcon={updateRoleMutation.isPending ? <CircularProgress size={16} /> : null}
        >
          {updateRoleMutation.isPending ? 'Updating...' : 'Update Roles'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ChangeSelectedUserRoles;