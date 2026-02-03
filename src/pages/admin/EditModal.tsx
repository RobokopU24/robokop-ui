import { useEffect, useState } from "react";
import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack, Typography, Divider } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUsers, updateUsersRole, User } from "../../functions/userFunctions";
import { useRoles } from "../../stores/useRoles";
import { useAlert } from "../../components/AlertProvider";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: User;
}

function EditModal({ isOpen, onClose, selectedUser }: EditModalProps) {
  const queryClient = useQueryClient();
  const { displayAlert } = useAlert();
  const { data: roles, isLoading: rolesLoading } = useRoles();

  const [selectedRoleId, setSelectedRoleId] = useState<number>(selectedUser?.role?.id ?? 0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, newRoleId }: { userId: string; newRoleId: number }) => updateUsersRole([userId], newRoleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      displayAlert("success", "Successfully updated user role");
      onClose();
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => deleteUsers([userId]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      displayAlert("success", "Successfully deleted user");
      onClose();
    },
  });

  useEffect(() => {
    if (isOpen && selectedUser) {
      setSelectedRoleId(selectedUser.role.id);
    }
  }, [isOpen, selectedUser]);

  const handleSave = async () => {
    updateRoleMutation.mutate({ userId: selectedUser.id, newRoleId: selectedRoleId });
  };

  const handleDelete = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteUserMutation.mutate(selectedUser.id);
    setConfirmOpen(false);
  };

  const handleCancelDelete = () => setConfirmOpen(false);

  const hasChanges = selectedRoleId !== selectedUser.role.id;

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={selectedUser.profilePicture} alt={selectedUser.name || selectedUser.email} sx={{ width: 48, height: 48 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {selectedUser.name || selectedUser.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedUser.name ? selectedUser.email : "ID: " + selectedUser.id}
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
              <Select labelId="user-role-label" value={selectedRoleId} label="Role" onChange={(e) => setSelectedRoleId(e.target.value as number)} disabled={rolesLoading}>
                {roles?.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.roleName}
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
          <Button onClick={onClose} disabled={updateRoleMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || updateRoleMutation.isPending || rolesLoading} variant="contained">
            {updateRoleMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={handleCancelDelete} maxWidth="xs" fullWidth>
        <DialogTitle>Delete User?</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete {selectedUser.name || selectedUser.email}? This action cannot be undone.</DialogContentText>
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
