import { createFileRoute } from '@tanstack/react-router';
import DrugDiseasePairs from '../../../../pages/explore/DrugDiseasePairs';

export const Route = createFileRoute('/_appLayout/explore/drug-chemical/')({
  component: RouteComponent,
  ssr: false,
  head: () => ({
    meta: [
      {
        title: 'Drug to Disease Pair - ROBOKOP',
      },
      {
        name: 'description',
        content: 'Explore the relationship between drugs and diseases.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:title',
        content: 'Drug to Disease Pair - ROBOKOP',
      },
      {
        property: 'og:description',
        content: 'Explore the relationship between drugs and diseases.',
      },
    ],
  }),
});

function RouteComponent() {
  return <DrugDiseasePairs />;
}
