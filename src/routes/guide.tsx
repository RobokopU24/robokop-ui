import { createFileRoute } from '@tanstack/react-router';
import Guide from '../pages/Guide';

export const Route = createFileRoute('/guide')({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: 'Guide - ROBOKOP',
      },
      {
        name: 'description',
        content: 'Explore the guide for using ROBOKOP.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:title',
        content: 'Guide - ROBOKOP',
      },
      {
        property: 'og:description',
        content: 'Explore the guide for using ROBOKOP.',
      },
    ],
  }),
});

function RouteComponent() {
  return <Guide />;
}
