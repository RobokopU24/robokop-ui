import React, { useMemo, useState, useEffect } from 'react';
import {
  CardContent,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Typography,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
} from '@tanstack/react-table';

import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

type PredicateData = {
  predicate: string;
  count: number;
  value: { property: string; count: number }[];
};

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    align?: 'left' | 'center' | 'right';
  }
}

const columnHelper = createColumnHelper<PredicateData>();

function PredicateCount({ graphData }: { graphData: any }) {
  let hashmap: Record<string, { property: string; count: number }[]> = {};
  for (const [property, objectList] of Object.entries(
    graphData?.qc_results?.predicates_by_knowledge_source || {}
  )) {
    for (const [predicate, count] of Object.entries(objectList as object)) {
      if (hashmap[predicate]) {
        hashmap[predicate].push({ property, count });
      } else {
        hashmap[predicate] = [{ property, count }];
      }
    }
  }

  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'count', desc: true }]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const data = useMemo(() => {
    return Object.keys(hashmap).map((predicate) => ({
      predicate,
      count: hashmap[predicate].reduce((sum, item) => sum + item.count, 0),
      value: hashmap[predicate],
    }));
  }, [hashmap]);

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) => row.predicate.toLowerCase().includes(q));
  }, [data, searchQuery]);

  // Reset page index when page size changes
  useEffect(() => {
    setPageIndex(0);
  }, [pageSize]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('predicate', {
        header: 'Predicate',
        cell: (info) => (
          <ExpandableRows
            sourceKey={info.getValue()}
            value={info.row.original.value}
            count={info.row.original.count}
          />
        ),
      }),
      columnHelper.accessor('count', {
        header: 'Count',
        cell: () => null,
        enableSorting: true,
        size: 0,
        meta: {
          align: 'right' as const,
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      // columnVisibility: { count: false },
      pagination: {
        pageSize,
        pageIndex,
      },
    },
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex, pageSize });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      } else {
        setPageIndex(updater.pageIndex);
        setPageSize(updater.pageSize);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  });

  return (
    <CardContent sx={{ p: 1 }}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">Predicate Counts</Typography>
          <TextField
            size="small"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPageIndex(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Divider sx={{ mb: 2 }} />
        {filteredData.length === 0 ? (
          <Box
            sx={{
              py: 2,
              height: '100%',
              minHeight: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography>No predicate data available.</Typography>
          </Box>
        ) : (
          <>
            <TableContainer
              component={Paper}
              sx={{
                height: 600,
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f1f1',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#c1c1c1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  backgroundColor: '#a8a8a8',
                },
              }}
            >
              <Table stickyHeader>
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableCell
                          key={header.id}
                          align={header.column.columnDef.meta?.align}
                          sx={{
                            cursor: header.column.getCanSort() ? 'pointer' : 'default',
                            userSelect: 'none',
                          }}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <Typography variant="subtitle2" fontWeight="bold">
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableHead>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} hover>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          colSpan={2}
                          key={cell.id}
                          component="td"
                          scope="row"
                          align={cell.column.columnDef.meta?.align}
                          sx={{
                            p: 0,
                            m: 0,
                            ...(cell.column.id === 'count' && {
                              width: 0,
                              maxWidth: 0,
                              minWidth: 0,
                              border: 'none',
                              padding: 0,
                              m: 0,
                              overflow: 'hidden',
                            }),
                          }}
                        >
                          {cell.column.id !== 'count' &&
                            flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredData.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">Page size:</Typography>
                  <FormControl size="small" sx={{ minWidth: 80 }}>
                    <Select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPageIndex(0);
                      }}
                      displayEmpty
                    >
                      <MenuItem value={5}>5</MenuItem>
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={20}>20</MenuItem>
                      <MenuItem value={50}>50</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2">
                    Showing {filteredData.length === 0 ? 0 : pageIndex * pageSize + 1} to{' '}
                    {Math.min((pageIndex + 1) * pageSize, filteredData.length)} of{' '}
                    {filteredData.length} results
                  </Typography>
                  <Pagination
                    count={Math.ceil(filteredData.length / pageSize)}
                    page={pageIndex + 1}
                    onChange={(event, page) => {
                      setPageIndex(page - 1);
                    }}
                    color="primary"
                    size="small"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>
    </CardContent>
  );
}

export default PredicateCount;

function ExpandableRows({
  sourceKey,
  value,
  count,
}: {
  sourceKey: string;
  value: { property: string; count: number }[];
  count: number;
}) {
  return (
    <Accordion sx={{ boxShadow: 'none', width: '100%', p: 0, m: 0 }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <Typography component="span">{sourceKey}</Typography>
          <Typography component="span" sx={{ ml: 2, fontSize: 14 }}>
            {typeof count === 'number' ? count.toLocaleString() : JSON.stringify(count)}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Table size="small" aria-label="predicates table">
          <TableHead>
            <TableRow>
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
      </AccordionDetails>
    </Accordion>
  );
}
