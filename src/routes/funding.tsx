import { createFileRoute } from '@tanstack/react-router';
import Funding from '../pages/landing/Funding';

export const Route = createFileRoute('/funding')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Funding />;
}
