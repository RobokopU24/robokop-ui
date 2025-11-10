import { createFileRoute } from '@tanstack/react-router';
import Citations from '../pages/landing/Citations';

export const Route = createFileRoute('/citations')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Citations />;
}
