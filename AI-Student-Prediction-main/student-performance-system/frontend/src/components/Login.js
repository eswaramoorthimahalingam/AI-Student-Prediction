import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from './common/Alert';
import { getDefaultRoute } from '../utils/roles';
import { getApiErrorMessage } from '../services/apiClient';

const DEMO_ACCOUNTS = [
  {
    id: 'admin',
    title: 'Built-in Admin',
    description: 'Opens the full admin dashboard with live analytics, students, and prediction tools.',
    identifier: 'admin@studentai.local',
    password: 'Admin@123',
  },
  {
    id: 'user',
    title: 'Built-in User',
    description: 'Opens the standard user dashboard for personal prediction history testing.',
    identifier: 'user@studentai.local',
    password: 'User@123',
  },
];

const Login = ({ onSwitchMode }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const showDemoAccess = process.env.NODE_ENV !== 'production' || process.env.REACT_APP_SHOW_DEMO_LOGINS === 'true';

  const authenticate = async ({ identifier, password }) => {
    const response = await login({
      identifier,
      password,
    });

    navigate(getDefaultRoute(response.user), { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.identifier || !form.password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await authenticate({
        identifier: form.identifier,
        password: form.password,
      });
    } catch (error) {
      setError(getApiErrorMessage(error, 'Login failed. Please check your credentials.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (account) => {
    setError('');
    setForm({
      identifier: account.identifier,
      password: account.password,
    });

    try {
      setIsSubmitting(true);
      await authenticate(account);
    } catch (error) {
      setError(getApiErrorMessage(error, 'Demo login failed. Please make sure the backend is running.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form-shell">
      <div className="auth-form-header">
        <h2>Sign in to continue</h2>
        <p>Access the prediction portal, leaderboard, and your personal performance history.</p>
      </div>

      <Alert tone="error">{error}</Alert>

      <form className="form-stack" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">Email / Username</span>
          <input
            type="text"
            placeholder="you@example.com"
            value={form.identifier}
            onChange={(event) => setForm((current) => ({ ...current, identifier: event.target.value }))}
          />
        </label>

        <label className="field">
          <span className="field-label">Password</span>
          <input
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
        </label>

        <button className="button-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Login'}
        </button>
      </form>

      {showDemoAccess && (
        <section className="demo-access-card">
          <div className="demo-access-header">
            <strong>Built-in Local Access</strong>
            <span>Use the seeded local accounts directly from the login page.</span>
          </div>

          <div className="demo-access-grid">
            {DEMO_ACCOUNTS.map((account) => (
              <article className="demo-access-item" key={account.id}>
                <div>
                  <h3>{account.title}</h3>
                  <p>{account.description}</p>
                </div>

                <div className="demo-credentials">
                  <code>{account.identifier}</code>
                  <code>{account.password}</code>
                </div>

                <div className="button-row">
                  <button
                    className="button-secondary button-compact"
                    disabled={isSubmitting}
                    onClick={() =>
                      setForm({
                        identifier: account.identifier,
                        password: account.password,
                      })
                    }
                    type="button"
                  >
                    Use Credentials
                  </button>
                  <button
                    className="button-primary button-compact"
                    disabled={isSubmitting}
                    onClick={() => handleDemoLogin(account)}
                    type="button"
                  >
                    {account.id === 'admin' ? 'Login as Admin' : 'Login as User'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="auth-form-footer">
        <span>Need an account?</span>
        <button className="button-link" type="button" onClick={() => onSwitchMode('register')}>
          Register here
        </button>
      </div>
    </div>
  );
};

export default Login;
