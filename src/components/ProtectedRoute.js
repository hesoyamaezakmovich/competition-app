import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [isFederation, setIsFederation] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          setAuthenticated(false);
          setLoading(false);
          return;
        }

        setAuthenticated(true);

        if (location.pathname === '/admin') {
          const { data: profile, error } = await supabase
            .from('users')
            .select('role')
            .eq('user_id', data.session.user.id)
            .single();

          if (error || !profile) {
            console.error('Ошибка получения профиля:', error?.message || 'Профиль не найден');
            setIsFederation(false);
          } else {
            setIsFederation(profile.role === 'Федерация');
          }
        }
      } catch (error) {
        console.error('Ошибка при проверке авторизации:', error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" />;
  }

  if (location.pathname === '/admin' && !isFederation) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;