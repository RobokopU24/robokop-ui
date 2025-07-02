import { createFileRoute } from '@tanstack/react-router';
import DrugDiseasePairs from '../../../../pages/explore/DrugDiseasePairs';

export const Route = createFileRoute('/_appLayout/explore/drug-chemical/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <DrugDiseasePairs />;
}
