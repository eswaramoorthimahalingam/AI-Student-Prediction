import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="center-page">
        <Spinner label="Preparing your workspace..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate replace state={{ from: location }} to="/" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
