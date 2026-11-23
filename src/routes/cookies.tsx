import { createFileRoute } from '@tanstack/react-router'
import CookiePolicy from '../pages/CookiePolicy'

export const Route = createFileRoute('/cookies')({
  component: CookiePolicy,
  head: () => ({ meta: [{ title: 'Cookie policy & preferences - ROBOKOP' }] }),
})
