import React from 'react';
import AdminPanel from './AdminPanel'; // Faculty has same import as admin

const FacultyPanel = () => (
  <div className="panel">
    <h2>Faculty Panel</h2>
    <AdminPanel />
    <p>Manage student data</p>
  </div>
);

export default FacultyPanel;

