import { createFileRoute } from '@tanstack/react-router';
import API from '../../../../API';
import { queryClient } from '../../../../utils/queryClient';
import { useQuery } from '@tanstack/react-query';
import GraphId from '../../../../pages/graphId/GraphId';
import { api } from '../../../../API/baseUrlProxy';

async function fetchGraphMetadataV2(graphId: string): Promise<any | null> {
  try {
    const response = await api.get(`/api/graph-metadata/${graphId}`);
    if (response.status !== 200) {
      return null;
    }
    return response.data;
  } catch (_) {
    return null;
  }
}

export const Route = createFileRoute('/explore/graphs/$graph_id/')({
  component: RouteComponent,
  ssr: false,
  loader: async ({ params }) => {
    const [graphData, graphMetadataV2] = await Promise.all([
      queryClient.ensureQueryData({
        queryKey: ['graph-metadata', params.graph_id],
        queryFn: () => API.graphMetadata.metadata(params.graph_id!),
      }),
      queryClient.ensureQueryData({
        queryKey: ['graph-metadata-v2', params.graph_id],
        queryFn: () => fetchGraphMetadataV2(params.graph_id),
      }),
    ]);

    return {
      graphData,
      graphMetadataV2,
    };
  },
  head: ({ loaderData, params }) => {
    const cachedData: any = queryClient.getQueryData(['graph-metadata', params.graph_id]);
    const cachedGraphMetadataV2: any =
      loaderData?.graphMetadataV2 ?? queryClient.getQueryData(['graph-metadata-v2', params.graph_id]);

    return {
      meta: [
        {
          title: cachedData ? `${cachedData.graph_name} | ROBOKOP` : 'Graph | ROBOKOP',
        },
      ],
      scripts: cachedGraphMetadataV2
        ? [
            {
              type: 'application/ld+json',
              children: JSON.stringify(cachedGraphMetadataV2),
            },
          ]
        : [],
    };
  },
});

function RouteComponent() {
  const { graph_id } = Route.useParams();

  const { data, isPending } = useQuery({
    queryKey: ['graph-metadata', graph_id],
    queryFn: () => {
      return API.graphMetadata.metadata(graph_id!);
    },
    enabled: !!graph_id,
  });

  if (isPending) return 'Loading...';

  return <GraphId graphData={data} />;
}
