import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './EmailConfirmation.css'; // Используем те же стили

const AuthCallback = () => {
  const [status, setStatus] = useState({ loading: true, message: '', error: false });
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Получаем параметры из URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');
        
        console.log("Параметры URL:", { accessToken, refreshToken, type, error, errorDescription });

        if (error) {
          throw new Error(errorDescription || 'Произошла ошибка при подтверждении email');
        }

        if (accessToken && type === 'signup') {
          // Устанавливаем сессию с токенами
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) throw sessionError;

          setStatus({
            loading: false,
            message: 'Email успешно подтвержден! Перенаправление в личный кабинет...',
            error: false
          });

          // Перенаправляем на дашборд через 3 секунды
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else if (accessToken && type === 'recovery') {
          // Обработка сброса пароля
          navigate('/reset-password', { state: { accessToken, refreshToken } });
        } else {
          setStatus({
            loading: false,
            message: 'Неизвестный тип запроса или отсутствуют необходимые параметры',
            error: true
          });
        }
      } catch (error) {
        console.error('Ошибка при обработке callback:', error);
        setStatus({
          loading: false,
          message: `Ошибка: ${error.message}`,
          error: true
        });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <div className="confirmation-header">
          <h1>Подтверждение Email</h1>
        </div>
        
        <div className={`status-message ${status.error ? 'error' : 'success'}`}>
          {status.loading ? (
            <>
              <div className="loader"></div>
              <p>Обработка подтверждения email...</p>
            </>
          ) : (
            status.message
          )}
        </div>
        
        {!status.loading && status.error && (
          <div className="confirmation-footer">
            <button className="back-button" onClick={() => navigate('/login')}>
              Вернуться на страницу входа
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;