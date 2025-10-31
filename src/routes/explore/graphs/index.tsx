import { createFileRoute } from '@tanstack/react-router';
import API from '../../../API';
import { queryClient } from '../../../utils/queryClient';
import { useQuery } from '@tanstack/react-query';
import Graph from '../../../pages/graph/Graph';

export const Route = createFileRoute('/explore/graphs/')({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: 'Graphs | ROBOKOP' }],
  }),
});

function RouteComponent() {
  const { isLoading, data: graphData } = useQuery({
    queryKey: ['graphs'],
    queryFn: async () => {
      const registry = await API.graphMetadata.registry();

      if (!Array.isArray(registry)) {
        throw new Error(registry.message || 'Failed to fetch graph registry');
      }

      const graphData = await Promise.all(
        registry.map((graphId) =>
          API.graphMetadata.metadata(graphId).then((data) => ({ ...data, graph_id: graphId }))
        )
      );

      const sortedGraphData = graphData.sort((a, b) => b.final_node_count - a.final_node_count);
      for (const graph of sortedGraphData) {
        queryClient.setQueryData(['graph-metadata', graph.graph_id], graph);
      }
      return sortedGraphData;
    },
  });

  return <Graph graphData={graphData!} isLoading={isLoading} />;
}
