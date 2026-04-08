import React from 'react';

const Alert = ({ children, tone = 'info' }) => {
  if (!children) {
    return null;
  }

  return <div className={`alert alert-${tone}`}>{children}</div>;
};

export default Alert;
