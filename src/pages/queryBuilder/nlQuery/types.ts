import { NodeOption, QueryGraph } from '../textEditor/types'

export interface GroundedNode {
  key: string
  mention: string | null
  node: NodeOption
  alternatives: NodeOption[]
  ambiguous: boolean
  unresolved: boolean
}

export interface SchemaValidation {
  schema_id: string | null
  fetched_at: string
  valid: boolean
  inheritance_aware: boolean
  grounded_categories_adjusted: number
  warnings: string[]
}

export interface FillResult {
  queryGraph: QueryGraph
  grounded: GroundedNode[]
  source: 'llm'
  schemaValidation?: SchemaValidation
}
