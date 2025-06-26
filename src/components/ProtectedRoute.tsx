import { Navigate } from '@tanstack/react-router';
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from './AlertProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { displayAlert } = useAlert();

  if (loading) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    displayAlert('error', 'You must be logged in to access this page.');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
