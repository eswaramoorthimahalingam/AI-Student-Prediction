import React, { useState } from 'react';
import Leaderboard from '../Leaderboard';
import { calculateTotalScore, predictorDefaults, scoreFieldConfig } from '../utils/studentFields';
import Alert from './common/Alert';
import StatCard from './common/StatCard';
import predictionService from '../services/predictionService';
import { getApiErrorMessage } from '../services/apiClient';

const Predictor = () => {
  const [form, setForm] = useState(predictorDefaults);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const weightedScore = calculateTotalScore(form).toFixed(1);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handlePredict = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      setIsSubmitting(true);
      const response = await predictionService.predict(form);
      setResult(response);
      setSuccessMessage('Prediction completed and stored in history.');
    } catch (error) {
      setError(getApiErrorMessage(error, 'Prediction service is unavailable right now.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm(predictorDefaults);
    setResult(null);
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="content-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Local Portal, Improved</p>
          <h1>Prediction Workspace</h1>
          <p className="page-copy">
            The local prediction flow remains at the center of the app. The form below now feeds the cleaned-up
            backend service, stores history for logged-in users, and works alongside the leaderboard and admin records.
          </p>
        </div>
      </section>

      <div className="two-column-layout">
        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Prediction Input</p>
              <h2>Student Performance Signals</h2>
            </div>
            <span className="metric-pill">Weighted score preview: {weightedScore}</span>
          </div>

          <Alert tone="error">{error}</Alert>
          <Alert tone="success">{successMessage}</Alert>

          <form className="form-stack" onSubmit={handlePredict}>
            <div className="form-grid">
              <label className="field">
                <span className="field-label">Student Name</span>
                <input
                  name="studentName"
                  type="text"
                  placeholder="Optional for manual predictions"
                  value={form.studentName}
                  onChange={handleInputChange}
                />
              </label>

              <label className="field">
                <span className="field-label">Register Number</span>
                <input
                  name="registerNo"
                  type="text"
                  placeholder="Optional register number"
                  value={form.registerNo}
                  onChange={handleInputChange}
                />
              </label>

              <label className="field">
                <span className="field-label">Department</span>
                <input
                  name="department"
                  type="text"
                  placeholder="CSE / ECE / IT"
                  value={form.department}
                  onChange={handleInputChange}
                />
              </label>

              <label className="field">
                <span className="field-label">Semester / Year</span>
                <input
                  name="yearOrSemester"
                  type="text"
                  placeholder="Semester 6"
                  value={form.yearOrSemester}
                  onChange={handleInputChange}
                />
              </label>
            </div>

            <div className="metric-grid">
              {scoreFieldConfig.map((field) => (
                <label className="metric-field" key={field.name}>
                  <span className="field-label">{field.label}</span>
                  <input
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    name={field.name}
                    type="number"
                    value={form[field.name]}
                    onChange={handleInputChange}
                  />
                  <span className="field-hint">{field.helper}</span>
                </label>
              ))}
            </div>

            <div className="button-row">
              <button className="button-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Predicting...' : 'Predict Performance'}
              </button>
              <button className="button-secondary" type="button" onClick={resetForm}>
                Reset Form
              </button>
            </div>
          </form>

          {result && (
            <section className="result-card">
              <div className="result-heading">
                <div>
                  <p className="eyebrow">Prediction Result</p>
                  <h3>{form.studentName || 'Manual Prediction Result'}</h3>
                </div>
                <span className={`badge ${result.pass ? 'badge-success' : 'badge-danger'}`}>
                  {result.pass ? 'Pass' : 'Needs Attention'}
                </span>
              </div>

              <div className="card-grid">
                <StatCard title="Predicted Score" value={Number(result.predictedScore).toFixed(1)} caption="Score returned by the AI model." />
                <StatCard title="Risk Level" value={result.riskLevel} caption="Higher risk indicates more academic support is needed." />
                <StatCard title="Weighted Input Score" value={Number(result.totalScore).toFixed(1)} caption="Local portal score preserved for comparison." />
              </div>
            </section>
          )}
        </section>

        <Leaderboard />
      </div>
    </div>
  );
};

export default Predictor;
