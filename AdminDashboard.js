import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {
            console.error('Ошибка загрузки пользователей:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/admin/approve/${userId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Пользователь успешно одобрен!');
            fetchUsers(); // Обновить список
        } catch (err) {
            alert('Ошибка при одобрении: ' + (err.response?.data?.error || err.message));
        }
    };

    return (
        <div className="dashboard-container admin-dashboard">
            <header className="dashboard-header admin-header">
                <h1>Панель Администратора</h1>
                <div className="user-info">
                    <span>Админ: {user?.first_name || user?.email} 💼</span>
                    <button onClick={logout} className="btn-secondary">Выйти</button>
                </div>
            </header>

            <div className="dashboard-content">
                <h2>Управление пользователями</h2>
                {loading ? <p>Загрузка...</p> : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Имя</th>
                                <th>Email</th>
                                <th>Роль</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td>{u.first_name || '—'}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className={`role-badge ${u.role}`}>{u.role}</span>
                                    </td>
                                    <td>
                                        {u.role === 'admin_pending' && (
                                            <button
                                                onClick={() => handleApprove(u.id)}
                                                className="btn-success btn-sm"
                                            >
                                                Одобрить права
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <div className="admin-grid" style={{ marginTop: '2rem' }}>
                    <div className="dashboard-card">
                        <h3>Добавить Грант</h3>
                        <p>Опубликовать информацию о новом гранте.</p>
                    </div>
                    <div className="dashboard-card">
                        <h3>Публикация Новостей</h3>
                        <p>Разместить статью в блоге.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
