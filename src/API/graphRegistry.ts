import axios from 'axios'
import { baseAPI } from './routes'

export const GRAPH_REGISTRY_ROUTE = `${baseAPI}/graph-registry`

export interface GraphRegistryEntry {
  graph_id: string
  summary: string
  name: string
  nodes_count: number
  edges_counts: number
}

export interface GraphDownloadData {
  file_path: string
  file_size_bytes: number
}

export const graphRegistryList = async (): Promise<GraphRegistryEntry[]> => {
  const response = await axios.get(`${GRAPH_REGISTRY_ROUTE}/registry`)
  if (response.status === 200) {
    return response.data
  } else {
    throw new Error(`Failed to fetch graph registry: ${response.statusText}`)
  }
}

export const graphSchema = async (graph_id: string, graph_version: string) => {
  const response = await axios.get(`${GRAPH_REGISTRY_ROUTE}/schema/${graph_id}/${graph_version}`)
  if (response.status === 200) {
    return response.data
  } else {
    throw new Error(`Failed to fetch graph schema: ${response.statusText}`)
  }
}

export const graphMetadata = async (graph_id: string, graph_version: string) => {
  const response = await axios.get(
    `${GRAPH_REGISTRY_ROUTE}/graph_metadata/${graph_id}/${graph_version}`,
  )
  if (response.status === 200) {
    return response.data
  } else {
    throw new Error(`Failed to fetch graph metadata: ${response.statusText}`)
  }
}

export const getGraphDownloadList = async (
  graph_id: string,
  graph_version: string,
): Promise<GraphDownloadData[]> => {
  const response = await axios.get(`${GRAPH_REGISTRY_ROUTE}/files/${graph_id}/${graph_version}`)
  if (response.status === 200) {
    return response.data
  } else {
    throw new Error(`Failed to fetch graph download list: ${response.statusText}`)
  }
}

export const getGraphVersionList = async (graph_id: string): Promise<string[]> => {
  const response = await axios.get(`${GRAPH_REGISTRY_ROUTE}/versions/${graph_id}`)
  if (response.status === 200) {
    return response.data
  } else {
    throw new Error(`Failed to fetch graph version list: ${response.statusText}`)
  }
}
