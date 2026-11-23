import { useEffect, useState } from 'react'
import posthog from 'posthog-js'
import { useAuth } from '../context/AuthContext'
import {
  clearPostHogTrackingCookie,
  readStoredPostHogConsent,
  type PostHogConsentStatus,
} from '../utils/posthogConsent'

const projectKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string | undefined
const changedEvent = 'robokop-cookie-consent-changed'

export default function useCookieConsent() {
  const { user } = useAuth()
  const [consent, setConsent] = useState(() => readStoredPostHogConsent(projectKey))
  const [storageWarning, setStorageWarning] = useState(false)

  useEffect(() => {
    const refresh = (event: Event) => {
      setConsent((event as CustomEvent<PostHogConsentStatus>).detail)
    }
    window.addEventListener(changedEvent, refresh)
    return () => window.removeEventListener(changedEvent, refresh)
  }, [])

  const choose = (choice: Exclude<PostHogConsentStatus, 'pending'>) => {
    if (!projectKey) return
    if (choice === 'granted') {
      posthog.opt_in_capturing({ captureEventName: false })
      if (user) posthog.identify(user.id)
    } else {
      if (posthog.get_explicit_consent_status() !== 'denied') posthog.reset(true)
      posthog.set_config({ cookieless_mode: 'on_reject' })
      posthog.opt_out_capturing()
      clearPostHogTrackingCookie(projectKey)
    }
    window.dispatchEvent(new CustomEvent(changedEvent, { detail: choice }))
    setConsent(choice)
    setStorageWarning(readStoredPostHogConsent(projectKey) !== choice)
  }

  return { consent, choose, storageWarning, enabled: Boolean(projectKey) }
}
