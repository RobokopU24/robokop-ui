import { createFileRoute } from "@tanstack/react-router";
import API from "../../../../API";
import { queryClient } from "../../../../utils/queryClient";
import { useQuery } from "@tanstack/react-query";
import GraphId from "../../../../pages/graphId/GraphId";

export const Route = createFileRoute("/explore/graphs/$graph_id/")({
  component: RouteComponent,
  ssr: false,
  loader: async ({ params }) => {
    const [graphData, v2Metadata, schemaV2] = await Promise.all([
      queryClient.ensureQueryData({
        queryKey: ["graph-metadata", params.graph_id],
        queryFn: () => API.graphMetadata.metadata(params.graph_id!),
      }),
      queryClient.ensureQueryData({
        queryKey: ["graph-metadata-v2", params.graph_id],
        queryFn: () => API.graphMetadata.graphMetadataV2(params.graph_id),
      }),
      queryClient.ensureQueryData({
        queryKey: ["graph-schema-v2", params.graph_id],
        queryFn: () => API.graphMetadata.graphSchemaV2(params.graph_id!),
      }),
    ]);

    return {
      graphData,
      v2Metadata,
      schemaV2,
    };
  },
  head: ({ loaderData, params }) => {
    const cachedData: any = queryClient.getQueryData(["graph-metadata", params.graph_id]);
    const cachedMetadataV2: any = loaderData?.v2Metadata ?? queryClient.getQueryData(["graph-metadata-v2", params.graph_id]);
    const cachedSchemaV2: any = loaderData?.schemaV2 ?? queryClient.getQueryData(["graph-schema-v2", params.graph_id]);

    return {
      meta: [
        {
          title: cachedData ? `${cachedData.graph_name} | ROBOKOP` : "Graph | ROBOKOP",
        },
      ],
      //TODO: Confirm if schema should be included as well
      scripts:
        cachedMetadataV2 && cachedSchemaV2
          ? [
              {
                type: "application/ld+json",
                children: JSON.stringify(cachedMetadataV2),
              },
              {
                type: "application/ld+json",
                children: JSON.stringify(cachedSchemaV2),
              },
            ]
          : [],
    };
  },
});

function RouteComponent() {
  const { graph_id } = Route.useParams();

  const { data, isPending } = useQuery({
    queryKey: ["graph-metadata", graph_id],
    queryFn: () => {
      return API.graphMetadata.metadata(graph_id!);
    },
    enabled: !!graph_id,
  });

  const { data: v2Metadata, isPending: v2Pending } = useQuery({
    queryKey: ["graph-metadata-v2", graph_id],
    queryFn: () => API.graphMetadata.graphMetadataV2(graph_id!),
    enabled: !!graph_id,
  });

  const { data: schemaV2, isPending: schemaPending } = useQuery({
    queryKey: ["graph-schema-v2", graph_id],
    queryFn: () => API.graphMetadata.graphSchemaV2(graph_id!),
    enabled: !!graph_id,
  });

  if (isPending || v2Pending || schemaPending) return "Loading...";

  return <GraphId graphData={data} v2Metadata={v2Metadata ?? null} schemaV2={schemaV2 ?? null} />;
}
