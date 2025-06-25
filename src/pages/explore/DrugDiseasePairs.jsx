import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
} from '@mui/material';
import { ArrowRight } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import explorePage from '../../API/explorePage';
import QueryBuilderContext from '../../context/queryBuilder';
import Loading from '../../components/loading/Loading';
import useQueryBuilder from '../queryBuilder/useQueryBuilder';
import HeaderCell from './HeaderCell';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  hover: {
    '& .MuiButtonBase-root': {
      visibility: 'hidden',
    },
    '&:hover .MuiButtonBase-root': {
      visibility: 'visible',
    },
  },
  table: {
    fontSize: '1.6rem',
    width: '100%',
    '& td, & th': {
      paddingLeft: 12,
    },
    '& td:first-of-type, & th:first-of-type': {
      paddingLeft: 0,
    },
  },
});

const fetchPairs = explorePage.getDrugChemicalPairs;

function Chip({ children }) {
  return (
    <span
      style={{
        fontSize: '0.75rem',
        backgroundColor: '#e9e9e9',
        borderRadius: '4px',
        padding: '2px 4px',
        marginLeft: '1ch',
      }}
    >
      {children}
    </span>
  );
}

export default function DrugDiseasePairs() {
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [data, setData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const queryBuilder = useQueryBuilder(QueryBuilderContext);
  const navigate = useNavigate();

  const handleStartQuery = (pair) => {
    const query = {
      message: {
        query_graph: {
          nodes: {
            n0: { name: pair.disease_name, ids: [pair.disease_id] },
            n1: { name: pair.drug_name, ids: [pair.drug_id] },
          },
          edges: {
            e0: { subject: 'n0', object: 'n1', predicates: ['biolink:related_to'] },
          },
        },
      },
    };
    queryBuilder.dispatch({ type: 'saveGraph', payload: query });
    navigate('/');
  };

  const classes = useStyles();

  const columnHelper = createColumnHelper();
  const columns = React.useMemo(
    () => [
      columnHelper.accessor('disease_name', {
        header: 'Disease',
        cell: (info) => (
          <>
            {info.row.original.disease_name}
            <Chip>{info.row.original.disease_id}</Chip>
          </>
        ),
      }),
      columnHelper.accessor('drug_name', {
        header: 'Drug',
        cell: (info) => (
          <>
            {info.row.original.drug_name}
            <Chip>{info.row.original.drug_id}</Chip>
          </>
        ),
      }),
      columnHelper.accessor('score', {
        header: 'Score',
        cell: (info) =>
          info.row.original.known ? (
            <span style={{ textDecoration: 'underline' }}>
              {info.row.original.score.toFixed(6)}*
            </span>
          ) : (
            info.row.original.score.toFixed(6)
          ),
      }),
      columnHelper.display({
        id: 'startQueryButton',
        cell: (props) => (
          <Button
            variant="contained"
            size="small"
            sx={{ fontSize: '0.75rem', textTransform: 'none' }}
            endIcon={<ArrowRight />}
            onClick={() => handleStartQuery(props.row.original)}
          >
            Start a query
          </Button>
        ),
      }),
    ],
    []
  );

  const sortParam = React.useMemo(
    () => Object.fromEntries(sorting.map(({ id, desc }) => [id, desc ? 'desc' : 'asc'])),
    [sorting]
  );

  const filterParam = React.useMemo(
    () => Object.fromEntries(columnFilters.map(({ id, value }) => [id, value])),
    [columnFilters]
  );

  React.useEffect(() => {
    let ignore = false;
    setIsLoading(true);

    (async () => {
      try {
        if (ignore) return;
        const result = await fetchPairs({ pagination, sort: sortParam, filters: filterParam });
        setData(result);
      } catch (e) {
        console.error('Error fetching drug-disease pairs:', e);
      } finally {
        setIsLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [pagination, JSON.stringify(sortParam), JSON.stringify(filterParam)]);

  const table = useReactTable({
    data: data.rows || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    enableMultiSort: false,
    manualSorting: true,
    manualFiltering: true,
    rowCount: data.num_of_results,
    state: { pagination, sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
  });

  return (
    <Container sx={{ my: 6 }}>
      <Typography variant="body2" component={Link} to="/explore">
        ← View all datasets
      </Typography>
      <Typography variant="h4" gutterBottom>
        Drug - Disease Pairs
      </Typography>
      <Typography gutterBottom>
        These drug-disease pairs were generated using a machine learning model to align with the
        nodes in the ROBOKOP knowledge graph. They highlight potential associations between various
        drugs and a broad range of diseases, suggesting possible avenues for further research. These
        connections can serve as a starting point for a new query by hovering over a pair and
        clicking &ldquo;Start a Query&rdquo;.
      </Typography>
      <Typography sx={{ mb: 4 }}>
        Scores with an asterisk and underline means the drug-disease pair is already known. The
        score is still predicted using the trained model.
      </Typography>

      <Box sx={{ position: 'relative' }}>
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              inset: '-20px',
              backgroundColor: 'rgba(255,255,255,0.3)',
              backdropFilter: 'blur(2px)',
              borderRadius: 2,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Loading />
          </Box>
        )}

        <Table size="small" className={classes.table}>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id}>
                    {header.isPlaceholder ? null : <HeaderCell header={header} />}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className={classes.hover}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {data.num_of_results > 0 ? (
          <TablePagination
            component="div"
            count={data.num_of_results}
            page={pagination.pageIndex}
            onPageChange={(_, page) => setPagination((prev) => ({ ...prev, pageIndex: page }))}
            rowsPerPage={pagination.pageSize}
            onRowsPerPageChange={(e) => {
              setPagination({ pageIndex: 0, pageSize: parseInt(e.target.value, 10) });
            }}
            rowsPerPageOptions={[10, 20, 50, 100]}
          />
        ) : (
          <Typography align="center" sx={{ my: 4 }}>
            No results found. Please try a different filter.
          </Typography>
        )}
      </Box>
    </Container>
  );
}
