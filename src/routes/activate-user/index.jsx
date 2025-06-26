import { createFileRoute } from '@tanstack/react-router';
import ActivateUser from '../../pages/ActivateUser';

export const Route = createFileRoute('/activate-user/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <ActivateUser />;
}
