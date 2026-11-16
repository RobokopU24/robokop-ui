import type { CaptureResult } from 'posthog-js'

export type PostHogConsentStatus = 'granted' | 'denied' | 'pending'

export function filterPostHogEvent(
  event: CaptureResult | null,
  consent: PostHogConsentStatus,
): CaptureResult | null {
  if (!event) return null
  if (consent !== 'denied') return event
  if (event.event !== '$pageview') return null

  // Keep only the cookieless identifier and page location, excluding user properties,
  // referrers, query parameters, and fragments from declined visitors' events.
  let url: URL
  try {
    url = new URL(event.properties.$current_url)
  } catch {
    return null
  }
  return {
    event: event.event,
    uuid: event.uuid,
    properties: {
      distinct_id: '$posthog_cookieless',
      $current_url: `${url.origin}${url.pathname}`,
      $pathname: url.pathname,
      $host: url.hostname,
      $process_person_profile: false,
    },
  }
}

const OPEN_COOKIE_CONSENT = 'robokop-open-cookie-consent'

export function posthogConsentStorageKey(projectKey: string) {
  return `__ph_opt_in_out_${projectKey}`
}

export function readStoredPostHogConsent(projectKey: string | undefined): PostHogConsentStatus {
  if (!projectKey) return 'pending'

  try {
    const value = localStorage.getItem(posthogConsentStorageKey(projectKey))
    if (value === '1') return 'granted'
    if (value === '0') return 'denied'
  } catch {
    return 'pending'
  }

  return 'pending'
}

export function clearPostHogTrackingCookie(projectKey: string) {
  const cookieName = `ph_${projectKey}_posthog`
  const expiry = 'expires=Thu, 01 Jan 1970 00:00:00 GMT'
  const host = window.location.hostname
  const domains = new Set<string>(['.renci.org', host, `.${host}`])
  const parts = host.split('.')
  if (parts.length > 2) domains.add(`.${parts.slice(-2).join('.')}`)

  document.cookie = `${cookieName}=; ${expiry}; path=/`
  domains.forEach((domain) => {
    document.cookie = `${cookieName}=; ${expiry}; path=/; domain=${domain}`
  })

  try {
    localStorage.removeItem(cookieName)
  } catch {
    // Storage can be blocked. The consent choice is still kept separately.
  }
}

export function openCookieConsent() {
  window.dispatchEvent(new Event(OPEN_COOKIE_CONSENT))
}

export function subscribeToCookieConsentOpen(onOpen: () => void) {
  window.addEventListener(OPEN_COOKIE_CONSENT, onOpen)
  return () => window.removeEventListener(OPEN_COOKIE_CONSENT, onOpen)
}
