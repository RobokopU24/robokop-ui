import React, { useMemo, useState, useEffect, JSX } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import {
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
  TableSortLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { SortingState, ColumnFiltersState, ColumnDef } from '@tanstack/react-table';
import EmptyTable from '../../../components/shared/emptyTableRows/EmptyTable';
import ResultExplorer from './ResultExplorer';
import './resultsTable.css';

interface NodeType {
  id: string;
  name: string;
  categories: string[];
  score: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface EdgeType {
  id: string;
  source: string | NodeType;
  target: string | NodeType;
  predicate: string;
  strokeWidth?: number;
  numEdges?: number;
  index?: number;
  attributes?: any[];
  sources?: any[];
}

interface AnswerStoreType {
  numQgNodes: number;
  showNodePruneSlider: boolean;
  selectedResult: {
    nodes: { [id: string]: NodeType };
    edges: { [id: string]: EdgeType };
  };
  selectedRowId: string;
  metaData?: any;
  resultJSON: {
    knowledge_graph: {
      edges: { [id: string]: { attributes: any[]; sources: any[] } };
    };
    result?: any;
  };
  tableHeaders: any[];
  message: {
    results: any[];
    [key: string]: any;
  };
  selectRow: (row: any, id: string | number) => void;
}

interface ResultsTableProps {
  answerStore: AnswerStoreType;
  containerSx?: SxProps<Theme>;
}

// -------------------- Component --------------------
export default function ResultsTable({ answerStore, containerSx }: ResultsTableProps): JSX.Element {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'score', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pageSize, setPageSize] = useState<number>(15);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const data = useMemo<any[]>(() => answerStore.message.results || [], [answerStore.message]);

  const columns = useMemo<ColumnDef<any, any>[]>(() => {
    return answerStore.tableHeaders.map((header: any): ColumnDef<any, any> => {
      const columnDef: ColumnDef<any, any> = {
        id: header.id || (typeof header.accessor === 'string' ? header.accessor : header.id),
        header: header.Header,
        cell: header.Cell ? (info) => header.Cell({ value: info.getValue() }) : undefined,
        enableSorting: !header.disableSortBy,
        enableColumnFilter: !header.disableFilters,
        meta: {
          color: header.color,
          width: header.width,
        } as any,
      };

      if (typeof header.accessor === 'function') (columnDef as any).accessorFn = header.accessor;
      else if (typeof header.accessor === 'string')
        (columnDef as any).accessorKey = header.accessor;

      if (header.filter === 'equals') (columnDef as any).filterFn = 'equals';
      return columnDef;
    });
  }, [answerStore.tableHeaders]);

  const filteredData = useMemo<any[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
  }, [data, searchQuery]);

  useEffect(() => setPageIndex(0), [pageSize]);

  const table = useReactTable<any>({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination: { pageSize, pageIndex },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', minHeight: 800, ...containerSx }}>
      <Box sx={{ flexGrow: 1, display: 'inline-block', width: 'auto', maxWidth: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">Results</Typography>
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
              minHeight: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography>No results available.</Typography>
          </Box>
        ) : (
          <>
            <TableContainer
              component={Paper}
              sx={{
                maxHeight: 600,
                overflow: 'auto',
                display: 'inline-block',
              }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableCell
                          key={header.id}
                          sx={{
                            py: 2,
                            cursor: header.column.getCanSort() ? 'pointer' : 'default',
                            backgroundColor: (header.column.columnDef as any).meta?.color,
                            width: (header.column.columnDef as any).meta?.width,
                          }}
                        >
                          {header.column.getCanSort() ? (
                            <TableSortLabel
                              active={!!header.column.getIsSorted()}
                              direction={header.column.getIsSorted() === 'desc' ? 'desc' : 'asc'}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </TableSortLabel>
                          ) : (
                            flexRender(header.column.columnDef.header, header.getContext())
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableHead>
                <TableBody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        hover
                        selected={answerStore.selectedRowId === row.id}
                        onClick={() => answerStore.selectRow(row.original, row.id)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} sx={{ py: 2 }}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <EmptyTable numRows={15} numCells={columns.length} text="No Results" />
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}
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
                    <MenuItem value={15}>15</MenuItem>
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
                  onChange={(_event, page) => setPageIndex(page - 1)}
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
      <ResultExplorer answerStore={answerStore} />
    </Box>
  );
}
