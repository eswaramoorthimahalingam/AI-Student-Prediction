import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/common/Alert';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import StatCard from '../components/common/StatCard';
import StudentInsightModal from '../components/dashboard/StudentInsightModal';
import { getApiErrorMessage } from '../services/apiClient';
import performanceService from '../services/performanceService';
import predictionService from '../services/predictionService';
import studentService from '../services/studentService';
import {
  buildStudentInsights,
  buildStudentManagementCards,
  getStudentDisplayName,
  getStudentPredictedScore,
  getStudentRiskLevel,
} from '../utils/insightHelpers';

const STUDENT_REFRESH_MS = 30000;

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [predictionFilter, setPredictionFilter] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [submittingId, setSubmittingId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  const loadStudents = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }

    setError('');

    try {
      const [studentRecords, predictionHistory] = await Promise.all([
        studentService.listStudents(),
        predictionService.getHistory(),
      ]);

      setStudents(studentRecords);
      setPredictions(predictionHistory);
      setLastSyncedAt(new Date());
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'Unable to load student records.'));
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadStudents();

    const timer = window.setInterval(() => {
      loadStudents({ silent: true });
    }, STUDENT_REFRESH_MS);

    return () => window.clearInterval(timer);
  }, [loadStudents]);

  const studentInsights = useMemo(() => buildStudentInsights(students), [students]);

  const departments = useMemo(
    () => ['All', ...new Set(studentInsights.map((student) => student.department).filter(Boolean))],
    [studentInsights]
  );

  const filteredStudents = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return studentInsights.filter((student) => {
      const matchesSearch =
        !searchTerm ||
        getStudentDisplayName(student).toLowerCase().includes(searchTerm) ||
        student.registerNo.toLowerCase().includes(searchTerm) ||
        student.department.toLowerCase().includes(searchTerm);
      const matchesDepartment = departmentFilter === 'All' || student.department === departmentFilter;
      const matchesRisk = riskFilter === 'All' || getStudentRiskLevel(student) === riskFilter;
      const matchesPrediction =
        predictionFilter === 'All' ||
        (predictionFilter === 'Predicted' && Boolean(student.lastPrediction?.createdAt)) ||
        (predictionFilter === 'Pending' && !student.lastPrediction?.createdAt);

      return matchesSearch && matchesDepartment && matchesRisk && matchesPrediction;
    });
  }, [departmentFilter, predictionFilter, riskFilter, search, studentInsights]);

  useEffect(() => {
    if (!selectedStudent?._id) {
      return;
    }

    const nextSelectedStudent = studentInsights.find((student) => student._id === selectedStudent._id);

    if (!nextSelectedStudent) {
      setSelectedStudent(null);
      return;
    }

    if (nextSelectedStudent !== selectedStudent) {
      setSelectedStudent(nextSelectedStudent);
    }
  }, [selectedStudent, studentInsights]);

  const handleDelete = async (student) => {
    const confirmed = window.confirm(`Delete ${getStudentDisplayName(student)}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setError('');
    setMessage('');
    setSubmittingId(student._id);

    try {
      await studentService.deleteStudent(student._id);
      setMessage('Student record deleted successfully.');
      if (selectedStudent?._id === student._id) {
        setSelectedStudent(null);
      }
      await loadStudents({ silent: true });
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, 'Unable to delete the student record.'));
    } finally {
      setSubmittingId('');
    }
  };

  const handlePredict = async (student) => {
    setError('');
    setMessage('');
    setSubmittingId(student._id);

    try {
      const result = await predictionService.predictStudent(student._id);
      setMessage(
        `${getStudentDisplayName(student)} predicted successfully with score ${Number(result.predictedScore).toFixed(1)} (${result.riskLevel}).`
      );
      await loadStudents({ silent: true });
    } catch (predictionError) {
      setError(getApiErrorMessage(predictionError, 'Unable to run prediction for this student.'));
    } finally {
      setSubmittingId('');
    }
  };

  const handleImportCsv = async (event) => {
    event.preventDefault();

    if (!importFile) {
      setError('Choose a CSV file before starting an import.');
      return;
    }

    setImporting(true);
    setError('');
    setMessage('');

    try {
      const result = await performanceService.importCsv(importFile);
      setMessage(`Imported ${result.imported} rows and synced the live student registry.`);
      setImportFile(null);
      await loadStudents({ silent: true });
    } catch (importError) {
      setError(getApiErrorMessage(importError, 'Unable to import the CSV file.'));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="content-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Admin Student Management</p>
          <h1>Live Student Records</h1>
          <p className="page-copy">
            Manage real student data with search, filters, CSV import, CRUD operations, saved predictions, and a live
            analytics drill-down for each record.
          </p>
        </div>
      </section>

      <section className="panel">
        <div className="toolbar">
          <div>
            <p className="eyebrow">Realtime Sync</p>
            <h2>Student Registry Control Center</h2>
            {lastSyncedAt && <p className="field-hint">Last synced {formatDate(lastSyncedAt)}</p>}
          </div>

          <div className="quick-actions">
            <button className="button-secondary" onClick={() => loadStudents()} type="button">
              Refresh Data
            </button>
            <Link className="button-primary" to="/students/new">
              Add Student
            </Link>
          </div>
        </div>
      </section>

      <section className="card-grid">
        {buildStudentManagementCards(filteredStudents).map((card) => (
          <StatCard caption={card.caption} key={card.label} title={card.label} value={card.value} />
        ))}
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Bulk Import</p>
            <h2>CSV Sync</h2>
          </div>
        </div>

        <form className="toolbar import-toolbar" onSubmit={handleImportCsv}>
          <label className="field inline-field">
            <span className="field-label">Upload CSV</span>
            <input accept=".csv" onChange={(event) => setImportFile(event.target.files?.[0] || null)} type="file" />
          </label>

          <button className="button-secondary" disabled={importing} type="submit">
            {importing ? 'Importing...' : 'Import and Sync'}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="toolbar">
          <div className="search-form leaderboard-filters">
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, register number, or department"
              type="text"
              value={search}
            />

            <select onChange={(event) => setDepartmentFilter(event.target.value)} value={departmentFilter}>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>

            <select onChange={(event) => setRiskFilter(event.target.value)} value={riskFilter}>
              <option value="All">All risk states</option>
              <option value="Low Risk">Low Risk</option>
              <option value="Moderate Risk">Moderate Risk</option>
              <option value="High Risk">High Risk</option>
              <option value="Awaiting Prediction">Awaiting Prediction</option>
            </select>

            <select onChange={(event) => setPredictionFilter(event.target.value)} value={predictionFilter}>
              <option value="All">All prediction states</option>
              <option value="Predicted">Predicted</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </section>

      <Alert tone="success">{message}</Alert>
      <Alert tone="error">{error}</Alert>

      <section className="panel">
        {loading ? (
          <Spinner label="Loading student records..." />
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            description="Try relaxing the filters, importing a CSV file, or creating a new student record."
            title="No student records match the current view"
          />
        ) : (
          <div className="table-shell">
            <table className="data-table leaderboard-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Register No</th>
                  <th>Department</th>
                  <th>Level</th>
                  <th>Live Score</th>
                  <th>Weighted Total</th>
                  <th>Risk</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id}>
                    <td>{getStudentDisplayName(student)}</td>
                    <td>{student.registerNo}</td>
                    <td>{student.department}</td>
                    <td>{student.levelLabel}</td>
                    <td>{getStudentPredictedScore(student)}</td>
                    <td>{Number(student.totalScore || 0).toFixed(1)}</td>
                    <td>
                      <span className="status-chip status-chip-neutral">{getStudentRiskLevel(student)}</span>
                    </td>
                    <td>{student.updatedAt ? formatDate(student.updatedAt) : 'Recently added'}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="button-secondary button-compact"
                          disabled={submittingId === student._id}
                          onClick={() => handlePredict(student)}
                          type="button"
                        >
                          {submittingId === student._id ? 'Predicting...' : 'Predict'}
                        </button>
                        <button className="button-ghost button-compact" onClick={() => setSelectedStudent(student)} type="button">
                          Open
                        </button>
                        <Link className="button-ghost button-compact" to={`/students/${student._id}/edit`}>
                          Edit
                        </Link>
                        <button
                          className="button-ghost button-compact"
                          disabled={submittingId === student._id}
                          onClick={() => handleDelete(student)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <StudentInsightModal
        onClose={() => setSelectedStudent(null)}
        onPredict={handlePredict}
        predicting={submittingId === selectedStudent?._id}
        predictions={predictions}
        student={selectedStudent}
        students={studentInsights}
      />
    </div>
  );
};

export default StudentsPage;
