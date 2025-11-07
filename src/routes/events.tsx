import { createFileRoute } from '@tanstack/react-router';
import Events from '../pages/landing/Events';

export const Route = createFileRoute('/events')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Events />;
}
