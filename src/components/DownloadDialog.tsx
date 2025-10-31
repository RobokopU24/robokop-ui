import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
} from '@mui/material';
import Papa from 'papaparse';

const jsonToCsvString = (json: any[] | Papa.UnparseObject<unknown>) =>
  Promise.resolve(Papa.unparse(json));

const constructPmidOrPmcLink = (id: string) => {
  if (id.startsWith('PMID')) {
    return `https://pubmed.ncbi.nlm.nih.gov/${id.split(':')[1]}`;
  }
  if (id.startsWith('PMC')) {
    return `https://pmc.ncbi.nlm.nih.gov/articles/${id.split(':')[1]}`;
  }
  return '';
};

const getConcatPublicationsForResult = (
  result: { analyses: { edge_bindings: { [s: string]: unknown } | ArrayLike<unknown> }[] },
  message: { knowledge_graph: { edges: { [x: string]: any } } }
) => {
  const edgeIds = Object.values(result.analyses[0].edge_bindings)
    .flat()
    .map((e) => (e as { id: string }).id);
  const publications = edgeIds
    .flatMap((edgeId) =>
      message.knowledge_graph.edges[edgeId].attributes
        .filter(
          (attr: { attribute_type_id: string }) => attr.attribute_type_id === 'biolink:publications'
        )
        .flatMap((attr: { value: any }) => attr.value)
    )
    .map(constructPmidOrPmcLink);

  return publications;
};

const constructCsvObj = (message: {
  results: any[];
  knowledge_graph: {
    edges: { [x: string]: { subject: any; object: any; predicate: any; sources: any } };
    nodes: { [x: string]: any };
  };
}) => {
  const nodeLabelHeaders = Object.keys(message.results[0].node_bindings).flatMap((node_label) => [
    `${node_label} (Name)`,
    `${node_label} (CURIE)`,
  ]);

  let csvHeaderEdgeLabelsMerged = new Set();
  message.results.forEach(
    (result: {
      node_bindings: ArrayLike<unknown> | { [s: string]: unknown };
      analyses: { edge_bindings: { [s: string]: unknown } | ArrayLike<unknown> }[];
    }) => {
      const curieToNodeLabel: Record<string, string> = {};

      Object.entries(result.node_bindings).forEach(([nodeLabel, nb]) => {
        const curie = (nb as Array<{ id: string }>)[0].id;
        curieToNodeLabel[curie] = nodeLabel;
      });

      Object.values(result.analyses[0].edge_bindings)
        .flat()
        .forEach((eb) => {
          const { subject, object } = message.knowledge_graph.edges[(eb as { id: string }).id];
          const subjectLabel = curieToNodeLabel[subject];
          const objectLabel = curieToNodeLabel[object];
          const csvHeaderEdgeLabel = `${subjectLabel} -> ${objectLabel}`;
          if (subjectLabel && objectLabel) {
            // TODO: These were occasionally returning undefined, figure out why
            csvHeaderEdgeLabelsMerged.add(csvHeaderEdgeLabel);
          }
        });
    }
  );
  const csvHeaderEdgeLabelsMergedArray = Array.from(csvHeaderEdgeLabelsMerged);

  const header = [...nodeLabelHeaders, ...csvHeaderEdgeLabelsMergedArray, 'Score', 'Publications'];

  const body = message.results.map(
    (result: {
      node_bindings: ArrayLike<unknown> | { [s: string]: unknown };
      analyses: { edge_bindings: { [s: string]: unknown } | ArrayLike<unknown> }[];
      score: any;
    }) => {
      const row = new Array(header.length).fill('');
      const curieToNodeLabel: Record<string, string> = {};
      Object.entries(result.node_bindings).forEach(([nodeLabel, nb], i) => {
        const curie = (nb as Array<{ id: string }>)[0].id;
        curieToNodeLabel[curie] = nodeLabel;
        const node = message.knowledge_graph.nodes[curie];
        row[i * 2] = node.name || node.categories[0];
        row[i * 2 + 1] = curie;
      });

      Object.values(result.analyses[0].edge_bindings)
        .flat()
        .forEach((eb) => {
          const { subject, object, predicate, sources } =
            message.knowledge_graph.edges[(eb as { id: string }).id];
          const subjectLabel = curieToNodeLabel[subject];
          const objectLabel = curieToNodeLabel[object];
          if (subjectLabel && objectLabel) {
            const csvHeaderEdgeLabel = `${curieToNodeLabel[subject]} -> ${curieToNodeLabel[object]}`;
            const edgeHeaderIndex = header.findIndex((h) => h === csvHeaderEdgeLabel);
            const primarySourceObj = sources.find(
              (s: { resource_role: string }) => s.resource_role === 'primary_knowledge_source'
            );
            const primarySource = (primarySourceObj && primarySourceObj.resource_id) || undefined;
            row[edgeHeaderIndex] += `${row[edgeHeaderIndex].length > 0 ? '\n' : ''}${predicate}${
              primarySource ? ` (${primarySource})` : ''
            }`;
          }
        });

      row[row.length - 2] = result.score;
      row[row.length - 1] = getConcatPublicationsForResult(result, message).join('\n');

      return row;
    }
  );

  return [header, ...body];
};

type DownloadDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  message: any;
  download_type?: 'answer' | 'all_queries' | 'query';
};

export default function DownloadDialog({
  open,
  setOpen,
  message,
  download_type = 'answer',
}: DownloadDialogProps) {
  const [type, setType] = React.useState('json');
  const [fileName, setFileName] = React.useState('ROBOKOP_message');

  const handleClose = () => {
    setOpen(false);
  };

  const handleClickDownload = async () => {
    let blob;
    if (type === 'json') {
      blob = new Blob([JSON.stringify({ message }, null, 2)], { type: 'application/json' });
    }
    if (type === 'csv') {
      const csvString = await jsonToCsvString(constructCsvObj(message));
      blob = new Blob([csvString], { type: 'text/csv' });
    }

    if (!blob) {
      // If blob is undefined, do not proceed
      handleClose();
      return;
    }
    const a = document.createElement('a');
    a.download = `${fileName}.${type}`;
    a.href = window.URL.createObjectURL(blob);
    document.body.appendChild(a);
    a.click();
    a.remove();
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="alert-dialog-title">
      <DialogTitle id="alert-dialog-title">Download Answer</DialogTitle>
      <DialogContent style={{ width: 600, paddingTop: '1rem' }}>
        <TextField
          label={
            ['answer', 'all_queries'].includes(download_type) ? 'File name' : 'Query Graph Name'
          }
          // fullWidth
          variant="outlined"
          style={{ marginBottom: '1rem', width: '90%' }}
          value={fileName}
          onChange={(e) => {
            setFileName(e.target.value);
          }}
        />

        {
          // Show the radio group only when the download type is answers.
          download_type === 'answer' && (
            <FormControl component="fieldset">
              <RadioGroup
                aria-label="gender"
                name="gender1"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                }}
              >
                <FormControlLabel value="json" control={<Radio />} label="JSON" />
                <FormControlLabel value="csv" control={<Radio />} label="CSV" />
              </RadioGroup>
            </FormControl>
          )
        }

        {type === 'csv' && (
          <DialogContentText style={{ fontSize: '1em' }}>
            The CSV download contains a smaller subset of the answer information. To analyze the
            complete properties of the answer graphs, consider using JSON.
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleClickDownload} color="primary" variant="contained">
          {['answer', 'all_queries'].includes(download_type) ? 'Download' : 'Bookmark'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
