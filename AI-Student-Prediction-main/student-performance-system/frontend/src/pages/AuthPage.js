import React, { useEffect, useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';

const AuthPage = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  return (
    <div className="auth-page">
      <section className="auth-hero">
        <p className="eyebrow">Production-Style Upgrade</p>
        <h1>Student Prediction System</h1>
        <p>
          The project now starts with secure authentication, role-based navigation, and a cleaner experience that still
          keeps your local portal at the center of the workflow.
        </p>

        <div className="feature-list">
          <article className="feature-item">
            <strong>Auth First</strong>
            <span>Login and registration are now the new entry point before the local portal opens.</span>
          </article>

          <article className="feature-item">
            <strong>Admin Student Management</strong>
            <span>Admins can add, edit, delete, search, and predict student records one by one from the UI.</span>
          </article>

          <article className="feature-item">
            <strong>Prediction History</strong>
            <span>Every authenticated prediction can now be tracked through a dedicated history view.</span>
          </article>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-switch">
          <button
            className={`auth-switch-button ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
            type="button"
          >
            Login
          </button>
          <button
            className={`auth-switch-button ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
            type="button"
          >
            Register
          </button>
        </div>

        {mode === 'login' ? <Login onSwitchMode={setMode} /> : <Register onSwitchMode={setMode} />}
      </section>
    </div>
  );
};

export default AuthPage;
