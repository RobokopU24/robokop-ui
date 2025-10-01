import { createFileRoute } from '@tanstack/react-router';
import Tutorial from '../pages/Tutorial';

export const Route = createFileRoute('/tutorial')({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: 'Tutorial - ROBOKOP',
      },
      {
        name: 'description',
        content: 'Learn how to use ROBOKOP effectively.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:title',
        content: 'Tutorial - ROBOKOP',
      },
      {
        property: 'og:description',
        content: 'Learn how to use ROBOKOP effectively.',
      },
    ],
  }),
});

function RouteComponent() {
  return <Tutorial />;
}
