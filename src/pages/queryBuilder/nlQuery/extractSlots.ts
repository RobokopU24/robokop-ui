import strings from '../../../utils/strings'
import { ExtractedEdge, ExtractedNode, ExtractedQuery } from './types'

const DEFAULT_CATEGORY = 'biolink:NamedThing'
const DEFAULT_PREDICATE = 'biolink:related_to'

const CATEGORY_PATTERNS: Array<{ re: RegExp; category: string }> = [
  { re: /\bchemical entit(?:y|ies)\b/gi, category: 'biolink:ChemicalEntity' },
  { re: /\bchemical exposure\b/gi, category: 'biolink:ChemicalEntity' },
  { re: /\bchemicals?\b/gi, category: 'biolink:ChemicalEntity' },
  { re: /\bdrugs?\b/gi, category: 'biolink:Drug' },
  { re: /\bgenes?\b/gi, category: 'biolink:Gene' },
  { re: /\bproteins?\b/gi, category: 'biolink:Protein' },
  { re: /\bphenotypic features?\b/gi, category: 'biolink:PhenotypicFeature' },
  { re: /\bphenotypes?\b/gi, category: 'biolink:PhenotypicFeature' },
  { re: /\bbiolog(?:ical)? processes?\b/gi, category: 'biolink:BiologicalProcessOrActivity' },
  { re: /\bpathways?\b/gi, category: 'biolink:BiologicalProcessOrActivity' },
  { re: /\bdiseases?\b/gi, category: 'biolink:DiseaseOrPhenotypicFeature' },
  { re: /\bdisorders?\b/gi, category: 'biolink:DiseaseOrPhenotypicFeature' },
]

const PREDICATE_PATTERNS: Array<{ re: RegExp; predicate: string }> = [
  {
    re: /\b(treats?|ameliorate[sd]?|alleviate[sd]?|therap(?:y|ies|eutic))\b/i,
    predicate: 'biolink:treats',
  },
  { re: /\binteracts?\s+with\b/i, predicate: 'biolink:interacts_with' },
  { re: /\bgenetically\s+associated\b/i, predicate: 'biolink:genetically_associated_with' },
  { re: /\bassociated\s+with\b/i, predicate: 'biolink:associated_with' },
  { re: /\bregulat(?:e|es|ed|ion)\b/i, predicate: 'biolink:regulates' },
  { re: /\bcaus(?:e|es|ed|ing)\b/i, predicate: 'biolink:causes' },
  { re: /\brelated\s+to\b/i, predicate: DEFAULT_PREDICATE },
  { re: /\brelates?\b/i, predicate: DEFAULT_PREDICATE },
]

const STOPWORDS = new Set([
  'what',
  'which',
  'who',
  'that',
  'might',
  'may',
  'can',
  'could',
  'would',
  'should',
  'the',
  'a',
  'an',
  'and',
  'or',
  'of',
  'to',
  'for',
  'in',
  'on',
  'with',
  'between',
  'explain',
  'relationship',
  'find',
  'show',
  'list',
  'are',
  'is',
  'be',
  'been',
  'being',
  'please',
  'how',
  'does',
  'do',
  'any',
  'some',
  'other',
  'each',
  'another',
  'question',
])

export function normalizeCategory(raw: string | undefined | null): string {
  if (!raw) return DEFAULT_CATEGORY
  const value = raw.startsWith('biolink:') ? raw.slice('biolink:'.length) : raw
  return strings.nodeFromBiolink(value) || DEFAULT_CATEGORY
}

export function normalizePredicate(raw: string | undefined | null): string {
  if (!raw) return DEFAULT_PREDICATE
  const value = raw.startsWith('biolink:') ? raw.slice('biolink:'.length) : raw
  return strings.edgeFromBiolink(value) || DEFAULT_PREDICATE
}

function stripPatterns(text: string, patterns: RegExp[]): string {
  return patterns.reduce((acc, re) => acc.replace(re, ' '), text)
}

