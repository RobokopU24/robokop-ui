import { createFileRoute } from '@tanstack/react-router';
import About from '../../pages/About';

export const Route = createFileRoute('/_appLayout/about')({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  return <About />;
}
