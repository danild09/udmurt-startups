import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const Guide = () => {
  const [activeTab, setActiveTab] = useState('podcasts');
  const [podcasts, setPodcasts] = useState([]);
  const [grants, setGrants] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [accelerators, setAccelerators] = useState([]);
  const [partners, setPartners] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    // Загрузка данных для активной вкладки
    switch (activeTab) {
      case 'podcasts':
        axios.get('/api/guide/podcasts')
          .then(response => setPodcasts(response.data))
          .catch(() => setPodcasts([]));
        break;
      case 'grants':
        axios.get('/api/guide/grants')
          .then(response => setGrants(response.data))
          .catch(() => setGrants([]));
        break;
      case 'mentors':
        axios.get('/api/guide/mentors')
          .then(response => setMentors(response.data))
          .catch(() => setMentors([]));
        break;
      case 'accelerators':
        axios.get('/api/guide/accelerators')
          .then(response => setAccelerators(response.data))
          .catch(() => setAccelerators([]));
        break;

      case 'recommendations':
        const user = JSON.parse(localStorage.getItem('telegram_user') || '{}');
        if (user.id) {
          axios.get(`/api/guide/recommendations/${user.id}`)
            .then(response => setRecommendations(response.data))
            .catch(() => setRecommendations([]));
        }
        break;
      default:
        break;
    }
  }, [activeTab]);

  const tabs = [
    { id: 'podcasts', label: 'Подкасты' },
    { id: 'grants', label: 'Гранты' },
    { id: 'mentors', label: 'Кураторы' },
    { id: 'accelerators', label: 'Акселераторы' },
    { id: 'recommendations', label: 'Рекомендации' }
  ];

  return (
    <div className="container">
      <h1 className="page-title">Путеводитель</h1>
      <p style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '2rem' }}>
        Все ресурсы для развития вашего бизнеса в одном месте
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem', justifyContent: 'center' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ margin: '0.25rem' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Подкасты */}
      {activeTab === 'podcasts' && (
        <div>
          <h2 className="section-title">Подкасты</h2>
          {podcasts.length === 0 ? (
            <div className="card">
              <p>Подкасты скоро появятся здесь. Следите за обновлениями!</p>
            </div>
          ) : (
            <div className="card-grid">
              {podcasts.map(podcast => (
                <div key={podcast.id} className="card">
                  <h3>{podcast.title}</h3>
                  <p>{podcast.description}</p>
                  {podcast.duration && <p>{podcast.duration}</p>}
                  {podcast.audio_url && (
                    <audio controls style={{ width: '100%', marginTop: '1rem' }}>
                      <source src={podcast.audio_url} />
                    </audio>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Гранты */}
      {activeTab === 'grants' && (
        <div>
          <h2 className="section-title">Гранты</h2>
          {grants.length === 0 ? (
            <div className="card">
              <p>Информация о грантах загружается...</p>
            </div>
          ) : (
            grants.map(grant => (
              <div key={grant.id} className="card">
                <h3>{grant.title}</h3>
                <p>{grant.description}</p>
                <p><strong>Размер:</strong> {grant.amount}</p>
                <p><strong>Срок:</strong> {grant.deadline}</p>
                <p><strong>Требования:</strong> {grant.requirements}</p>
                {grant.link && (
                  <a href={grant.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                    Подробнее
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Кураторы */}
      {activeTab === 'mentors' && (
        <div>
          <h2 className="section-title">Кураторы</h2>
          {mentors.length === 0 ? (
            <div className="card">
              <p>Информация о кураторах загружается...</p>
            </div>
          ) : (
            <div className="card-grid">
              {mentors.map(mentor => (
                <div key={mentor.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                    {mentor.photo_url ? (
                      <img src={mentor.photo_url} alt={mentor.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🧑‍🏫</div>
                    )}
                    <div>
                      <h3 style={{ margin: 0 }}>{mentor.name}</h3>
                      <p style={{ color: '#00b4ff', margin: '0.2rem 0', fontSize: '0.9rem' }}>{mentor.specialization}</p>
                      <span style={{ color: '#a78bfa', fontSize: '0.85rem' }}>Опыт: {mentor.experience_years} лет</span>
                    </div>
                  </div>
                  <p style={{ color: '#ccc', flexGrow: 1, fontSize: '0.95rem', lineHeight: '1.5' }}>{mentor.bio}</p>
                  
                  <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}><strong>Отзывы:</strong> 🌟🌟🌟🌟🌟 Оценок нет</p>
                    <a href="/dashboard" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', padding: '0.6rem' }}>
                      Подать заявку куратору (в Дашборде)
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Акселераторы */}
      {activeTab === 'accelerators' && (
        <div>
          <h2 className="section-title">Акселераторы</h2>
          {accelerators.length === 0 ? (
            <div className="card">
              <p>Информация об акселераторах загружается...</p>
            </div>
          ) : (
            <div className="card-grid">
              {accelerators.map(acc => (
                <div key={acc.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  {acc.logo_url && (
                    <div style={{ textAlign: 'center', marginBottom: '1rem', background: '#fff', padding: '1rem', borderRadius: '8px' }}>
                      <img src={acc.logo_url} alt={acc.name} style={{ maxHeight: '60px', maxWidth: '100%' }} />
                    </div>
                  )}
                  <h3 style={{ color: acc.name.includes('Сбер') ? '#21a038' : '#fff' }}>{acc.name}</h3>
                  <p style={{ color: '#ccc', flexGrow: 1 }}>{acc.description}</p>
                  
                  {acc.programs && (
                    <div style={{ margin: '1rem 0', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                      <strong style={{ display: 'block', marginBottom: '0.3rem', color: '#a78bfa' }}>📚 Доступные программы:</strong>
                      <span style={{ fontSize: '0.9rem' }}>{acc.programs}</span>
                    </div>
                  )}
                  
                  {acc.website && (
                    <button className="btn btn-primary" style={{ marginTop: 'auto', textAlign: 'center', cursor: 'default' }}>
                      Подробнее
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}



      {/* Рекомендации */}
      {activeTab === 'recommendations' && (
        <div>
          <h2 className="section-title">Персональные рекомендации</h2>
          {recommendations.length === 0 ? (
            <div className="card">
              <p>Рекомендации у вас в профиле</p>
            </div>
          ) : (
            recommendations.map(rec => (
              <div key={rec.id} className="card">
                <h3>{rec.title}</h3>
                <p>{rec.description}</p>
                {rec.link && (
                  <a href={rec.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                    Перейти
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Guide;

