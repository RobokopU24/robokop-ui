import { Button, Divider, Modal, Typography } from '@mui/material'
import KeyIcon from '@mui/icons-material/Key'
import React from 'react'

function LoginWarning({
  isOpen,
  onClose,
  warningType = 'login',
  onSetupBYOK,
}: {
  isOpen: boolean
  onClose: () => void
  warningType?: 'login' | 'premium' | null
  onSetupBYOK?: () => void
}) {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <div
        style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          maxWidth: '500px',
          margin: 'auto',
          marginTop: '100px',
        }}
      >
        {warningType === 'login' && <h2>Please log in to use this feature.</h2>}
        {warningType === 'premium' && (
          <>
            <h2>This feature is available for premium users only. Please upgrade your account.</h2>
            {onSetupBYOK && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant='body2' color='text.secondary' mb={1}>
                  Alternatively, use your own API key at no cost.
                </Typography>
                <Button
                  variant='outlined'
                  size='small'
                  startIcon={<KeyIcon />}
                  onClick={() => {
                    onClose()
                    onSetupBYOK()
                  }}
                >
                  Use my own API key (BYOK)
                </Button>
              </>
            )}
          </>
        )}
        <div style={{ marginTop: '20px' }}>
          <button onClick={onClose} className='button-cancel'>
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default LoginWarning
