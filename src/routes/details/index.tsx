import { createFileRoute } from '@tanstack/react-router';
import DetailsPage from '../../pages/details/DetailsPage';

type TypeOptions = 'id' | 'name';

type DetailsRouteParams = {
  type?: TypeOptions;
  q?: string;
};

export const Route = createFileRoute('/details/')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): DetailsRouteParams => {
    return {
      q: (search.q as string) || '',
      type: (search.type as TypeOptions) || 'id',
    };
  },
  head: () => ({
    meta: [
      {
        title: 'Node Explorer - ROBOKOP',
      },
      {
        name: 'description',
        content: 'View and manage details for all the nodes in ROBOKOP.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:title',
        content: 'Node Explorer - ROBOKOP',
      },
      {
        property: 'og:description',
        content: 'View and manage details for all the nodes in ROBOKOP.',
      },
    ],
  }),
});

function RouteComponent() {
  return <DetailsPage />;
}
