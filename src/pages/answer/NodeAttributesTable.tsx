import React from 'react';
import { Box, Table, TableBody, TableCell, TableRow } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTableBody = styled(TableBody)(() => ({
  '& .MuiTableRow-root:last-of-type .MuiTableCell-root': {
    borderBottom: 'none',
  },
}));

interface ValueCellProps {
  value: string | number | (string | number)[] | undefined;
}

const ValueCell: React.FC<ValueCellProps> = ({ value }) => (
  <TableCell>
    <ul style={{ padding: 0, margin: 0, listStyleType: 'none' }}>
      {Array.isArray(value) ? (
        value.map((valueItem, valueItemIndex) => <li key={valueItemIndex}>{valueItem}</li>)
      ) : (
        <li>{value}</li>
      )}
    </ul>
  </TableCell>
);

interface NodeData {
  name?: string | number | (string | number)[];
  id?: string | number | (string | number)[];
  categories?: string | number | (string | number)[];
  count?: string | number | (string | number)[];
}

interface NodeAttributesTableProps {
  nodeData: NodeData;
}

const NodeAttributesTable: React.FC<NodeAttributesTableProps> = ({ nodeData }) => {
  const { name, id, categories, count } = nodeData;

  return (
    <Box style={{ maxHeight: 500, overflow: 'auto' }}>
      <Table size="small" aria-label="node attributes table">
        <StyledTableBody>
          {Boolean(name) && (
            <TableRow style={{ verticalAlign: 'top' }}>
              <TableCell>Name</TableCell>
              <ValueCell value={name} />
            </TableRow>
          )}

          {Boolean(id) && (
            <TableRow style={{ verticalAlign: 'top' }}>
              <TableCell>ID</TableCell>
              <ValueCell value={id} />
            </TableRow>
          )}

          {Boolean(categories) && (
            <TableRow style={{ verticalAlign: 'top' }}>
              <TableCell>Categories</TableCell>
              <ValueCell value={categories} />
            </TableRow>
          )}

          {Boolean(count) && (
            <TableRow style={{ verticalAlign: 'top' }}>
              <TableCell>Count</TableCell>
              <ValueCell value={count} />
            </TableRow>
          )}
        </StyledTableBody>
      </Table>
    </Box>
  );
};

export default NodeAttributesTable;
