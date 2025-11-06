import { createFileRoute } from '@tanstack/react-router';
import License from '../pages/landing/License';

export const Route = createFileRoute('/license')({
  component: RouteComponent,
});

function RouteComponent() {
  return <License />;
}
