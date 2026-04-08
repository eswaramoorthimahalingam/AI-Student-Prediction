import React, { useEffect } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  buildStudentBarData,
  buildStudentComparison,
  buildStudentPredictionHistory,
  buildStudentRadarData,
  CATEGORY_COLORS,
  getStudentCategory,
  getStudentDisplayName,
  getStudentPredictedScore,
  getStudentRegisterNo,
  getStudentRiskLevel,
} from '../../utils/insightHelpers';

const formatDate = (value) => {
  if (!value) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

const StudentInsightModal = ({ student, students, predictions, onClose, onPredict, predicting }) => {
  useEffect(() => {
    if (!student) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, student]);

  if (!student) {
    return null;
  }

  const category = getStudentCategory(student);
  const predictionHistory = buildStudentPredictionHistory(student, predictions).slice(0, 5);
  const comparisonData = buildStudentComparison(student, students);
  const radarData = buildStudentRadarData(student);
  const barData = buildStudentBarData(student);

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        aria-label={`${getStudentDisplayName(student)} insight panel`}
        className="modal-panel insight-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-hero">
          <div>
            <p className="eyebrow">Student Insight</p>
            <h2>{getStudentDisplayName(student)}</h2>
            <p className="modal-copy">
              {student.department} • {student.levelLabel}
            </p>
            <div className="chip-row">
              <span className={`status-chip status-chip-${category.toLowerCase()}`}>{category} band</span>
              <span className="status-chip status-chip-neutral">{getStudentRiskLevel(student)}</span>
              <span className="status-chip status-chip-neutral">{getStudentRegisterNo(student)}</span>
            </div>
          </div>

          <div className="modal-actions">
            {onPredict && (
              <button className="button-secondary" disabled={predicting} onClick={() => onPredict(student)} type="button">
                {predicting ? 'Predicting...' : 'Run Prediction'}
              </button>
            )}
            <button className="button-ghost" onClick={onClose} type="button">
              Close
            </button>
          </div>
        </div>

        <div className="insight-stat-grid">
          <article className="insight-stat-card">
            <span>Live Score</span>
            <strong>{getStudentPredictedScore(student)}</strong>
            <p>Prediction result when available, otherwise the weighted score.</p>
          </article>
          <article className="insight-stat-card">
            <span>Weighted Total</span>
            <strong>{Number(student.totalScore || 0).toFixed(1)}</strong>
            <p>Score assembled from exam, assignment, project, and activity inputs.</p>
          </article>
          <article className="insight-stat-card">
            <span>Attendance</span>
            <strong>{Number(student.attendance || 0).toFixed(0)}%</strong>
            <p>Live attendance contribution used by the current model.</p>
          </article>
          <article className="insight-stat-card">
            <span>Last Prediction</span>
            <strong>{student.lastPrediction?.createdAt ? formatDate(student.lastPrediction.createdAt) : 'Pending'}</strong>
            <p>Most recent saved prediction timestamp for this student record.</p>
          </article>
        </div>

        <div className="analytics-grid insight-grid">
          <section className="chart-card">
            <div className="chart-card-header">
              <div>
                <p className="eyebrow">Performance Profile</p>
                <h3>Input Radar</h3>
              </div>
            </div>
            <div className="chart-shell chart-shell-medium">
              <ResponsiveContainer height="100%" width="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(20, 54, 66, 0.16)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#5c6673', fontSize: 11 }} />
                  <Radar
                    dataKey="value"
                    fill={CATEGORY_COLORS[category]}
                    fillOpacity={0.22}
                    stroke={CATEGORY_COLORS[category]}
                    strokeWidth={2}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="chart-card">
            <div className="chart-card-header">
              <div>
                <p className="eyebrow">Component Scores</p>
                <h3>Strength Breakdown</h3>
              </div>
            </div>
            <div className="chart-shell chart-shell-medium">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={barData} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(20, 54, 66, 0.12)" strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fill: '#5c6673', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#5c6673', fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {barData.map((item) => (
                      <Cell fill={item.color} key={item.label} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <section className="chart-card">
          <div className="chart-card-header">
            <div>
              <p className="eyebrow">Comparison</p>
              <h3>Department Context</h3>
            </div>
          </div>
          <div className="comparison-grid">
            {comparisonData.map((item) => (
              <article className="comparison-card" key={item.label}>
                <strong style={{ color: item.color }}>{item.value}</strong>
                <span>{item.label}</span>
                <div className="comparison-track">
                  <div className="comparison-bar" style={{ backgroundColor: item.color, width: `${item.value}%` }} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="chart-card">
          <div className="chart-card-header">
            <div>
              <p className="eyebrow">Prediction Audit</p>
              <h3>Recent Runs</h3>
            </div>
          </div>

          {predictionHistory.length === 0 ? (
            <div className="empty-state compact-empty-state">
              <p>No saved predictions yet for this student.</p>
            </div>
          ) : (
            <div className="history-list compact-history-list">
              {predictionHistory.map((prediction) => (
                <article className="history-item compact-history-item" key={prediction._id}>
                  <div>
                    <h3>{Number(prediction.predictedScore).toFixed(1)} predicted score</h3>
                    <p>{formatDate(prediction.createdAt)}</p>
                  </div>
                  <div className="history-meta">
                    <span className={`badge ${prediction.pass ? 'badge-success' : 'badge-danger'}`}>
                      {prediction.pass ? 'Pass' : 'Needs Attention'}
                    </span>
                    <span className="metric-pill">{prediction.riskLevel}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default StudentInsightModal;
