import React, { useMemo, useState } from 'react';
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
import PredicateCountDetailsModal from './PredicateCountDetailsModal';

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
  const hashmap: Record<string, { property: string; count: number }[]> = {};
  for (const [property, objectList] of Object.entries(
    graphData?.qc_results?.predicates_by_knowledge_source || {}
  )) {
    for (const [predicate, count] of Object.entries(objectList as object)) {
      if (hashmap[predicate]) {
        hashmap[predicate].push({ property, count: Number(count) });
      } else {
        hashmap[predicate] = [{ property, count: Number(count) }];
      }
    }
  }

  const [sorting, setSorting] = useState<SortingState>([{ id: 'count', desc: true }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const { pageIndex, pageSize } = pagination;
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
        meta: { align: 'right' as const },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
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
                '&::-webkit-scrollbar': { width: '8px' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#c1c1c1', borderRadius: '4px' },
                '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#a8a8a8' },
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
                  {table.getPaginationRowModel().rows.map((row) => (
                    <TableRow key={row.id} hover>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          colSpan={2}
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
                    onChange={(e) =>
                      setPagination((prev) => ({
                        ...prev,
                        pageSize: Number(e.target.value),
                        pageIndex: 0,
                      }))
                    }
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
                  onChange={(_, page) =>
                    setPagination((prev) => ({ ...prev, pageIndex: page - 1 }))
                  }
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <Box
      className="hover-row"
      sx={{
        padding: '8px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {isModalOpen && (
        <PredicateCountDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          value={value}
          sourceKey={sourceKey}
        />
      )}
      <Typography component="span">{sourceKey}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography
          component="span"
          sx={{ ml: 2, fontSize: 14, float: 'right', fontWeight: 'bold' }}
        >
          {typeof count === 'number' ? count.toLocaleString() : JSON.stringify(count)}
        </Typography>
        <button className="details-card-button" onClick={() => setIsModalOpen(true)}>
          Details
        </button>
      </Box>
    </Box>
  );
}
