import { createFileRoute } from '@tanstack/react-router';

import QueryBuilder from '../../pages/queryBuilder/QueryBuilder';

export const Route = createFileRoute('/_appLayout/question-builder')({
  component: Index,
});

function Index() {
  return <QueryBuilder />;
}
