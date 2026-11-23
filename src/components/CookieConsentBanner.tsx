import { Box, Button, Link, Paper, Typography } from '@mui/material'
import { Link as RouterLink, useLocation } from '@tanstack/react-router'
import useCookieConsent from '../hooks/useCookieConsent'

export default function CookieConsentBanner() {
  const { consent, choose, enabled } = useCookieConsent()
  const pathname = useLocation({ select: (location) => location.pathname })

  if (!enabled || consent !== 'pending' || pathname.replace(/\/$/, '') === '/cookies') return null

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
        ROBOKOP uses PostHog analytics. Cookies are enabled until you decline. Declining allows only
        page-view counting without tracking cookies.{' '}
        <Link component={RouterLink} to='/cookies'>
          Read our cookie policy and manage your preferences
        </Link>
        .
      </Typography>
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
          onClick={() => choose('denied')}
          sx={{ borderColor: '#c5cbe0', color: '#334155' }}
        >
          Decline
        </Button>
        <Button
          type='button'
          variant='contained'
          onClick={() => choose('granted')}
          autoFocus={consent === 'pending'}
          sx={{ bgcolor: '#627dff', '&:hover': { bgcolor: '#4b63d4' } }}
        >
          Accept cookies
        </Button>
      </Box>
    </Paper>
  )
}
