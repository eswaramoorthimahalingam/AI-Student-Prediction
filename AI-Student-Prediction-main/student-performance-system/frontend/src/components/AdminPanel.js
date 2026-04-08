import React, { useState } from 'react';

const AdminPanel = () => {
  const [file, setFile] = useState(null);

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('csv', file);
    try {
      await fetch('http://localhost:5000/api/import-csv', {
        method: 'POST',
        headers: { 'Authorization': localStorage.getItem('token') },
        body: formData
      });
      alert('Imported successfully');
    } catch (error) {
      alert('Import failed');
    }
  };

  return (
    <div className="panel">
      <h2>Admin Panel</h2>
      <form onSubmit={handleImport}>
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit">Import CSV Data</button>
      </form>
      <p>CSV format: studentId,examScore,assignmentScore,seminarScore,projectScore,sportsScore,hackathonScore,attendance</p>
    </div>
  );
};

export default AdminPanel;

