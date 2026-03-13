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
      case 'partners':
        axios.get('/api/guide/partners')
          .then(response => setPartners(response.data))
          .catch(() => setPartners([]));
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
    { id: 'mentors', label: 'Наставники' },
    { id: 'accelerators', label: 'Акселераторы' },
    { id: 'partners', label: 'Партнеры' },
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

      {/* Наставники */}
      {activeTab === 'mentors' && (
        <div>
          <h2 className="section-title">Наставники</h2>
          {mentors.length === 0 ? (
            <div className="card">
              <p>Информация о наставниках загружается...</p>
            </div>
          ) : (
            <div className="card-grid">
              {mentors.slice(0, 1).map(mentor => (
                <div key={mentor.id} className="card">
                  {mentor.photo_url && (
                    <img src={mentor.photo_url} alt={mentor.name} style={{ width: '100%', borderRadius: '5px', marginBottom: '1rem' }} />
                  )}
                  <h3>Иван Иванов</h3>
                  <p><strong>Специализация:</strong> {mentor.specialization}</p>
                  <p>{mentor.bio}</p>
                  <p><strong>Опыт:</strong> {mentor.experience_years} лет</p>
                  {mentor.contact_info && (
                    <p><strong>Контакты:</strong> {mentor.contact_info}</p>
                  )}
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
              {accelerators.slice(0, 1).map(acc => (
                <div key={acc.id} className="card">
                  {acc.logo_url && (
                    <img src={acc.logo_url} alt={acc.name} style={{ width: '100px', marginBottom: '1rem' }} />
                  )}
                  <h3>{acc.name}</h3>
                  <p>{acc.description}</p>
                  {acc.programs && <p><strong>Программы:</strong> {acc.programs}</p>}
                  <button className="btn btn-primary" style={{ marginTop: '0.5rem', display: 'inline-block' }} disabled>
                    Сайт
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Партнеры */}
      {activeTab === 'partners' && (
        <div>
          <h2 className="section-title">Партнеры</h2>
          {partners.length === 0 ? (
            <div className="card">
              <p>Информация о партнерах загружается...</p>
            </div>
          ) : (
            <div className="card-grid">
              {partners.map(partner => (
                <div key={partner.id} className="card">
                  {partner.logo_url && (
                    <img src={partner.logo_url} alt={partner.name} style={{ width: '150px', marginBottom: '1rem' }} />
                  )}
                  <h3>{partner.name}</h3>
                  <p>{partner.description}</p>
                  {partner.website && (
                    <a href={partner.website} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                      Сайт партнера
                    </a>
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
              <p>Рекомендации появятся после авторизации через Telegram бота с ИИ.</p>
              <p style={{ marginTop: '1rem' }}>Бот проанализирует ваш проект и предложит подходящие ресурсы из путеводителя.</p>
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

