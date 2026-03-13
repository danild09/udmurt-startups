import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const SuccessStories = () => {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    axios.get('/api/content/articles/success')
      .then(response => {
        setStories(response.data);
      })
      .catch(error => {
        console.error('Ошибка загрузки историй:', error);
        // Примеры историй для демонстрации
        setStories([
          {
            id: 1,
            title: 'От хобби к бизнесу: История Марии',
            content: 'Мария начала создавать украшения с удмуртской символикой в 15 лет как хобби. Сейчас у нее собственный бренд, который продается в нескольких городах России. "Начала с простых сережек с национальными узорами, теперь делаю целые коллекции", - рассказывает Мария.',
            category: 'success'
          },
          {
            id: 2,
            title: 'IT-стартап в 16 лет',
            content: 'Алексей разработал мобильное приложение для изучения удмуртского языка. Приложение скачали более 10 000 раз. "Важно найти проблему, которую можешь решить", - советует Алексей.',
            category: 'success'
          }
        ]);
      });
  }, []);

  return (
    <div className="container">
      <h1 className="page-title">Опыт успешных бизнесменов</h1>
      <p style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '2rem' }}>
        Истории молодых предпринимателей из Удмуртии
      </p>

      {stories.length === 0 ? (
        <div className="card">
          <p>Истории успеха скоро появятся здесь. Следите за обновлениями!</p>
        </div>
      ) : (
        stories.map(story => (
          <div key={story.id} className="card">
            <h2 className="section-title">{story.title}</h2>
            <p style={{ lineHeight: '1.8', whiteSpace: 'pre-line' }}>{story.content}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default SuccessStories;

