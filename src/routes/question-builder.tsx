import { createFileRoute } from '@tanstack/react-router';

import QueryBuilder from '../pages/queryBuilder/QueryBuilder';

export const Route = createFileRoute('/question-builder')({
  component: Index,
  head: () => ({
    meta: [
      {
        title: 'Question Builder - ROBOKOP',
      },
      {
        name: 'description',
        content: 'Build and customize your queries with our intuitive question builder.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:title',
        content: 'Question Builder - ROBOKOP',
      },
      {
        property: 'og:description',
        content: 'Build and customize your queries with our intuitive question builder.',
      },
    ],
  }),
});

function Index() {
  return <QueryBuilder />;
}
