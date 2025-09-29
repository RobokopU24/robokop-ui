import { createFileRoute } from '@tanstack/react-router';
import Explore from '../../pages/explore/Explore';

export const Route = createFileRoute('/explore/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Explore />;
}
