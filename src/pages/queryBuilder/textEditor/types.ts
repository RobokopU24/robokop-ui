// Shared types for textEditor and its subfolders

// Types for the biolink model (partial, as used here)
export interface BiolinkModel {
  classes: {
    lookup: Map<string, any>;
  };
  slots: {
    lookup: Map<string, any>;
    has: (key: string) => boolean;
  };
  enums: Record<string, any>;
  associations: any;
  qualifiers: any;
}

// Types for the query builder context
export interface QueryGraphNode {
  categories?: string[];
  [key: string]: any;
}

export interface QueryGraphEdge {
  subject?: string;
  object?: string;
  predicates?: string[];
  qualifier_constraints?: Array<{
    qualifier_set: Array<{ qualifier_type_id: string; qualifier_value: string }>;
  }>;
  [key: string]: any;
}

export interface QueryGraph {
  nodes: Record<string, QueryGraphNode>;
  edges: Record<string, QueryGraphEdge>;
}

export interface QueryBuilderContextType {
  state: {
    message: {
      message: {
        query_graph: QueryGraph;
      };
    };
    rootNode: string | null;
    isValid: boolean;
    errMessage: string;
  };
  query_graph: QueryGraph;
  dispatch: (action: { type: string; payload: any }) => void;
  textEditorRows?: TextEditorRowProps[];
}

// Types for the Biolink context
export interface BiolinkContextType {
  model?: BiolinkModel;
  colorMap?: (categories: string | string[]) => [string | null, string];
  hierarchies?: Record<string, any>;
  predicates?: BiolinkPredicate[];
  ancestorsMap?: Record<string, string[]>;
}

export interface BiolinkPredicate {
  predicate: string;
  domain: string;
  range: string;
  symmetric: boolean;
}

// Types for the row prop
export interface TextEditorRowProps {
  edgeId: string;
  subjectIsReference: boolean;
  objectIsReference: boolean;
}

// Add NodeOption type
export interface NodeOption {
  name: string;
  key?: string | null;
  ids?: string[];
  categories?: string[];
  taxa?: string[];
  is_set?: boolean;
}
