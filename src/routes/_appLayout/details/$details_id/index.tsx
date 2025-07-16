import { createFileRoute } from '@tanstack/react-router';
import Info from '../../../../pages/details/Info';

export const Route = createFileRoute('/_appLayout/details/$details_id/')({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  const { details_id } = Route.useParams();
  return <Info details_id={details_id} />;
}
