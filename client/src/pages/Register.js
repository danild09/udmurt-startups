import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [role, setRole] = useState('startup');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            return setError('Пароль должен содержать минимум 6 символов');
        }

        setLoading(true);

        try {
            const data = await register(email, password, role, firstName, dateOfBirth);

            if (data.user.role === 'admin_pending') {
                navigate('/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Ошибка при регистрации. Проверьте введенные данные.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Регистрация</h2>
                <p className="auth-subtitle">Создайте аккаунт, чтобы получить доступ к платформе.</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Ваше Имя</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Иван Иванов"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Дата рождения</label>
                        <input
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email адресс</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Введите email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Минимум 6 символов"
                            required
                        />
                    </div>

                    <div className="form-group role-selection">
                        <label>Кто вы?</label>
                        <div className="role-options">
                            <label className={`role-option ${role === 'startup' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="startup"
                                    checked={role === 'startup'}
                                    onChange={() => setRole('startup')}
                                />
                                🚀 Стартапер (создатель проекта)
                            </label>
                            <label className={`role-option ${role === 'admin' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="admin"
                                    checked={role === 'admin'}
                                    onChange={() => setRole('admin')}
                                />
                                💼 Администратор / Модератор
                            </label>
                        </div>
                        {role === 'admin' && (
                            <div className="auth-warning">
                                ⚠️ Права администратора будут доступны **только после проверки** вашей заявки модератором.
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                        {loading ? 'Создание аккаунта...' : 'Зарегистрироваться'}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>или</span>
                </div>

                <div className="telegram-auth-container" style={{ textAlign: 'center', margin: '1rem 0' }}>
                    <a
                        href="https://t.me/MolStartupUR_bot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-telegram"
                    >
                        🤖 Зарегистрироваться через Telegram бота
                    </a>
                </div>

                <div className="auth-links">
                    <span>Уже есть аккаунт? <Link to="/login">Войти</Link></span>
                </div>
            </div>
        </div>
    );
};

export default Register;
