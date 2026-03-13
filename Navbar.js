import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="logo">
          Поддержка предпринимателей
        </Link>
        <ul className="nav-links">
          <li><Link to="/">Главная</Link></li>
          <li><Link to="/about">Об Удмуртии</Link></li>
          <li><Link to="/how-to-start">Как начать</Link></li>
          <li><Link to="/success-stories">Истории успеха</Link></li>
          <li><Link to="/lessons">Уроки</Link></li>
          <li><Link to="/support">Поддержка</Link></li>
          <li><Link to="/market">Маркет</Link></li>
          <li><Link to="/guide">Путеводитель</Link></li>
          <li><Link to="/contacts">Контакты</Link></li>
        </ul>

        <div className="nav-auth">
          {user ? (
            <div className="user-menu">
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="auth-button">
                Личный кабинет
              </Link>
              <button onClick={logout} className="logout-btn">Выйти</button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-link">Войти</Link>
              <Link to="/register" className="auth-button">Регистрация</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
