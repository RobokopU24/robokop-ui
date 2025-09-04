import { createFileRoute } from '@tanstack/react-router';
import Info from '../../../../pages/details/Info';
import API from '../../../../API';

export const Route = createFileRoute('/_appLayout/details/$details_id/')({
  component: RouteComponent,
  ssr: false,
  loader: async ({ params }) => {
    const nodeData = await API.details.getNodeDetails(params.details_id);
    return { nodeData };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.nodeData?.name} (${loaderData?.nodeData?.id})`,
      },
      {
        name: 'description',
        content: loaderData?.nodeData?.properties?.description,
      },
      { property: 'og:type', content: 'website' },
      {
        property: 'og:title',
        content: `${loaderData?.nodeData?.name} (${loaderData?.nodeData?.id})`,
      },
      {
        property: 'og:description',
        content: loaderData?.nodeData?.properties?.description,
      },
    ],
  }),
});

function RouteComponent() {
  const { details_id } = Route.useParams();
  const { nodeData } = Route.useLoaderData();
  return <Info details_id={details_id} nodeData={nodeData} />;
}
