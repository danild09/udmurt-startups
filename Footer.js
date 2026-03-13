import React from 'react';
import { Link } from 'react-router-dom';
import { FaTelegramPlane, FaVk, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3 className="footer-logo">Поддержка предпринимателей</h3>
                    <p className="footer-tagline">
                        Развиваем бизнес молодых в Удмуртии.
                        Вдохновляем, обучаем, поддерживаем.
                    </p>
                </div>

                <div className="footer-section">
                    <h4>Навигация</h4>
                    <ul className="footer-links">
                        <li><Link to="/">Главная</Link></li>
                        <li><Link to="/about">Об Удмуртии</Link></li>
                        <li><Link to="/guide">Путеводитель</Link></li>
                        <li><Link to="/market">Маркет</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>Контакты</h4>
                    <ul className="contact-list">
                        <li>
                            <FaEnvelope className="icon" />
                            <span>info@udmurt-entrepreneurs.ru</span>
                        </li>
                        <li>
                            <FaPhoneAlt className="icon" />
                            <span>+7 (3412) 123-456</span>
                        </li>
                        <li>
                            <FaMapMarkerAlt className="icon" />
                            <span>г. Ижевск, ул. Пушкинская, 200</span>
                        </li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>Мы в соцсетях</h4>
                    <div className="social-links">
                        <a href="https://t.me/MolStartupUR_bot" target="_blank" rel="noopener noreferrer" className="social-icon">
                            <FaTelegramPlane size={24} />
                        </a>
                        <a href="#" className="social-icon">
                            <FaVk size={24} />
                        </a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Поддержка предпринимателей Удмуртии. Все права защищены.</p>
            </div>
        </footer>
    );
};

export default Footer;
