import React from 'react';
import { useAuth } from '../../context/AuthContext';
import UserTable from './UserTable';

function AdminPage() {
  const { user, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user || user.role !== 'admin') {
    return <div>Access Denied</div>;
  } else {
    return <UserTable />;
  }
}

export default AdminPage;
