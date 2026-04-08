import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentPanel = () => {
  const [performances, setPerformances] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/my-performances').then(res => setPerformances(res.data));
  }, []);

  return (
    <div className="panel">
      <h2>My Performances</h2>
      {performances.length === 0 ? (
        <p>No performances yet</p>
      ) : (
        <ul>
          {performances.map((p, i) => (
            <li key={i}>Score: {p.totalScore.toFixed(1)}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudentPanel;

