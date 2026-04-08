import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from './common/Alert';
import EmptyState from './common/EmptyState';
import Spinner from './common/Spinner';
import StatCard from './common/StatCard';
import performanceService from '../services/performanceService';
import predictionService from '../services/predictionService';
import studentService from '../services/studentService';
import { getApiErrorMessage } from '../services/apiClient';
import { getRoleLabel, isAdminLikeRole } from '../utils/roles';
import {
  buildAdminSummaryCards,
  buildStudentInsights,
  getStudentDisplayName,
  getStudentPredictedScore,
  getStudentRiskLevel,
} from '../utils/insightHelpers';
import InsightCharts from './dashboard/InsightCharts';
import RankedStudentsPanel from './dashboard/RankedStudentsPanel';
import ActivityLeaderboardPanel from './dashboard/ActivityLeaderboardPanel';
import StudentInsightModal from './dashboard/StudentInsightModal';
import StudentVisualDashboard from './dashboard/StudentVisualDashboard';

const DASHBOARD_REFRESH_MS = 30000;

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const TAB_OPTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'activities', label: 'Activities' },
];

const Dashboard = ({ mode = 'default' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [predictions, setPredictions] = useState([]);
  const [students, setStudents] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [submittingStudentId, setSubmittingStudentId] = useState('');
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const isAdminLike = isAdminLikeRole(user?.role);
  const isLegacyMode = mode === 'legacy';

  useEffect(() => {
    setActiveTab(isLegacyMode ? 'analytics' : 'overview');
  }, [isLegacyMode]);

  const loadDashboard = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }

    setError('');

    try {
      if (isAdminLike) {
        const [history, studentRecords] = await Promise.all([
          predictionService.getHistory(),
          studentService.listStudents(),
        ]);

        setPredictions(history);
        setStudents(studentRecords);
        setPerformances([]);
      } else {
        const [history, myPerformances] = await Promise.all([
          predictionService.getHistory(),
          performanceService.getMyPerformances(),
        ]);

        setPredictions(history);
        setPerformances(myPerformances);
        setStudents([]);
      }

      setLastSyncedAt(new Date());
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'Unable to load the dashboard right now.'));
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [isAdminLike]);

  useEffect(() => {
    loadDashboard();

    const timer = window.setInterval(() => {
      loadDashboard({ silent: true });
    }, DASHBOARD_REFRESH_MS);

    return () => window.clearInterval(timer);
  }, [loadDashboard]);

  const studentInsights = useMemo(() => buildStudentInsights(students), [students]);
  const recentPredictions = predictions.slice(0, 6);
  const highRiskStudents = studentInsights.filter((student) => getStudentRiskLevel(student) === 'High Risk').slice(0, 5);
  const recentlyUpdatedStudents = [...studentInsights]
    .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt))
    .slice(0, 5);

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

  const handlePredictStudent = async (student) => {
    setSubmittingStudentId(student._id);
    setError('');
    setSuccessMessage('');

    try {
      const result = await predictionService.predictStudent(student._id);
      setSuccessMessage(
        `${getStudentDisplayName(student)} updated with a live score of ${Number(result.predictedScore).toFixed(1)} (${result.riskLevel}).`
      );
      await loadDashboard({ silent: true });
    } catch (predictionError) {
      setError(getApiErrorMessage(predictionError, 'Unable to run prediction for this student.'));
    } finally {
      setSubmittingStudentId('');
    }
  };

  const renderAdminOverview = () => (
    <>
      <section className="card-grid card-grid-3">
        {buildAdminSummaryCards(studentInsights, predictions).map((card) => (
          <StatCard caption={card.caption} key={card.label} title={card.label} value={card.value} />
        ))}
      </section>

      <section className="dashboard-spotlight-grid">
        <article className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Intervention Queue</p>
              <h2>Students Needing Attention</h2>
            </div>
            <Link className="button-link" to="/students">
              Open student records
            </Link>
          </div>

          {highRiskStudents.length === 0 ? (
            <EmptyState
              description="Run predictions on more student records and high-risk students will surface here automatically."
              title="No high-risk students right now"
            />
          ) : (
            <div className="history-list compact-history-list">
              {highRiskStudents.map((student) => (
                <article className="history-item compact-history-item" key={student._id}>
                  <div>
                    <h3>{getStudentDisplayName(student)}</h3>
                    <p>
                      {student.department} • {student.levelLabel}
                    </p>
                  </div>
                  <div className="history-meta">
                    <span className="status-chip status-chip-critical">{getStudentRiskLevel(student)}</span>
                    <button
                      className="button-ghost button-compact"
                      onClick={() => setSelectedStudent(student)}
                      type="button"
                    >
                      Open
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>

        <article className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Prediction Timeline</p>
              <h2>Recent Predictions</h2>
            </div>
            <Link className="button-link" to="/history">
              Open full history
            </Link>
          </div>

          {recentPredictions.length === 0 ? (
            <EmptyState
              description="Prediction runs created from stored records or the predictor page will appear here."
              title="No predictions yet"
            />
          ) : (
            <div className="history-list compact-history-list">
              {recentPredictions.map((prediction) => (
                <article className="history-item compact-history-item" key={prediction._id}>
                  <div>
                    <h3>{prediction.student?.studentName || prediction.studentName || 'Manual prediction'}</h3>
                    <p>{formatDate(prediction.createdAt)}</p>
                  </div>
                  <div className="history-meta">
                    <span className={`badge ${prediction.pass ? 'badge-success' : 'badge-danger'}`}>
                      {prediction.pass ? 'Pass' : 'Needs Attention'}
                    </span>
                    <strong>{Number(prediction.predictedScore).toFixed(1)}</strong>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="dashboard-spotlight-grid">
        <article className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Latest Record Changes</p>
              <h2>Recently Updated Students</h2>
            </div>
          </div>

          {recentlyUpdatedStudents.length === 0 ? (
            <EmptyState description="Create or update a student to populate this stream." title="No student updates yet" />
          ) : (
            <div className="history-list compact-history-list">
              {recentlyUpdatedStudents.map((student) => (
                <article className="history-item compact-history-item" key={student._id}>
                  <div>
                    <h3>{getStudentDisplayName(student)}</h3>
                    <p>
                      {student.department} • {student.levelLabel}
                    </p>
                  </div>
                  <div className="history-meta">
                    <span className="metric-pill">{Number(student.totalScore || 0).toFixed(1)} total</span>
                    <button className="button-ghost button-compact" onClick={() => setSelectedStudent(student)} type="button">
                      Inspect
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>

        <article className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Top Performers</p>
              <h2>Live Score Leaders</h2>
            </div>
          </div>

          {studentInsights.length === 0 ? (
            <EmptyState description="Add student records to start building a live leaderboard." title="Leaderboard is empty" />
          ) : (
            <div className="history-list compact-history-list">
              {studentInsights.slice(0, 5).map((student) => (
                <article className="history-item compact-history-item" key={student._id}>
                  <div>
                    <h3>
                      #{student.rank} {getStudentDisplayName(student)}
                    </h3>
                    <p>{student.department}</p>
                  </div>
                  <div className="history-meta">
                    <strong>{getStudentPredictedScore(student)}</strong>
                    <button className="button-ghost button-compact" onClick={() => setSelectedStudent(student)} type="button">
                      Open
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      </section>
    </>
  );

  const renderUserDashboard = () => (
    <StudentVisualDashboard mode={isLegacyMode ? 'legacy' : 'default'} performances={performances} predictions={predictions} user={user} />
  );

  return (
    <div className="content-stack">
      <section className={`hero-panel ${isLegacyMode ? 'legacy-hero-panel' : ''}`.trim()}>
        <div>
          <p className="eyebrow">
            {isLegacyMode
              ? 'Legacy Portal View'
              : isAdminLike
                ? 'Live Admin Portal'
                : 'Personal Workspace'}
          </p>
          <h1>
            {isLegacyMode
              ? isAdminLike
                ? 'Legacy Student Portal'
                : 'Legacy Student Workspace'
              : isAdminLike
                ? 'Student Insight Hub'
                : `${getRoleLabel(user?.role)} Dashboard`}
          </h1>
          <p className="hero-copy">
            {isLegacyMode
              ? isAdminLike
                ? `Welcome back, ${user?.name}. This legacy-style portal brings the older visual navigation back on top of the live student registry, analytics, and prediction engine.`
                : `Welcome back, ${user?.name}. This legacy-style student workspace now shows your own prediction journey and progress visuals instead of sharing the admin layout.`
              : isAdminLike
                ? `Welcome back, ${user?.name}. The legacy analytics experience now runs directly on live student CRUD records, saved predictions, and the current backend APIs.`
                : `Welcome back, ${user?.name}. Your ${getRoleLabel(user?.role).toLowerCase()} workspace keeps prediction history and saved performance logs together in one portal.`}
          </p>
        </div>

        <div className="quick-actions">
          <Link className="button-primary" to={isAdminLike ? '/students/new' : '/predictor'}>
            {isAdminLike ? 'Add Student' : 'Run Prediction'}
          </Link>
          <Link className="button-secondary" to={isAdminLike ? '/students' : '/history'}>
            {isAdminLike ? 'Manage Records' : 'View History'}
          </Link>
          {!isLegacyMode && (
            <Link className="button-ghost" to="/legacy-portal">
              Legacy Portal
            </Link>
          )}
          {isLegacyMode && (
            <Link className="button-ghost" to={isAdminLike ? '/admin' : '/dashboard'}>
              Back to Main View
            </Link>
          )}
          {isAdminLike && (
            <button className="button-ghost" onClick={() => loadDashboard()} type="button">
              Refresh Live Data
            </button>
          )}
          {lastSyncedAt && <span className="metric-pill">Last sync: {formatDate(lastSyncedAt)}</span>}
        </div>
      </section>

      <Alert tone="error">{error}</Alert>
      <Alert tone="success">{successMessage}</Alert>

      {loading ? (
        <section className="panel">
          <Spinner label="Loading portal insights..." />
        </section>
      ) : isAdminLike && studentInsights.length === 0 ? (
        <section className="panel">
          <EmptyState
            description="Create your first live student record and the dashboard will immediately fill with analytics, leaderboard rankings, and activity views."
            title="No student records yet"
          />
        </section>
      ) : (
        <>
          {isAdminLike && (
            <section className={`tab-strip ${isLegacyMode ? 'legacy-tab-panel' : 'tab-strip-panel'}`.trim()}>
              {TAB_OPTIONS.map((tab) => (
                <button
                  className={`tab-button ${activeTab === tab.id ? 'tab-button-active' : ''}`}
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </section>
          )}

          {isAdminLike ? (
            <>
              {activeTab === 'overview' && renderAdminOverview()}
              {activeTab === 'analytics' && <InsightCharts students={studentInsights} />}
              {activeTab === 'leaderboard' && (
                <RankedStudentsPanel onSelectStudent={setSelectedStudent} students={studentInsights} />
              )}
              {activeTab === 'activities' && (
                <ActivityLeaderboardPanel onSelectStudent={setSelectedStudent} students={studentInsights} />
              )}
            </>
          ) : (
            renderUserDashboard()
          )}
        </>
      )}

      <StudentInsightModal
        onClose={() => setSelectedStudent(null)}
        onPredict={isAdminLike ? handlePredictStudent : null}
        predicting={submittingStudentId === selectedStudent?._id}
        predictions={predictions}
        student={selectedStudent}
        students={studentInsights}
      />
    </div>
  );
};

export default Dashboard;
