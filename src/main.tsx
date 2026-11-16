import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import posthog from 'posthog-js'

import { routeTree } from './routeTree.gen'
import {
  clearPostHogTrackingCookie,
  filterPostHogEvent,
  readStoredPostHogConsent,
} from './utils/posthogConsent'

const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string | undefined
const posthogConsent = readStoredPostHogConsent(posthogKey)

if (posthogKey && posthogConsent === 'denied') {
  clearPostHogTrackingCookie(posthogKey)
}

if (posthogKey && !posthog.__loaded) {
  posthog.init(posthogKey, {
    api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
    defaults: '2025-05-24',
    capture_exceptions: true,
    persistence: 'localStorage+cookie',
    // Track normally until declined, without recording an implicit consent choice.
    cookieless_mode: posthogConsent === 'denied' ? 'on_reject' : undefined,
    opt_out_capturing_by_default: false,
    opt_out_persistence_by_default: true,
    opt_out_capturing_persistence_type: 'localStorage',
    before_send: (event) => filterPostHogEvent(event, posthog.get_explicit_consent_status()),
    debug: import.meta.env.MODE === 'development',
  })
}

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(<RouterProvider router={router} />)
}
