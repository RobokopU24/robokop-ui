import { llmRoutes } from '../../../API/routes'
import { NodeOption, QueryGraph } from '../textEditor/types'
import { extractSlotsHeuristic } from './extractSlots'
import { FillResult, GroundedNode, SchemaValidation } from './types'
import fetchCuries from '../../../utils/fetchCuries'
import strings from '../../../utils/strings'
import axios from 'axios'

const { CancelToken } = axios

type AlertFn = (severity: 'success' | 'error' | 'info' | 'warning', message: string) => void

function unboundNode(category: string, mention?: string | null): NodeOption {
  return {
    name: mention || strings.displayCategory(category) || 'Something',
    categories: [category],
  }
}

async function heuristicFill(question: string, displayAlert: AlertFn): Promise<FillResult> {
  const extracted = extractSlotsHeuristic(question)
  const grounded: GroundedNode[] = await Promise.all(
    extracted.nodes.map(async (node) => {
      if (!node.pinned || !node.mention) {
        return {
          key: node.key,
          mention: node.mention,
          node: unboundNode(node.category, node.mention),
          alternatives: [],
          ambiguous: false,
          unresolved: false,
        }
      }
      const hits = await fetchCuries(
        node.mention,
        displayAlert as (severity: string, message: string) => void,
        CancelToken.source().token,
        node.category !== 'biolink:NamedThing' ? node.category : undefined,
      )
      if (!hits.length) {
        return {
          key: node.key,
          mention: node.mention,
          node: unboundNode(node.category, node.mention),
          alternatives: [],
          ambiguous: false,
          unresolved: true,
        }
      }
      return {
        key: node.key,
        mention: node.mention,
        node: hits[0],
        alternatives: hits.slice(1, 5),
        ambiguous: hits.length > 1,
        unresolved: false,
      }
    }),
  )

  const nodes: QueryGraph['nodes'] = {}
  grounded.forEach((item) => {
    nodes[item.key] = item.node
  })
  const edges: QueryGraph['edges'] = {}
  extracted.edges.forEach((edge, index) => {
    edges[`e${index}`] = {
      subject: edge.subject,
      object: edge.object,
      predicates: [edge.predicate],
    }
  })

  return { queryGraph: { nodes, edges }, grounded, source: 'heuristic' }
}

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
  displayAlert: AlertFn
}): Promise<FillResult> {
  const hasAuth = Boolean(options.authHeaders.Authorization)
  if (hasAuth) {
    try {
      const response = await fetch(llmRoutes.nlToQuery, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.authHeaders,
        },
        body: JSON.stringify({ question: options.question }),
      })
      if (response.ok) {
        const data = await response.json()
        const queryGraph = data?.query_graph as QueryGraph | undefined
        const grounded = asGrounded(data?.grounded)
        if (queryGraph?.nodes && queryGraph?.edges && grounded.length) {
          return {
            queryGraph,
            grounded,
            schemaValidation: data?.schema_validation as SchemaValidation | undefined,
            source:
              data?.source === 'heuristic'
                ? 'heuristic'
                : data?.source === 'pathway'
                  ? 'pathway'
                  : 'llm',
          }
        }
      } else if (response.status === 401 || response.status === 403) {
        options.displayAlert(
          'info',
          'Log in to fill questions with AI. Using a basic fill for now.',
        )
      }
    } catch (error) {
      console.error('[nl-to-query] backend fill failed', error)
    }
  }

  return heuristicFill(options.question, options.displayAlert)
}
