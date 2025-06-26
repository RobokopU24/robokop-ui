import { createFileRoute } from '@tanstack/react-router';

import QueryBuilder from '../pages/queryBuilder/QueryBuilder';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return <QueryBuilder />;
}
