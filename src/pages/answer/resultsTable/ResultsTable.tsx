import React, { useMemo } from 'react';
import {
  useTable,
  usePagination,
  useSortBy,
  useFilters,
  Column,
  TableInstance,
  Row,
  HeaderGroup,
} from 'react-table';

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
  tableHeaders: Column<any>[];
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
  const columns = useMemo<Column<any>[]>(
    () => answerStore.tableHeaders,
    [answerStore.tableHeaders]
  );
  const data = useMemo<any[]>(() => answerStore.message.results, [answerStore.message]);

  // This is a custom filter UI for selecting
  // a unique option from a list
  function SelectColumnFilterFn({
    column: { filterValue, setFilter, preFilteredRows, id },
  }: {
    column: {
      filterValue: any;
      setFilter: (val: any) => void;
      preFilteredRows: Row<any>[];
      id: string;
    };
  }) {
    // Calculate the options for filtering
    // using the preFilteredRows
    const options = useMemo(() => {
      const o = new Set<string | null>();
      preFilteredRows.forEach((row) => {
        o.add(row.values[id] ? String(row.values[id]) : null);
      });
      return [...o.values()];
    }, [id, preFilteredRows]);

    // Render a multi-select box
    return (
      <select
        value={filterValue || ''}
        onChange={(e) => {
          setFilter(e.target.value || undefined);
        }}
        className="resultsFilterSelect"
      >
        <option value="">All</option>
        {options.map((option, i) => (
          <option key={i} value={option ?? ''}>
            {option ?? '—'}
          </option>
        ))}
      </select>
    );
  }

  // Let's set up our default Filter UI
  const defaultColumn = useMemo(() => ({ Filter: SelectColumnFilterFn }), []) as any;

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state,
    canPreviousPage,
    canNextPage,
    setPageSize,
    nextPage,
    previousPage,
    gotoPage,
    pageCount,
  } = useTable<any>(
    {
      columns,
      data,
      defaultColumn,
      initialState: {
        pageIndex: 0,
        pageSize: 15,
        sortBy: [
          {
            id: 'score',
            desc: true,
          },
        ],
      } as any, // react-table's types are not always up to date with plugins
    },
    useFilters,
    useSortBy,
    usePagination
  ) as TableInstance<any> & {
    page: Row<any>[];
    canPreviousPage: boolean;
    canNextPage: boolean;
    setPageSize: (size: number) => void;
    nextPage: () => void;
    previousPage: () => void;
    gotoPage: (page: number) => void;
    pageCount: number;
    state: any;
  };

  // react-table's state shape
  const pageIndex = state.pageIndex ?? 0;
  const pageSize = state.pageSize ?? 15;

  // MUI TablePagination expects onPageChange
  const handleChangePage = (_event: unknown, newPage: number) => {
    gotoPage(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(Number(e.target.value));
  };

  return (
    <>
      <div id="resultsContainer">
        <Paper id="resultsTable" elevation={3}>
          <TableContainer>
            <Table {...getTableProps()}>
              <TableHead>
                {headerGroups.map((headerGroup: HeaderGroup<any>) => (
                  <TableRow {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column: any) => (
                      <TableCell
                        className="resultsTableHeader"
                        {...column.getHeaderProps(
                          column.getSortByToggleProps({
                            style: {
                              backgroundColor: column.color,
                              cursor: column.canSort ? 'pointer' : '',
                              width: column.width,
                            },
                          })
                        )}
                      >
                        {column.canSort ? (
                          <TableSortLabel
                            active={column.isSorted}
                            direction={column.isSortedDesc ? 'desc' : 'asc'}
                          >
                            {column.render('Header')}
                          </TableSortLabel>
                        ) : (
                          <>{column.render('Header')}</>
                        )}
                        <div>{column.canFilter ? column.render('Filter') : null}</div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody style={{ position: 'relative' }} {...getTableBodyProps()}>
                {page.length > 0 ? (
                  <>
                    {page.map((row: Row<any>) => {
                      prepareRow(row);
                      return (
                        <TableRow
                          {...row.getRowProps()}
                          hover
                          selected={answerStore.selectedRowId === row.id}
                          onClick={() => answerStore.selectRow(row.original, row.id)}
                          role="button"
                        >
                          {row.cells.map((cell: any) => (
                            <TableCell {...cell.getCellProps()}>{cell.render('Cell')}</TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
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
            rowsPerPage={pageSize}
            page={pageIndex}
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
