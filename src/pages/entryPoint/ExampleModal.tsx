import { Modal } from '@mui/material';
import React from 'react';
import { QueryTemplate, TemplatesArray } from '../queryBuilder/templatedQueries/types';
import examples from '../queryBuilder/templatedQueries/templates.json';

import './EntryPoint.css';
import {
  TemplateNodePart,
  TemplatePart,
} from '../queryBuilder/templatedQueries/TemplateQueriesModal';
import { useQueryBuilderContext } from '../../context/queryBuilder';
import { useNavigate } from '@tanstack/react-router';

interface ExampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
}
interface ExampleStructure {
  nodes: Record<string, { name: string; category: string; id?: string }>;
  edges: Record<string, { subject: string; object: string; predicate: string }>;
}

interface ExampleTemplate {
  type: string;
  tags?: string;
  template: TemplatePart[];
  structure: ExampleStructure;
}

function ExampleModal({ isOpen, onClose, onCancel }: ExampleModalProps) {
  const queryBuilder = useQueryBuilderContext();
  const navigate = useNavigate();

  const [selectedExamples, setSelectedExamples] = React.useState<QueryTemplate>(
    {} as QueryTemplate
  );
  const exampleQueries = (examples as unknown as TemplatesArray).filter(
    (example) => example.type === 'example'
  );
  const onModalClose = () => {
    setSelectedExamples({} as QueryTemplate);
    onCancel();
    onClose();
  };

  function exampleToTrapiFormat(example: ExampleTemplate) {
    const templateNodes = example.template
      .filter((part): part is TemplateNodePart => part.type === 'node')
      .reduce((obj, { id }) => ({ ...obj, [id]: { categories: [] } }), {} as Record<string, any>);

    const structureNodes = Object.entries(example.structure.nodes).reduce(
      (obj, [id, n]) => ({
        ...obj,
        [id]: { categories: [n.category], name: n.name, ...(n.id && { ids: [n.id] }) },
      }),
      {} as Record<string, any>
    );

    const nodesSortedById = Object.entries({ ...templateNodes, ...structureNodes })
      .sort(([a], [b]) => a.localeCompare(b))
      .reduce((obj, [id, n]) => ({ ...obj, [id]: n }), {} as Record<string, any>);

    const edges = Object.entries(example.structure.edges).reduce(
      (obj, [id, e]) => ({
        ...obj,
        [id]: { subject: e.subject, object: e.object, predicates: [e.predicate] },
      }),
      {} as Record<string, any>
    );

    return {
      message: {
        query_graph: {
          nodes: nodesSortedById,
          edges,
        },
      },
    };
  }

  const handleSelectExample = (example: any) => {
    const payload = exampleToTrapiFormat(example as ExampleTemplate);
    queryBuilder.dispatch({ type: 'saveGraph', payload });
  };

  const createTemplateDisplay = (template: TemplatePart[]) => {
    return (
      <span>
        {template.map((part, i) => {
          if (part.type === 'text') {
            return <span key={i}>{part.text}</span>;
          }
          if (part.type === 'node') {
            return <code key={i}>{part.name}</code>;
          }
          return null;
        })}
      </span>
    );
  };
  return (
    <Modal open={isOpen} onClose={onModalClose}>
      <div
        style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          maxWidth: '500px',
          margin: 'auto',
          marginTop: '100px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <img src="/react-icons/fiBookOpen.svg" alt="Example" />
          <h3 style={{ margin: '0 0 0 12px', fontWeight: 500 }}>Start with an example</h3>
        </div>
        <p style={{ color: '#5E5E5E', fontSize: '14px', margin: '8px 0 0 0' }}>
          Select one of the existing queries from our set of examples provided
        </p>
        {exampleQueries.map((query) => (
          <div
            key={query.id}
            className={`example-box ${selectedExamples.id === query.id ? 'example-box-selected' : 'example-box-unselected'}`}
            onClick={() => {
              setSelectedExamples(query);
              handleSelectExample(query);
            }}
          >
            <h4 style={{ fontWeight: 500, margin: 0 }}>{createTemplateDisplay(query.template)}</h4>
            <p style={{ margin: 0, color: '#5E5E5E', fontSize: '14px', marginTop: '4px' }}>
              Short description about the query
            </p>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'end', marginTop: '32px', gap: '8px' }}>
          <button onClick={onModalClose} className="button-cancel">
            Cancel
          </button>
          <button
            onClick={() => navigate({ to: '/question-builder' })}
            className="button-default"
            disabled={!selectedExamples.id}
          >
            Run Query
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ExampleModal;
