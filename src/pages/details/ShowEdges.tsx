import React, { useState, useEffect } from 'react';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import TablePagination from '@mui/material/TablePagination';

import API from '../../API';

import propertyFriendlyNames from './property-friendly-names.json';
import strings from '../../utils/strings';
import useBiolinkModel from '../../stores/useBiolinkModel';
import { useAlert } from '../../components/AlertProvider';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

interface ShowEdgesProps {
  node: any;
  nodeId: string;
  selectedPredicate: string;
  setPredicateSelection: React.Dispatch<React.SetStateAction<string>>;
  selectedCategory: string;
  setCategorySelection: React.Dispatch<React.SetStateAction<string>>;
  totalCount?: number;
  resetTotalCount?: () => void;
}

export default function ShowEdges({
  node,
  nodeId,
  selectedPredicate,
  setPredicateSelection,
  selectedCategory,
  setCategorySelection,
  totalCount = 0,
  resetTotalCount = () => {},
}: ShowEdgesProps) {
  const biolink = useBiolinkModel();
  const { displayAlert } = useAlert();

  const pageSizeOptions = [10, 25, 50, 100, 1000];

  const [loading, setLoading] = useState(true);
  const [hasEdgesDataError, setHasEdgesDataError] = useState(false);

  const [pageSize, setPageSize] = useState(10);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [currentPageNumber, setCurrentPageNumber] = useState(0);

  const [edgeData, setEdgeData] = useState([]);
  console.log('edgeData', edgeData);

  // Load biolink on page load
  async function fetchBiolink() {
    const response = await API.biolink.getModelSpecification();
    if (response.status === 'error') {
      displayAlert(
        'error',
        'Failed to contact server to download biolink model. You will not be able to select general nodes or predicates. Please try again later.'
      );
      return;
    }
    biolink.setBiolinkModel(response);
  }

  async function fetchEdges() {
    console.log('Fetching edges for node:', selectedCategory);
    const edgeResponse = await API.details.getNodeEdges(
      nodeId,
      pageSize,
      currentPageNumber,
      selectedPredicate,
      selectedCategory
    );

    // setHasNextPage(edgeResponse.length === pageSize);

    if (edgeResponse.status === 'error') {
      setHasEdgesDataError(true);
      setEdgeData([]);
    } else {
      setHasEdgesDataError(false);
      setEdgeData(edgeResponse.edges);
    }
  }

  const handlePageSizeChange = (event: { target: { value: React.SetStateAction<number> } }) => {
    setCurrentPageNumber(0);
    setPageSize(event.target.value);
  };

  const handlePredicateChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setCurrentPageNumber(0);
    setPredicateSelection(event.target.value);
  };

  useEffect(() => {
    fetchBiolink();
    fetchEdges().finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchEdges();
  }, [currentPageNumber, pageSize, selectedPredicate, selectedCategory]);

  const goOnPrevPage = () => {
    if (currentPageNumber < 1) return;
    setCurrentPageNumber((prev) => prev - 1);
  };

  const goOnNextPage = () => {
    setCurrentPageNumber((prev) => prev + 1);
  };

  const ShowEdgeInfo = ({ edge }: { edge: any }) => {
    console.log('edge', edge);
    const isIncoming = edge.edge.direction === '<';
    const predicate =
      propertyFriendlyNames[edge.edge.predicate as keyof typeof propertyFriendlyNames] ??
      edge.edge.predicate;

    return (
      <TableRow>
        <TableCell>
          {isIncoming ? (
            <Link href={'./' + edge.adj_node.id} underline="hover">
              {edge.adj_node.name} ({edge.adj_node.id})
            </Link>
          ) : (
            node.name
          )}
        </TableCell>
        <TableCell>{strings.displayPredicate(predicate) || predicate}</TableCell>
        <TableCell>
          {isIncoming ? (
            node.name
          ) : (
            <Link href={'./' + edge.adj_node.id} underline="hover">
              {edge.adj_node.name} ({edge.adj_node.id})
            </Link>
          )}
        </TableCell>
      </TableRow>
    );
  };

  return loading ? (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
      <CircularProgress />
      <Typography sx={{ ml: 2 }}>Loading edges...</Typography>
    </Box>
  ) : (
    <Box>
      {hasEdgesDataError ? (
        <Box>
          <Typography>An error occurred while getting the edges</Typography>
        </Box>
      ) : (
        <Box>
          <Box mb={1} display="flex" justifyContent="space-between" alignItems="center" mt={-6}>
            <Box>
              <Typography component="span" sx={{ mr: 2 }}>
                Filter by predicates:
              </Typography>
              <Select
                labelId="select-filter-predicate"
                id="select-filter-predicate"
                value={selectedPredicate}
                label="Predicate"
                size="small"
                onChange={handlePredicateChange}
              >
                <MenuItem key="all" value={'all'}>
                  All
                </MenuItem>
                {biolink.predicates
                  .map((predicate) => ({
                    name:
                      propertyFriendlyNames[
                        predicate.predicate as keyof typeof propertyFriendlyNames
                      ] ?? predicate.predicate,
                    value: predicate.predicate,
                  }))
                  .sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))
                  .map((predicate) => (
                    <MenuItem key={predicate.value} value={predicate.value}>
                      {predicate.name}
                    </MenuItem>
                  ))}
              </Select>
            </Box>
            <Link
              onClick={() => {
                setPredicateSelection('all');
                setCategorySelection('');
                setCurrentPageNumber(0);
                resetTotalCount();
              }}
              sx={{ fontSize: 'small', cursor: 'pointer' }}
            >
              Clear Filters
            </Link>
          </Box>
          {edgeData.length === 0 ? (
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
                        Subject
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Predicate
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Object
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {edgeData.map((edgeRow, index) => (
                    <ShowEdgeInfo key={index} edge={edgeRow} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <TablePagination
            component="div"
            count={totalCount}
            page={currentPageNumber}
            onPageChange={(_, newPage) => setCurrentPageNumber(newPage)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(event) => {
              setPageSize(parseInt(event.target.value, 10));
              setCurrentPageNumber(0);
            }}
          />
          {/* <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 2,
              mt: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">Page Size:</Typography>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={pageSize}
                label="Page Size"
                size="small"
                onChange={handlePageSizeChange}
              >
                {pageSizeOptions.map((pageSize) => (
                  <MenuItem key={pageSize} value={pageSize}>
                    {pageSize}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Typography variant="body2">Page: {currentPageNumber + 1}</Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={goOnPrevPage}
                disabled={currentPageNumber === 0}
              >
                Previous
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={goOnNextPage}
                disabled={!hasNextPage}
              >
                Next
              </Button>
            </Box>
          </Box> */}
        </Box>
      )}
    </Box>
  );
}
