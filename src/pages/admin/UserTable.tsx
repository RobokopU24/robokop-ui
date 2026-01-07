import React, { useEffect } from 'react';
import { adminRoutes } from '../../API/routes';
import { authApi } from '../../API/baseUrlProxy';
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

function UserTable() {
  const [userList, setUserList] = React.useState<Array<any>>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const handleEdit = (user: any) => {
    // TODO: Implement edit functionality
    console.log('Edit user:', user);
  };

  const columns = [
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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await authApi.get(adminRoutes.users);
        setUserList(res.data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const table = useReactTable({
    data: userList,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  if (loading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (userList.length === 0) {
    return <div>No users found.</div>;
  }

  return (
    <div>
      <h2 style={{ margin: '20px 0' }}>Users</h2>
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
          <TableBody>
            {table.getRowModel().rows.map((row) => (
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default UserTable;
