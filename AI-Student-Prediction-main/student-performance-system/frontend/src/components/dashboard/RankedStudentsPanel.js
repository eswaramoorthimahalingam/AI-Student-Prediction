import React, { useEffect, useMemo, useState } from 'react';
import EmptyState from '../common/EmptyState';
import {
  CATEGORY_COLORS,
  getStudentDisplayName,
  getStudentPredictedScore,
  getStudentRegisterNo,
  getStudentRiskLevel,
} from '../../utils/insightHelpers';

const PAGE_SIZE = 10;

const RankedStudentsPanel = ({ students, onSelectStudent }) => {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [riskLevel, setRiskLevel] = useState('All');
  const [sortBy, setSortBy] = useState('predictedScore');
  const [sortDirection, setSortDirection] = useState('desc');
  const [page, setPage] = useState(1);

  const departments = useMemo(
    () => ['All', ...new Set(students.map((student) => student.department).filter(Boolean))],
    [students]
  );

  const filteredStudents = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    const nextStudents = students.filter((student) => {
      const matchesSearch =
        !searchTerm ||
        getStudentDisplayName(student).toLowerCase().includes(searchTerm) ||
        getStudentRegisterNo(student).toLowerCase().includes(searchTerm);
      const matchesDepartment = department === 'All' || student.department === department;
      const matchesRisk = riskLevel === 'All' || getStudentRiskLevel(student) === riskLevel;

      return matchesSearch && matchesDepartment && matchesRisk;
    });

    return [...nextStudents].sort((left, right) => {
      const leftValue =
        sortBy === 'predictedScore'
          ? getStudentPredictedScore(left)
          : sortBy === 'attendance'
            ? Number(left.attendance || 0)
            : Number(left.totalScore || 0);
      const rightValue =
        sortBy === 'predictedScore'
          ? getStudentPredictedScore(right)
          : sortBy === 'attendance'
            ? Number(right.attendance || 0)
            : Number(right.totalScore || 0);

      return sortDirection === 'desc' ? rightValue - leftValue : leftValue - rightValue;
    });
  }, [department, riskLevel, search, sortBy, sortDirection, students]);

  useEffect(() => {
    setPage(1);
  }, [department, riskLevel, search, sortBy, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const pageRecords = filteredStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const podiumStudents = students.slice(0, 3);

  const toggleSort = (nextSortBy) => {
    if (sortBy === nextSortBy) {
      setSortDirection((current) => (current === 'desc' ? 'asc' : 'desc'));
      return;
    }

    setSortBy(nextSortBy);
    setSortDirection('desc');
  };

  return (
    <div className="content-stack compact-stack">
      <section className="podium-grid">
        {podiumStudents.map((student) => (
          <article className="podium-card" key={student._id}>
            <span className="podium-rank">#{student.rank}</span>
            <strong>{getStudentDisplayName(student)}</strong>
            <p>{student.department}</p>
            <div className="podium-score">{getStudentPredictedScore(student)}</div>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Live Rankings</p>
            <h2>Student Leaderboard</h2>
          </div>
          <span className="metric-pill">{filteredStudents.length} students</span>
        </div>

        <div className="toolbar">
          <div className="search-form leaderboard-filters">
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by student name or register number"
              type="text"
              value={search}
            />

            <select onChange={(event) => setDepartment(event.target.value)} value={department}>
              {departments.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select onChange={(event) => setRiskLevel(event.target.value)} value={riskLevel}>
              <option value="All">All risks</option>
              <option value="Low Risk">Low Risk</option>
              <option value="Moderate Risk">Moderate Risk</option>
              <option value="High Risk">High Risk</option>
              <option value="Awaiting Prediction">Awaiting Prediction</option>
            </select>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <EmptyState
            description="Try a different search term or relax the filters to bring students back into the live ranking view."
            title="No students match the current filters"
          />
        ) : (
          <>
            <div className="table-shell">
              <table className="data-table leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Student</th>
                    <th>Department</th>
                    <th>Level</th>
                    <th>
                      <button className="table-sort-button" onClick={() => toggleSort('predictedScore')} type="button">
                        Live Score
                      </button>
                    </th>
                    <th>
                      <button className="table-sort-button" onClick={() => toggleSort('attendance')} type="button">
                        Attendance
                      </button>
                    </th>
                    <th>
                      <button className="table-sort-button" onClick={() => toggleSort('totalScore')} type="button">
                        Weighted Total
                      </button>
                    </th>
                    <th>Risk</th>
                    <th>Insights</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRecords.map((student) => (
                    <tr key={student._id}>
                      <td>{student.rank}</td>
                      <td>
                        <strong>{getStudentDisplayName(student)}</strong>
                        <br />
                        <span className="field-hint">{getStudentRegisterNo(student)}</span>
                      </td>
                      <td>{student.department}</td>
                      <td>{student.levelLabel}</td>
                      <td>
                        <span
                          className="score-chip"
                          style={{ backgroundColor: `${CATEGORY_COLORS[student.category]}1a`, color: CATEGORY_COLORS[student.category] }}
                        >
                          {getStudentPredictedScore(student)}
                        </span>
                      </td>
                      <td>{Number(student.attendance || 0).toFixed(0)}%</td>
                      <td>{Number(student.totalScore || 0).toFixed(1)}</td>
                      <td>
                        <span className="status-chip status-chip-neutral">{getStudentRiskLevel(student)}</span>
                      </td>
                      <td>
                        <button className="button-ghost button-compact" onClick={() => onSelectStudent(student)} type="button">
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination-row">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="button-row">
                <button
                  className="button-ghost button-compact"
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                  type="button"
                >
                  Prev
                </button>
                <button
                  className="button-ghost button-compact"
                  disabled={page === totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  type="button"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default RankedStudentsPanel;
