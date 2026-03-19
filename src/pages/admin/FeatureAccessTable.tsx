'use no memo'

import React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'
import OutlinedInput from '@mui/material/OutlinedInput'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getFeatures,
  updateFeatureRoles,
  createFeature,
  deleteFeatures,
  Feature,
  CreateFeaturePayload,
} from '../../functions/featureFunctions'
import DialogContentText from '@mui/material/DialogContentText'
import { useRoles } from '../../stores/useRoles'
import { useAlert } from '../../components/AlertProvider'

function FeatureAccessTable() {
  const queryClient = useQueryClient()
  const { data: roles } = useRoles()
  const { displayAlert } = useAlert()
  const [editingFeatureId, setEditingFeatureId] = React.useState<number | null>(null)
  const [editingRoleIds, setEditingRoleIds] = React.useState<number[]>([])

  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [featureToDelete, setFeatureToDelete] = React.useState<Feature | null>(null)
  const [newFeature, setNewFeature] = React.useState<CreateFeaturePayload>({
    featureId: '',
    featureName: '',
    description: '',
    roleIds: [],
  })

  const {
    data: features,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['features'],
    queryFn: getFeatures,
  })

  const updateMutation = useMutation({
    mutationFn: ({ featureId, roleIds }: { featureId: number; roleIds: number[] }) =>
      updateFeatureRoles(featureId, roleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] })
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      setEditingFeatureId(null)
      displayAlert('success', 'Feature roles updated successfully')
    },
    onError: () => {
      displayAlert('error', 'Failed to update feature roles')
    },
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateFeaturePayload) => createFeature(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] })
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      handleCloseAddDialog()
      displayAlert('success', 'Feature created successfully')
    },
    onError: () => {
      displayAlert('error', 'Failed to create feature')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (featureIds: number[]) => deleteFeatures(featureIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] })
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      handleCloseDeleteDialog()
      displayAlert('success', 'Feature deleted successfully')
    },
    onError: () => {
      displayAlert('error', 'Failed to delete feature')
    },
  })

  const handleEditClick = (feature: Feature) => {
    setEditingFeatureId(feature.id)
    setEditingRoleIds(feature.rolesAllowed.map((r) => r.id))
  }

  const handleCancelEdit = () => {
    setEditingFeatureId(null)
    setEditingRoleIds([])
  }

  const handleSaveEdit = () => {
    if (editingFeatureId !== null) {
      updateMutation.mutate({ featureId: editingFeatureId, roleIds: editingRoleIds })
    }
  }

  const handleRoleChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value
    setEditingRoleIds(typeof value === 'string' ? value.split(',').map(Number) : value)
  }

  const handleOpenAddDialog = () => {
    setAddDialogOpen(true)
  }

  const handleCloseAddDialog = () => {
    setAddDialogOpen(false)
    setNewFeature({
      featureId: '',
      featureName: '',
      description: '',
      roleIds: [],
    })
  }

  const handleNewFeatureChange =
    (field: keyof CreateFeaturePayload) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setNewFeature((prev) => ({ ...prev, [field]: event.target.value }))
    }

  const handleNewFeatureRoleChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value
    setNewFeature((prev) => ({
      ...prev,
      roleIds: typeof value === 'string' ? value.split(',').map(Number) : value,
    }))
  }

  const handleAddFeature = () => {
    createMutation.mutate(newFeature)
  }

  const handleOpenDeleteDialog = (feature: Feature) => {
    setFeatureToDelete(feature)
    setDeleteDialogOpen(true)
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setFeatureToDelete(null)
  }

  const handleConfirmDelete = () => {
    if (featureToDelete) {
      deleteMutation.mutate([featureToDelete.id])
    }
  }

  const isAddFormValid = newFeature.featureId.trim() !== '' && newFeature.featureName.trim() !== ''

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (isError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Typography color='error'>Failed to load features</Typography>
      </Box>
    )
  }

  return (
    <div>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '20px 0',
        }}
      >
        <h2 style={{ margin: 0 }}>Feature Access Control</h2>
        <Button variant='contained' startIcon={<AddIcon />} onClick={handleOpenAddDialog}>
          Add Feature
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 600 }} aria-label='feature access table'>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Feature Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Feature ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Allowed Roles</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {features?.map((feature) => {
              const isEditing = editingFeatureId === feature.id

              return (
                <TableRow
                  key={feature.id}
                  sx={{
                    '&:last-child td': { border: 0 },
                    '&:hover': { backgroundColor: 'action.hover' },
                  }}
                >
                  <TableCell>{feature.featureName}</TableCell>
                  <TableCell>
                    <Typography
                      variant='body2'
                      sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                    >
                      {feature.featureId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2' color='text.secondary'>
                      {feature.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <FormControl size='small' sx={{ minWidth: 200 }}>
                        <Select
                          multiple
                          value={editingRoleIds}
                          onChange={handleRoleChange}
                          input={<OutlinedInput />}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((roleId) => {
                                const role = roles?.find((r) => r.id === roleId)
                                return role ? (
                                  <Chip
                                    key={roleId}
                                    label={role.roleName}
                                    size='small'
                                    variant='outlined'
                                  />
                                ) : null
                              })}
                            </Box>
                          )}
                        >
                          {roles?.map((role) => (
                            <MenuItem key={role.id} value={role.id}>
                              <Checkbox checked={editingRoleIds.includes(role.id)} />
                              <ListItemText primary={role.roleName} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {feature.rolesAllowed.length === 0 ? (
                          <Typography variant='body2' color='text.secondary'>
                            No access
                          </Typography>
                        ) : (
                          feature.rolesAllowed.map((role) => (
                            <Chip
                              key={role.id}
                              label={role.roleName}
                              size='small'
                              variant='outlined'
                            />
                          ))
                        )}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          onClick={handleSaveEdit}
                          color='primary'
                          size='small'
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending ? <CircularProgress size={20} /> : <SaveIcon />}
                        </IconButton>
                        <IconButton
                          onClick={handleCancelEdit}
                          size='small'
                          disabled={updateMutation.isPending}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          onClick={() => handleEditClick(feature)}
                          color='primary'
                          size='small'
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleOpenDeleteDialog(feature)}
                          color='error'
                          size='small'
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={addDialogOpen} onClose={handleCloseAddDialog} maxWidth='sm' fullWidth>
        <DialogTitle>Add New Feature</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label='Feature ID'
              value={newFeature.featureId}
              onChange={handleNewFeatureChange('featureId')}
              placeholder='e.g., my_feature'
              required
              fullWidth
              helperText='Unique identifier for the feature (used in code)'
            />
            <TextField
              label='Feature Name'
              value={newFeature.featureName}
              onChange={handleNewFeatureChange('featureName')}
              placeholder='e.g., My Feature'
              required
              fullWidth
              helperText='Human-readable name for the feature'
            />
            <TextField
              label='Description'
              value={newFeature.description}
              onChange={handleNewFeatureChange('description')}
              placeholder='Describe what this feature does...'
              multiline
              rows={3}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id='new-feature-roles-label'>Allowed Roles</InputLabel>
              <Select
                labelId='new-feature-roles-label'
                multiple
                value={newFeature.roleIds}
                onChange={handleNewFeatureRoleChange}
                input={<OutlinedInput label='Allowed Roles' />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((roleId) => {
                      const role = roles?.find((r) => r.id === roleId)
                      return role ? <Chip key={roleId} label={role.roleName} size='small' /> : null
                    })}
                  </Box>
                )}
              >
                {roles?.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    <Checkbox checked={newFeature.roleIds.includes(role.id)} />
                    <ListItemText primary={role.roleName} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleAddFeature}
            variant='contained'
            disabled={!isAddFormValid || createMutation.isPending}
            startIcon={createMutation.isPending ? <CircularProgress size={16} /> : null}
          >
            {createMutation.isPending ? 'Adding...' : 'Add Feature'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} maxWidth='sm'>
        <DialogTitle>Delete Feature</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the feature{' '}
            <strong>{featureToDelete?.featureName}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color='error'
            variant='contained'
            disabled={deleteMutation.isPending}
            startIcon={deleteMutation.isPending ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default FeatureAccessTable
