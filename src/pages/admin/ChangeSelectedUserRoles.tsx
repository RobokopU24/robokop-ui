import React, { useState, useEffect } from 'react'
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
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUsersRole, User } from '../../functions/userFunctions'
import { useRoles } from '../../stores/useRoles'
import { useAlert } from '../../components/AlertProvider'

interface ChangeSelectedUserRolesProps {
  isOpen: boolean
  onClose: () => void
  selectedUsers: User[]
  onSuccess: () => void
}

function ChangeSelectedUserRoles({
  isOpen,
  onClose,
  selectedUsers,
  onSuccess,
}: ChangeSelectedUserRolesProps) {
  const queryClient = useQueryClient()
  const { displayAlert } = useAlert()
  const { data: roles, isLoading: rolesLoading } = useRoles()
  const [selectedRoleId, setSelectedRoleId] = useState<number | ''>('')

  useEffect(() => {
    if (isOpen && selectedUsers.length > 0) {
      setSelectedRoleId(selectedUsers[0].role.id)
    }
  }, [isOpen, selectedUsers])

  const updateRoleMutation = useMutation({
    mutationFn: ({ userIds, newRoleId }: { userIds: string[]; newRoleId: number }) => {
      return updateUsersRole(userIds, newRoleId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      displayAlert(
        'success',
        `Successfully updated role for ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}`,
      )
      onSuccess()
      onClose()
    },
  })

  const handleSave = () => {
    if (selectedRoleId === '') return
    updateRoleMutation.mutate({
      userIds: selectedUsers.map((u) => u.id),
      newRoleId: selectedRoleId,
    })
  }

  const handleClose = () => {
    if (!updateRoleMutation.isPending) {
      setSelectedRoleId('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>Change Role for Selected Users</DialogTitle>
      <DialogContent dividers>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
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
                  <Avatar
                    src={user.profilePicture}
                    alt={user.name || user.email}
                    sx={{ width: 32, height: 32 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={user.name || user.email}
                  secondary={user.name ? user.email : undefined}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                <Chip label={user.role.roleName} size='small' variant='outlined' />
              </ListItem>
            ))}
          </List>
        </Box>

        <FormControl fullWidth>
          <InputLabel id='new-role-label'>New Role</InputLabel>
          <Select
            labelId='new-role-label'
            id='new-role'
            value={selectedRoleId}
            label='New Role'
            onChange={(e) => setSelectedRoleId(e.target.value as number)}
            disabled={rolesLoading}
          >
            {roles?.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.roleName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {updateRoleMutation.isError && (
          <Typography color='error' variant='body2' sx={{ mt: 2 }}>
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
          variant='contained'
          color='primary'
          disabled={updateRoleMutation.isPending || selectedRoleId === '' || rolesLoading}
          startIcon={updateRoleMutation.isPending ? <CircularProgress size={16} /> : null}
        >
          {updateRoleMutation.isPending ? 'Updating...' : 'Update Roles'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ChangeSelectedUserRoles
