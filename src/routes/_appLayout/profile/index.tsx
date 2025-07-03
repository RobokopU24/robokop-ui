import { createFileRoute } from '@tanstack/react-router';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Profile from '../../../pages/Profile';

export const Route = createFileRoute('/_appLayout/profile/')({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  );
}
