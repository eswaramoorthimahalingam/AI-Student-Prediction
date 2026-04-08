import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import EmptyState from '../common/EmptyState';
import {
  buildUserPerformanceCompositionData,
  buildUserPredictionTrendData,
  buildUserRiskMixData,
  buildUserScoreComparisonData,
  RISK_COLORS,
} from '../../utils/insightHelpers';

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const StudentVisualDashboard = ({ user, predictions, performances, mode = 'default' }) => {
  const trendData = buildUserPredictionTrendData(predictions);
  const riskMixData = buildUserRiskMixData(predictions);
  const performanceCompositionData = buildUserPerformanceCompositionData(performances);
  const comparisonData = buildUserScoreComparisonData(predictions, performances);

  const latestPrediction = predictions[0] || null;
  const latestPerformance = performances[0] || null;
  const averagePredictedScore = predictions.length
    ? (predictions.reduce((sum, prediction) => sum + Number(prediction.predictedScore || 0), 0) / predictions.length).toFixed(1)
    : '0.0';
  const bestPrediction = predictions.length
    ? Math.max(...predictions.map((prediction) => Number(prediction.predictedScore || 0))).toFixed(1)
    : '0.0';
  const averageInputScore = performances.length
    ? (performances.reduce((sum, performance) => sum + Number(performance.totalScore || 0), 0) / performances.length).toFixed(1)
    : '0.0';
  const highRiskCount = predictions.filter((prediction) => prediction.riskLevel === 'High Risk').length;
  const sectionTitle = mode === 'legacy' ? 'Legacy Student Portal' : 'Student Performance Studio';

  return (
    <div className={`student-visual-shell ${mode === 'legacy' ? 'student-visual-shell-legacy' : ''}`.trim()}>
      <section className={`student-visual-hero ${mode === 'legacy' ? 'student-visual-hero-legacy' : ''}`.trim()}>
        <div>
          <p className="eyebrow">{mode === 'legacy' ? 'Legacy Student Portal' : 'Personal Analytics'}</p>
          <h2>{sectionTitle}</h2>
          <p className="hero-copy">
            {mode === 'legacy'
              ? `A visual view of ${user?.name}'s progress, prediction movement, and learning signals in a portal inspired by the legacy experience.`
              : `A student-first analytics workspace for ${user?.name} with clearer charts, progress visuals, and performance history separated from the admin view.`}
          </p>
        </div>

        <div className="quick-actions">
          <Link className="button-primary" to="/predictor">
            Run Prediction
          </Link>
          <Link className="button-secondary" to="/history">
            View History
          </Link>
          {mode !== 'legacy' && (
            <Link className="button-ghost" to="/legacy-portal">
              Open Legacy Portal
            </Link>
          )}
        </div>
      </section>

      <section className="student-visual-stat-grid">
        <article className="student-visual-stat-card">
          <span>Predictions</span>
          <strong>{predictions.length}</strong>
          <p>Saved prediction runs under your account.</p>
        </article>
        <article className="student-visual-stat-card">
          <span>Average Score</span>
          <strong>{averagePredictedScore}</strong>
          <p>Average score returned by the live prediction model.</p>
        </article>
        <article className="student-visual-stat-card">
          <span>Best Score</span>
          <strong>{bestPrediction}</strong>
          <p>Highest prediction result in your personal history.</p>
        </article>
        <article className="student-visual-stat-card">
          <span>Input Average</span>
          <strong>{averageInputScore}</strong>
          <p>Average weighted score from saved performance inputs.</p>
        </article>
        <article className="student-visual-stat-card">
          <span>High Risk</span>
          <strong>{highRiskCount}</strong>
          <p>Prediction results that need more attention.</p>
        </article>
      </section>

      <div className="analytics-grid student-analytics-grid">
        <section className="chart-card chart-card-wide">
          <div className="chart-card-header">
            <div>
              <p className="eyebrow">Prediction Journey</p>
              <h3>Predicted vs Weighted Score</h3>
            </div>
          </div>
          {trendData.length === 0 ? (
            <EmptyState
              description="Run predictions from the predictor page and the trend line will appear here."
              title="No trend data yet"
            />
          ) : (
            <div className="chart-shell chart-shell-wide">
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={trendData} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(20, 54, 66, 0.12)" strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fill: '#5c6673', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#5c6673', fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line dataKey="predictedScore" dot={{ r: 5 }} name="Predicted Score" stroke="#127475" strokeWidth={3} type="monotone" />
                  <Line dataKey="weightedScore" dot={{ r: 5 }} name="Weighted Input" stroke="#c96d29" strokeWidth={3} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="chart-card">
          <div className="chart-card-header">
            <div>
              <p className="eyebrow">Risk Breakdown</p>
              <h3>Personal Risk Mix</h3>
            </div>
          </div>
          {predictions.length === 0 ? (
            <EmptyState
              description="Your risk mix appears automatically once predictions are saved."
              title="No risk data yet"
            />
          ) : (
            <div className="chart-shell">
              <ResponsiveContainer height="100%" width="100%">
                <PieChart>
                  <Pie data={riskMixData} dataKey="value" innerRadius={52} outerRadius={90} paddingAngle={3}>
                    {riskMixData.map((entry) => (
                      <Cell fill={entry.color} key={entry.label} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="chart-card">
          <div className="chart-card-header">
            <div>
              <p className="eyebrow">Skill Composition</p>
              <h3>Average Input Strengths</h3>
            </div>
          </div>
          <div className="chart-shell">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={performanceCompositionData} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="rgba(20, 54, 66, 0.12)" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fill: '#5c6673', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#5c6673', fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {performanceCompositionData.map((entry) => (
                    <Cell fill={entry.color} key={entry.label} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="chart-card chart-card-wide">
          <div className="chart-card-header">
            <div>
              <p className="eyebrow">Score Comparison</p>
              <h3>Personal Benchmarks</h3>
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
      </div>

      <section className="dashboard-spotlight-grid">
        <article className="panel student-focus-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Latest Snapshot</p>
              <h2>Focus Areas</h2>
            </div>
          </div>

          <div className="student-focus-grid">
            <article className="student-focus-card">
              <span>Latest Prediction</span>
              <strong>{latestPrediction ? Number(latestPrediction.predictedScore).toFixed(1) : 'Pending'}</strong>
              <p>{latestPrediction ? `Recorded on ${formatDate(latestPrediction.createdAt)}.` : 'Run a prediction to generate your first model output.'}</p>
            </article>
            <article className="student-focus-card">
              <span>Latest Risk</span>
              <strong style={{ color: RISK_COLORS[latestPrediction?.riskLevel || 'Awaiting Prediction'] || '#127475' }}>
                {latestPrediction?.riskLevel || 'Awaiting Prediction'}
              </strong>
              <p>
                {latestPrediction
                  ? latestPrediction.pass
                    ? 'Keep building consistency across coursework and attendance.'
                    : 'Focus on exam, assignment, and attendance improvements first.'
                  : 'No model result has been saved yet.'}
              </p>
            </article>
            <article className="student-focus-card">
              <span>Latest Weighted Input</span>
              <strong>{latestPerformance ? Number(latestPerformance.totalScore || 0).toFixed(1) : '0.0'}</strong>
              <p>
                {latestPerformance
                  ? `Most recent saved performance from ${latestPerformance.department || 'your department'}.`
                  : 'Save a performance entry from the predictor to start seeing input trends.'}
              </p>
            </article>
          </div>
        </article>

        <article className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Recent Runs</p>
              <h2>Prediction Timeline</h2>
            </div>
          </div>

          {predictions.length === 0 ? (
            <EmptyState
              description="Your saved predictions will appear here once you start using the predictor."
              title="No predictions yet"
            />
          ) : (
            <div className="history-list compact-history-list">
              {predictions.slice(0, 5).map((prediction) => (
                <article className="history-item compact-history-item" key={prediction._id}>
                  <div>
                    <h3>{prediction.studentName || prediction.student?.studentName || user?.name}</h3>
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
    </div>
  );
};

export default StudentVisualDashboard;
