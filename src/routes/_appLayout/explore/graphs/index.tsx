import { createFileRoute } from '@tanstack/react-router';
import API from '../../../../API';
import Graph from '../../../../pages/graph/Graph';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../../../../utils/queryClient';

export const Route = createFileRoute('/_appLayout/explore/graphs/')({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: 'Graphs | ROBOKOP' }],
  }),
  loader: async () => {
    const registry = await API.graphMetadata.registry();

    if (!Array.isArray(registry)) {
      throw new Error(registry.message || 'Failed to fetch graph registry');
    }

    const graphData = await Promise.all(
      registry.map((graphId) =>
        API.graphMetadata.metadata(graphId).then((data) => ({ ...data, graph_id: graphId }))
      ) // doesn't include id matching registry, so include it here manually
    );

    const sortedGraphData = graphData.sort((a, b) => b.final_node_count - a.final_node_count);

    for (const graph of sortedGraphData) {
      queryClient.setQueryData(['graph-metadata', graph.graph_id], graph);
    }

    queryClient.setQueryData(['graphs'], sortedGraphData);

    return { graphData: sortedGraphData };
  },
});

function RouteComponent() {
  const { graphData } = Route.useLoaderData();

  const { data } = useQuery({
    queryKey: ['graphs'],
    queryFn: async () => {
      const registry = await API.graphMetadata.registry();

      if (!Array.isArray(registry)) {
        throw new Error(registry.message || 'Failed to fetch graph registry');
      }

      const graphData = await Promise.all(
        registry.map((graphId) =>
          API.graphMetadata.metadata(graphId).then((data) => ({ ...data, graph_id: graphId }))
        ) // doesn't include id matching registry, so include it here manually
      );

      const sortedGraphData = graphData.sort((a, b) => b.final_node_count - a.final_node_count);

      for (const graph of sortedGraphData) {
        queryClient.setQueryData(['graph-metadata', graph.graph_id], graph);
      }

      return sortedGraphData;
    },
  });
  console.log(data, 'data in RouteComponent');

  return <Graph graphData={graphData} />;
}
