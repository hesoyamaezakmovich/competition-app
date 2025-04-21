import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import EmailConfirmation from './components/EmailConfirmation';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';
import CreateSuperuser from './components/CreateSuperuser';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/confirm-email" element={<EmailConfirmation />} />
          <Route path="/login" element={<LoginForm />} />
          
          {/* Защищенные маршруты (требуют авторизации) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } />
          
          {/* Перенаправления */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/auth/callback" element={<Navigate to="/dashboard" />} />
          
          {/* Маршрут для страницы 404 */}
          <Route path="*" element={
            <div className="not-found-page">
              <h1>404 - Страница не найдена</h1>
              <p>Извините, запрашиваемая страница не существует.</p>
              <a href="/">Вернуться на главную</a>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;