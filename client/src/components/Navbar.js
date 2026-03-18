import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="logo">
          Поддержка предпринимателей {user ? (user.role === 'admin' ? '(Админ)' : '(Стартапер)') : ''}
        </Link>
        <ul className="nav-links">
          <li><NavLink to="/" end>Главная</NavLink></li>
          <li><NavLink to="/about">Об Удмуртии</NavLink></li>
          <li><NavLink to="/how-to-start">Как начать</NavLink></li>
          <li><NavLink to="/success-stories">Истории успеха</NavLink></li>
          <li><NavLink to="/lessons">Уроки</NavLink></li>
          <li><NavLink to="/support">Поддержка</NavLink></li>
          <li><NavLink to="/market">Маркет</NavLink></li>
          <li><NavLink to="/guide">Путеводитель</NavLink></li>
          {(!user || user.role !== 'admin') && <li><NavLink to="/contacts">Контакты</NavLink></li>}
        </ul>

        <div className="nav-auth">
          {user ? (
            <div className="user-menu">
              {user.role === 'admin' && (
                <Link to="/admin" className="auth-button" style={{ marginRight: '10px', background: '#ff4757' }}>
                  Панель Администратора
                </Link>
              )}
              <Link to="/dashboard" className="auth-button">
                Личный кабинет
              </Link>
              <button onClick={() => { if(window.confirm('Вы уверены, что хотите выйти?')) logout() }} className="logout-btn">Выйти</button>
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
