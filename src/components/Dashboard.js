import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Получаем текущего пользователя
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }
        
        setUser(user);
        
        // Получаем профиль пользователя из таблицы users
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.error('Ошибка при получении профиля:', error);
        } else {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Загрузка...</p>
      </div>
    );
  }
  
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo">
          <h1>CP Platform</h1>
        </div>
        <nav className="main-nav">
          <ul>
            <li><a href="/dashboard" className="active">Главная</a></li>
            <li><a href="/competitions">Соревнования</a></li>
            <li><a href="/tasks">Задачи</a></li>
            {userProfile?.role === 'Организатор' && (
              <li><a href="/organizer">Панель организатора</a></li>
            )}
          </ul>
        </nav>
        <div className="user-menu">
          <div className="user-info">
            <span>{user?.user_metadata?.username || user?.email}</span>
            <img 
              src={userProfile?.avatar || 'https://via.placeholder.com/40'} 
              alt="Avatar" 
              className="avatar" 
            />
          </div>
          <div className="dropdown-menu">
            <a href="/profile">Профиль</a>
            <a href="/settings">Настройки</a>
            <button onClick={handleLogout} className="logout-button">Выход</button>
          </div>
        </div>
      </header>
      
      <main className="dashboard-content">
        <div className="welcome-section">
          <h2>Добро пожаловать, {userProfile?.username || user?.user_metadata?.username || 'Пользователь'}!</h2>
          <p>Роль: {userProfile?.role || 'Участник'}</p>
        </div>
        
        <div className="dashboard-cards">
          <div className="card">
            <h3>Активные соревнования</h3>
            <p>Ещё нет активных соревнований</p>
            <a href="/competitions" className="card-link">Посмотреть все соревнования</a>
          </div>
          
          <div className="card">
            <h3>Мои задачи</h3>
            <p>Вы ещё не решали задачи</p>
            <a href="/tasks" className="card-link">Перейти к задачам</a>
          </div>
          
          <div className="card">
            <h3>Рейтинг</h3>
            <p>Ваш текущий рейтинг: {userProfile?.rating || 0}</p>
            <a href="/ratings" className="card-link">Посмотреть общий рейтинг</a>
          </div>
        </div>
      </main>
      
      <footer className="dashboard-footer">
        <p>&copy; 2025 Платформа для соревнований по программированию</p>
      </footer>
    </div>
  );
};

export default Dashboard;