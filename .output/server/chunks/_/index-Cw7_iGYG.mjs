import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import React from 'react';
import { Button, Container, Typography, Box, Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Tooltip, IconButton, Badge, Collapse, FormControl, InputLabel, FilledInput, InputAdornment } from '@mui/material';
import ArrowRight from '@mui/icons-material/ArrowRight';
import { useNavigate, Link } from '@tanstack/react-router';
import { createColumnHelper, useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { u as utils } from './queryGraph-DEhAVldC.mjs';
import { b as api } from './baseUrlProxy-CL-Lrxdy.mjs';
import { L as Loading } from './Loading-Df2nHO8-.mjs';
import { u as useQueryBuilderContext } from './queryBuilder-B0Yriqen.mjs';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import FilterList from '@mui/icons-material/FilterList';
import SwapVert from '@mui/icons-material/SwapVert';
import Clear from '@mui/icons-material/Clear';
import { makeStyles } from '@mui/styles';
import 'lodash/isString.js';
import 'lodash/transform.js';
import 'lodash/omitBy.js';
import 'lodash/pick.js';
import 'lodash/cloneDeep.js';
import 'lodash/startCase.js';
import 'lodash/camelCase.js';
import 'lodash/snakeCase.js';
import 'axios';
import './AlertProvider-wxvwEFCh.mjs';
import '@mui/material/Snackbar';
import '@mui/material/Alert';

const routes = {
  async getDrugChemicalPairs({
    pagination,
    sort,
    filters
  }) {
    let response;
    try {
      response = await api.post("/api/explore/drug-disease", {
        pagination: {
          offset: pagination.pageIndex * pagination.pageSize,
          limit: pagination.pageSize
        },
        sort,
        filters
      });
    } catch (error) {
      return utils.handleAxiosError(error);
    }
    return response.data;
  }
};
function DebouncedFilterBox({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}) {
  const [value, setValue] = React.useState(initialValue);
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);
    return () => clearTimeout(timeout);
  }, [value]);
  return /* @__PURE__ */ jsxs(FormControl, { fullWidth: true, variant: "filled", children: [
    /* @__PURE__ */ jsx(InputLabel, { htmlFor: "filter", children: "Filter" }),
    /* @__PURE__ */ jsx(
      FilledInput,
      {
        value,
        onChange: (e) => setValue(e.target.value),
        margin: "dense",
        endAdornment: /* @__PURE__ */ jsx(InputAdornment, { position: "end", children: /* @__PURE__ */ jsx(IconButton, { "aria-label": "Clear filter", onClick: () => setValue(""), size: "small", children: /* @__PURE__ */ jsx(Clear, {}) }) }),
        ...props
      }
    )
  ] });
}
const DebouncedFilterBox$1 = React.memo(DebouncedFilterBox);
function HeaderCell({ header }) {
  const [isFilterOpen, setIsFilterOpen] = React.useState(header.column.getIsFiltered());
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, flexDirection: "column" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [
      /* @__PURE__ */ jsx("h2", { style: { margin: 0, fontSize: 18, flex: "1" }, children: flexRender(header.column.columnDef.header, header.getContext()) }),
      (header.column.getCanFilter() || header.column.getCanSort()) && /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        header.column.getCanSort() && /* @__PURE__ */ jsx(
          Tooltip,
          {
            placement: "top",
            title: {
              asc: "Sort ascending",
              desc: "Sort descending"
            }[header.column.getNextSortingOrder()] || "Unsort",
            children: /* @__PURE__ */ jsx(
              IconButton,
              {
                size: "small",
                color: header.column.getIsSorted() ? "primary" : void 0,
                onClick: header.column.getToggleSortingHandler(),
                children: {
                  asc: /* @__PURE__ */ jsx(ArrowDownward, {}),
                  desc: /* @__PURE__ */ jsx(ArrowUpward, {})
                }[header.column.getIsSorted()] || /* @__PURE__ */ jsx(SwapVert, {})
              }
            )
          }
        ),
        header.column.getCanFilter() && /* @__PURE__ */ jsx(Tooltip, { title: "Filter column", placement: "top", children: /* @__PURE__ */ jsx(Badge, { variant: "dot", color: "primary", invisible: !header.column.getIsFiltered(), children: /* @__PURE__ */ jsx(
          IconButton,
          {
            size: "small",
            onClick: () => {
              setIsFilterOpen(!isFilterOpen);
            },
            children: /* @__PURE__ */ jsx(FilterList, {})
          }
        ) }) })
      ] })
    ] }),
    header.column.getCanFilter() && /* @__PURE__ */ jsx(Collapse, { in: isFilterOpen, children: /* @__PURE__ */ jsx(
      DebouncedFilterBox$1,
      {
        value: header.column.getFilterValue() || "",
        onChange: (value) => header.column.setFilterValue(value)
      }
    ) })
  ] });
}
const useStyles = makeStyles({
  hover: {
    "& .MuiButtonBase-root": {
      visibility: "hidden"
    },
    "&:hover .MuiButtonBase-root": {
      visibility: "visible"
    }
  },
  table: {
    fontSize: "1.6rem",
    width: "100%",
    "& td, & th": {
      paddingLeft: 12
    },
    "& td:first-of-type, & th:first-of-type": {
      paddingLeft: 0
    }
  }
});
const fetchPairs = routes.getDrugChemicalPairs;
function Chip({ children }) {
  return /* @__PURE__ */ jsx(
    "span",
    {
      style: {
        fontSize: "0.75rem",
        backgroundColor: "#e9e9e9",
        borderRadius: "4px",
        padding: "2px 4px",
        marginLeft: "1ch"
      },
      children
    }
  );
}
function DrugDiseasePairs() {
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [data, setData] = React.useState({
    rows: [],
    num_of_results: 0,
    limit: 0,
    offset: 0
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const queryBuilder = useQueryBuilderContext();
  const navigate = useNavigate();
  const handleStartQuery = (pair) => {
    const query = {
      message: {
        query_graph: {
          nodes: {
            n0: { name: pair.disease_name, ids: [pair.disease_id] },
            n1: { name: pair.drug_name, ids: [pair.drug_id] }
          },
          edges: {
            e0: { subject: "n0", object: "n1", predicates: ["biolink:related_to"] }
          }
        }
      }
    };
    queryBuilder.dispatch({ type: "saveGraph", payload: query });
    navigate({ to: "/question-builder" });
  };
  const classes = useStyles();
  const columnHelper = createColumnHelper();
  const columns = React.useMemo(
    () => [
      columnHelper.accessor("disease_name", {
        header: "Disease",
        cell: (info) => /* @__PURE__ */ jsxs(Fragment, { children: [
          info.row.original.disease_name,
          /* @__PURE__ */ jsx(Chip, { children: info.row.original.disease_id })
        ] })
      }),
      columnHelper.accessor("drug_name", {
        header: "Drug",
        cell: (info) => /* @__PURE__ */ jsxs(Fragment, { children: [
          info.row.original.drug_name,
          /* @__PURE__ */ jsx(Chip, { children: info.row.original.drug_id })
        ] })
      }),
      columnHelper.accessor("score", {
        header: "Score",
        cell: (info) => info.row.original.known ? /* @__PURE__ */ jsxs("span", { style: { textDecoration: "underline" }, children: [
          info.row.original.score.toFixed(6),
          "*"
        ] }) : info.row.original.score.toFixed(6)
      }),
      columnHelper.display({
        id: "startQueryButton",
        cell: (props) => /* @__PURE__ */ jsx(
          Button,
          {
            variant: "contained",
            size: "small",
            sx: { fontSize: "0.75rem", textTransform: "none" },
            endIcon: /* @__PURE__ */ jsx(ArrowRight, {}),
            onClick: () => handleStartQuery(props.row.original),
            children: "Start a query"
          }
        )
      })
    ],
    []
  );
  const sortParam = React.useMemo(
    () => Object.fromEntries(sorting.map(({ id, desc }) => [id, desc ? "desc" : "asc"])),
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
        console.error("Error fetching drug-disease pairs:", e);
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
    onColumnFiltersChange: setColumnFilters
  });
  return /* @__PURE__ */ jsxs(Container, { sx: { my: 6 }, children: [
    /* @__PURE__ */ jsx(Typography, { variant: "body2", component: Link, to: "/explore", children: "\u2190 View all datasets" }),
    /* @__PURE__ */ jsx(Typography, { variant: "h4", gutterBottom: true, children: "Drug - Disease Pairs" }),
    /* @__PURE__ */ jsx(Typography, { gutterBottom: true, children: "These drug-disease pairs were generated using a machine learning model to align with the nodes in the ROBOKOP knowledge graph. They highlight potential associations between various drugs and a broad range of diseases, suggesting possible avenues for further research. These connections can serve as a starting point for a new query by hovering over a pair and clicking \u201CStart a Query\u201D." }),
    /* @__PURE__ */ jsx(Typography, { sx: { mb: 4 }, children: "Scores with an asterisk and underline means the drug-disease pair is already known. The score is still predicted using the trained model." }),
    /* @__PURE__ */ jsxs(Box, { sx: { position: "relative" }, children: [
      isLoading && /* @__PURE__ */ jsx(
        Box,
        {
          sx: {
            position: "absolute",
            inset: "-20px",
            backgroundColor: "rgba(255,255,255,0.3)",
            backdropFilter: "blur(2px)",
            borderRadius: 2,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          },
          children: /* @__PURE__ */ jsx(Loading, {})
        }
      ),
      /* @__PURE__ */ jsxs(Table, { size: "small", className: classes.table, children: [
        /* @__PURE__ */ jsx(TableHead, { children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsx(TableRow, { children: headerGroup.headers.map((header) => /* @__PURE__ */ jsx(TableCell, { children: header.isPlaceholder ? null : /* @__PURE__ */ jsx(HeaderCell, { header }) }, header.id)) }, headerGroup.id)) }),
        /* @__PURE__ */ jsx(TableBody, { children: table.getRowModel().rows.map((row) => /* @__PURE__ */ jsx(TableRow, { className: classes.hover, children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsx(TableCell, { children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id)) }, row.id)) })
      ] }),
      data.num_of_results > 0 ? /* @__PURE__ */ jsx(
        TablePagination,
        {
          component: "div",
          count: data.num_of_results,
          page: pagination.pageIndex,
          onPageChange: (_, page) => setPagination((prev) => ({ ...prev, pageIndex: page })),
          rowsPerPage: pagination.pageSize,
          onRowsPerPageChange: (e) => {
            setPagination({ pageIndex: 0, pageSize: parseInt(e.target.value, 10) });
          },
          rowsPerPageOptions: [10, 20, 50, 100]
        }
      ) : /* @__PURE__ */ jsx(Typography, { align: "center", sx: { my: 4 }, children: "No results found. Please try a different filter." })
    ] })
  ] });
}
const SplitComponent = function RouteComponent() {
  return /* @__PURE__ */ jsx(DrugDiseasePairs, {});
};

export { SplitComponent as component };
//# sourceMappingURL=index-Cw7_iGYG.mjs.map
