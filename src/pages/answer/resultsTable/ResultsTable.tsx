import React, { useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  PaginationState,
} from '@tanstack/react-table';

import {
  Paper,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
} from '@mui/material';

import ResultExplorer from './ResultExplorer';
import EmptyTable from '../../../components/shared/emptyTableRows/EmptyTable';

import './resultsTable.css';

// Types for answerStore (from useAnswerStore and ResultExplorer)
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
}

/**
 * Paginated results table
 * @param {object} answerStore - answer store hook
 */
export default function ResultsTable({ answerStore }: ResultsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: 'score',
      desc: true,
    },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  });

  const data = useMemo<any[]>(() => answerStore.message.results, [answerStore.message]);

  // Convert react-table column definitions to TanStack React Table format
  const columns = useMemo<ColumnDef<any, any>[]>(() => {
    return answerStore.tableHeaders.map((header) => {
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

      // Handle accessor - could be a function or string
      if (typeof header.accessor === 'function') {
        (columnDef as any).accessorFn = header.accessor;
      } else if (typeof header.accessor === 'string') {
        (columnDef as any).accessorKey = header.accessor;
      }

      // Add custom filter function if specified
      if (header.filter === 'equals') {
        columnDef.filterFn = 'equals';
      }

      return columnDef;
    });
  }, [answerStore.tableHeaders]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 15,
      },
      sorting: [
        {
          id: 'score',
          desc: true,
        },
      ],
    },
  });

  // MUI TablePagination expects onPageChange
  const handleChangePage = (_event: unknown, newPage: number) => {
    table.setPageIndex(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = Number(e.target.value);
    table.setPageSize(newPageSize);
  };

  return (
    <>
      <div id="resultsContainer">
        <Paper id="resultsTable" elevation={3}>
          <TableContainer>
            <Table>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell
                        key={header.id}
                        className="resultsTableHeader"
                        style={{
                          backgroundColor: (header.column.columnDef.meta as any)?.color,
                          cursor: header.column.getCanSort() ? 'pointer' : '',
                          width: (header.column.columnDef.meta as any)?.width,
                        }}
                      >
                        {header.isPlaceholder ? null : (
                          <>
                            {header.column.getCanSort() ? (
                              <TableSortLabel
                                active={!!header.column.getIsSorted()}
                                direction={header.column.getIsSorted() === 'desc' ? 'desc' : 'asc'}
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                              </TableSortLabel>
                            ) : (
                              <>{flexRender(header.column.columnDef.header, header.getContext())}</>
                            )}
                            <div>
                              {header.column.getCanFilter() && (
                                <select
                                  value={(header.column.getFilterValue() as string) || ''}
                                  onChange={(e) => {
                                    header.column.setFilterValue(e.target.value || undefined);
                                  }}
                                  className="resultsFilterSelect"
                                >
                                  <option value="">All</option>
                                  {Array.from(
                                    new Set(
                                      table
                                        .getPreFilteredRowModel()
                                        .rows.map((row) => {
                                          const value = row.getValue(header.column.id);
                                          return value ? String(value) : null;
                                        })
                                        .filter(Boolean)
                                    )
                                  ).map((option, i) => (
                                    <option key={i} value={option ?? ''}>
                                      {option ?? '—'}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody style={{ position: 'relative' }}>
                {table.getRowModel().rows.length > 0 ? (
                  <>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        hover
                        selected={answerStore.selectedRowId === row.id}
                        onClick={() => answerStore.selectRow(row.original, row.id)}
                        role="button"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </>
                ) : (
                  <EmptyTable numRows={15} numCells={columns.length} text="No Results" />
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 15, 50, 100]}
            count={data.length}
            rowsPerPage={table.getState().pagination.pageSize}
            page={table.getState().pagination.pageIndex}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            component="div"
          />
        </Paper>
        <ResultExplorer answerStore={answerStore} />
      </div>
    </>
  );
}
