import { createFileRoute } from '@tanstack/react-router';
import Answer from '../../../pages/answer/Answer';

export const Route = createFileRoute('/_appLayout/answer/$answer_id/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { answer_id } = Route.useParams();
  return <Answer answer_id={answer_id} />;
}
