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
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
} from '@tanstack/react-table';

type RowType = { property: string };

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    align?: 'left' | 'center' | 'right';
  }
}

const columnHelper = createColumnHelper<RowType>();

function StringTableDisplay({ tableData, title }: { tableData: string[]; title: string }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'property', desc: false }]);
  const [pageSize, setPageSize] = useState(50);
  const [pageIndex, setPageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const data = useMemo(() => (tableData || []).map((property) => ({ property })), [tableData]);

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) => row.property.toLowerCase().includes(q));
  }, [data, searchQuery]);

  useEffect(() => setPageIndex(0), [pageSize]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('property', {
        header: 'Property',
        cell: (info) => info.getValue(),
        meta: { align: 'left' },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, pagination: { pageSize, pageIndex } },
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
  });

  return (
    <CardContent sx={{ p: 1 }}>
      <Box>
        {/* Header Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">{title}</Typography>
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

        {/* Empty State */}
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
            <Typography>No properties available.</Typography>
          </Box>
        ) : (
          <>
            {/* Table */}
            <TableContainer
              component={Paper}
              sx={{
                height: 600,
                overflow: 'auto',
                '&::-webkit-scrollbar': { width: '8px' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#c1c1c1', borderRadius: '4px' },
                '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#a8a8a8' },
              }}
            >
              <Table stickyHeader size="small">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        const sorted = header.column.getIsSorted(); // 'asc' | 'desc' | false
                        const canSort = header.column.getCanSort();
                        return (
                          <TableCell
                            key={header.id}
                            align={header.column.columnDef.meta?.align}
                            sx={{
                              cursor: canSort ? 'pointer' : 'default',
                              userSelect: 'none',
                              py: 1.2,
                              px: 2,
                            }}
                            onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent:
                                  header.column.columnDef.meta?.align === 'right'
                                    ? 'flex-end'
                                    : 'flex-start',
                                gap: 0.4,
                              }}
                            >
                              <Typography variant="subtitle2" fontWeight="bold">
                                {flexRender(header.column.columnDef.header, header.getContext())}
                              </Typography>
                              {canSort && (
                                <Box
                                  component="span"
                                  sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    color: sorted ? 'text.primary' : 'text.disabled',
                                    opacity: sorted ? 1 : 0.6,
                                    transition: 'opacity 0.2s ease',
                                  }}
                                >
                                  {sorted === 'asc' ? (
                                    <ArrowDropUpIcon fontSize="small" />
                                  ) : sorted === 'desc' ? (
                                    <ArrowDropDownIcon fontSize="small" />
                                  ) : (
                                    <UnfoldMoreIcon fontSize="small" />
                                  )}
                                </Box>
                              )}
                            </Box>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHead>

                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} hover>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} sx={{ py: 1.2 }}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
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
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
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
                  onChange={(event, page) => setPageIndex(page - 1)}
                  color="primary"
                  size="small"
                  showFirstButton
                  showLastButton
                />
              </Box>
            </Box>
          </>
        )}
      </Box>
    </CardContent>
  );
}

export default StringTableDisplay;
