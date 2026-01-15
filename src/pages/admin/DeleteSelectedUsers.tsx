import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteUsers, User } from '../../functions/userFunctions';
import { useAlert } from '../../components/AlertProvider';

interface DeleteSelectedUsersProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUsers: User[];
  onSuccess: () => void;
}

function DeleteSelectedUsers({
  isOpen,
  onClose,
  selectedUsers,
  onSuccess,
}: DeleteSelectedUsersProps) {
  const queryClient = useQueryClient();
  const { displayAlert } = useAlert();

  const deleteMutation = useMutation({
    mutationFn: (userIds: string[]) => deleteUsers(userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      displayAlert(
        'success',
        `Successfully deleted ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}`
      );
      onSuccess();
      onClose();
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(selectedUsers.map((u) => u.id));
  };

  const handleClose = () => {
    if (!deleteMutation.isPending) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete Selected Users</DialogTitle>
      <DialogContent dividers>
        <DialogContentText sx={{ mb: 2 }}>
          Are you sure you want to delete {selectedUsers.length} user
          {selectedUsers.length > 1 ? 's' : ''}? This action cannot be undone.
        </DialogContentText>

        <Box
          sx={{
            maxHeight: 200,
            overflow: 'auto',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
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

        {deleteMutation.isError && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            Error: {deleteMutation.error?.message || 'Failed to delete users'}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={deleteMutation.isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={deleteMutation.isPending}
          startIcon={deleteMutation.isPending ? <CircularProgress size={16} /> : null}
        >
          {deleteMutation.isPending ? 'Deleting...' : 'Delete Users'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteSelectedUsers;