import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './LoginForm.css';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Некорректный email')
    .required('Обязательное поле'),
  password: Yup.string()
    .required('Обязательное поле'),
  rememberMe: Yup.boolean()
});

const LoginForm = () => {
  const [status, setStatus] = useState({ loading: false, error: null });
  const navigate = useNavigate();
  
  // Проверка сессии при загрузке
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        // Пользователь уже авторизован, перенаправляем на дашборд
        navigate('/dashboard');
      }
    };
    
    checkSession();
  }, [navigate]);
  
  const handleSubmit = async (values, { setSubmitting }) => {
    setStatus({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password
      });
      
      if (error) throw error;
      
      // Успешный вход, перенаправляем на дашборд
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Ошибка входа:', error.message);
      setStatus({ loading: false, error: error.message });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Вход в систему</h1>
          <p>Войдите в свой аккаунт</p>
        </div>
        
        {status.error && (
          <div className="error-message">
            {status.error}
          </div>
        )}
        
        <Formik
          initialValues={{ email: '', password: '', rememberMe: false }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <Field
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                />
                <ErrorMessage name="email" component="div" className="error-text" />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Пароль</label>
                <Field
                  type="password"
                  name="password"
                  id="password"
                  autoComplete="current-password"
                />
                <ErrorMessage name="password" component="div" className="error-text" />
              </div>
              
              <div className="form-row">
                <div className="form-group checkbox">
                  <Field
                    type="checkbox"
                    name="rememberMe"
                    id="rememberMe"
                  />
                  <label htmlFor="rememberMe">Запомнить меня</label>
                </div>
                
                <div className="forgot-password">
                  <a href="/reset-password">Забыли пароль?</a>
                </div>
              </div>
              
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting || status.loading}
              >
                {(isSubmitting || status.loading) ? 'Вход...' : 'Войти'}
              </button>
              
              <div className="register-link">
                Нет аккаунта? <a href="/register">Зарегистрироваться</a>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default LoginForm;