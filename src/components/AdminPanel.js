import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './AdminPanel.css';

const AdminPanel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [newOrganization, setNewOrganization] = useState({
    username: '',
    email: '',
    password: '',
    organization_name: '',
    organization_type: '',
    organization_description: '',
    contact_phone: '',
    first_name: '',
    last_name: '',
    country: ''
  });
  const navigate = useNavigate();

  // Проверяем, является ли пользователь Федерацией
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (profile.role !== 'Федерация') {
          navigate('/dashboard');
        } else {
          fetchOrganizations();
        }
      } catch (err) {
        setError(err.message);
      }
    };

    checkUserRole();
  }, [navigate]);

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'Организация');

      if (error) throw error;
      setOrganizations(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userData = {
        username: newOrganization.username,
        role: 'Организация',
        first_name: newOrganization.first_name,
        last_name: newOrganization.last_name,
        country: newOrganization.country,
        organization_name: newOrganization.organization_name,
        organization_type: newOrganization.organization_type,
        organization_description: newOrganization.organization_description || null,
        contact_phone: newOrganization.contact_phone,
        is_organizer_verified: false
      };

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: newOrganization.email,
        password: newOrganization.password,
        options: {
          data: userData
        }
      });

      if (signUpError) throw signUpError;

      const { error: insertError } = await supabase.from('users').insert({
        user_id: data.user.id,
        username: newOrganization.username,
        email: newOrganization.email,
        role: 'Организация',
        first_name: newOrganization.first_name,
        last_name: newOrganization.last_name,
        country: newOrganization.country,
        organization_name: newOrganization.organization_name,
        organization_type: newOrganization.organization_type,
        organization_description: newOrganization.organization_description || null,
        contact_phone: newOrganization.contact_phone,
        email_confirmed: true,
        active: true,
        is_organizer_verified: false
      });

      if (insertError) throw insertError;

      setNewOrganization({
        username: '',
        email: '',
        password: '',
        organization_name: '',
        organization_type: '',
        organization_description: '',
        contact_phone: '',
        first_name: '',
        last_name: '',
        country: ''
      });

      fetchOrganizations();
      alert('Организация успешно создана!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (userId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_organizer_verified: !currentStatus })
        .eq('user_id', userId);

      if (error) throw error;
      fetchOrganizations();
      alert(`Статус верификации изменён на ${!currentStatus ? 'Подтверждён' : 'Отклонён'}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteOrganization = async (userId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту организацию?')) return;

    try {
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) throw authError;

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      fetchOrganizations();
      alert('Организация успешно удалена!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditOrganization = (org) => {
    alert('Функция редактирования пока не реализована.');
  };

  return (
    <div className="admin-panel-container">
      <h1>Админ-панель</h1>
      {error && <div className="error-message">{error}</div>}

      <section className="create-organization-section">
        <h2>Создать организацию</h2>
        <form onSubmit={handleCreateOrganization} className="create-organization-form">
          <div className="form-group">
            <label htmlFor="username">Имя пользователя*</label>
            <input
              type="text"
              id="username"
              value={newOrganization.username}
              onChange={(e) => setNewOrganization({ ...newOrganization, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input
              type="email"
              id="email"
              value={newOrganization.email}
              onChange={(e) => setNewOrganization({ ...newOrganization, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль*</label>
            <input
              type="password"
              id="password"
              value={newOrganization.password}
              onChange={(e) => setNewOrganization({ ...newOrganization, password: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="first_name">Имя*</label>
            <input
              type="text"
              id="first_name"
              value={newOrganization.first_name}
              onChange={(e) => setNewOrganization({ ...newOrganization, first_name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="last_name">Фамилия*</label>
            <input
              type="text"
              id="last_name"
              value={newOrganization.last_name}
              onChange={(e) => setNewOrganization({ ...newOrganization, last_name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="country">Страна*</label>
            <input
              type="text"
              id="country"
              value={newOrganization.country}
              onChange={(e) => setNewOrganization({ ...newOrganization, country: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="organization_name">Название организации*</label>
            <input
              type="text"
              id="organization_name"
              value={newOrganization.organization_name}
              onChange={(e) => setNewOrganization({ ...newOrganization, organization_name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="organization_type">Тип организации*</label>
            <select
              id="organization_type"
              value={newOrganization.organization_type}
              onChange={(e) => setNewOrganization({ ...newOrganization, organization_type: e.target.value })}
              required
            >
              <option value="">Выберите тип организации</option>
              <option value="educational">Образовательное учреждение</option>
              <option value="commercial">Коммерческая организация</option>
              <option value="nonprofit">Некоммерческая организация</option>
              <option value="government">Государственная организация</option>
              <option value="other">Другое</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="organization_description">Описание организации</label>
            <textarea
              id="organization_description"
              value={newOrganization.organization_description}
              onChange={(e) => setNewOrganization({ ...newOrganization, organization_description: e.target.value })}
              className="text-area"
            />
          </div>
          <div className="form-group">
            <label htmlFor="contact_phone">Контактный телефон*</label>
            <input
              type="text"
              id="contact_phone"
              value={newOrganization.contact_phone}
              onChange={(e) => setNewOrganization({ ...newOrganization, contact_phone: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Создание...' : 'Создать организацию'}
          </button>
        </form>
      </section>

      <section className="organizations-list-section">
        <h2>Список организаций</h2>
        {organizations.length === 0 ? (
          <p>Организации отсутствуют.</p>
        ) : (
          <table className="organizations-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Email</th>
                <th>Тип</th>
                <th>Страна</th>
                <th>Контактный телефон</th>
                <th>Верифицирован</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((org) => (
                <tr key={org.user_id}>
                  <td>{org.organization_name}</td>
                  <td>{org.email}</td>
                  <td>{org.organization_type}</td>
                  <td>{org.country}</td>
                  <td>{org.contact_phone}</td>
                  <td>
                    {org.is_organizer_verified ? 'Да' : 'Нет'}
                    <button
                      className="action-button"
                      onClick={() => handleToggleVerification(org.user_id, org.is_organizer_verified)}
                    >
                      {org.is_organizer_verified ? 'Отклонить' : 'Подтвердить'}
                    </button>
                  </td>
                  <td>
                    <button
                      className="action-button"
                      onClick={() => handleEditOrganization(org)}
                    >
                      Редактировать
                    </button>
                    <button
                      className="action-button delete"
                      onClick={() => handleDeleteOrganization(org.user_id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default AdminPanel;