import { createFileRoute } from '@tanstack/react-router';
import EntryPoint from '../../pages/entryPoint/EntryPoint';

export const Route = createFileRoute('/_appLayout/welcome')({
  component: RouteComponent,
});

function RouteComponent() {
  return <EntryPoint />;
}
