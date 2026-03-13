import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const Support = () => {
  const [activeSection, setActiveSection] = useState('grants');
  const [grants, setGrants] = useState([]);

  useEffect(() => {
    axios.get('/api/guide/grants')
      .then(response => {
        // Оставляем только первый грант "Стартовый грант Удмуртии"
        const filteredGrants = response.data.filter(grant =>
          grant.title && grant.title.includes('Стартовый грант Удмуртии')
        );
        if (filteredGrants.length > 0) {
          setGrants([filteredGrants[0]]);
        } else if (response.data.length > 0) {
          // Если нет точного совпадения, берем первый
          setGrants([response.data[0]]);
        }
      })
      .catch(error => {
        console.error('Ошибка загрузки грантов:', error);
        // Пример для демонстрации
        setGrants([{
          id: 1,
          title: 'Стартовый грант Удмуртии',
          description: 'Финансирование новых проектов',
          amount: 'до 300 000 руб',
          deadline: '2024-11-30',
          requirements: 'Регистрация в Удмуртии, возраст до 25 лет'
        }]);
      });
  }, []);

  const sections = [
    { id: 'grants', title: 'Гранты и субсидии' },
    { id: 'contests', title: 'Конкурсы' },
    { id: 'programs', title: 'Программы обучения и стажировок' },
    { id: 'partners', title: 'Партнерские организации и проекты поддержки' }
  ];

  return (
    <div className="container">
      <h1 className="page-title">Меры поддержки</h1>
      <p style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '2rem' }}>
        Гранты, субсидии и программы для молодых предпринимателей
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem', justifyContent: 'center' }}>
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`btn ${activeSection === section.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ margin: '0.25rem' }}
          >
            {section.title}
          </button>
        ))}
      </div>

      {activeSection === 'grants' && (
        <div className="card">
          <h2 className="section-title">Гранты и субсидии</h2>
          {grants.length === 0 ? (
            <p>Информация о грантах загружается...</p>
          ) : (
            grants.map(grant => (
              <div key={grant.id} style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <h3 style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>{grant.title}</h3>
                <p style={{ margin: '0.5rem 0', color: 'var(--text-muted)' }}>{grant.description}</p>
                <p><strong>Размер:</strong> <span style={{ color: 'var(--secondary-color)' }}>{grant.amount}</span></p>
                <p><strong>Срок подачи:</strong> <span style={{ color: 'var(--secondary-color)' }}>{grant.deadline}</span></p>
                <p><strong>Требования:</strong> <span style={{ color: 'var(--secondary-color)' }}>{grant.requirements}</span></p>
                {grant.link && (
                  <a href={grant.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                    Подробнее
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeSection === 'contests' && (
        <div className="card">
          <h2 className="section-title">Конкурсы</h2>
          <p>Раздел в разработке. Скоро здесь появятся материалы.</p>
        </div>
      )}

      {activeSection === 'programs' && (
        <div className="card">
          <h2 className="section-title">Программы обучения и стажировок</h2>
          <p>Раздел в разработке. Скоро здесь появятся материалы.</p>
        </div>
      )}

      {activeSection === 'partners' && (
        <div className="card">
          <h2 className="section-title">Партнерские организации и проекты поддержки</h2>
          <p>Раздел в разработке. Скоро здесь появятся материалы.</p>
        </div>
      )}
    </div>
  );
};

export default Support;

