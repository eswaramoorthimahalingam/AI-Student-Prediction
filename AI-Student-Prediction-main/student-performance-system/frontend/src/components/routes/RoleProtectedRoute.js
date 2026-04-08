import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';

const RoleProtectedRoute = ({ allowedRoles }) => {
  const { user, loading, defaultRoute } = useAuth();

  if (loading) {
    return (
      <div className="center-page">
        <Spinner label="Verifying access..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate replace to="/" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate replace to={defaultRoute} />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
