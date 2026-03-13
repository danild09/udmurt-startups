import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
    const { user, logout } = useAuth();

    const renderStartupDashboard = () => (
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
                <button className="btn-secondary" style={{ marginTop: '1rem' }}>Искать</button>
            </div>
        </div>
    );

    const renderMentorDashboard = () => (
        <div className="dashboard-grid">
            <div className="dashboard-card">
                <h3>Запросы на менторство</h3>
                <p>Стартапы, которые хотят работать с вами.</p>
                <button className="btn-primary">Посмотреть запросы</button>
            </div>
            <div className="dashboard-card">
                <h3>Мои консультации</h3>
                <p>Расписание предстоящих встреч со стартапами.</p>
            </div>
            <div className="dashboard-card">
                <h3>Профиль наставника</h3>
                <p>Обновите информацию о себе, вашей специализации и опыте.</p>
                <button className="btn-secondary" style={{ marginTop: '1rem' }}>Редактировать</button>
            </div>
        </div>
    );

    const renderInvestorDashboard = () => (
        <div className="dashboard-grid">
            <div className="dashboard-card">
                <h3>База стартапов</h3>
                <p>Каталог проектов, ищущих инвестиции.</p>
                <button className="btn-primary">Перейти в каталог</button>
            </div>
            <div className="dashboard-card">
                <h3>Мои инвестиции</h3>
                <p>Аналитика и статус профинансированных вами проектов.</p>
            </div>
        </div>
    );

    const renderExpertDashboard = () => (
        <div className="dashboard-grid">
            <div className="dashboard-card">
                <h3>Оценка проектов</h3>
                <p>Стартапы, ожидающие вашей экспертной оценки.</p>
                <button className="btn-primary">Приступить к оценке</button>
            </div>
            <div className="dashboard-card">
                <h3>Мои экспертизы</h3>
                <p>История ваших отзывов и заключений.</p>
            </div>
        </div>
    );

    const renderDashboardContent = () => {
        switch (user?.role) {
            case 'startup':
                return renderStartupDashboard();
            case 'mentor':
                return renderMentorDashboard();
            case 'investor':
                return renderInvestorDashboard();
            case 'expert':
                return renderExpertDashboard();
            default:
                return renderStartupDashboard(); // Fallback to startup
        }
    };

    const getRoleNameForDisplay = (role) => {
        const roles = {
            'startup': 'Стартапера',
            'mentor': 'Наставника',
            'investor': 'Инвестора',
            'expert': 'Эксперта',
        };
        return roles[role] || 'Пользователя';
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Дашборд {getRoleNameForDisplay(user?.role)}</h1>
                <div className="user-info">
                    <span>Привет, {user?.first_name || user?.username || user?.email}! 🚀</span>
                    <button onClick={logout} className="btn-secondary">Выйти</button>
                </div>
            </header>

            {renderDashboardContent()}
        </div>
    );
};

export default Dashboard;
