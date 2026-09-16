import { llmRoutes } from '../../../API/routes'
import { NodeOption, QueryGraph } from '../textEditor/types'
import { FillResult, GroundedNode, SchemaValidation } from './types'

function asGrounded(raw: unknown): GroundedNode[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const rec = item as Record<string, unknown>
      const node = rec.node as NodeOption | undefined
      if (typeof rec.key !== 'string' || !node) return null
      return {
        key: rec.key,
        mention: typeof rec.mention === 'string' ? rec.mention : null,
        node,
        alternatives: Array.isArray(rec.alternatives) ? (rec.alternatives as NodeOption[]) : [],
        ambiguous: Boolean(rec.ambiguous),
        unresolved: Boolean(rec.unresolved),
      }
    })
    .filter((item): item is GroundedNode => Boolean(item))
}

export async function fillQueryFromEnglish(options: {
  question: string
  authHeaders: Record<string, string>
}): Promise<FillResult> {
  if (!options.authHeaders.Authorization) {
    throw new Error('Authentication is required to fill questions with AI')
  }

  const response = await fetch(llmRoutes.nlToQuery, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.authHeaders,
    },
    body: JSON.stringify({ question: options.question }),
  })

  if (!response.ok) {
    throw new Error(`AI question fill failed with status ${response.status}`)
  }

  const data = await response.json()
  if (data?.source !== 'llm') {
    throw new Error('AI question fill did not return an LLM-generated result')
  }

  const queryGraph = data?.query_graph as QueryGraph | undefined
  const grounded = asGrounded(data?.grounded)
  if (!queryGraph?.nodes || !queryGraph?.edges || !grounded.length) {
    throw new Error('AI question fill returned an invalid result')
  }

  return {
    queryGraph,
    grounded,
    schemaValidation: data?.schema_validation as SchemaValidation | undefined,
    source: 'llm',
  }
}
