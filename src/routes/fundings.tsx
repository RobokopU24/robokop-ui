import { createFileRoute } from '@tanstack/react-router';
import Fundings from '../pages/landing/Fundings';

export const Route = createFileRoute('/fundings')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Fundings />;
}
