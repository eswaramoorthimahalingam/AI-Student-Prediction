import React from 'react';
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
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ACTIVITY_CONFIG,
  buildActivityAverageData,
  buildAttendanceScatterData,
  buildCategoryDistributionData,
  buildDepartmentActivityData,
  buildDepartmentChartData,
  buildDepartmentRiskHeatmap,
  buildLevelTrendData,
  buildRiskDistributionData,
  buildScoreBandData,
  CATEGORY_COLORS,
} from '../../utils/insightHelpers';

const ChartCard = ({ title, subtitle, className = '', children }) => (
  <section className={`chart-card ${className}`.trim()}>
    <div className="chart-card-header">
      <div>
        <p className="eyebrow">{subtitle}</p>
        <h3>{title}</h3>
      </div>
    </div>
    {children}
  </section>
);

const HeatCell = ({ value, total, color }) => {
  const intensity = total ? value / total : 0;
  return (
    <span
      className="heatmap-cell"
      style={{
        backgroundColor: `rgba(${color}, ${0.12 + intensity * 0.72})`,
        color: intensity > 0.45 ? '#fff' : '#1e2932',
      }}
    >
      {value}
    </span>
  );
};

const InsightCharts = ({ students }) => {
  const departmentData = buildDepartmentChartData(students);
  const riskData = buildRiskDistributionData(students);
  const categoryData = buildCategoryDistributionData(students);
  const scoreBandData = buildScoreBandData(students);
  const scatterData = buildAttendanceScatterData(students);
  const levelTrendData = buildLevelTrendData(students);
  const activityAverageData = buildActivityAverageData(students);
  const departmentActivityData = buildDepartmentActivityData(students);
  const heatmapRows = buildDepartmentRiskHeatmap(students);

  return (
    <div className="analytics-grid">
      <ChartCard subtitle="Live Enrollment" title="Students by Department">
        <div className="chart-shell">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={departmentData} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="rgba(20, 54, 66, 0.12)" strokeDasharray="3 3" />
              <XAxis dataKey="department" tick={{ fill: '#5c6673', fontSize: 11 }} />
              <YAxis tick={{ fill: '#5c6673', fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#127475" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard subtitle="Prediction Status" title="Risk Split">
        <div className="chart-shell">
          <ResponsiveContainer height="100%" width="100%">
            <PieChart>
              <Pie data={riskData} dataKey="value" innerRadius={52} outerRadius={90} paddingAngle={3}>
                {riskData.map((entry) => (
                  <Cell fill={entry.color} key={entry.label} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard subtitle="Score Quality" title="Performance Bands">
        <div className="chart-shell">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={categoryData} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="rgba(20, 54, 66, 0.12)" strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fill: '#5c6673', fontSize: 11 }} />
              <YAxis tick={{ fill: '#5c6673', fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {categoryData.map((entry) => (
                  <Cell fill={entry.color} key={entry.label} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard subtitle="Score Spread" title="Predicted Score Distribution">
        <div className="chart-shell">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={scoreBandData} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="rgba(20, 54, 66, 0.12)" strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fill: '#5c6673', fontSize: 11 }} />
              <YAxis tick={{ fill: '#5c6673', fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#c96d29" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard subtitle="Relationship View" title="Attendance vs Live Score" className="chart-card-wide">
        <div className="chart-shell chart-shell-wide">
          <ResponsiveContainer height="100%" width="100%">
            <ScatterChart margin={{ top: 12, right: 18, left: -8, bottom: 4 }}>
              <CartesianGrid stroke="rgba(20, 54, 66, 0.12)" strokeDasharray="3 3" />
              <XAxis
                dataKey="attendance"
                domain={[0, 100]}
                tick={{ fill: '#5c6673', fontSize: 11 }}
                type="number"
                name="Attendance"
              />
              <YAxis
                dataKey="score"
                domain={[0, 100]}
                tick={{ fill: '#5c6673', fontSize: 11 }}
                type="number"
                name="Score"
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={scatterData}>
                {scatterData.map((entry) => (
                  <Cell fill={CATEGORY_COLORS[entry.category]} key={`${entry.registerNo}-${entry.score}`} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard subtitle="Activity Snapshot" title="Average Activity Mix">
        <div className="chart-shell">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={activityAverageData} layout="vertical" margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
              <CartesianGrid stroke="rgba(20, 54, 66, 0.12)" strokeDasharray="3 3" />
              <XAxis domain={[0, 100]} tick={{ fill: '#5c6673', fontSize: 11 }} type="number" />
              <YAxis dataKey="label" tick={{ fill: '#5c6673', fontSize: 11 }} type="category" width={92} />
              <Tooltip />
              <Bar dataKey="average" radius={[0, 10, 10, 0]}>
                {activityAverageData.map((entry) => (
                  <Cell fill={entry.color} key={entry.id} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard subtitle="Term Trend" title="Average Score by Year / Semester">
        <div className="chart-shell">
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={levelTrendData} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="rgba(20, 54, 66, 0.12)" strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fill: '#5c6673', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#5c6673', fontSize: 11 }} />
              <Tooltip />
              <Line
                activeDot={{ r: 6 }}
                dataKey="averageScore"
                dot={{ fill: '#127475', r: 5 }}
                stroke="#127475"
                strokeWidth={3}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard subtitle="Department Mix" title="Activity Scores by Department" className="chart-card-wide">
        <div className="chart-shell chart-shell-wide">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={departmentActivityData} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="rgba(20, 54, 66, 0.12)" strokeDasharray="3 3" />
              <XAxis dataKey="department" tick={{ fill: '#5c6673', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#5c6673', fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {ACTIVITY_CONFIG.filter((entry) => entry.id !== 'overall').map((entry) => (
                <Bar dataKey={entry.id} fill={entry.color} key={entry.id} radius={[6, 6, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard subtitle="Department Monitoring" title="Risk Heatmap" className="chart-card-wide">
        <div className="heatmap-shell">
          <table className="heatmap-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Low Risk</th>
                <th>Moderate</th>
                <th>High Risk</th>
                <th>Pending</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {heatmapRows.map((row) => (
                <tr key={row.department}>
                  <td>{row.department}</td>
                  <td>
                    <HeatCell color="31, 122, 76" total={row.total} value={row.counts['Low Risk']} />
                  </td>
                  <td>
                    <HeatCell color="201, 109, 41" total={row.total} value={row.counts['Moderate Risk']} />
                  </td>
                  <td>
                    <HeatCell color="186, 58, 49" total={row.total} value={row.counts['High Risk']} />
                  </td>
                  <td>
                    <HeatCell color="18, 116, 117" total={row.total} value={row.counts['Awaiting Prediction']} />
                  </td>
                  <td>
                    <span className="heatmap-cell heat-cell-total">{row.total}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
};

export default InsightCharts;
