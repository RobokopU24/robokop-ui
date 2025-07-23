import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
} from '@mui/material';
import strings from '../../utils/strings';

import ShowPropertyValue from './ShowPropertyValue';

import API from '../../API';

import ShowEdges from './ShowEdges';

export default function ShowEdgesSummary({ nodeId, node }: { nodeId: string; node: any }) {
  const [selectedPredicate, setPredicateSelection] = useState('all');
  const [selectedCategory, setCategorySelection] = useState<string>('');
  const [hasEdgesSummaryError, setHasEdgesSummaryError] = useState(false);
  const [edgeSummary, setEdgeSummary] = useState([]);
  const [edgeCount, setEdgeCount] = useState(0);
  const defaultEdgeCountRef = useRef(0);

  async function fetchEdgesSummary() {
    const edgeSummaryResponse = await API.details.getNodeEdgeSummary(nodeId);
    const edgeCountResponse = await API.details.getNodeEdgeCount(nodeId);

    const totalCount = edgeCountResponse.pagination.count;
    setEdgeCount(totalCount);
    defaultEdgeCountRef.current = totalCount;

    if (edgeSummaryResponse.status === 'error') {
      setHasEdgesSummaryError(true);
      setEdgeSummary([]);
    } else {
      setHasEdgesSummaryError(false);
      setEdgeSummary(edgeSummaryResponse.edge_types);
    }
  }

  const resetTotalCount = () => {
    setEdgeCount(defaultEdgeCountRef.current);
  };

  useEffect(() => {
    fetchEdgesSummary();
  }, []);

  const ShowEdgeSummary = ({ edge: edgeSummaryItem }: { edge: any }) => {
    return (
      <TableRow
        onClick={() => {
          setPredicateSelection(edgeSummaryItem.predicate);
          setCategorySelection(edgeSummaryItem.category);
          setEdgeCount(edgeSummaryItem.count);
        }}
        sx={{
          cursor: 'pointer',
          ':hover': { backgroundColor: 'action.hover' },
          backgroundColor:
            selectedPredicate === edgeSummaryItem.predicate &&
            selectedCategory === edgeSummaryItem.category
              ? 'action.selected'
              : 'inherit',
        }}
      >
        <TableCell>{strings.displayPredicate(edgeSummaryItem.predicate)}</TableCell>
        <TableCell>
          <ShowPropertyValue
            propertyValue={strings.displayCategory(edgeSummaryItem.category)}
          ></ShowPropertyValue>
        </TableCell>
        <TableCell>{edgeSummaryItem.count}</TableCell>
      </TableRow>
    );
  };

  return (
    <Box mt={6}>
      <Typography variant="h5" component="h2" gutterBottom>
        Edges Summary
      </Typography>
      {hasEdgesSummaryError ? (
        <Box>
          <Typography>An error occurred while getting the edges summary</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid size={6}>
            {edgeSummary.length === 0 ? (
              <Box sx={{ py: 2 }}>
                <Typography>No edges found for this node.</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ backgroundColor: 'action.hover' }}>
                    <TableRow>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Predicate
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Category
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Total
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {edgeSummary.map((edgeRow, index) => (
                      <ShowEdgeSummary key={index} edge={edgeRow} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Grid>
          <Grid size={6}>
            <div style={{ position: 'sticky', top: '20px' }}>
              <ShowEdges
                nodeId={nodeId}
                node={node}
                selectedPredicate={selectedPredicate}
                setPredicateSelection={setPredicateSelection}
                selectedCategory={selectedCategory}
                setCategorySelection={setCategorySelection}
                totalCount={edgeCount}
                resetTotalCount={resetTotalCount}
              />
            </div>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
