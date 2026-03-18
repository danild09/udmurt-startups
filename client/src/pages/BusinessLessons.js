import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const BusinessLessons = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [activeSection, setActiveSection] = useState('all');
  const [lessons, setLessons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ format: 'video' });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const categories = [
    { id: 'all', title: 'Все уроки' },
    { id: 'marketing', title: 'Основы маркетинга' },
    { id: 'finance', title: 'Финансовая грамотность' },
    { id: 'management', title: 'Управление временем и проектами' }
  ];

  useEffect(() => {
    loadLessons();
  }, [activeSection]);

  const loadLessons = () => {
    const url = activeSection === 'all'
      ? `${API_URL}/api/guide/lessons`
      : `${API_URL}/api/guide/lessons?category=${activeSection}`;
    axios.get(url).then(r => setLessons(r.data)).catch(() => {});
  };

  const handleSubmit = async () => {
    if (!form.title) return alert('Укажите название материала');
    try {
      await axios.post(`${API_URL}/api/guide/lesson`, { ...form, category: form.category || activeSection }, { headers });
      setForm({ format: 'video' });
      setShowForm(false);
      loadLessons();
      alert('✅ Урок добавлен!');
    } catch (err) {
      alert('❌ Ошибка: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить урок?')) return;
    try {
      await axios.delete(`${API_URL}/api/guide/lesson/${id}`, { headers });
      loadLessons();
    } catch (err) {
      alert('Ошибка удаления');
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.8rem', borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)',
    color: '#fff', marginBottom: '0.6rem', fontSize: '0.95rem'
  };

  // Вспомогательная функция для извлечения ID из YouTube URL
  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  return (
    <div className="container">
      <h1 className="page-title">Бизнес-уроки</h1>
      <p style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '2rem' }}>
        Видеоуроки и вебинары по основам предпринимательства
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem', justifyContent: 'center' }}>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => { setActiveSection(cat.id); setShowForm(false); }}
            className={`btn ${activeSection === cat.id ? 'btn-primary' : 'btn-secondary'}`} style={{ margin: '0.25rem' }}>
            {cat.title}
          </button>
        ))}
      </div>

      {/* Премиум-курсы (Интенсивы) */}
      <div className="card" style={{ 
        marginBottom: '2rem', 
        background: 'linear-gradient(135deg, rgba(30,30,40,0.95) 0%, rgba(20,20,30,0.98) 100%)',
        border: '1px solid rgba(255,0,51,0.2)',
        borderRadius: '12px',
        padding: '1.2rem 1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.5rem',
        alignItems: 'center'
      }}>
        <div style={{ flex: '1 1 500px' }}>
          <div style={{ display: 'inline-block', background: '#ff0033', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '0.5rem', letterSpacing: '1px' }}>
            ПРОДВИНУТАЯ ПРОГРАММА
          </div>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#fff' }}>Комплексные бизнес-интенсивы</h2>
          <p style={{ color: '#ccc', lineHeight: '1.4', marginBottom: '0.8rem', fontSize: '0.9rem' }}>
            От идеи до первых продаж. Сборные платные курсы включают расширенную базу, еженедельные сессии с куратором и помощь с маркетплейсами.
          </p>
          <button className="btn btn-primary" onClick={() => alert('Набор на следующий поток откроется в ближайшее время. Следите за анонсами!')} style={{ fontSize: '0.9rem', padding: '0.6rem 1.2rem' }}>
            Узнать подробности и тарифы
          </button>
        </div>
      </div>

      {/* Кнопка добавления (для админа) */}
      {isAdmin && (
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Скрыть форму' : '+ Добавить урок / видеоматериал'}
          </button>
        </div>
      )}

      {/* Форма добавления урока */}
      {isAdmin && showForm && (
        <div className="card" style={{ marginBottom: '2rem', border: '1px solid rgba(255,0,51,0.3)' }}>
          <h3 style={{ color: '#ff0033', marginBottom: '1rem' }}>Новый учебный материал</h3>
          
          <select style={inputStyle} value={form.format} onChange={e => setForm({...form, format: e.target.value})}>
            <option value="video">Формат: Видеоурок</option>
            <option value="document">Формат: Текстовый документ</option>
            <option value="presentation">Формат: Презентация</option>
          </select>
          
          <input style={inputStyle} placeholder="Название материала *" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
          <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Описание" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
          <input style={inputStyle} type="url" placeholder="Ссылка на материал (Видео, Google Docs, PDF и т.д.) *" value={form.video_url || ''} 
            onChange={e => setForm({ ...form, video_url: e.target.value })} 
            onBlur={e => {
              if (e.target.value && !e.target.value.startsWith('http')) {
                alert('Пожалуйста, введите корректную ссылку, начинающуюся с http:// или https://');
                setForm({...form, video_url: ''});
              }
            }} 
          />
          <div style={{ position: 'relative' }}>
            <input style={{...inputStyle, paddingRight: '40px'}} type="text" inputMode="numeric" pattern="[0-9]*" placeholder="Длительность или объем (введите только число)" value={form.duration || ''} 
              onChange={e => {
                const val = e.target.value.replace(/\D/g, ''); // Удаляем любые нецифровые символы
                setForm({ ...form, duration: val });
              }} 
            />
            <span style={{ position: 'absolute', right: '15px', top: '12px', color: '#999', fontSize: '0.9rem' }}>мин/стр</span>
          </div>
          <p style={{ color: '#ccc', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Категория:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>
            {[
              { id: 'marketing', label: 'Основы маркетинга' },
              { id: 'finance', label: 'Финансовая грамотность' },
              { id: 'management', label: 'Управление временем и проектами' }
            ].map(cat => (
              <button key={cat.id} type="button" onClick={() => setForm({ ...form, category: cat.id })}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, border: 'none',
                  background: form.category === cat.id ? 'rgba(255,0,51,0.3)' : 'rgba(255,255,255,0.05)',
                  color: form.category === cat.id ? '#ff0033' : '#ccc',
                  borderWidth: '1px', borderStyle: 'solid',
                  borderColor: form.category === cat.id ? 'rgba(255,0,51,0.5)' : 'rgba(255,255,255,0.1)',
                  transition: 'all 0.2s ease'
                }}>
                {form.category === cat.id ? '✓ ' : ''}{cat.label}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={handleSubmit} style={{ marginTop: '0.5rem' }}>Создать урок</button>
        </div>
      )}

      {/* Список уроков */}
      {lessons.length === 0 ? (
        <div className="card">
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
            {isAdmin ? 'Уроков пока нет. Добавьте первый видеоматериал!' : 'Раздел в разработке. Скоро здесь появятся материалы.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {lessons.map(lesson => (
            <div key={lesson.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
              {/* Превью в зависимости от формата */}
              {(lesson.format === 'video' || !lesson.format) && lesson.video_url === 'dummy_video' ? (
                <div 
                  onClick={() => alert('Данный контент находится в разработке.\n\nАвтор: admin@example.com')}
                  style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#1a1a24', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ fontSize: '3rem', color: '#ff0033', opacity: 0.8, marginBottom: '0.5rem' }}>▶</span>
                    <span style={{ color: '#ccc', fontSize: '0.9rem', fontWeight: 'bold' }}>Смотреть видео</span>
                  </div>
                </div>
              ) : (lesson.format === 'video' || !lesson.format) && lesson.video_url && getYouTubeId(lesson.video_url) ? (
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(lesson.video_url)}`}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    title={lesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : lesson.video_url ? (
                <div style={{ padding: '2rem 1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.03)' }}>
                  <span style={{fontSize: '2rem', display: 'block', marginBottom: '0.5rem'}}>
                    {lesson.format === 'document' ? '📄' : lesson.format === 'presentation' ? '📊' : '▶'}
                  </span>
                  <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" style={{ color: '#00b4ff', fontSize: '1.1rem' }}>
                    {lesson.format === 'document' ? 'Открыть Сводную Информацию' : lesson.format === 'presentation' ? 'Презентация' : 'Смотреть материал'}
                  </a>
                </div>
              ) : null}

              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>{lesson.title}</h3>
                {lesson.description && <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{lesson.description}</p>}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {lesson.duration && <span style={{ color: '#ffa502', fontSize: '0.85rem' }}>⌛ {lesson.duration}</span>}
                  {lesson.category && <span style={{ color: '#a78bfa', fontSize: '0.85rem' }}>📂 {lesson.category === 'marketing' ? 'Основы маркетинга' : lesson.category === 'finance' ? 'Финансовая грамотность' : lesson.category === 'management' ? 'Управление проектами' : lesson.category}</span>}
                </div>
                {isAdmin && (
                  <button onClick={() => handleDelete(lesson.id)} style={{ marginTop: '0.8rem', background: 'rgba(255,71,87,0.2)', color: '#ff4757', border: '1px solid rgba(255,71,87,0.3)', padding: '0.3rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                    🗑 Удалить
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessLessons;
