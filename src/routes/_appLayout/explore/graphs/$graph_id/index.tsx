import { createFileRoute } from '@tanstack/react-router';
import API from '../../../../../API';
import GraphId from '../../../../../pages/graphId/GraphId';
import { getFileSize } from '../../../../../utils/getFileSize';

export const Route = createFileRoute('/_appLayout/explore/graphs/$graph_id/')({
  component: RouteComponent,
  ssr: false,
  loader: async ({ params }) => {
    const graphData = await API.graphMetadata.metadata(params.graph_id);

    let fileSize;
    if (graphData?.neo4j_dump) {
      fileSize = await getFileSize(graphData.neo4j_dump);
    }

    return {
      graphData,
      fileSize,
    };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.graphData.graph_name} | ROBOKOP` }],
  }),
});

function RouteComponent() {
  const { graphData, fileSize } = Route.useLoaderData();

  return <GraphId graphData={graphData} fileSize={fileSize} />;
}
