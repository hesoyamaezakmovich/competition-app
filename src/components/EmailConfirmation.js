import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './EmailConfirmation.css';

const EmailConfirmation = () => {
  const [status, setStatus] = useState({ loading: false, message: '', error: false });
  const [resendStatus, setResendStatus] = useState({ loading: false, message: '', error: false, lastSent: null });
  const navigate = useNavigate();
  const location = useLocation();
  
  // Получаем email из localStorage
  const email = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('userRole') || 'Участник';
  
  // Извлекаем token из URL, если он есть (для случая, когда пользователь переходит по ссылке из email)
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const error = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');
    
    if (accessToken) {
      // Токен найден, пользователь уже подтвердил email
      setStatus({ 
        loading: false, 
        message: 'Email успешно подтвержден! Вы можете войти в систему.', 
        error: false 
      });
    } else if (error) {
      // Произошла ошибка
      setStatus({ 
        loading: false, 
        message: `Ошибка: ${errorDescription || error}`, 
        error: true 
      });
    } else {
      // Нет токена, ожидаем подтверждение
      setStatus({ 
        loading: false,
        message: 'Ожидание подтверждения email. Пожалуйста, проверьте вашу почту.',
        error: false
      });
    }
  }, [location]);
  
  const handleResendEmail = async () => {
    // Проверяем, не прошло ли 5 минут с последней отправки
    if (resendStatus.lastSent && (new Date() - resendStatus.lastSent) < 300000) { // 5 минут в мс
      const remainingMinutes = Math.ceil((300000 - (new Date() - resendStatus.lastSent)) / 60000);
      setResendStatus({
        ...resendStatus,
        message: `Повторная отправка возможна через ${remainingMinutes} мин.`,
        error: true
      });
      return;
    }
    
    setResendStatus({ loading: true, message: '', error: false, lastSent: resendStatus.lastSent });
    
    try {
      if (!email) {
        throw new Error('Email не найден. Вернитесь на страницу регистрации.');
      }
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: window.location.origin + '/confirm-email'
        }
      });
      
      if (error) throw error;
      
      setResendStatus({
        loading: false,
        message: 'Письмо успешно отправлено! Проверьте вашу почту.',
        error: false,
        lastSent: new Date()
      });
    } catch (error) {
      console.error('Ошибка отправки:', error.message);
      setResendStatus({
        loading: false,
        message: error.message,
        error: true,
        lastSent: resendStatus.lastSent
      });
    }
  };
  
  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <div className="confirmation-header">
          <h1>Подтверждение Email</h1>
        </div>
        
        <div className="confirmation-message">
          <p>Мы отправили письмо с подтверждением на <strong>{email || 'ваш email'}</strong>.</p>
          <p>Вы регистрируетесь с ролью: <strong>{userRole}</strong></p>
          <p>Пожалуйста, проверьте вашу почту и перейдите по ссылке в письме для активации аккаунта.</p>
        </div>

        <div className={`status-message ${status.error ? 'error' : status.message.includes('успешно') ? 'success' : 'info'}`}>
        {status.message}
        </div>
        
        <div className={`status-message ${status.error ? 'error' : 'info'}`}>
          {status.message}
        </div>
        
        <div className="resend-section">
          <p>Не получили письмо?</p>
          
          {resendStatus.message && (
            <div className={`status-message ${resendStatus.error ? 'error' : 'success'}`}>
              {resendStatus.message}
            </div>
          )}
          
          <button
            className="resend-button"
            onClick={handleResendEmail}
            disabled={resendStatus.loading || (resendStatus.lastSent && (new Date() - resendStatus.lastSent) < 300000)}
          >
            {resendStatus.loading ? 'Отправка...' : 'Отправить повторно'}
          </button>
        </div>
        
        <div className="confirmation-footer">
          <button className="back-button" onClick={() => navigate('/login')}>
            Перейти на страницу входа
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;