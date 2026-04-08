import React from 'react';

const Spinner = ({ label = 'Loading...' }) => (
  <div className="loading-state">
    <div className="spinner" />
    <p>{label}</p>
  </div>
);

export default Spinner;
