import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div style={{ padding: '5rem', textAlign: 'center' }}>Загрузка...</div>;
    }

    // Если не авторизован - на логин
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Если указаны роли, и роль юзера не подходит
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Если он ждет аппрува админа
        if (user.role === 'admin_pending') {
            return (
                <div style={{ padding: '5rem', textAlign: 'center' }}>
                    <h2>Ожидание модерации</h2>
                    <p>Ваша заявка на права администратора находится на рассмотрении. Пожалуйста, ожидайте подтверждения.</p>
                </div>
            );
        }
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
