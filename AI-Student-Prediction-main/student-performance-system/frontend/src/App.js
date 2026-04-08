import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AppLayout from './components/layout/AppLayout';
import Predictor from './components/Predictor';
import ProtectedRoute from './components/routes/ProtectedRoute';
import PublicOnlyRoute from './components/routes/PublicOnlyRoute';
import RoleProtectedRoute from './components/routes/RoleProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import PredictionHistoryPage from './pages/PredictionHistoryPage';
import StudentFormPage from './pages/StudentFormPage';
import StudentsPage from './pages/StudentsPage';
import './App.css';

const App = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route
          path="/"
          element={(
            <PublicOnlyRoute>
              <AuthPage initialMode="login" />
            </PublicOnlyRoute>
          )}
        />
        <Route
          path="/login"
          element={(
            <PublicOnlyRoute>
              <AuthPage initialMode="login" />
            </PublicOnlyRoute>
          )}
        />
        <Route
          path="/register"
          element={(
            <PublicOnlyRoute>
              <AuthPage initialMode="register" />
            </PublicOnlyRoute>
          )}
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/legacy-portal" element={<Dashboard mode="legacy" />} />
            <Route path="/predictor" element={<Predictor />} />
            <Route path="/history" element={<PredictionHistoryPage />} />

            <Route element={<RoleProtectedRoute allowedRoles={['admin', 'faculty']} />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/students/new" element={<StudentFormPage />} />
              <Route path="/students/:id/edit" element={<StudentFormPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
