import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './RegistrationForm.css';

// Схема валидации для обычного пользователя
const UserSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Минимум 3 символа')
    .max(20, 'Максимум 20 символов')
    .matches(/^[a-zA-Z0-9_]+$/, 'Только буквы, цифры и подчеркивания')
    .required('Обязательное поле'),
  email: Yup.string()
    .email('Некорректный email')
    .required('Обязательное поле'),
  password: Yup.string()
    .min(8, 'Минимум 8 символов')
    .matches(/[a-z]/, 'Должен содержать строчную букву')
    .matches(/[A-Z]/, 'Должен содержать заглавную букву')
    .matches(/[0-9]/, 'Должен содержать цифру')
    .required('Обязательное поле'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Пароли должны совпадать')
    .required('Обязательное поле'),
  termsAccepted: Yup.boolean()
    .oneOf([true], 'Вы должны принять правила платформы')
});

// Схема валидации для организации
const OrganizationSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Минимум 3 символа')
    .max(20, 'Максимум 20 символов')
    .matches(/^[a-zA-Z0-9_]+$/, 'Только буквы, цифры и подчеркивания')
    .required('Обязательное поле'),
  email: Yup.string()
    .email('Некорректный email')
    .required('Обязательное поле'),
  password: Yup.string()
    .min(8, 'Минимум 8 символов')
    .matches(/[a-z]/, 'Должен содержать строчную букву')
    .matches(/[A-Z]/, 'Должен содержать заглавную букву')
    .matches(/[0-9]/, 'Должен содержать цифру')
    .required('Обязательное поле'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Пароли должны совпадать')
    .required('Обязательное поле'),
  organization_name: Yup.string()
    .required('Обязательное поле'),
  organization_type: Yup.string()
    .required('Обязательное поле'),
  contact_phone: Yup.string()
    .required('Обязательное поле'),
  termsAccepted: Yup.boolean()
    .oneOf([true], 'Вы должны принять правила платформы')
});

// Типы организаций
const organizationTypes = [
  { value: 'educational', label: 'Образовательное учреждение' },
  { value: 'commercial', label: 'Коммерческая организация' },
  { value: 'nonprofit', label: 'Некоммерческая организация' },
  { value: 'government', label: 'Государственная организация' },
  { value: 'other', label: 'Другое' }
];

const RegistrationForm = () => {
  const [status, setStatus] = useState({ loading: false, error: null, success: false });
  const [registrationType, setRegistrationType] = useState('user'); // 'user' или 'organization'
  const navigate = useNavigate();

  // Проверяем, авторизован ли пользователь
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setStatus({ loading: true, error: null, success: false });

    try {
      // Определяем роль
      const role = registrationType === 'user' ? 'Участник' : 'Организация';
      
      const userData = {
        username: values.username,
        role: role
      };
      
      // Добавляем данные организации если нужно
      if (registrationType === 'organization') {
        userData.organization_name = values.organization_name;
        userData.organization_type = values.organization_type;
        userData.contact_phone = values.contact_phone;
        userData.organization_description = values.organization_description || null;
        userData.is_verified = false; // Требуется проверка администратором
      }
      
      // Регистрация в Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: userData,
          emailRedirectTo: window.location.origin + '/auth/callback'
        }
      });

      if (signUpError) throw signUpError;

      // Сохраняем данные для страницы подтверждения
      localStorage.setItem('userEmail', values.email);
      localStorage.setItem('userRole', role);
      
      setStatus({ loading: false, error: null, success: true });
      
      // Перенаправляем на страницу подтверждения
      setTimeout(() => {
        navigate('/confirm-email');
      }, 2000);
      
    } catch (error) {
      console.error('Ошибка регистрации:', error.message);
      setStatus({ loading: false, error: error.message, success: false });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
        <div className="registration-header">
          <h1>Регистрация</h1>
          <p>Создайте аккаунт для участия в соревнованиях</p>
        </div>

        <div className="registration-type-selector">
          <button
            className={`type-button ${registrationType === 'user' ? 'active' : ''}`}
            onClick={() => setRegistrationType('user')}
          >
            Я участник
          </button>
          <button
            className={`type-button ${registrationType === 'organization' ? 'active' : ''}`}
            onClick={() => setRegistrationType('organization')}
          >
            Я организация
          </button>
        </div>

        {status.success && (
          <div className="success-message">
            Регистрация успешна! Проверьте вашу почту для подтверждения аккаунта.
          </div>
        )}

        {status.error && (
          <div className="error-message">
            Ошибка: {status.error}
          </div>
        )}

        <Formik
          initialValues={{
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            organization_name: '',
            organization_type: '',
            organization_description: '',
            contact_phone: '',
            termsAccepted: false
          }}
          validationSchema={registrationType === 'user' ? UserSchema : OrganizationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="registration-form">
              <div className="form-group">
                <label htmlFor="username">Имя пользователя*</label>
                <Field
                  type="text"
                  name="username"
                  id="username"
                  className={errors.username && touched.username ? 'input-error' : ''}
                />
                <ErrorMessage name="username" component="div" className="error-text" />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email*</label>
                <Field
                  type="email"
                  name="email"
                  id="email"
                  className={errors.email && touched.email ? 'input-error' : ''}
                />
                <ErrorMessage name="email" component="div" className="error-text" />
              </div>

              <div className="form-group">
                <label htmlFor="password">Пароль*</label>
                <Field
                  type="password"
                  name="password"
                  id="password"
                  className={errors.password && touched.password ? 'input-error' : ''}
                  autoComplete="new-password"
                />
                <ErrorMessage name="password" component="div" className="error-text" />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Подтверждение пароля*</label>
                <Field
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  className={errors.confirmPassword && touched.confirmPassword ? 'input-error' : ''}
                  autoComplete="new-password"
                />
                <ErrorMessage name="confirmPassword" component="div" className="error-text" />
              </div>

              {/* Поля для организации */}
              {registrationType === 'organization' && (
                <>
                  <div className="form-group">
                    <label htmlFor="organization_name">Название организации*</label>
                    <Field
                      type="text"
                      name="organization_name"
                      id="organization_name"
                      className={errors.organization_name && touched.organization_name ? 'input-error' : ''}
                    />
                    <ErrorMessage name="organization_name" component="div" className="error-text" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="organization_type">Тип организации*</label>
                    <Field
                      as="select"
                      name="organization_type"
                      id="organization_type"
                      className={errors.organization_type && touched.organization_type ? 'input-error' : ''}
                    >
                      <option value="">Выберите тип организации</option>
                      {organizationTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="organization_type" component="div" className="error-text" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="organization_description">Описание организации</label>
                    <Field
                      as="textarea"
                      name="organization_description"
                      id="organization_description"
                      className="text-area"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact_phone">Контактный телефон*</label>
                    <Field
                      type="text"
                      name="contact_phone"
                      id="contact_phone"
                      className={errors.contact_phone && touched.contact_phone ? 'input-error' : ''}
                    />
                    <ErrorMessage name="contact_phone" component="div" className="error-text" />
                  </div>
                </>
              )}

              <div className="form-group checkbox">
                <Field 
                  type="checkbox" 
                  name="termsAccepted" 
                  id="termsAccepted" 
                />
                <label htmlFor="termsAccepted">
                  Я принимаю <a href="/terms" target="_blank" rel="noopener noreferrer">правила платформы</a>*
                </label>
                <ErrorMessage name="termsAccepted" component="div" className="error-text" />
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting || status.loading}
              >
                {(isSubmitting || status.loading) ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>

              <div className="login-link">
                Уже есть аккаунт? <a href="/login">Войти</a>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default RegistrationForm;