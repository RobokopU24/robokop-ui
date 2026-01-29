import { createFileRoute } from "@tanstack/react-router";
import { queryClient } from "../../../../utils/queryClient";
import { useQuery } from "@tanstack/react-query";
import API from "../../../../API";
import graphMetadataV2, { GraphMetadataV2 } from "../../../../API/graphMetadataV2";
import GraphIdV2 from "../../../../pages/graphIdv2/GraphIdV2";

export const Route = createFileRoute("/explore/graphs/$graph_id/v2")({
  component: RouteComponent,
  ssr: false,
  loader: async ({ params }) => {
    const [v2Metadata, originalData] = await Promise.all([
      queryClient.ensureQueryData({
        queryKey: ["graph-metadata-v2", params.graph_id],
        queryFn: () => graphMetadataV2.metadata(params.graph_id!),
      }),
      queryClient.ensureQueryData({
        queryKey: ["graph-metadata", params.graph_id],
        queryFn: () => API.graphMetadata.metadata(params.graph_id!),
      }),
    ]);

    return {
      v2Metadata,
      originalData,
    };
  },
  head: ({ params }) => {
    const cachedData: any = queryClient.getQueryData(["graph-metadata-v2", params.graph_id]);
    return {
      meta: [
        {
          title: cachedData ? `${cachedData.name} | ROBOKOP` : "Graph | ROBOKOP",
        },
      ],
    };
  },
});

function RouteComponent() {
  const { graph_id } = Route.useParams();

  // Fetch v2 metadata (from JSON file)
  const { data: v2Metadata, isPending: v2Pending } = useQuery({
    queryKey: ["graph-metadata-v2", graph_id],
    queryFn: () => graphMetadataV2.metadata(graph_id!),
    enabled: !!graph_id,
  });

  // Fetch original API data (for downloads, tables, QC results, etc.)
  const { data: originalData, isPending: originalPending } = useQuery({
    queryKey: ["graph-metadata", graph_id],
    queryFn: () => API.graphMetadata.metadata(graph_id!),
    enabled: !!graph_id,
  });

  if (v2Pending || originalPending) return "Loading...";

  return <GraphIdV2 graphData={originalData} v2Metadata={v2Metadata as GraphMetadataV2} />;
}
