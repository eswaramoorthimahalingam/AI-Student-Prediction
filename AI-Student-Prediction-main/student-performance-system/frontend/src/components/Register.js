import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from './common/Alert';
import { getDefaultRoute } from '../utils/roles';
import { getApiErrorMessage } from '../services/apiClient';

const Register = ({ onSwitchMode }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('Please complete every required field.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Password and confirm password must match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      navigate(getDefaultRoute(response.user), { replace: true });
    } catch (error) {
      setError(getApiErrorMessage(error, 'Registration failed. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form-shell">
      <div className="auth-form-header">
        <h2>Create your portal account</h2>
        <p>Register once, then continue into the existing prediction system with role-based access.</p>
      </div>

      <Alert tone="error">{error}</Alert>

      <form className="form-stack" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span className="field-label">Full Name</span>
            <input
              type="text"
              placeholder="Aarav Kumar"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </label>

          <label className="field">
            <span className="field-label">Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
          </label>
        </div>

        <div className="form-grid">
          <label className="field">
            <span className="field-label">Password</span>
            <input
              type="password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
          </label>

          <label className="field">
            <span className="field-label">Confirm Password</span>
            <input
              type="password"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
            />
          </label>
        </div>

        <label className="field">
          <span className="field-label">Role</span>
          <select
            value={form.role}
            onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <span className="field-hint">
            Admin registration is controlled by the backend. If it is disabled, the account is safely created as a normal user.
          </span>
        </label>

        <button className="button-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <div className="auth-form-footer">
        <span>Already registered?</span>
        <button className="button-link" type="button" onClick={() => onSwitchMode('login')}>
          Sign in instead
        </button>
      </div>
    </div>
  );
};

export default Register;
