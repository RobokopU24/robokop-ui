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

type PrefixData = {
  prefix: string;
  count: number;
};

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    align?: 'left' | 'center' | 'right';
  }
}

const columnHelper = createColumnHelper<PrefixData>();

function NodeCuriePrefixes({ graphData }: { graphData: any }) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'count', desc: true }]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const data = useMemo(() => {
    return [...Object.entries(graphData?.qc_results?.node_curie_prefixes || {})].map(
      ([prefix, count]) => ({
        prefix,
        count: count as number,
      })
    );
  }, [graphData?.qc_results?.node_curie_prefixes]);

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) => row.prefix.toLowerCase().includes(q));
  }, [data, searchQuery]);

  // Reset page index when page size changes
  useEffect(() => {
    setPageIndex(0);
  }, [pageSize]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('prefix', {
        header: 'Prefix',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('count', {
        header: 'Count',
        cell: (info) => info.getValue().toLocaleString(),
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
          <Typography variant="h6">Node CURIE Prefixes</Typography>
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
            <Typography>No prefix data available.</Typography>
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
                          key={cell.id}
                          component={cell.column.id === 'prefix' ? 'th' : 'td'}
                          scope={cell.column.id === 'prefix' ? 'row' : undefined}
                          align={cell.column.columnDef.meta?.align}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
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

export default NodeCuriePrefixes;
