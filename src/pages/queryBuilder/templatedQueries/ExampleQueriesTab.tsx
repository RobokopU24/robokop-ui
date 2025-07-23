import React, { useState } from 'react';
import examples from './templates.json';
import {
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  Input,
  Box,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TemplateNodePart, TemplatePart } from './TemplateQueriesModal';
import './exampleQueryTab.css';
import NodeSelector from '../textEditor/textEditorRow/NodeSelector';
import { useQueryBuilderContext } from '../../../context/queryBuilder';
import { NodeOption } from '../textEditor/types';

interface NodeInfo {
  name: string;
  category: string[];
  ids?: string[];
  taxa?: string[];
}

interface SubExample {
  [nodeKey: string]: NodeInfo;
}

interface SubExampleProps {
  subExample: SubExample;
  mainNodesTemplate: TemplatePart[];
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

function ExampleQueriesTab() {
  const queryBuilder = useQueryBuilderContext();
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [exampleSearch, setExampleSearch] = useState('');
  const handleChange = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false);
  };
  const editNode = (id: string, node: NodeOption | null) => {
    queryBuilder.dispatch({ type: 'editNode', payload: { id, node } });
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
  const handleSubExampleSelect = (subExample: SubExample) => {
    const nodes = Object.entries(subExample).map(([id, node]) => ({ id, node }));
    nodes.forEach(({ id, node }) => {
      queryBuilder.dispatch({ type: 'editNode', payload: { id, node } });
    });
  };
  function createTemplateDisplay(template: TemplatePart[]) {
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

  const SubExample = ({ subExample, mainNodesTemplate }: SubExampleProps) => {
    const getNodes = () => {
      // return the name of the nodes in the template
      return mainNodesTemplate.filter((node) => node.type === 'node').map((node) => node.name);
    };
    const nodeHeaders = getNodes();
    console.log(nodeHeaders, 'nodeHeaders');
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
  return (
    <div>
      <Input
        placeholder="Search examples"
        fullWidth
        value={exampleSearch}
        onChange={(e) => setExampleSearch(e.target.value)}
      />
      {examples.map((example, index) =>
        example.type === 'template' ? (
          <Accordion
            expanded={expanded === `panel${index + 1}`}
            onChange={handleChange(`panel${index + 1}`)}
            key={index}
            sx={{
              boxShadow: 'none',
              borderTop: '1px solid #e0e0e0',
            }}
          >
            <AccordionSummary
              aria-controls={`panel${index + 1}d-content`}
              id={`panel${index + 1}d-header`}
              expandIcon={<ExpandMoreIcon />}
              sx={{ my: 0 }}
              onClick={() => handleSelectExample(example)}
            >
              <Typography component="span" mb={0}>
                {createTemplateDisplay(example.template as TemplatePart[])}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List sx={{ py: 0 }}>
                {example.sub_examples &&
                  example.sub_examples.map((subExample, subIndex) => (
                    <ListItem
                      key={subIndex}
                      sx={{ p: 0, ml: 2, borderBottom: '1px solid #e0e0e0' }}
                    >
                      <ListItemText
                        sx={{ p: 0, m: 0 }}
                        primary={
                          <SubExample
                            subExample={subExample}
                            mainNodesTemplate={example.template as TemplatePart[]}
                          />
                        }
                      />
                    </ListItem>
                  ))}
                <ListItem sx={{ py: 0 }}>
                  {example.template.map((part: any, i) => {
                    if (part.type === 'node' && queryBuilder.query_graph.nodes[part.id!]) {
                      return (
                        <div key={i}>
                          <NodeSelector
                            id={part.id!}
                            title={part.name}
                            size="small"
                            properties={queryBuilder.query_graph.nodes[part.id!]}
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
                  })}
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
        ) : (
          <ListItem
            key={index}
            sx={{
              cursor: 'pointer',
              borderTop: '1px solid #e0e0e0',
              '&:hover': { backgroundColor: '#f0f0f0' },
            }}
            onClick={() => handleSelectExample(example)}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography>
                    {createTemplateDisplay(example.template as TemplatePart[])}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        )
      )}
    </div>
  );
}

export default ExampleQueriesTab;
