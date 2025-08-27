import { Modal } from '@mui/material';
import React, { useEffect } from 'react';
import { QueryTemplate, TemplatesArray } from '../queryBuilder/templatedQueries/types';
// import examples from '../queryBuilder/templatedQueries/templates.json';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  Box,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

import './EntryPoint.css';
import {
  TemplateNodePart,
  TemplatePart,
} from '../queryBuilder/templatedQueries/TemplateQueriesModal';
import { useQueryBuilderContext } from '../../context/queryBuilder';
import { useNavigate } from '@tanstack/react-router';
import NodeSelector from '../queryBuilder/textEditor/textEditorRow/NodeSelector';
import { NodeOption } from '../queryBuilder/textEditor/types';
import { SubExample, SubExampleProps } from '../queryBuilder/templatedQueries/ExampleQueryView';
import { parse } from 'yaml';

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

function TemplateModal({ isOpen, onClose, onCancel }: ExampleModalProps) {
  const [examples, setExamples] = React.useState<TemplatesArray>([]);
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/templates.yaml');
        const text = await res.text();
        const data = parse(text) as TemplatesArray;
        setExamples(data);
      } catch (e: any) {
        console.log(e.message);
      }
    })();
  }, []);
  const queryBuilder = useQueryBuilderContext();
  const navigate = useNavigate();

  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState<any>(null);
  const [isTemplateComplete, setIsTemplateComplete] = React.useState(false);

  const templateQueries = (examples as unknown as TemplatesArray).filter(
    (example) => example.type === 'template'
  );
  const handleChange = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false);
  };
  const onModalClose = () => {
    setExpanded(false);
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
    setSelectedTemplate(example);
  };

  const editNode = (id: string, node: NodeOption | null) => {
    queryBuilder.dispatch({ type: 'editNode', payload: { id, node } });
  };

  const checkTemplateCompletion = () => {
    if (!selectedTemplate) {
      setIsTemplateComplete(false);
      return;
    }

    const templateNodes = selectedTemplate.template.filter((part: any) => part.type === 'node');
    const allNodesFilled = templateNodes.every((nodePart: any) => {
      const nodeId = nodePart.id;
      const nodeData = queryBuilder.query_graph.nodes[nodeId];
      return (
        nodeData &&
        ((nodeData.ids && nodeData.ids.length > 0) ||
          (nodeData.categories && nodeData.categories.length > 0))
      );
    });

    setIsTemplateComplete(allNodesFilled);
  };

  useEffect(() => {
    checkTemplateCompletion();
  }, [queryBuilder.query_graph]);

  const SubExample = ({ subExample, mainNodesTemplate }: SubExampleProps) => {
    const handleSubExampleSelect = (subExample: SubExample) => {
      const nodes = Object.entries(subExample).map(([id, node]) => ({ id, node }));
      nodes.forEach(({ id, node }) => {
        queryBuilder.dispatch({ type: 'editNode', payload: { id, node } });
      });
      setIsTemplateComplete(true);
    };
    const getNodes = () => {
      // return the name of the nodes in the template
      return mainNodesTemplate.filter((node) => node.type === 'node').map((node) => node.name);
    };
    const nodeHeaders = getNodes();
    return (
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          py: 1,
          '&:hover': { backgroundColor: '#f5f5f5', cursor: 'pointer' },
        }}
        onClick={() => handleSubExampleSelect(subExample)}
      >
        {Object.entries(subExample).map(([nodeKey, nodeInfo], index) => (
          <Box key={nodeKey} flex={1}>
            <code>{nodeHeaders[index] || nodeInfo.category}</code>
            <Typography variant="body2">{nodeInfo.name}</Typography>
          </Box>
        ))}
      </Box>
    );
  };

  const createTemplateDisplay = (template: TemplatePart[], isExpanded: boolean) => {
    if (isExpanded) {
      return template.map((part, i) => {
        if (part.type === 'text') {
          return (
            <span key={i} style={{ fontSize: '16px', lineHeight: 2 }}>
              {part.text}
            </span>
          );
        }
        if (part.type === 'node') {
          return (
            <div
              key={i}
              style={{
                maxWidth: '300px',
                display: 'inline-flex',
                transform: 'translateY(-16px)',
              }}
            >
              <NodeSelector
                id={part.id}
                title={part.name}
                size="small"
                properties={queryBuilder.query_graph.nodes[part.id]}
                nameresCategoryFilter={part.filterType}
                update={editNode}
                isReference={false}
                setReference={() => {}}
                options={{
                  includeCuries: true,
                  includeCategories: false,
                  includeExistingNodes: false,
                }}
              />
            </div>
          );
        }
        if (part.type === 'json_text') {
          return <pre id="resultJSONContainer">{part.text}</pre>;
        }
        return null;
      });
    } else {
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
    }
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
          <img src="/react-icons/cgTemplate.svg" alt="Example" />
          <h3 style={{ margin: '0 0 0 12px', fontWeight: 500 }}>Choose from Templates</h3>
        </div>
        <p style={{ color: '#5E5E5E', fontSize: '14px', margin: '8px 0 0 0' }}>
          Use any of the customizable templates available from the list
        </p>
        {templateQueries.map((query, index) => (
          <Accordion
            key={query.id}
            className={`example-box example-box-unselected`}
            expanded={expanded === `panel${index + 1}`}
            onChange={handleChange(`panel${index + 1}`)}
            sx={{
              borderRadius: '8px',
              padding: 0,
            }}
          >
            <AccordionSummary
              aria-controls={`panel${index + 1}d-content`}
              id={`panel${index + 1}d-header`}
              expandIcon={<ExpandMoreIcon />}
              sx={{ m: 0, p: 0, borderRadius: '8px', border: 'none' }}
              onClick={() => handleSelectExample(query)}
            >
              <div style={{ margin: 0, padding: '8px' }}>
                <h4
                  style={{
                    fontWeight: 500,
                    margin: 0,
                    fontFamily: 'Roboto',
                    fontSize: '16px',
                    lineHeight: 1.5,
                  }}
                >
                  {createTemplateDisplay(query.template, expanded === `panel${index + 1}`)}
                </h4>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <List sx={{ py: 0 }}>
                {query.sub_examples &&
                  query.sub_examples.map((subExample, subIndex) => (
                    <ListItem
                      key={subIndex}
                      sx={{ p: 0, ml: 2, borderBottom: '1px solid #e0e0e0' }}
                    >
                      <ListItemText
                        sx={{ p: 0, m: 0 }}
                        primary={
                          <SubExample
                            subExample={subExample}
                            mainNodesTemplate={query.template as TemplatePart[]}
                          />
                        }
                      />
                    </ListItem>
                  ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
        <div style={{ display: 'flex', justifyContent: 'end', marginTop: '32px', gap: '8px' }}>
          <button onClick={onModalClose} className="button-cancel">
            Cancel
          </button>
          <button
            onClick={() => {
              setExpanded(false);
              onClose();
              navigate({ to: '/question-builder' });
            }}
            className="button-default"
            disabled={!isTemplateComplete}
          >
            Select Query
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default TemplateModal;
