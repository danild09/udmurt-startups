import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await login(email, password);
            if (data.user.role === 'admin' || data.user.role === 'admin_pending') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Ошибка авторизации. Проверьте почту и пароль.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Вход в платформу</h2>
                <p className="auth-subtitle">С возвращением! Введите данные для входа.</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Email адресс</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Введите ваш email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Введите пароль"
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                        {loading ? 'Вход...' : 'Войти'}
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
                        🤖 Войти через Telegram бота
                    </a>
                </div>

                <div className="auth-links">
                    <span>Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></span>
                </div>
            </div>
        </div>
    );
};

export default Login;
