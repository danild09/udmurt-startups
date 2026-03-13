import React, { useState } from 'react';
import '../App.css';

const BusinessLessons = () => {
  const [activeSection, setActiveSection] = useState('marketing');

  const sections = [
    { id: 'marketing', title: 'Основы маркетинга' },
    { id: 'finance', title: 'Финансовая грамотность' },
    { id: 'management', title: 'Управление временем и проектами' }
  ];

  return (
    <div className="container">
      <h1 className="page-title">Бизнес-уроки</h1>
      <p style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '2rem' }}>
        Видеоуроки и вебинары по основам предпринимательства
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

      <div className="card">
        {activeSection === 'marketing' && (
          <div>
            <h2 className="section-title">Основы маркетинга</h2>
            <p>Раздел в разработке. Скоро здесь появятся материалы.</p>
          </div>
        )}

        {activeSection === 'finance' && (
          <div>
            <h2 className="section-title">Финансовая грамотность</h2>
            <p>Раздел в разработке. Скоро здесь появятся материалы.</p>
          </div>
        )}

        {activeSection === 'management' && (
          <div>
            <h2 className="section-title">Управление временем и проектами</h2>
            <p>Раздел в разработке. Скоро здесь появятся материалы.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessLessons;

