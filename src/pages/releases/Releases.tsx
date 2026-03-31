import React, { useState } from 'react'
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createRelease,
  deleteRelease,
  getReleaseNotes,
  GitHubRelease,
  updateRelease,
} from './functions'
import ReleaseNoteCard from './ReleaseNoteCard'
import ReleaseFormDialog, { ReleaseFormValues } from './ReleaseFormDialog'
import { useFeatureAccess } from '../../hooks/useFeatureAccess'
import { useAlert } from '../../components/AlertProvider'

function Releases() {
  const queryClient = useQueryClient()
  const { canAccess } = useFeatureAccess()
  const { displayAlert } = useAlert()
  const hasAccess = canAccess('releases')

  const { data: releaseNotes, isLoading: isLoadingReleases } = useQuery({
    queryKey: ['release-notes'],
    queryFn: () => getReleaseNotes(),
  })

  const [formOpen, setFormOpen] = useState(false)
  const [editingRelease, setEditingRelease] = useState<GitHubRelease | null>(null)

  const openAddDialog = () => {
    setEditingRelease(null)
    setFormOpen(true)
  }

  const openEditDialog = (release: GitHubRelease) => {
    setEditingRelease(release)
    setFormOpen(true)
  }

  const closeFormDialog = () => {
    setFormOpen(false)
    setEditingRelease(null)
  }

  const [deleteTarget, setDeleteTarget] = useState<GitHubRelease | null>(null)
  const confirmDelete = (release: GitHubRelease) => setDeleteTarget(release)
  const cancelDelete = () => setDeleteTarget(null)

  const createMutation = useMutation({
    mutationFn: (values: ReleaseFormValues) => createRelease(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release-notes'] })
      displayAlert('success', 'Release created successfully')
      closeFormDialog()
    },
    onError: () => displayAlert('error', 'Failed to create release'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: ReleaseFormValues }) =>
      updateRelease(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release-notes'] })
      displayAlert('success', 'Release updated successfully')
      closeFormDialog()
    },
    onError: () => displayAlert('error', 'Failed to update release'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRelease(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release-notes'] })
      displayAlert('success', 'Release deleted successfully')
      setDeleteTarget(null)
    },
    onError: () => displayAlert('error', 'Failed to delete release'),
  })

  const handleFormSubmit = (values: ReleaseFormValues) => {
    if (editingRelease) {
      updateMutation.mutate({ id: editingRelease.id, values })
    } else {
      createMutation.mutate(values)
    }
  }

  const handleConfirmDelete = () => {
    if (deleteTarget) deleteMutation.mutate(deleteTarget.id)
  }

  return (
    <Container maxWidth='md' sx={{ my: 6 }}>
      <Stack direction='row' alignItems='center' sx={{ mb: 2 }}>
        <Typography variant='h4' sx={{ flexGrow: 1 }}>
          Releases
        </Typography>
        {hasAccess && (
          <Button variant='contained' startIcon={<AddIcon />} onClick={openAddDialog}>
            Add Release
          </Button>
        )}
      </Stack>

      {isLoadingReleases ? (
        <Stack spacing={4}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} variant='rounded' height={302} />
          ))}
        </Stack>
      ) : releaseNotes && releaseNotes.length > 0 ? (
        <Stack spacing={4}>
          {releaseNotes.map((releaseNote) => (
            <ReleaseNoteCard
              key={releaseNote.id}
              releaseNote={releaseNote}
              onEdit={hasAccess ? openEditDialog : undefined}
              onDelete={hasAccess ? confirmDelete : undefined}
            />
          ))}
        </Stack>
      ) : (
        <Typography>No release notes available.</Typography>
      )}

      <ReleaseFormDialog
        open={formOpen}
        onClose={closeFormDialog}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        existingRelease={editingRelease}
      />

      <Dialog open={Boolean(deleteTarget)} onClose={cancelDelete}>
        <DialogTitle>Delete Release</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{' '}
            <strong>{deleteTarget?.name || deleteTarget?.tagName}</strong>? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button
            color='error'
            variant='contained'
            onClick={handleConfirmDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default Releases
