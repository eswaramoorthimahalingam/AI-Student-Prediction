import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';

const PublicOnlyRoute = ({ children }) => {
  const { user, loading, defaultRoute } = useAuth();

  if (loading) {
    return (
      <div className="center-page">
        <Spinner label="Checking your session..." />
      </div>
    );
  }

  if (user) {
    return <Navigate replace to={defaultRoute} />;
  }

  return children;
};

export default PublicOnlyRoute;
