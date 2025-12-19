import strings from '../../../utils/strings';

interface BiolinkPredicate {
  predicate: string;
  symmetric: boolean;
}

export function graphQueryContext(graph: unknown, predicates: BiolinkPredicate[] = []): string {
  const symmetricPredicates = predicates
    .filter((predicate) => predicate.symmetric)
    .map((predicate) => predicate.predicate);

  const g = graph as {
    nodes: Record<string, { name?: string; categories?: string[] }>;
    edges: Record<string, { subject: string; object: string; predicates?: string[] }>;
  };

  if (!g?.nodes || !g?.edges) {
    return 'Each row represents a knowledge-graph pattern connecting multiple entities.';
  }

  const lines: string[] = [];

  Object.values(g.edges).forEach((edge) => {
    console.log('edge', edge);
    const edgeSubject = edge.subject;
    const edgeObject = edge.object;
    const subj = g.nodes[edgeSubject];
    const obj = g.nodes[edgeObject];

    const subjectLabel =
      subj?.name ?? (strings.displayCategory(subj?.categories?.[0] ?? '') || edgeSubject);
    const objectLabel =
      obj?.name ?? (strings.displayCategory(obj?.categories?.[0] ?? '') || edgeObject);

    const rawPredicate = edge.predicates?.[0] ?? 'biolink:related_to';
    const predicate = strings.displayPredicate(rawPredicate) || 'related to';

    const isSymmetric = symmetricPredicates.includes(rawPredicate);
    const arrow = isSymmetric ? '<--' : '--';

    lines.push(
      `- [${edgeSubject}] (${subjectLabel}) ${arrow}${predicate}-->  [${edgeObject}] (${objectLabel})`
    );
  });

  return (
    `Each row in the table corresponds to a knowledge-graph pattern defined by the following relationships:\n` +
    lines.join('\n')
  );
}
