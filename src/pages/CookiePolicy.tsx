import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import useCookieConsent from '../hooks/useCookieConsent'

const storageEntries = [
  {
    name: 'ph_<project-token>_posthog',
    type: 'First-party cookie',
    purpose:
      'PostHog browser identity and session information. Helps connect activity and recognize return visits; the cookie can be shared across sibling subdomains where its domain scope permits.',
    lifetime:
      '365-day SDK default, refreshed when rewritten. Browser settings may shorten this. Removed when you decline.',
  },
  {
    name: 'ph_<project-token>_posthog',
    type: 'Local storage',
    purpose:
      'PostHog analytics state, including browser/device identifiers, session information, saved event properties, and SDK configuration. More information is kept here than in the cookie.',
    lifetime:
      'No automatic browser expiry. Cleared by the decline flow or when you clear site data; SDK state can also change on sign-out.',
  },
  {
    name: 'ph_<project-token>_posthog; ph_<project-token>_window_id; ph_<project-token>_primary_window_exists',
    type: 'Session storage',
    purpose:
      'PostHog tab/session state and markers that distinguish tabs and page reloads when analytics persistence is enabled.',
    lifetime:
      'Normally the tab’s browsing session. Browser session restoration can preserve session storage.',
  },
  {
    name: '__ph_opt_in_out_<project-token>',
    type: 'Local storage · preference',
    purpose:
      'Remembers your decision: 1 means allowed and 0 means declined. A missing or unrecognized value means no saved choice. This preference is retained after declining and is separate from the tracking identifier.',
    lifetime:
      'Until you change your choice or clear site data. No automatic expiry is set by this app.',
  },
  {
    name: 'authToken',
    type: 'Local storage · sign-in',
    purpose:
      'Keeps your authentication token so ROBOKOP can validate your session and authorize requests. This is sensitive sign-in data, not an analytics cookie.',
    lifetime:
      'Removed on sign-out or failed token validation, or when you clear site data. Server-side token validity is separate from browser storage.',
  },
  {
    name: 'passkeyPopupDenied; summarizationModel:<user-id>',
    type: 'Local storage · preferences',
    purpose:
      'Remembers dismissal of the passkey prompt and the selected AI summarization model for an account.',
    lifetime: 'Until replaced or site data is cleared. No automatic expiry is set by this app.',
  },
  {
    name: 'byok_config; byok_session_token',
    type: 'Session storage · optional AI features',
    purpose:
      'Stores your bring-your-own-key provider configuration, including the API key, model and optional endpoint, and a token used to route requests to your browser session.',
    lifetime:
      'Normally the tab’s browsing session. Turning off bring-your-own-key removes the configuration; the session token remains for the tab session.',
  },
  {
    name: 'quick_message',
    type: 'IndexedDB · query results',
    purpose:
      'Stores a query response or uploaded answer so the results page can display it across navigation or reloads.',
    lifetime:
      'Until replaced, cleared by the app when loading a saved answer, or removed through browser site-data settings.',
  },
]

