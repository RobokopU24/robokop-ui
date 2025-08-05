interface TemplateTextPart {
  type: 'text';
  text: string;
}

interface TemplateNodePart {
  type: 'node';
  id: string;
  name: string;
  filterType: string;
}

export type TemplatePart = TemplateTextPart | TemplateNodePart;

export interface SubExampleNode {
  name: string;
  category: string[];
  ids: string[];
  taxa: string[];
}

export interface SubExample {
  [nodeKey: string]: SubExampleNode;
}

export interface StructureNode {
  name: string;
  category: string;
  id?: string;
}

export interface StructureEdge {
  subject: string;
  object: string;
  predicate: string;
}

export interface QueryStructure {
  nodes: Record<string, StructureNode>;
  edges: Record<string, StructureEdge>;
}

export interface TemplateQuery {
  type: 'template';
  id: number;
  tags: string;
  template: TemplatePart[];
  sub_examples?: SubExample[];
  structure: QueryStructure;
}

export interface ExampleQuery {
  type: 'example';
  id: number;
  template: TemplatePart[];
  structure: QueryStructure;
}

export type QueryTemplate = TemplateQuery | ExampleQuery;

export type TemplatesArray = QueryTemplate[];
