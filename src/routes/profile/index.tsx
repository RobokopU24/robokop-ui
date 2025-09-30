import { createFileRoute } from '@tanstack/react-router';
import ProtectedRoute from '../../components/ProtectedRoute';
import Profile from '../../pages/Profile';

export const Route = createFileRoute('/profile/')({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: 'Profile - ROBOKOP',
      },
      {
        name: 'description',
        content: 'View your profile information.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:title',
        content: 'Profile - ROBOKOP',
      },
      {
        property: 'og:description',
        content: 'View your profile information.',
      },
    ],
  }),
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  );
}
