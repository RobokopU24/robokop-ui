import { createFileRoute } from '@tanstack/react-router';
import Explore from '../../../pages/explore/Explore';

export const Route = createFileRoute('/_appLayout/explore/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Explore />;
}
