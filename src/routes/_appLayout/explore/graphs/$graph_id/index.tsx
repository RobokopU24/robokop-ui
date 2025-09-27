import { createFileRoute } from '@tanstack/react-router';
import API from '../../../../../API';
import GraphId from '../../../../../pages/graphId/GraphId';
import { getFileSize } from '../../../../../utils/getFileSize';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../../../../../utils/queryClient';

export const Route = createFileRoute('/_appLayout/explore/graphs/$graph_id/')({
  component: RouteComponent,
  ssr: false,
  loader: async ({ params }) => {
    console.log('params in loader', params);
    const graphData = await queryClient.ensureQueryData({
      queryKey: ['graph-metadata', params.graph_id],
      queryFn: () => API.graphMetadata.metadata(params.graph_id!),
    });

    let fileSize;
    if (graphData?.neo4j_dump) {
      fileSize = await getFileSize(graphData.neo4j_dump);
    }

    return {
      graphData,
      fileSize,
    };
  },
  head: ({ params }) => {
    const cachedData: any = queryClient.getQueryData(['graph-metadata', params.graph_id]);
    return {
      meta: [
        {
          title: cachedData ? `${cachedData.graph_name} | ROBOKOP` : 'Graph | ROBOKOP',
        },
      ],
    };
  },
});

function RouteComponent() {
  const { graph_id } = Route.useParams();
  console.log('graph_id', graph_id);
  const { data, isPending } = useQuery({
    queryKey: ['graph-metadata', graph_id],
    queryFn: () => {
      console.log('fetching graph metadata for', graph_id);
      return API.graphMetadata.metadata(graph_id!);
    },
    enabled: !!graph_id,
  });

  const { fileSize } = Route.useLoaderData();
  if (isPending) return 'Loading...';

  return <GraphId graphData={data} fileSize={fileSize} />;
}
