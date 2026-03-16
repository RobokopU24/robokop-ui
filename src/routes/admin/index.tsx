import { createFileRoute } from '@tanstack/react-router';
import AdminPage from '../../pages/admin';

export const Route = createFileRoute('/admin/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <AdminPage />;
}
