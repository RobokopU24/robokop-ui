export interface MinimalNode {
  id: string;
  name: string;
  description?: string | null;
  category?: string[];
}

export interface MinimalEdge {
  subject: string;
  subject_id: string;
  predicate: string;
  object: string;
  object_id: string;
  qualifiers: Record<string, string>;
  evidence: string[];
  publications: string[];
  confidence: number | null;
}

export interface MinimalKGSummary {
  query_nodes: MinimalNode[];
  path: MinimalEdge[];
  overall_score: number;
}

export function transformKGToMinimalDynamic(jsonData: any): MinimalKGSummary {
  console.log('Transforming KG to Minimal Dynamic:', jsonData);
  if (!jsonData || typeof jsonData !== 'object') {
    return {
      query_nodes: [],
      path: [],
      overall_score: 0,
    };
  }

  const kg = jsonData.knowledge_graph ?? {};
  const nodes = kg.nodes ?? {};
  const edges = kg.edges ?? {};

  const results = jsonData.result ?? {};
  const nodeBindings = results.node_bindings ?? {};
  const analyses = results.analyses?.[0] ?? {};
  const edgeBindings = analyses.edge_bindings ?? {};
  const overallScore = results.score ?? 0;

  const query_nodes: MinimalNode[] = [];

  for (const key of Object.keys(nodeBindings)) {
    const bindingArr = nodeBindings[key] || [];

    for (const binding of bindingArr) {
      const nodeId = binding.id;
      const node = nodes[nodeId];

      if (!node) {
        // If KG does not contain the node, include minimal info
        query_nodes.push({
          id: nodeId,
          name: nodeId,
          description: null,
          category: [],
        });
        continue;
      }

      let description: string | null = null;
      if (node.attributes) {
        for (const attr of node.attributes) {
          if (
            attr.attribute_type_id === 'biolink:description' ||
            attr.attribute_type_id === 'dct:description'
          ) {
            description = attr.value;
          }
        }
      }

      query_nodes.push({
        id: nodeId,
        name: node.name ?? nodeId,
        description,
        category: node.categories ?? [],
      });
    }
  }

  const path: MinimalEdge[] = [];

  for (const edgeKey of Object.keys(edgeBindings)) {
    const boundEdges = edgeBindings[edgeKey] || [];

    for (const edgeRef of boundEdges) {
      const edgeId = edgeRef.id;
      const fullEdge = edges[edgeId];

      if (!fullEdge) continue;

      let evidence: string[] = [];
      let publications: string[] = [];
      let confidence: number | null = null;

      const qualifiers: Record<string, string> = {};

      if (fullEdge.attributes) {
        for (const attr of fullEdge.attributes) {
          if (attr.original_attribute_name === 'sentences') {
            evidence = (attr.value ?? '')
              .split('|NA|')
              .map((s: string) => s.trim())
              .filter(Boolean);
          }

          if (attr.attribute_type_id === 'biolink:publications') {
            publications = attr.value ?? [];
          }

          if (
            attr.original_attribute_name === 'tmkp_confidence_score' ||
            attr.original_attribute_name === 'score'
          ) {
            confidence = attr.value;
          }
        }
      }

      if (fullEdge.qualifiers) {
        for (const q of fullEdge.qualifiers) {
          qualifiers[q.qualifier_type_id] = q.qualifier_value;
        }
      }

      const subjectNode = nodes[fullEdge.subject];
      const objectNode = nodes[fullEdge.object];

      path.push({
        subject: subjectNode?.name ?? fullEdge.subject,
        subject_id: fullEdge.subject,
        predicate: fullEdge.predicate.replace('biolink:', ''),
        object: objectNode?.name ?? fullEdge.object,
        object_id: fullEdge.object,
        qualifiers,
        evidence,
        publications,
        confidence,
      });
    }
  }

  return {
    query_nodes,
    path,
    overall_score: overallScore,
  };
}
