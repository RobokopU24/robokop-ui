import { Role, ROLES } from './roles'

export interface Feature {
  id: string
  name: string
}

export const FEATURES: Feature[] = [
  {
    id: 'graph_table_summarization',
    name: 'Graph Table Summarization',
  },
  {
    id: 'graph_edges_summarization',
    name: 'Graph Edges Summarization',
  },
  {
    id: 'publication_summarization',
    name: 'Publication Summarization',
  },
]

export const DEFAULT_FEATURE_ROLES: Record<string, Role[]> = {
  graph_table_summarization: [ROLES.PREMIUM, ROLES.ADMIN],
  graph_edges_summarization: [ROLES.PREMIUM, ROLES.ADMIN],
  publication_summarization: [ROLES.PREMIUM, ROLES.ADMIN],
}

export const hasFeatureAccess = (
  featureId: string,
  userRole: Role,
  featureAccessMap: Record<string, Role[]>,
): boolean => {
  const allowedRoles = featureAccessMap[featureId] || DEFAULT_FEATURE_ROLES[featureId] || []
  return allowedRoles.includes(userRole)
}
