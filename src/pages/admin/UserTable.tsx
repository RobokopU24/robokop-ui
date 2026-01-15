'use no memo';

import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import TableSortLabel from '@mui/material/TableSortLabel';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../../functions/userFunctions';
import useDebounce from '../../stores/useDebounce';
import EditModal from './EditModal';
import ChangeSelectedUserRoles from './ChangeSelectedUserRoles';
import DeleteSelectedUsers from './DeleteSelectedUsers';

function UserTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<any>(null);
  const [searchFilter, setSearchFilter] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('');
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const debouncedSearch = useDebounce(searchFilter, 300) as string;

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedUser(null);
    setIsEditModalOpen(false);
  };

  const handleBulkOperationSuccess = () => {
    setSelectedUsers([]);
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (!userList?.users) return;
    const allUserIds = userList.users.map((user: any) => user.id);
    const allSelected = allUserIds.every((id: string) => selectedUsers.includes(id));
    if (allSelected) {
      setSelectedUsers((prev) => prev.filter((id) => !allUserIds.includes(id)));
    } else {
      setSelectedUsers((prev) => [...new Set([...prev, ...allUserIds])]);
    }
  };

  const isAllSelected = () => {
    if (!userList?.users?.length) return false;
    return userList.users.every((user: any) => selectedUsers.includes(user.id));
  };

  const isSomeSelected = () => {
    if (!userList?.users?.length) return false;
    const someSelected = userList.users.some((user: any) => selectedUsers.includes(user.id));
    return someSelected && !isAllSelected();
  };

  const columns = [
    {
      id: 'select',
      header: () => (
        <Checkbox
          checked={isAllSelected()}
          indeterminate={isSomeSelected()}
          onChange={handleSelectAll}
          inputProps={{ 'aria-label': 'select all users' }}
        />
      ),
      cell: ({ row }: any) => (
        <Checkbox
          checked={selectedUsers.includes(row.original.id)}
          onChange={() => handleSelectUser(row.original.id)}
          inputProps={{ 'aria-label': `select ${row.original.name}` }}
        />
      ),
    },
    {
      accessorKey: 'name',
      header: 'User',
      cell: ({ row }: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={row.original.profilePicture} alt={row.original.name} />
          <span>{row.original.name}</span>
        </Box>
      ),
    },
    { accessorKey: 'email', header: 'Email' },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }: any) => {
        const role = row.original.role;
        return role ? role.charAt(0).toUpperCase() + role.slice(1) : '';
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }: any) => {
        const date = new Date(row.original.createdAt);
        return date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <IconButton
          onClick={() => handleEdit(row.original)}
          color="primary"
          size="small"
          aria-label="edit user"
        >
          <EditIcon />
        </IconButton>
      ),
    },
  ];

  const {
    data: userList,
    isLoading,
    isError,
    error: fetchError,
  } = useQuery({
    queryKey: ['users', debouncedSearch, roleFilter, page, rowsPerPage],
    queryFn: () =>
      getUsers({
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
        page: page + 1,
        limit: rowsPerPage,
      }),
  });

  React.useEffect(() => {
    setPage(0);
  }, [debouncedSearch, roleFilter]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const table = useReactTable({
    data: userList?.users || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  console.log('userList:', userList);

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
            <CircularProgress size={40} />
          </TableCell>
        </TableRow>
      );
    }

    if (isError) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} align="center" sx={{ py: 4, color: 'error.main' }}>
            Error: {fetchError.message}
          </TableCell>
        </TableRow>
      );
    }

    if (!userList?.users?.length) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
            No users found.
          </TableCell>
        </TableRow>
      );
    }

    return table.getRowModel().rows.map((row) => (
      <TableRow
        key={row.id}
        sx={{
          '&:last-child td, &:last-child th': { border: 0 },
          '&:hover': { backgroundColor: 'action.hover' },
          transition: 'background-color 0.2s ease-in-out',
          cursor: 'pointer',
        }}
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <div>
      {isEditModalOpen && (
        <EditModal isOpen={isEditModalOpen} onClose={closeEditModal} selectedUser={selectedUser} />
      )}
      {isChangeRoleModalOpen && (
        <ChangeSelectedUserRoles
          isOpen={isChangeRoleModalOpen}
          onClose={() => setIsChangeRoleModalOpen(false)}
          selectedUsers={userList?.users?.filter((u: any) => selectedUsers.includes(u.id)) || []}
          onSuccess={handleBulkOperationSuccess}
        />
      )}
      {isDeleteModalOpen && (
        <DeleteSelectedUsers
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          selectedUsers={userList?.users?.filter((u: any) => selectedUsers.includes(u.id)) || []}
          onSuccess={handleBulkOperationSuccess}
        />
      )}
      <h2 style={{ margin: '20px 0' }}>Users</h2>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Search by name or email"
          sx={{ minWidth: 250 }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="role-filter-label">Filter by Role</InputLabel>
          <Select
            labelId="role-filter-label"
            id="role-filter"
            value={roleFilter}
            label="Filter by Role"
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="premium">Premium</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ ml: 'auto', display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<SwapHorizIcon />}
            disabled={selectedUsers.length === 0}
            size="small"
            onClick={() => setIsChangeRoleModalOpen(true)}
          >
            Change Role
          </Button>

          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            disabled={selectedUsers.length === 0}
            size="small"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete Selected
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="user table">
          <TableHead>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableCell key={header.id}>
                    {header.isPlaceholder ? null : (
                      <TableSortLabel
                        active={header.column.getIsSorted() !== false}
                        direction={header.column.getIsSorted() || 'asc'}
                        onClick={header.column.getToggleSortingHandler()}
                        sx={{ cursor: 'pointer' }}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableSortLabel>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>{renderTableContent()}</TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={userList?.pagination?.total || 0}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </div>
  );
}

export default UserTable;
