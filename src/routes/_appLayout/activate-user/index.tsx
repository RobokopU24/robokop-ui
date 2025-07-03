import { createFileRoute } from '@tanstack/react-router';
import ActivateUser from '../../../pages/ActivateUser';

export const Route = createFileRoute('/_appLayout/activate-user/')({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  return <ActivateUser />;
}
