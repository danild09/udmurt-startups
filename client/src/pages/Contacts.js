import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

const Contacts = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    axios.post(`${API_URL}/api/guide/ticket`, formData, { headers })
      .then(response => {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
      })
      .catch(error => {
        console.error('Ошибка отправки:', error);
        alert('Произошла ошибка при отправке. Попробуйте позже.');
      });
  };

  return (
    <div className="container">
      <h1 className="page-title">Контакты</h1>
      <p style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '2rem' }}>
        Свяжитесь с нами для вопросов и предложений
      </p>

      <div className="card-grid">
        <div className="card">
          <h2 className="section-title">Форма обратной связи</h2>
          {submitted && (
            <div style={{ background: '#93a7bd', color: '#7e1a1b', padding: '1rem', borderRadius: '5px', marginBottom: '1rem' }}>
              Спасибо! Ваше обращение отправлено. Мы свяжемся с вами в ближайшее время.
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Ваше имя *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Телефон</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Сообщение *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Отправить
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className="section-title">Контактная информация</h2>
          <div style={{ lineHeight: '2' }}>
            <p><strong>Email:</strong> info@udmurt-entrepreneurs.ru</p>
            <p><strong>Телефон:</strong> +7 (3412) XXX-XX-XX</p>
            <p><strong>Адрес:</strong> г. Ижевск, Удмуртская Республика</p>
            <p><strong>Время работы:</strong> Пн-Пт: 9:00 - 18:00</p>
          </div>

          <h3 style={{ marginTop: '2rem' }}>Мы в социальных сетях</h3>
          <div style={{ marginTop: '1rem' }}>
            <a href="https://t.me/MolStartupUR_bot" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ marginRight: '0.5rem' }}>
              Telegram
            </a>
            <a href="#" className="btn btn-secondary">
              VK
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;

