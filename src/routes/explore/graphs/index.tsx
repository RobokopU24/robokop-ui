import { createFileRoute } from "@tanstack/react-router";
import API from "../../../API";
import { queryClient } from "../../../utils/queryClient";
import { useQuery } from "@tanstack/react-query";
import Graph from "../../../pages/graph/Graph";

export const Route = createFileRoute("/explore/graphs/")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Graphs | ROBOKOP" }],
  }),
});

function RouteComponent() {
  // const { isLoading, data: graphData } = useQuery({
  //   queryKey: ["graphs"],
  //   queryFn: async () => {
  //     const registry = await API.graphMetadata.registry();

  //     if (!Array.isArray(registry)) {
  //       throw new Error(registry.message || "Failed to fetch graph registry");
  //     }

  //     const graphData = await Promise.all(registry.map((graphId) => API.graphMetadata.metadata(graphId).then((data) => ({ ...data, graph_id: graphId }))));

  //     const sortedGraphData = graphData.sort((a, b) => b.final_node_count - a.final_node_count);
  //     console.log(sortedGraphData, "sortedGraphData in graph list");
  //     for (const graph of sortedGraphData) {
  //       queryClient.setQueryData(["graph-metadata", graph.graph_id], graph);
  //     }
  //     return sortedGraphData;
  //   },
  // });

  const { isLoading: isLoadingV2, data: graphDataV2 } = useQuery({
    queryKey: ["graphsV2"],
    queryFn: async () => {
      const registry = await API.graphMetadata.registry();

      if (!Array.isArray(registry)) {
        throw new Error(registry.message || "Failed to fetch graph registry");
      }

      const graphData = await Promise.all(
        registry.map((graphId) =>
          API.graphMetadata.graphMetadataV2(graphId).then((data) => {
            console.log(data, "data in graphMetadataV2 in graph list");
            let totalNodeCount = 0;
            let totalEdgeCount = 0;
            if (data?.hasPart && Array.isArray(data.hasPart)) {
              data.hasPart.forEach((part) => {
                if (part["orion:nodeCount"]) {
                  totalNodeCount += part["orion:nodeCount"];
                }
                if (part["orion:edgeCount"]) {
                  totalEdgeCount += part["orion:edgeCount"];
                }
              });
            }
            return { ...data, graph_id: graphId, totalNodeCount, totalEdgeCount };
          }),
        ),
      );

      const sortedGraphData = graphData.sort((a, b) => b.totalNodeCount - a.totalNodeCount);
      console.log(sortedGraphData, "sortedGraphData in graph list");
      for (const graph of sortedGraphData) {
        queryClient.setQueryData(["graph-metadata-v2", graph.graph_id], graph);
      }
      return sortedGraphData;
    },
  });
  console.log(graphDataV2, "graphDataV2 in graph list", isLoadingV2);

  return <Graph graphData={graphDataV2!} isLoading={isLoadingV2} />;
}
