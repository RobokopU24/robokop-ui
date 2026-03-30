import { createFileRoute } from '@tanstack/react-router'
import { queryClient } from '../../../../utils/queryClient'
import { graphMetadata, graphSchema } from '../../../../API/graphRegistry'
import { useQuery } from '@tanstack/react-query'
import GraphId from '../../../../pages/graphId/GraphId'

// export const Route = createFileRoute('/graphs/$graph_id/$graph_version/')({
//   component: RouteComponent,
// })
export const Route = createFileRoute('/graphs/$graph_id/$graph_version/')({
  component: RouteComponent,
  ssr: false,
  loader: async ({ params }) => {
    const [v2Metadata, schemaV2] = await Promise.all([
      queryClient.ensureQueryData({
        queryKey: ['graph-metadata', params.graph_id, params.graph_version],
        queryFn: () => graphMetadata(params.graph_id!, params.graph_version!),
      }),
      queryClient.ensureQueryData({
        queryKey: ['graph-schema', params.graph_id, params.graph_version],
        queryFn: () => graphSchema(params.graph_id!, params.graph_version!),
      }),
    ])

    return {
      v2Metadata,
      schemaV2,
    }
  },
  head: ({ loaderData, params }) => {
    const cachedData: any = queryClient.getQueryData([
      'graph-metadata',
      params.graph_id,
      params.graph_version,
    ])
    const cachedMetadataV2: any =
      loaderData?.v2Metadata ??
      queryClient.getQueryData(['graph-metadata', params.graph_id, params.graph_version])

    return {
      meta: [
        {
          title: cachedData ? `${cachedData.name} | ROBOKOP` : 'Graph | ROBOKOP',
        },
      ],
      scripts: cachedMetadataV2
        ? [
            {
              type: 'application/ld+json',
              children: JSON.stringify(cachedMetadataV2),
            },
          ]
        : [],
    }
  },
})

function RouteComponent() {
  const { graph_id, graph_version } = Route.useParams()

  const { data: v2Metadata, isPending: v2Pending } = useQuery({
    queryKey: ['graph-metadata', graph_id, graph_version],
    queryFn: () => graphMetadata(graph_id!, graph_version!),
    enabled: !!graph_id,
  })

  const { data: schemaV2, isPending: schemaPending } = useQuery({
    queryKey: ['graph-schema', graph_id, graph_version],
    queryFn: () => graphSchema(graph_id!, graph_version!),
    enabled: !!graph_id,
  })

  if (v2Pending || schemaPending) return 'Loading...'

  return <GraphId v2Metadata={v2Metadata ?? null} schemaV2={schemaV2 ?? null} />
}
