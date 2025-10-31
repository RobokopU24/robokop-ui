import {
  Box,
  IconButton,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import React from 'react';
import Close from '@mui/icons-material/Close';
import { Sankey } from './Sankey';

function PredicateCountDetailsModal({
  isOpen,
  onClose,
  value,
  sourceKey,
}: {
  isOpen: boolean;
  onClose: () => void;
  value: { property: string; count: number }[] | undefined;
  sourceKey: string;
}) {
  let sankeyNodes = new Set<string>(sourceKey ? [sourceKey] : []);

  let sankeyLinks: Array<{ source: string; target: string; value: number }> = [];
  Object.entries(value || {}).forEach(([_, count]) => {
    sankeyNodes.add(count.property);
    sankeyLinks.push({
      source: count.property,
      target: sourceKey,
      value: typeof count.count === 'number' ? count.count : 0,
    });
  });

  const sankeyData = {
    nodes: Array.from(sankeyNodes).map((id) => ({ id })),
    links: sankeyLinks,
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          backgroundColor: 'background.paper',
          p: 2,
          borderRadius: 1,
          width: 700,
          maxHeight: '80vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: '#c1c1c1', borderRadius: '4px' },
          '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#a8a8a8' },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <h2>Predicate Count Details</h2>
          <IconButton onClick={onClose} style={{ alignSelf: 'flex-end' }}>
            <Close />
          </IconButton>
        </Box>
        <p>Here are more details about the predicate counts.</p>
        <Box sx={{ m: 'auto', width: '100%' }}>
          <Sankey data={sankeyData} />
        </Box>
        <Table
          size="small"
          aria-label="predicates table"
          sx={{ border: '1px solid #ddd', mt: 2, borderRadius: 8 }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Property</TableCell>
              <TableCell align="right">Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(value || {}).map(([predicate, count]) => (
              <TableRow key={predicate} hover>
                <TableCell component="th" scope="row">
                  {count.property}
                </TableCell>
                <TableCell align="right">
                  {typeof count.count === 'number'
                    ? count.count.toLocaleString()
                    : JSON.stringify(count.count)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Modal>
  );
}

export default PredicateCountDetailsModal;
