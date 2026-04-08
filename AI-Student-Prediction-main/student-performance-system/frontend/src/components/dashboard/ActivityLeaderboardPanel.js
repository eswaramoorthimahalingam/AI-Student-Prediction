import React, { useEffect, useMemo, useState } from 'react';
import EmptyState from '../common/EmptyState';
import {
  ACTIVITY_CONFIG,
  getActivityScore,
  getStudentDisplayName,
  getStudentPredictedScore,
  getStudentRegisterNo,
} from '../../utils/insightHelpers';

const PAGE_SIZE = 10;

const ActivityLeaderboardPanel = ({ students, onSelectStudent }) => {
  const [activeActivity, setActiveActivity] = useState('overall');
  const [search, setSearch] = useState('');
  const [sortDirection, setSortDirection] = useState('desc');
  const [page, setPage] = useState(1);

  const rankedStudents = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    const nextStudents = students.filter((student) => {
      if (!searchTerm) {
        return true;
      }

      return (
        getStudentDisplayName(student).toLowerCase().includes(searchTerm) ||
        getStudentRegisterNo(student).toLowerCase().includes(searchTerm)
      );
    });

    return [...nextStudents].sort((left, right) => {
      const leftValue = getActivityScore(left, activeActivity);
      const rightValue = getActivityScore(right, activeActivity);
      return sortDirection === 'desc' ? rightValue - leftValue : leftValue - rightValue;
    });
  }, [activeActivity, search, sortDirection, students]);

  useEffect(() => {
    setPage(1);
  }, [activeActivity, search, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(rankedStudents.length / PAGE_SIZE));
  const pageRecords = rankedStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const topStudent = rankedStudents[0];
  const averageScore = rankedStudents.length
    ? Math.round(rankedStudents.reduce((sum, student) => sum + getActivityScore(student, activeActivity), 0) / rankedStudents.length)
    : 0;
  const scoreAboveSeventy = rankedStudents.filter((student) => getActivityScore(student, activeActivity) >= 70).length;

  const renderSignal = (student) => {
    switch (activeActivity) {
      case 'academics':
        return `Exam ${Number(student.examScore || 0).toFixed(0)} / Assignment ${Number(student.assignmentScore || 0).toFixed(0)}`;
      case 'project':
        return `Project ${Number(student.projectScore || 0).toFixed(0)}`;
      case 'seminar':
        return `Seminar ${Number(student.seminarScore || 0).toFixed(0)}`;
      case 'sports':
        return `Sports ${Number(student.sportsScore || 0).toFixed(0)} / 50`;
      case 'hackathon':
        return `Hackathon ${Number(student.hackathonScore || 0).toFixed(0)} / 50`;
      default:
        return `Attendance ${Number(student.attendance || 0).toFixed(0)}%`;
    }
  };

  return (
    <div className="content-stack compact-stack">
      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Activity Leaderboard</p>
            <h2>Live Co-Curricular Ranking</h2>
          </div>
          <button className="button-secondary button-compact" onClick={() => setSortDirection((current) => (current === 'desc' ? 'asc' : 'desc'))} type="button">
            {sortDirection === 'desc' ? 'Highest First' : 'Lowest First'}
          </button>
        </div>

        <div className="tab-strip">
          {ACTIVITY_CONFIG.map((activity) => (
            <button
              className={`tab-button ${activeActivity === activity.id ? 'tab-button-active' : ''}`}
              key={activity.id}
              onClick={() => setActiveActivity(activity.id)}
              style={activeActivity === activity.id ? { backgroundColor: activity.color, borderColor: activity.color } : {}}
              type="button"
            >
              {activity.label}
            </button>
          ))}
        </div>

        <div className="insight-stat-grid activity-stat-grid">
          <article className="insight-stat-card">
            <span>Average Score</span>
            <strong>{averageScore}</strong>
            <p>Mean score for the active activity leaderboard.</p>
          </article>
          <article className="insight-stat-card">
            <span>Best Performer</span>
            <strong>{topStudent ? getStudentDisplayName(topStudent) : 'No data'}</strong>
            <p>{topStudent ? `${getActivityScore(topStudent, activeActivity)} points in the active view.` : 'No students available yet.'}</p>
          </article>
          <article className="insight-stat-card">
            <span>Students at 70+</span>
            <strong>{scoreAboveSeventy}</strong>
            <p>Students meeting a strong benchmark in this activity dimension.</p>
          </article>
        </div>

        <div className="toolbar">
          <div className="search-form leaderboard-filters">
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by student name or register number"
              type="text"
              value={search}
            />
          </div>
        </div>

        {rankedStudents.length === 0 ? (
          <EmptyState
            description="Try a different search term to bring students back into the selected activity leaderboard."
            title="No students match the current activity view"
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
                    <th>{ACTIVITY_CONFIG.find((activity) => activity.id === activeActivity)?.label}</th>
                    <th>Signal</th>
                    <th>Live Score</th>
                    <th>Insights</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRecords.map((student, index) => (
                    <tr key={student._id}>
                      <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                      <td>
                        <strong>{getStudentDisplayName(student)}</strong>
                        <br />
                        <span className="field-hint">{getStudentRegisterNo(student)}</span>
                      </td>
                      <td>{student.department}</td>
                      <td>{student.levelLabel}</td>
                      <td>{getActivityScore(student, activeActivity)}</td>
                      <td>{renderSignal(student)}</td>
                      <td>{getStudentPredictedScore(student)}</td>
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

export default ActivityLeaderboardPanel;
