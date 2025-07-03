import { createFileRoute } from '@tanstack/react-router';
import TermsOfService from '../../pages/TermsOfService';

export const Route = createFileRoute('/_appLayout/termsofservice')({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  return <TermsOfService />;
}
