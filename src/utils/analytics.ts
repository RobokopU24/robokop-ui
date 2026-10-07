import posthog from 'posthog-js'

type AnalyticsValue = string | number | boolean | null | undefined
type AnalyticsProperties = Record<string, AnalyticsValue>

/**
 * Capture product analytics without ever making analytics a dependency of a user flow.
 * Event properties should describe behavior and structure, not contain query text, CURIEs,
 * filenames, or other user-provided content.
 */
export function captureEvent(event: string, properties: AnalyticsProperties = {}) {
  if (!import.meta.env.VITE_PUBLIC_POSTHOG_KEY) return

  try {
    posthog.capture(event, properties)
  } catch (error) {
    if (import.meta.env.DEV) console.warn(`[analytics] Failed to capture ${event}`, error)
  }
}

export function getQueryGraphMetrics(queryGraph: any): AnalyticsProperties {
  const nodes = Object.values(queryGraph?.nodes ?? {}) as Array<{
    ids?: unknown[]
    categories?: unknown[]
  }>
  const edges = Object.values(queryGraph?.edges ?? {}) as Array<{
    predicates?: unknown[]
    qualifier_constraints?: unknown[]
  }>

  return {
    node_count: nodes.length,
    edge_count: edges.length,
    pinned_node_count: nodes.filter((node) => node.ids?.length).length,
    categorized_node_count: nodes.filter((node) => node.categories?.length).length,
    constrained_edge_count: edges.filter(
      (edge) => edge.predicates?.length || edge.qualifier_constraints?.length,
    ).length,
  }
}

export function getAnswerMetrics(message: any): AnalyticsProperties {
  return {
    result_count: Array.isArray(message?.results) ? message.results.length : 0,
    knowledge_node_count: Object.keys(message?.knowledge_graph?.nodes ?? {}).length,
    knowledge_edge_count: Object.keys(message?.knowledge_graph?.edges ?? {}).length,
    ...getQueryGraphMetrics(message?.query_graph),
  }
}
