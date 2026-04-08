import React, { useEffect, useState } from 'react';
import Alert from './components/common/Alert';
import EmptyState from './components/common/EmptyState';
import Spinner from './components/common/Spinner';
import predictionService from './services/predictionService';
import { getApiErrorMessage } from './services/apiClient';

const Leaderboard = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLeaderboard = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await predictionService.getLeaderboard();
      setRecords(response);
    } catch (error) {
      setError(getApiErrorMessage(error, 'Unable to load leaderboard data.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <p className="eyebrow">Leaderboard</p>
          <h2>Top Performers</h2>
        </div>
        <button className="button-secondary button-compact" onClick={loadLeaderboard} type="button">
          Refresh
        </button>
      </div>

      <Alert tone="error">{error}</Alert>

      {loading ? (
        <Spinner label="Loading leaderboard..." />
      ) : records.length === 0 ? (
        <EmptyState
          title="No leaderboard data yet"
          description="Create student records or import performance data to populate the leaderboard."
        />
      ) : (
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student</th>
                <th>Department</th>
                <th>Total Score</th>
                <th>Exam</th>
                <th>Project</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {records.map((student, index) => (
                <tr key={student._id || student.registerNo || `${student.studentName}-${index}`}>
                  <td>{index + 1}</td>
                  <td>{student.studentName || student.registerNo || 'Student'}</td>
                  <td>{student.department || 'General'}</td>
                  <td>{Number(student.totalScore || 0).toFixed(1)}</td>
                  <td>{student.examScore}</td>
                  <td>{student.projectScore}</td>
                  <td>{student.attendance}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default Leaderboard;
