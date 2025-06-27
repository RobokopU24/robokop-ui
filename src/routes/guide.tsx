import { createFileRoute } from '@tanstack/react-router';
import Guide from '../pages/Guide';

export const Route = createFileRoute('/guide')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Guide />;
}