function cleanMention(value: string): string {
  return value
    .replace(/[?.!,;:]+$/g, '')
    .replace(/^(the|a|an)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function uniqueMentions(mentions: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  mentions.forEach((mention) => {
    const cleaned = cleanMention(mention)
    const key = cleaned.toLowerCase()
    if (!cleaned || STOPWORDS.has(key) || seen.has(key)) return
    seen.add(key)
    result.push(cleaned)
  })
  return result
}

function extractQuoted(text: string): string[] {
  return [...text.matchAll(/"([^"]+)"|'([^']+)'/g)].map((match) => match[1] || match[2] || '')
}

function extractPairedMentions(text: string): string[] {
  const match = text.match(/(?:between|relate|relates|related to)\s+(.+?)\s+and\s+(.+?)(?:[?.]|$)/i)
  if (!match) return []
  return [match[1], match[2]]
}

function extractRemainingMentions(text: string): string[] {
  const leftover = text
    .split(/\s+/)
    .filter((token) => token && !STOPWORDS.has(token.toLowerCase().replace(/[?.!,]/g, '')))
    .join(' ')
    .trim()
  if (!leftover) return []

  const capitalized = leftover.match(/[A-Z][A-Za-z0-9'/-]*(?:\s+[A-Z][A-Za-z0-9'/-]*)*/g) || []
  if (capitalized.length) return capitalized
  return [leftover]
}

export function extractSlotsHeuristic(question: string): ExtractedQuery {
  const categories = CATEGORY_PATTERNS.filter(({ re }) => {
    re.lastIndex = 0
    return re.test(question)
  }).map(({ category }) => category)

  const uniqueCategories = [...new Set(categories)]
  const predicate =
    PREDICATE_PATTERNS.find(({ re }) => re.test(question))?.predicate ?? DEFAULT_PREDICATE

  const withoutCategories = stripPatterns(
    question,
    CATEGORY_PATTERNS.map(({ re }) => re),
  )
  const withoutPredicates = stripPatterns(
    withoutCategories,
    PREDICATE_PATTERNS.map(({ re }) => re),
  )

  const mentions = uniqueMentions([
    ...extractQuoted(question),
    ...extractPairedMentions(question),
    ...extractRemainingMentions(withoutPredicates),
  ]).filter(
    (mention) =>
      !uniqueCategories.some(
        (category) => mention.toLowerCase() === category.replace('biolink:', '').toLowerCase(),
      ),
  )

  const wantsGeneBridge =
    uniqueCategories.includes('biolink:Gene') && mentions.length >= 2 && /relat/i.test(question)

  const nodes: ExtractedNode[] = []
  const edges: ExtractedEdge[] = []

  if (wantsGeneBridge) {
    nodes.push(
      { key: 'n0', mention: mentions[0], category: DEFAULT_CATEGORY, pinned: true },
      { key: 'n1', mention: null, category: 'biolink:Gene', pinned: false },
      { key: 'n2', mention: mentions[1], category: DEFAULT_CATEGORY, pinned: true },
    )
    edges.push(
      { subject: 'n0', object: 'n1', predicate },
      { subject: 'n1', object: 'n2', predicate },
    )
    return { nodes, edges }
  }

  const unboundCategory = uniqueCategories[0]
  if (unboundCategory && mentions.length >= 1) {
    nodes.push(
      { key: 'n0', mention: null, category: unboundCategory, pinned: false },
      {
        key: 'n1',
        mention: mentions[0],
        category: uniqueCategories[1] || DEFAULT_CATEGORY,
        pinned: true,
      },
    )
    edges.push({ subject: 'n0', object: 'n1', predicate })
    return { nodes, edges }
  }

  if (mentions.length >= 2) {
    nodes.push(
      {
        key: 'n0',
        mention: mentions[0],
        category: uniqueCategories[0] || DEFAULT_CATEGORY,
        pinned: true,
      },
      {
        key: 'n1',
        mention: mentions[1],
        category: uniqueCategories[1] || DEFAULT_CATEGORY,
        pinned: true,
      },
    )
    edges.push({ subject: 'n0', object: 'n1', predicate })
    return { nodes, edges }
  }

  if (mentions.length === 1) {
    nodes.push(
      {
        key: 'n0',
        mention: mentions[0],
        category: uniqueCategories[0] || DEFAULT_CATEGORY,
        pinned: true,
      },
      {
        key: 'n1',
        mention: null,
        category: uniqueCategories[1] || uniqueCategories[0] || DEFAULT_CATEGORY,
        pinned: false,
      },
    )
    edges.push({ subject: 'n0', object: 'n1', predicate })
    return { nodes, edges }
  }

  nodes.push(
    { key: 'n0', mention: null, category: uniqueCategories[0] || DEFAULT_CATEGORY, pinned: false },
    { key: 'n1', mention: null, category: uniqueCategories[1] || DEFAULT_CATEGORY, pinned: false },
  )
  edges.push({ subject: 'n0', object: 'n1', predicate })
  return { nodes, edges }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

export function parseExtractedQuery(raw: string): ExtractedQuery | null {
  const trimmed = raw.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced?.[1]?.trim() ?? trimmed
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(candidate.slice(start, end + 1))
  } catch {
    return null
  }

  const obj = asRecord(parsed)
  if (!obj) return null
  const nodeList = Array.isArray(obj.nodes) ? obj.nodes : []
  const edgeList = Array.isArray(obj.edges) ? obj.edges : []
  if (!nodeList.length || !edgeList.length) return null

  const nodes: ExtractedNode[] = nodeList.map((item, index) => {
    const node = asRecord(item) || {}
    const mentionRaw = node.mention ?? node.name
    const mention =
      typeof mentionRaw === 'string' &&
      mentionRaw.trim() &&
      mentionRaw.trim().toLowerCase() !== 'null'
        ? mentionRaw.trim()
        : null
    const pinned = typeof node.pinned === 'boolean' ? node.pinned : Boolean(mention)
    return {
      key: typeof node.key === 'string' && node.key ? node.key : `n${index}`,
      mention,
      category: normalizeCategory(typeof node.category === 'string' ? node.category : undefined),
      pinned,
    }
  })

  const nodeKeys = new Set(nodes.map((node) => node.key))
  const edges: ExtractedEdge[] = edgeList
    .map((item) => {
      const edge = asRecord(item) || {}
      return {
        subject: typeof edge.subject === 'string' ? edge.subject : '',
        object: typeof edge.object === 'string' ? edge.object : '',
        predicate: normalizePredicate(
          typeof edge.predicate === 'string' ? edge.predicate : undefined,
        ),
      }
    })
    .filter((edge) => nodeKeys.has(edge.subject) && nodeKeys.has(edge.object))

  if (!nodes.length || !edges.length) return null
  return { nodes, edges }
}
