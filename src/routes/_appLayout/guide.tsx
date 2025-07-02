import { createFileRoute } from '@tanstack/react-router';
import Guide from '../../pages/Guide';

export const Route = createFileRoute('/_appLayout/guide')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Guide />;
}
