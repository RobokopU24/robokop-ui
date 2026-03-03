import { GraphSchemaV2 } from "../../API/graphMetadata";

interface Node {
  id: string;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

interface LinksOutput {
  nodes: Node[];
  links: Link[];
}

export function transformSchemaToLinks(schema: GraphSchemaV2): LinksOutput {
  const links: Link[] = [];
  const nodesSet = new Set<string>();

  const predicatesByKnowledgeSource = schema.schema.edges_summary.predicates_by_knowledge_source;

  for (const [source, predicates] of Object.entries(predicatesByKnowledgeSource)) {
    nodesSet.add(source);
    for (const [target, value] of Object.entries(predicates)) {
      nodesSet.add(target);
      links.push({
        source,
        target,
        value,
      });
    }
  }
  links.sort((a, b) => b.value - a.value);
  return { nodes: Array.from(nodesSet).map((id) => ({ id })), links };
}

export const getAttributesAndCounts = (metadata: GraphSchemaV2["schema"]["edges"]) => {
  const attributesCount: Record<string, number> = {};

  metadata.forEach((edge) => {
    for (const [attribute, count] of Object.entries(edge.attributes)) {
      if (!attributesCount[attribute]) {
        attributesCount[attribute] = 0;
      }
      attributesCount[attribute] += count;
    }
    for (const [qualifier, count] of Object.entries(edge.qualifiers)) {
      if (!attributesCount[qualifier]) {
        attributesCount[qualifier] = 0;
      }
      attributesCount[qualifier] += count;
    }
  });

  return Object.entries(attributesCount).map(([name, value]) => ({ name, value }));
};
