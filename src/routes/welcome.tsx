import { createFileRoute } from '@tanstack/react-router';
import EntryPoint from '../pages/entryPoint/EntryPoint';

export const Route = createFileRoute('/welcome')({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: 'Welcome to ROBOKOP',
      },
      {
        name: 'description',
        content: 'Discover the features and capabilities of ROBOKOP.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:title',
        content: 'Welcome to ROBOKOP',
      },
      {
        property: 'og:description',
        content: 'Discover the features and capabilities of ROBOKOP.',
      },
    ],
  }),
});

function RouteComponent() {
  return <EntryPoint />;
}
