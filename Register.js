import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TelegramLoginWidget from '../components/TelegramLoginWidget';
import './Auth.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [role, setRole] = useState('startup');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, loginWithTelegram } = useAuth();
    const navigate = useNavigate();

    const handleTelegramAuth = async (user) => {
        setError('');
        setLoading(true);
        try {
            const data = await loginWithTelegram(user);
            if (data.user.role === 'admin' || data.user.role === 'admin_pending') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Ошибка авторизации через Telegram.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            return setError('Пароль должен содержать минимум 6 символов');
        }

        setLoading(true);

        try {
            const data = await register(email, password, role, firstName);

            if (data.user.role === 'admin_pending') {
                navigate('/admin');
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
                    <TelegramLoginWidget
                        botName={process.env.REACT_APP_TELEGRAM_BOT_USERNAME || 'MolStartupUR_bot'}
                        buttonSize="large"
                        cornerRadius={10}
                        onAuth={handleTelegramAuth}
                    />
                </div>

                <div className="auth-links">
                    <span>Уже есть аккаунт? <Link to="/login">Войти</Link></span>
                </div>
            </div>
        </div>
    );
};

export default Register;
