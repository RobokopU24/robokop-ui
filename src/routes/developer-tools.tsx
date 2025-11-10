import { createFileRoute } from '@tanstack/react-router';
import DeveloperTools from '../pages/landing/DeveloperTools';

export const Route = createFileRoute('/developer-tools')({
  component: RouteComponent,
});

function RouteComponent() {
  return <DeveloperTools />;
}
