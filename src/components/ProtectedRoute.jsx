import { Navigate, useLocation } from 'react-router-dom';
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from './AlertProvider';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
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
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
