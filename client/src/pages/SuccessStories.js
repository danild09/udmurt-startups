import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SuccessStories = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/guide/success-stories`);
      setStories(res.data);
    } catch (error) {
      console.error('Ошибка загрузки историй:', error);
      setStories([]);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.content) {
      alert('Заполните название и текст истории.');
      return;
    }
    try {
      await axios.post(`${API_URL}/api/guide/success-story`, form, { headers });
      alert('✅ Ваша история отправлена на модерацию администратору!');
      setShowForm(false);
      setForm({ title: '', content: '' });
    } catch (err) {
      alert('❌ Ошибка отправки: ' + (err.response?.data?.error || err.message));
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.8rem', borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)',
    color: '#fff', marginBottom: '0.8rem', fontSize: '0.95rem'
  };

  return (
    <div className="container">
      <h1 className="page-title">Опыт успешных бизнесменов</h1>
      <p style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '2rem', color: '#ccc' }}>
        Вдохновляющие истории молодых предпринимателей из Удмуртии
      </p>

      {user && user.role === 'admin' && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button className="btn btn-primary" style={{ background: 'linear-gradient(45deg, #00b4ff, #0072ff)', border: 'none' }} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Отмена' : '✍️ Написать свою историю'}
          </button>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem', border: '1px solid #00b4ff' }}>
          <h2 className="section-title" style={{ color: '#00b4ff' }}>Моя история успеха</h2>
          <p style={{ color: '#ccc', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Поделитесь тем, как кураторство или обучение на платформе помогли вам запустить продукт. Опишите ваши инсайты. Эта история будет опубликована после модерации.
          </p>
          <input style={inputStyle} placeholder="Заголовок вашей истории (Например: Как я открыл кофейню в 19 лет) *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <textarea style={{...inputStyle, minHeight: '150px'}} placeholder="Текст истории (ваши трудности, решения, советы новичкам) *" value={form.content} onChange={e => setForm({...form, content: e.target.value})} />
          
          <button className="btn btn-primary" style={{ width: '100%', background: '#00b4ff', border: 'none' }} onClick={handleSubmit}>Отправить на модерацию</button>
        </div>
      )}

      {stories.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#999' }}>Вы можете стать первым, чья история успеха появится здесь!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {stories.map(story => (
            <div key={story.id} className="card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #ff0033, #00b4ff)' }}></div>
              <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem', marginTop: '0.5rem' }}>{story.title}</h2>
              <p style={{ color: '#00b4ff', fontSize: '0.9rem', marginBottom: '1rem' }}>Автор: {story.first_name || story.email}</p>
              
              <p style={{ lineHeight: '1.6', whiteSpace: 'pre-line', color: '#ccc' }}>{story.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuccessStories;
