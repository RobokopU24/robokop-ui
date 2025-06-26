import { createFileRoute } from '@tanstack/react-router';
import DrugDiseasePairs from '../../../pages/explore/DrugDiseasePairs';

export const Route = createFileRoute('/explore/drug-chemical/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <DrugDiseasePairs />;
}
