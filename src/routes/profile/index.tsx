import { createFileRoute } from '@tanstack/react-router';
import ProtectedRoute from '../../components/ProtectedRoute';
import Profile from '../../pages/Profile';

export const Route = createFileRoute('/profile/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  );
}
