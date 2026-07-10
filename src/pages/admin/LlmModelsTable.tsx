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
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import TextField from '@mui/material/TextField'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getLlmModels,
  createLlmModel,
  updateLlmModel,
  deactivateLlmModels,
  LlmModel,
  CreateLlmModelPayload,
  UpdateLlmModelPayload,
} from '../../functions/llmModelFunctions'
import { useAlert } from '../../components/AlertProvider'

type ModelFormState = CreateLlmModelPayload & { isActive?: boolean }

const emptyForm: ModelFormState = { name: '', modelId: '', isActive: true, isDefault: false }

function LlmModelsTable() {
  const queryClient = useQueryClient()
  const { displayAlert } = useAlert()

  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [selectedModel, setSelectedModel] = React.useState<LlmModel | null>(null)
  const [form, setForm] = React.useState<ModelFormState>(emptyForm)

  const {
    data: models,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['llmModels'],
    queryFn: getLlmModels,
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateLlmModelPayload) => createLlmModel(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llmModels'] })
      queryClient.invalidateQueries({ queryKey: ['activeLlmModels'] })
      setAddDialogOpen(false)
      setForm(emptyForm)
      displayAlert('success', 'Model added successfully')
    },
    onError: () => {
      displayAlert('error', 'Failed to add model')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateLlmModelPayload }) =>
      updateLlmModel(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llmModels'] })
      queryClient.invalidateQueries({ queryKey: ['activeLlmModels'] })
      setEditDialogOpen(false)
      setSelectedModel(null)
      setForm(emptyForm)
      displayAlert('success', 'Model updated successfully')
    },
    onError: () => {
      displayAlert('error', 'Failed to update model')
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: (modelIds: number[]) => deactivateLlmModels(modelIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llmModels'] })
      queryClient.invalidateQueries({ queryKey: ['activeLlmModels'] })
      setDeleteDialogOpen(false)
      setSelectedModel(null)
      displayAlert('success', 'Model deactivated successfully')
    },
    onError: () => {
      displayAlert('error', 'Failed to deactivate model')
    },
  })

  const handleOpenAdd = () => {
    setForm(emptyForm)
    setAddDialogOpen(true)
  }

  const handleOpenEdit = (model: LlmModel) => {
    setSelectedModel(model)
    setForm({
      name: model.name,
      modelId: model.modelId,
      isActive: model.isActive,
      isDefault: model.isDefault,
    })
    setEditDialogOpen(true)
  }

  const handleIsActiveChange = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      isActive: checked,
      ...(checked ? {} : { isDefault: false }),
    }))
  }

  const handleIsDefaultChange = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      isDefault: checked,
      ...(checked ? { isActive: true } : {}),
    }))
  }

  const handleSetAsDefault = (model: LlmModel) => {
    updateMutation.mutate({ id: model.id, payload: { isDefault: true } })
  }

  const handleOpenDelete = (model: LlmModel) => {
    setSelectedModel(model)
    setDeleteDialogOpen(true)
  }

  const handleCreate = () => {
    createMutation.mutate({
      name: form.name.trim(),
      modelId: form.modelId.trim(),
      ...(form.isDefault ? { isDefault: true } : {}),
    })
  }

  const handleUpdate = () => {
    if (!selectedModel) return
    updateMutation.mutate({
      id: selectedModel.id,
      payload: {
        name: form.name.trim(),
        modelId: form.modelId.trim(),
        isActive: form.isActive,
        isDefault: form.isDefault,
      },
    })
  }

  const handleDeactivate = () => {
    if (!selectedModel) return
    deactivateMutation.mutate([selectedModel.id])
  }

  const isFormValid = form.name.trim().length > 0 && form.modelId.trim().length > 0

  if (isLoading) {
    return (
      <Box display='flex' justifyContent='center' py={4}>
        <CircularProgress />
      </Box>
    )
  }

  if (isError) {
    return (
      <Typography color='error' sx={{ py: 2 }}>
        Failed to load LLM models.
      </Typography>
    )
  }

  return (
    <Box>
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
        <Box>
          <Typography variant='h6'>AI Models</Typography>
          <Typography variant='body2' color='text.secondary'>
            Manage models for AI summarization. The default model is used when no user preference is
            set.
          </Typography>
        </Box>
        <Button variant='contained' startIcon={<AddIcon />} onClick={handleOpenAdd}>
          Add Model
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Display Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Model ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Default</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align='right'>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {models?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography color='text.secondary' sx={{ py: 2, textAlign: 'center' }}>
                    No models configured yet.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              models?.map((model) => (
                <TableRow key={model.id} hover>
                  <TableCell>{model.name}</TableCell>
                  <TableCell>
                    <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                      {model.modelId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={model.isActive ? 'Active' : 'Inactive'}
                      color={model.isActive ? 'success' : 'default'}
                      size='small'
                      variant='outlined'
                    />
                  </TableCell>
                  <TableCell>
                    {model.isDefault ? (
                      <Chip label='Default' color='primary' size='small' />
                    ) : model.isActive ? (
                      <Button size='small' onClick={() => handleSetAsDefault(model)}>
                        Set as default
                      </Button>
                    ) : (
                      <Typography variant='body2' color='text.secondary'>
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align='right'>
                    <IconButton size='small' color='primary' onClick={() => handleOpenEdit(model)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size='small'
                      color='error'
                      onClick={() => handleOpenDelete(model)}
                      disabled={!model.isActive}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Add AI Model</DialogTitle>
        <DialogContent>
          <Box display='flex' flexDirection='column' gap={2} pt={1}>
            <TextField
              label='Display Name'
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
              helperText='Friendly name shown to users in preferences'
            />
            <TextField
              label='Model ID'
              value={form.modelId}
              onChange={(e) => setForm((prev) => ({ ...prev, modelId: e.target.value }))}
              fullWidth
              helperText='Deployment or model identifier used by the backend'
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.isDefault ?? false}
                  onChange={(e) => handleIsDefaultChange(e.target.checked)}
                />
              }
              label='Set as default model'
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button
            variant='contained'
            onClick={handleCreate}
            disabled={!isFormValid || createMutation.isPending}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Edit AI Model</DialogTitle>
        <DialogContent>
          <Box display='flex' flexDirection='column' gap={2} pt={1}>
            <TextField
              label='Display Name'
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label='Model ID'
              value={form.modelId}
              onChange={(e) => setForm((prev) => ({ ...prev, modelId: e.target.value }))}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive ?? true}
                  onChange={(e) => handleIsActiveChange(e.target.checked)}
                />
              }
              label='Active'
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.isDefault ?? false}
                  onChange={(e) => handleIsDefaultChange(e.target.checked)}
                  disabled={!form.isActive}
                />
              }
              label='Default model'
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant='contained'
            onClick={handleUpdate}
            disabled={!isFormValid || updateMutation.isPending}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Deactivate Model</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deactivate &quot;{selectedModel?.name}&quot;? It will no longer appear in user
            preferences
            {selectedModel?.isDefault ? ' and will no longer be the default model' : ''}, but can be
            reactivated later.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            color='error'
            variant='contained'
            onClick={handleDeactivate}
            disabled={deactivateMutation.isPending}
          >
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default LlmModelsTable
