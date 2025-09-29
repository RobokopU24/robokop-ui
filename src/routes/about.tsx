import { createFileRoute } from '@tanstack/react-router';
import About from '../pages/About';

export const Route = createFileRoute('/about')({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: 'About - ROBOKOP',
      },
      {
        name: 'description',
        content: 'Learn more about ROBOKOP and its features.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:title',
        content: 'About - ROBOKOP',
      },
      {
        property: 'og:description',
        content: 'Learn more about ROBOKOP and its features.',
      },
    ],
  }),
});

function RouteComponent() {
  return <About />;
}
