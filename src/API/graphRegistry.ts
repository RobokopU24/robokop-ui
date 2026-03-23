import axios from 'axios'

export const GRAPH_REGISTRY_ROUTE = 'https://graph-registry.apps.renci.org'

export interface GraphRegistryEntry {
  graph_id: string
  summary: string
  name: string
  node_count: number
  edge_counts: number
}

export const graphRegistryList = async (): Promise<GraphRegistryEntry[]> => {
  const response = await axios.get(`${GRAPH_REGISTRY_ROUTE}/registry`)
  if (response.status === 200) {
    return response.data
  } else {
    throw new Error(`Failed to fetch graph registry: ${response.statusText}`)
  }
}
