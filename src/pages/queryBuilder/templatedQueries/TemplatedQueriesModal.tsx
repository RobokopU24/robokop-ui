import React, { useContext, useEffect, useState } from 'react';
import NodeSelector from '../textEditor/textEditorRow/NodeSelector';
import { authApi } from '../../../API/baseUrlProxy';
import examples from './templates.json';

import {
  Button,
  Chip,
  Divider,
  IconButton,
  List,
  ListItemText,
  ListSubheader,
  Modal,
  ListItemButton,
} from '@mui/material';
import Close from '@mui/icons-material/Close';
import { useQueryBuilderContext } from '../../../context/queryBuilder';
import API from '../../../API/routes';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { QueryBuilderContextType, NodeOption, QueryGraph } from '../textEditor/types';

// Types for template/example structure
interface TemplateTextPart {
  type: 'text';
  text: string;
  // Allow extra properties for compatibility with imported JSON
  [key: string]: any;
}
interface TemplateNodePart {
  type: 'node';
  id: string;
  name: string;
  filterType?: string;
  [key: string]: any;
}
interface TemplateJsonTextPart {
  type: 'json_text';
  text: string;
  [key: string]: any;
}
type TemplatePart = TemplateTextPart | TemplateNodePart | TemplateJsonTextPart;

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

interface BookmarkedQuery {
  id: string;
  name: string;
  createdAt: string;
  query: {
    message: {
      query_graph: QueryGraph;
    };
  };
}

const useStyles = makeStyles((theme: Theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    display: 'flex',
    flexDirection: 'row',
    width: 1200,
    height: 900,
    borderRadius: '8px',
  },
}));

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

function PleaseSelectAnExampleText() {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2.5rem',
        fontStyle: 'italic',
        color: '#acacac',
      }}
    >
      Please select an example from the list
    </div>
  );
}

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

interface TemplatedQueriesModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function TemplatedQueriesModal({ open, setOpen }: TemplatedQueriesModalProps) {
  const classes = useStyles();
  const queryBuilder = useQueryBuilderContext();
  const [selectedExample, setSelectedExample] = useState<ExampleTemplate | null>(null);
  const [queries, setQueries] = useState<BookmarkedQuery[]>([]);
  const handleClose = () => {
    setOpen(false);
    setSelectedExample(null);
  };

  const handleSelectExample = (example: any) => {
    // Accept any, but cast to ExampleTemplate for dispatch
    setSelectedExample(example as ExampleTemplate);
    const payload = exampleToTrapiFormat(example as ExampleTemplate);
    queryBuilder.dispatch({ type: 'saveGraph', payload });
  };

  const editNode = (id: string, node: NodeOption | null) => {
    queryBuilder.dispatch({ type: 'editNode', payload: { id, node } });
  };

  const handleSelectBookmarkedQuery = (query_graph: BookmarkedQuery) => {
    const example: ExampleTemplate = {
      type: 'example',
      template: [
        {
          text: JSON.stringify(query_graph.query.message.query_graph, null, 2),
          type: 'json_text',
        } as TemplateJsonTextPart,
      ],
      structure: { nodes: {}, edges: {} },
    };
    setSelectedExample(example);
    queryBuilder.dispatch({ type: 'saveGraph', payload: query_graph.query });
  };

  useEffect(() => {
    authApi
      .get(API.queryRoutes.base)
      .then((response) => {
        setQueries(response.data);
      })
      .catch(() => {
        // TODO: Handle error appropriately
      });
  }, [open]);

  return (
    <Modal open={open} onClose={handleClose} className={classes.modal}>
      <div className={classes.paper}>
        <List
          style={{ flexBasis: 350, overflowY: 'auto' }}
          subheader={
            <ListSubheader
              component="div"
              style={{
                background: 'white',
                borderBottom: '2px solid rgba(0, 0, 0, 0.12)',
              }}
            >
              Please select an example below
            </ListSubheader>
          }
        >
          {(examples as any[]).map((example, i: number) => (
            <ListItemButton
              divider
              key={i}
              onClick={() => {
                handleSelectExample(example);
              }}
            >
              <ListItemText
                primary={
                  <>
                    {example.tags && (
                      <>
                        <Chip size="small" label={example.tags} />{' '}
                      </>
                    )}
                    {createTemplateDisplay(example.template as TemplatePart[])}
                  </>
                }
              />
            </ListItemButton>
          ))}
          {queries.map((query, i) => (
            <ListItemButton
              divider
              key={i}
              onClick={() => {
                handleSelectBookmarkedQuery(query);
              }}
            >
              <ListItemText
                primary={
                  <>
                    <Chip size="small" label="Bookmarked" color="secondary" /> {query.name}
                  </>
                }
              />
            </ListItemButton>
          ))}
        </List>
        <Divider orientation="vertical" flexItem />
        <div
          style={{
            display: 'flex',
            flex: '1',
            padding: '1rem',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <IconButton size="small" onClick={handleClose}>
              <Close />
            </IconButton>
          </div>
          <div style={{ flex: '1' }}>
            {selectedExample === null ? (
              <PleaseSelectAnExampleText />
            ) : (
              selectedExample.template.map((part, i) => {
                if (part.type === 'text') {
                  return (
                    <span key={i} style={{ fontSize: '16px' }}>
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
                        marginLeft: '-1ch',
                        marginRight: '-1ch',
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
              })
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Button variant="contained" color="primary" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
