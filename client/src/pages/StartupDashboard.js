import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css'; // Опционально

const StartupDashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Дашборд Стартапера</h1>
                <div className="user-info">
                    <span>Привет, {user?.first_name || user?.username || user?.email}! 🚀</span>
                    <button onClick={logout} className="btn-secondary">Выйти</button>
                </div>
            </header>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3>Мои проекты</h3>
                    <p>Здесь вы можете опубликовать свой стартап.</p>
                    <button className="btn-primary">Добавить проект</button>
                </div>
                <div className="dashboard-card">
                    <h3>Мои заявки</h3>
                    <p>Статус заявок на менторство и гранты.</p>
                    <ul>
                        <li>Заявка на грант - <strong>На рассмотрении</strong></li>
                    </ul>
                </div>
                <div className="dashboard-card">
                    <h3>Поиск команды</h3>
                    <p>Найти разработчиков, дизайнеров или маркетологов.</p>
                </div>
            </div>
        </div>
    );
};

export default StartupDashboard;
