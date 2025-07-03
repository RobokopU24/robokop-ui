import { createFileRoute } from '@tanstack/react-router';
import DrugDiseasePairs from '../../../../pages/explore/DrugDiseasePairs';

export const Route = createFileRoute('/_appLayout/explore/drug-chemical/')({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  return <DrugDiseasePairs />;
}
