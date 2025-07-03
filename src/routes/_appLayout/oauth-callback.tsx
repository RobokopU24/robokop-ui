import { createFileRoute } from '@tanstack/react-router';
import OAuthCallback from '../../pages/OAuthCallback';

export const Route = createFileRoute('/_appLayout/oauth-callback')({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  return <OAuthCallback />;
}
