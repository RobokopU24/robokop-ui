import { createFileRoute } from '@tanstack/react-router'
import Releases from '../pages/releases/Releases'

export const Route = createFileRoute('/releases')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Releases />
}
