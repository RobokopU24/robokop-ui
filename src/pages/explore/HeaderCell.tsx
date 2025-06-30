import { Badge, Collapse, IconButton, Tooltip } from '@mui/material';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import FilterList from '@mui/icons-material/FilterList';
import SwapVert from '@mui/icons-material/SwapVert';
import { flexRender, Header } from '@tanstack/react-table';
import React from 'react';
import DebouncedFilterBox from './DebouncedFilterBox';

interface HeaderCellProps {
  header: Header<unknown, unknown>;
}

/**
 * @param {{ header: import('@tanstack/react-table').Header<unknown, unknown> }} props
 */
export default function HeaderCell({ header }: HeaderCellProps) {
  const [isFilterOpen, setIsFilterOpen] = React.useState(header.column.getIsFiltered());

  return (
    <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
      {/* Main header */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 18, flex: '1' }}>
          {flexRender(header.column.columnDef.header, header.getContext())}
        </h2>

        {/* Icon group */}
        {(header.column.getCanFilter() || header.column.getCanSort()) && (
          <div style={{ display: 'flex', gap: 8 }}>
            {header.column.getCanSort() && (
              <Tooltip
                placement="top"
                title={
                  {
                    asc: 'Sort ascending',
                    desc: 'Sort descending',
                  }[header.column.getNextSortingOrder() as string] || 'Unsort'
                }
              >
                <IconButton
                  size="small"
                  color={header.column.getIsSorted() ? 'primary' : undefined}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {{
                    asc: <ArrowDownward />,
                    desc: <ArrowUpward />,
                  }[header.column.getIsSorted() as string] || <SwapVert />}
                </IconButton>
              </Tooltip>
            )}

            {header.column.getCanFilter() && (
              <Tooltip title="Filter column" placement="top">
                <Badge variant="dot" color="primary" invisible={!header.column.getIsFiltered()}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setIsFilterOpen(!isFilterOpen);
                    }}
                  >
                    <FilterList />
                  </IconButton>
                </Badge>
              </Tooltip>
            )}
          </div>
        )}
      </div>

      {/* Hidden filter section */}
      {header.column.getCanFilter() && (
        <Collapse in={isFilterOpen}>
          <DebouncedFilterBox
            value={(header.column.getFilterValue() as string) || ''}
            onChange={(value) => header.column.setFilterValue(value)}
          />
        </Collapse>
      )}
    </div>
  );
}
