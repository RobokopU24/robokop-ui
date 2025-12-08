import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function ExpandableRows({ sourceKey, value }: { sourceKey: string; value: any }) {
  return (
    <Accordion sx={{ boxShadow: 'none', width: '100%', p: 0, m: 0 }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Typography component="span">{sourceKey}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Table size="small" aria-label="predicates table">
          <TableHead>
            <TableRow>
              <TableCell>Predicate</TableCell>
              <TableCell align="right">Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(value || {}).map(([predicate, count]) => (
              <TableRow key={predicate} hover>
                <TableCell component="th" scope="row">
                  {predicate}
                </TableCell>
                <TableCell align="right">
                  {typeof count === 'number' ? count.toLocaleString() : JSON.stringify(count)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AccordionDetails>
    </Accordion>
  );
}

export default ExpandableRows;