export default function CookiePolicy() {
  const { consent, choose, enabled, storageWarning } = useCookieConsent()
  const [updated, setUpdated] = useState(false)

  return (
    <Container maxWidth='md' sx={{ my: { xs: 3, sm: 6 } }}>
      <Typography component='h1' variant='h4' gutterBottom>
        Cookie policy &amp; preferences
      </Typography>
      <Typography color='text.secondary' sx={{ mb: 3 }}>
        Learn how ROBOKOP uses analytics and choose whether to allow analytics cookies in this
        browser.
      </Typography>

      <Paper
        component='section'
        variant='outlined'
        sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 2 }}
        aria-labelledby='cookie-preferences-heading'
      >
        <Typography id='cookie-preferences-heading' component='h2' variant='h6' gutterBottom>
          Your cookie preferences
        </Typography>
        {!enabled ? (
          <Alert severity='info'>
            PostHog analytics is not configured on this site. No analytics choice is needed.
          </Alert>
        ) : (
          <>
            <Typography sx={{ mb: 1 }} aria-live='polite'>
              <strong>Current choice: </strong>
              {consent === 'granted'
                ? 'Analytics cookies allowed.'
                : consent === 'denied'
                  ? 'Analytics cookies declined.'
                  : 'No saved choice. Analytics cookies are enabled by default.'}
            </Typography>
            <Typography color='text.secondary'>
              Your saved choice is read from this browser’s local storage. You can change it at any
              time; selecting a button applies your choice immediately.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2.5 }}>
              <Button
                variant='outlined'
                aria-pressed={consent === 'denied'}
                onClick={() => {
                  choose('denied')
                  setUpdated(true)
                }}
              >
                Decline analytics cookies
              </Button>
              <Button
                variant='contained'
                aria-pressed={consent === 'granted'}
                onClick={() => {
                  choose('granted')
                  setUpdated(true)
                }}
              >
                Allow analytics cookies
              </Button>
            </Stack>
            {updated && (
              <Alert severity={storageWarning ? 'warning' : 'success'} sx={{ mt: 2 }}>
                {storageWarning
                  ? 'Your choice was applied for this visit, but could not be saved in browser storage. You may need to choose again on your next visit.'
                  : 'Your cookie preference has been saved in this browser.'}
              </Alert>
            )}
          </>
        )}
      </Paper>

      <Stack spacing={3} sx={{ '& p': { lineHeight: 1.75 } }}>
        <Box component='section'>
          <Typography component='h2' variant='h6' gutterBottom>
            What cookies and browser storage are
          </Typography>
          <Typography>
            A cookie is a small piece of information saved by your browser for a website. The
            browser sends matching cookies with requests to the cookie’s domain. A first-party
            cookie is stored for the site you are visiting, even when a service such as PostHog
            supplies the analytics software. An identifier can connect visits without containing
            your name.
          </Typography>
          <Typography sx={{ mt: 1.5 }}>
            Local storage also saves information in your browser, but does not automatically send it
            with every request; the app’s code reads it and may send it when needed. It normally
            survives closing the browser. Session storage is specific to a tab’s browsing session.
            IndexedDB is a browser database for larger data such as query results. All of these
            differ from data already sent to a server.
          </Typography>
        </Box>
        <Box component='section'>
          <Typography component='h2' variant='h6' gutterBottom>
            Storage used by ROBOKOP
          </Typography>
          <Typography sx={{ mb: 2 }}>
            The inventory below describes storage used by this frontend and its PostHog integration.
            Entries appear only when the relevant feature is used or enabled. Names containing
            &lt;project-token&gt; vary by deployment; &lt;user-id&gt; identifies the account whose
            preference is saved. No stored token or API key values are displayed on this page.
          </Typography>
          <TableContainer
            component={Paper}
            variant='outlined'
            tabIndex={0}
            role='region'
            aria-label='Cookie and browser storage inventory'
            sx={{ maxWidth: '100%' }}
          >
            <Table
              sx={{
                minWidth: 640,
                '& td, & th': { verticalAlign: 'top', overflowWrap: 'anywhere' },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '26%' }}>Name and storage type</TableCell>
                  <TableCell sx={{ width: '42%' }}>What it stores and why</TableCell>
                  <TableCell>How long it remains</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {storageEntries.map((entry) => (
                  <TableRow key={entry.name + entry.type}>
                    <TableCell component='th' scope='row'>
                      <Box component='code' sx={{ fontSize: '0.875rem' }}>
                        {entry.name}
                      </Box>
                      <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                        {entry.type}
                      </Typography>
                    </TableCell>
                    <TableCell>{entry.purpose}</TableCell>
                    <TableCell>{entry.lifetime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography sx={{ mt: 2 }}>
            The analytics controls above govern PostHog tracking. Declining does not remove sign-in
            information, AI settings, saved preferences, or query results. Those entries support
            their respective app features. PostHog may maintain additional internal storage entries
            depending on SDK features and project settings; this list is not an inventory of cookies
            set by hosting infrastructure or external websites.
          </Typography>
        </Box>

        <Box component='section'>
          <Typography component='h2' variant='h6' gutterBottom>
            Why we use PostHog
          </Typography>
          <Typography>
            ROBOKOP uses PostHog to understand how the site is used, including page visits, clicks,
            and errors. Cookies and local storage can retain analytics identifiers that let PostHog
            recognize return visits in the same browser.
          </Typography>
        </Box>
        <Box component='section'>
          <Typography component='h2' variant='h6' gutterBottom>
            What analytics tells us
          </Typography>
          <Typography>
            Analytics can include page addresses, referring pages, browser and device details,
            interactions with page elements, and error diagnostics. ROBOKOP also sends events about
            selecting query sources, submitting queries, loading answers, choosing results, using
            exploration tools, downloading data, and signing in or out. These events describe usage
            and outcomes, such as query size, result counts, duration, or failure stage.
          </Typography>
          <Typography sx={{ mt: 1.5 }}>
            The app’s custom analytics helper is intended for behavior and structural measurements,
            rather than query text, filenames, or user-provided content. Automatic capture and error
            reporting are separate SDK features. When cookies are allowed and you are signed in,
            your account ID can link analytics activity to your account. Session replay availability
            depends on PostHog project settings; this frontend does not establish whether it is
            enabled for a particular deployment.
          </Typography>
        </Box>
        <Box component='section'>
          <Typography component='h2' variant='h6' gutterBottom>
            Before you make a choice
          </Typography>
          <Typography>
            Cookie-based analytics are enabled by default until you decline. Leaving the banner
            unanswered does not save an explicit choice. The banner will continue to appear until
            you allow or decline analytics cookies.
          </Typography>
        </Box>
        <Box component='section'>
          <Typography component='h2' variant='h6' gutterBottom>
            If you allow analytics cookies
          </Typography>
          <Typography>
            PostHog can use a cookie and local storage to recognize your browser across visits and
            measure activity such as page views, clicks, and errors. If you are signed in, ROBOKOP
            also associates analytics with your account ID after you allow cookies.
          </Typography>
        </Box>
        <Box component='section'>
          <Typography component='h2' variant='h6' gutterBottom>
            If you decline analytics cookies
          </Typography>
          <Typography>
            ROBOKOP clears the previous analytics identity and tracking cookie, and switches to
            cookieless page-view counting. Only page views are allowed through the analytics event
            filter. Clicks, errors, and session replay are not recorded for declined visitors.
            Page-view events exclude user properties, referrers, URL query parameters, and URL
            fragments. They retain the site hostname and page path, without a stored analytics
            identifier.
          </Typography>
          <Typography sx={{ mt: 1.5 }}>
            Cookieless does not mean that no information leaves your browser: page-view requests
            still reach the analytics service, which receives network information needed to handle
            them. PostHog documents server-side hashing for cookieless counting. ROBOKOP’s event
            filter limits the event properties; it does not eliminate the network request or set the
            service’s server-side retention policy. See{' '}
            <Link
              href='https://posthog.com/docs/privacy/data-collection'
              target='_blank'
              rel='noreferrer'
            >
              PostHog’s data collection documentation
            </Link>
            .
          </Typography>
        </Box>
        <Box component='section'>
          <Typography component='h2' variant='h6' gutterBottom>
            How your choice is remembered
          </Typography>
          <Typography>
            Your allow or decline decision is stored in this browser’s local storage, separately
            from the analytics tracking cookie. This lets ROBOKOP remember a decline without keeping
            a tracking identifier. The preference applies to this site in this browser; other
            browsers, devices, and private browsing sessions can have different choices. Clearing
            site data removes the saved choice and restores the default behavior. If browser storage
            is blocked, your choice may not persist between visits.
          </Typography>
        </Box>
        <Box component='section'>
          <Typography component='h2' variant='h6' gutterBottom>
            Changing your mind
          </Typography>
          <Typography>
            Use the controls above or return through “Cookie policy &amp; preferences” in the
            footer. Changes apply to future analytics activity; declining does not delete data
            already sent. These controls manage PostHog analytics, and do not clear other site data
            or sign you out. For more information about PostHog’s handling of data, see the{' '}
            <Link href='https://posthog.com/privacy' target='_blank' rel='noreferrer'>
              PostHog privacy policy
            </Link>
            .
          </Typography>
        </Box>
        <Box component='section'>
          <Typography component='h2' variant='h6' gutterBottom>
            Browser controls and data already collected
          </Typography>
          <Typography>
            You can inspect or delete cookies and other site data using your browser’s privacy or
            site settings. Deleting only the analytics cookie does not clear local storage or save a
            decline decision. Use “Decline analytics cookies” above to set that preference. Clearing
            all site data also removes the saved cookie choice and can sign you out, erase local
            query results, and reset preferences. Revisit this page to choose again afterward.
          </Typography>
          <Typography sx={{ mt: 1.5 }}>
            Browser storage lifetimes are separate from how long analytics data is retained on
            PostHog’s servers. Server retention depends on the project’s settings and plan; this
            page does not claim a fixed retention period. Changing your choice does not erase
            previously collected data, and events queued before a change may already be in transit.
            Read about{' '}
            <Link
              href='https://posthog.com/docs/privacy/data-storage'
              target='_blank'
              rel='noreferrer'
            >
              PostHog’s data retention
            </Link>{' '}
            and{' '}
            <Link
              href='https://posthog.com/docs/libraries/js/persistence'
              target='_blank'
              rel='noreferrer'
            >
              browser persistence
            </Link>{' '}
            for more detail.
          </Typography>
        </Box>
      </Stack>
    </Container>
  )
}
