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
  // loader: async () => {
  //   const registry = await API.graphMetadata.registry();

  //   if (!Array.isArray(registry)) {
  //     throw new Error(registry.message || 'Failed to fetch graph registry');
  //   }

  //   const graphData = await Promise.all(
  //     registry.map((graphId) =>
  //       API.graphMetadata.metadata(graphId).then((data) => ({ ...data, graph_id: graphId }))
  //     ) // doesn't include id matching registry, so include it here manually
  //   );

  //   const sortedGraphData = graphData.sort((a, b) => b.final_node_count - a.final_node_count);

  //   for (const graph of sortedGraphData) {
  //     queryClient.setQueryData(['graph-metadata', graph.graph_id], graph);
  //   }

  //   queryClient.setQueryData(['graphs'], sortedGraphData);

  //   return { graphData: sortedGraphData };
  // },
  loader: async () => {
    const registry = await queryClient.ensureQueryData({
      queryKey: ['graphs'],
      queryFn: async () => {
        const r = await API.graphMetadata.registry();
        if (!Array.isArray(r)) throw new Error(r.message || 'Failed to fetch graph registry');
        return r;
      },
    });

    const items = await Promise.all(
      registry.map((graphId) =>
        API.graphMetadata.metadata(graphId).then((data) => ({ ...data, graph_id: graphId }))
      ) // doesn't include id matching registry, so include it here manually
    );

    const sortedGraphData = items.sort((a, b) => b.final_node_count - a.final_node_count);

    for (const graph of sortedGraphData) {
      queryClient.setQueryData(['graph-metadata', graph.graph_id], graph);
    }

    queryClient.setQueryData(['graphs:list:sorted'], sortedGraphData);
    return null;
  },
});

function RouteComponent() {
  // const { graphData } = Route.useLoaderData();
  const { data: graphData, isLoading } = useQuery({
    queryKey: ['graphs:list:sorted'],
    queryFn: async () => {
      const registry = await API.graphMetadata.registry();
      if (!Array.isArray(registry)) {
        throw new Error(registry.message || 'Failed to fetch graph registry');
      }
      const items = await Promise.all(
        registry.map((id: string) =>
          API.graphMetadata.metadata(id).then((d: any) => ({ ...d, graph_id: id }))
        )
      );
      return items.sort((a, b) => b.final_node_count - a.final_node_count);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  console.log(graphData, 'data in RouteComponent');

  // const { data } = useQuery({
  //   queryKey: ['graphs'],
  //   queryFn: async () => {
  //     const registry = await API.graphMetadata.registry();

  //     if (!Array.isArray(registry)) {
  //       throw new Error(registry.message || 'Failed to fetch graph registry');
  //     }

  //     const graphData = await Promise.all(
  //       registry.map((graphId) =>
  //         API.graphMetadata.metadata(graphId).then((data) => ({ ...data, graph_id: graphId }))
  //       ) // doesn't include id matching registry, so include it here manually
  //     );

  //     const sortedGraphData = graphData.sort((a, b) => b.final_node_count - a.final_node_count);

  //     for (const graph of sortedGraphData) {
  //       queryClient.setQueryData(['graph-metadata', graph.graph_id], graph);
  //     }

  //     return sortedGraphData;
  //   },
  // });
  // console.log(data, 'data in RouteComponent');

  if (isLoading) return 'Loading...';
  return <Graph graphData={graphData!} />;
}
