import { createFileRoute } from '@tanstack/react-router';
import TermsOfService from '../pages/TermsOfService';

export const Route = createFileRoute('/termsofservice')({
  component: RouteComponent,
});

function RouteComponent() {
  return <TermsOfService />;
}
