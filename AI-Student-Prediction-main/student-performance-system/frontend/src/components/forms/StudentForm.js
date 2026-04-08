import React, { useEffect, useState } from 'react';
import { normalizeStudentPayload, scoreFieldConfig, studentFormDefaults } from '../../utils/studentFields';

const StudentForm = ({ initialValues, onSubmit, submitLabel, submitting }) => {
  const [form, setForm] = useState({
    ...studentFormDefaults,
    ...initialValues,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({
      ...studentFormDefaults,
      ...initialValues,
    });
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.studentName.trim()) {
      nextErrors.studentName = 'Student name is required.';
    }

    if (!form.registerNo.trim()) {
      nextErrors.registerNo = 'Register number is required.';
    }

    if (!form.department.trim()) {
      nextErrors.department = 'Department is required.';
    }

    if (!form.yearOrSemester.trim()) {
      nextErrors.yearOrSemester = 'Semester or year is required.';
    }

    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    scoreFieldConfig.forEach((field) => {
      const value = Number(form[field.name]);

      if (Number.isNaN(value)) {
        nextErrors[field.name] = `${field.label} must be a valid number.`;
        return;
      }

      if (value < field.min || value > field.max) {
        nextErrors[field.name] = `${field.label} must be between ${field.min} and ${field.max}.`;
      }
    });

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit(normalizeStudentPayload(form));
  };

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <section className="form-section">
        <h3>Student Information</h3>
        <p>Capture identity and academic context before sending scores for prediction.</p>

        <div className="form-grid">
          <label className="field">
            <span className="field-label">Student Name</span>
            <input name="studentName" type="text" value={form.studentName} onChange={handleChange} />
            <span className="field-error">{errors.studentName}</span>
          </label>

          <label className="field">
            <span className="field-label">Register Number</span>
            <input name="registerNo" type="text" value={form.registerNo} onChange={handleChange} />
            <span className="field-error">{errors.registerNo}</span>
          </label>

          <label className="field">
            <span className="field-label">Email</span>
            <input name="email" type="email" value={form.email} onChange={handleChange} />
            <span className="field-error">{errors.email}</span>
          </label>

          <label className="field">
            <span className="field-label">Department</span>
            <input name="department" type="text" value={form.department} onChange={handleChange} />
            <span className="field-error">{errors.department}</span>
          </label>

          <label className="field">
            <span className="field-label">Semester / Year</span>
            <input name="yearOrSemester" type="text" value={form.yearOrSemester} onChange={handleChange} />
            <span className="field-error">{errors.yearOrSemester}</span>
          </label>
        </div>
      </section>

      <section className="form-section">
        <h3>Performance Inputs</h3>
        <p>These are the same core inputs used by the existing prediction model.</p>

        <div className="metric-grid">
          {scoreFieldConfig.map((field) => (
            <label className="metric-field" key={field.name}>
              <span className="field-label">{field.label}</span>
              <input
                max={field.max}
                min={field.min}
                name={field.name}
                step={field.step}
                type="number"
                value={form[field.name]}
                onChange={handleChange}
              />
              <span className="field-hint">{field.helper}</span>
              <span className="field-error">{errors[field.name]}</span>
            </label>
          ))}
        </div>
      </section>

      <div className="button-row">
        <button className="button-primary" disabled={submitting} type="submit">
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;
