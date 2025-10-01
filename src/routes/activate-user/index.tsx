import { createFileRoute } from '@tanstack/react-router';
import ActivateUser from '../../pages/ActivateUser';

export const Route = createFileRoute('/activate-user/')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): { token: string } => {
    if (typeof search.token === 'string') {
      return { token: search.token };
    }
    throw new Error('A token is required.');
  },
});

function RouteComponent() {
  return <ActivateUser />;
}
