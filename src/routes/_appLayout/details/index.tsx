import { createFileRoute } from '@tanstack/react-router';
import DetailsPage from '../../../pages/details/DetailsPage';

type TypeOptions = 'id' | 'name';

type DetailsRouteParams = {
  type?: TypeOptions;
  q?: string;
};

export const Route = createFileRoute('/_appLayout/details/')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): DetailsRouteParams => {
    return {
      q: (search.q as string) || '',
      type: (search.type as TypeOptions) || 'id',
    };
  },
});

function RouteComponent() {
  return <DetailsPage />;
}
