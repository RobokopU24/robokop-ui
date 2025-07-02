import { createFileRoute } from '@tanstack/react-router';
import TermsOfService from '../../pages/TermsOfService';

export const Route = createFileRoute('/_appLayout/termsofservice')({
  component: RouteComponent,
});

function RouteComponent() {
  return <TermsOfService />;
}
