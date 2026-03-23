import { createFileRoute } from '@tanstack/react-router'
import API from '../../API'
import { queryClient } from '../../utils/queryClient'
import { useQuery } from '@tanstack/react-query'
import Graph from '../../pages/graph/Graph'
import { graphRegistryList } from '../../API/graphRegistry'

export const Route = createFileRoute('/graphs/')({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: 'Graphs | ROBOKOP' }],
  }),
})

function RouteComponent() {
  const { isLoading: isLoadingV2, data: graphDataV2 } = useQuery({
    queryKey: ['graph-registry'],
    queryFn: async () => {
      const registry = await graphRegistryList()
      const sortedGraphData = registry.sort((a, b) => b.node_count - a.node_count)
      return sortedGraphData
    },
  })

  return <Graph graphData={graphDataV2!} isLoading={isLoadingV2} />
}
