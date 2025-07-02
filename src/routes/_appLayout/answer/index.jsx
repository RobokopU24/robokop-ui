import { createFileRoute } from '@tanstack/react-router';
import Answer from '../../../pages/answer/Answer';

export const Route = createFileRoute('/_appLayout/answer/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Answer />;
}
