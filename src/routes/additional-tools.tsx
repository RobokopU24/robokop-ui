import { createFileRoute } from '@tanstack/react-router';
import AdditionalTools from '../pages/landing/AdditionalTools';

export const Route = createFileRoute('/additional-tools')({
  component: RouteComponent,
});

function RouteComponent() {
  return <AdditionalTools />;
}
