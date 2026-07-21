import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  Stack,
} from '@mui/material'
import KeyIcon from '@mui/icons-material/Key'
import LockOpenIcon from '@mui/icons-material/LockOpen'

interface BYOKKeyPromptProps {
  open: boolean
  onClose: () => void
  onLoginClick: () => void
  onSetupBYOK: () => void
}

export default function BYOKKeyPrompt({
  open,
  onClose,
  onLoginClick,
  onSetupBYOK,
}: BYOKKeyPromptProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
      <DialogTitle>AI Summarization</DialogTitle>
      <DialogContent>
        <Typography variant='body2' color='text.secondary' mb={2}>
          AI summarization requires either a ROBOKOP account or your own LLM API key.
        </Typography>
        <Stack spacing={1.5}>
          <Button
            variant='contained'
            startIcon={<KeyIcon />}
            onClick={() => {
              onClose()
              onSetupBYOK()
            }}
            fullWidth
          >
            Use my own API key (BYOK)
          </Button>
          <Divider>or</Divider>
          <Button
            variant='outlined'
            startIcon={<LockOpenIcon />}
            onClick={() => {
              onClose()
              onLoginClick()
            }}
            fullWidth
          >
            Log in to use server AI
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )
}
