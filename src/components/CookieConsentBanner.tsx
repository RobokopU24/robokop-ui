import { useEffect, useState } from 'react'
import { Box, Button, Link, Paper, Typography } from '@mui/material'
import posthog from 'posthog-js'
import { useAuth } from '../context/AuthContext'
import {
  clearPostHogTrackingCookie,
  readStoredPostHogConsent,
  subscribeToCookieConsentOpen,
  type PostHogConsentStatus,
} from '../utils/posthogConsent'

const projectKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string | undefined

export default function CookieConsentBanner() {
  const { user } = useAuth()
  const [consent, setConsent] = useState<PostHogConsentStatus>(() =>
    readStoredPostHogConsent(projectKey),
  )
  const [preferencesOpen, setPreferencesOpen] = useState(false)

  useEffect(() => subscribeToCookieConsentOpen(() => setPreferencesOpen(true)), [])

  if (!projectKey || (consent !== 'pending' && !preferencesOpen)) return null

  const accept = () => {
    posthog.opt_in_capturing({ captureEventName: false })
    if (user) posthog.identify(user.id)
    setConsent('granted')
    setPreferencesOpen(false)
  }

  const decline = () => {
    // Clear the previous identity before switching a pending visitor to cookieless mode.
    if (posthog.get_explicit_consent_status() !== 'denied') posthog.reset(true)
    posthog.set_config({ cookieless_mode: 'on_reject' })
    posthog.opt_out_capturing()
    clearPostHogTrackingCookie(projectKey)
    setConsent('denied')
    setPreferencesOpen(false)
  }

  return (
    <Paper
      component='section'
      aria-label='Cookie consent'
      elevation={8}
      sx={{
        position: 'fixed',
        zIndex: 1200,
        left: 16,
        right: 16,
        bottom: 16,
        mx: 'auto',
        maxWidth: 720,
        maxHeight: 'calc(100dvh - 32px)',
        overflow: 'auto',
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        border: '1px solid #dce2ff',
      }}
    >
      <Typography id='cookie-consent-title' component='h2' variant='subtitle1' fontWeight={700}>
        Cookie consent
      </Typography>
      <Typography id='cookie-consent-description' variant='body2' sx={{ mt: 1, lineHeight: 1.6 }}>
        ROBOKOP uses PostHog to understand how this site is used. Cookie-based analytics are enabled
        by default until you decline. PostHog sets a cookie so it can recognize return visits and
        measure pages, clicks, and errors. It does not include your queries or uploaded files. If
        you decline, we count page views without tracking cookies or stored analytics identifiers.
        We do not record your clicks, errors, or session replay, and we remember your choice in
        local storage.{' '}
        <Link href='https://posthog.com/privacy' target='_blank' rel='noreferrer'>
          PostHog privacy policy
        </Link>
        .
      </Typography>
      {consent !== 'pending' && (
        <Typography variant='body2' sx={{ mt: 1, color: '#475569' }}>
          Current choice: cookies are {consent === 'granted' ? 'allowed' : 'declined'}.
        </Typography>
      )}
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          gap: 1,
          mt: 2,
          pt: 1,
          bgcolor: 'background.paper',
        }}
      >
        <Button
          type='button'
          variant='outlined'
          onClick={decline}
          sx={{ borderColor: '#c5cbe0', color: '#334155' }}
        >
          Decline
        </Button>
        <Button
          type='button'
          variant='contained'
          onClick={accept}
          autoFocus={consent === 'pending'}
          sx={{ bgcolor: '#627dff', '&:hover': { bgcolor: '#4b63d4' } }}
        >
          Accept cookies
        </Button>
      </Box>
    </Paper>
  )
}
