import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const Market = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const url = selectedCategory === 'all' 
      ? '/api/market/products' 
      : `/api/market/products/category/${selectedCategory}`;
    
    axios.get(url)
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error('Ошибка загрузки товаров:', error);
        // Примеры товаров для демонстрации
        setProducts([
          {
            id: 1,
            name: 'Серьги с удмуртским орнаментом',
            description: 'Ручная работа, серебро 925',
            price: 2500,
            category: 'jewelry',
            first_name: 'Мария',
            last_name: 'Иванова'
          },
          {
            id: 2,
            name: 'Браслет с национальными узорами',
            description: 'Кожаный браслет с вышивкой',
            price: 1200,
            category: 'jewelry',
            first_name: 'Анна',
            last_name: 'Петрова'
          }
        ]);
      });
  }, [selectedCategory]);

  const categories = [
    { value: 'all', label: 'Все товары' },
    { value: 'jewelry', label: 'Украшения' },
    { value: 'souvenirs', label: 'Сувениры' },
    { value: 'clothing', label: 'Одежда' },
    { value: 'other', label: 'Другое' }
  ];

  return (
    <div className="container">
      <h1 className="page-title">Маркет молодых</h1>
      <p style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '2rem' }}>
        Онлайн-магазин товаров от молодых предпринимателей
      </p>

      <div className="card">
        <h2 className="section-title">Как стать участником?</h2>
        <p>Если вы молодой предприниматель и хотите представить свои товары на нашей платформе:</p>
        <ol style={{ lineHeight: '2', marginLeft: '2rem', marginTop: '1rem' }}>
          <li>Зарегистрируйтесь на сайте через Telegram</li>
          <li>Заполните форму заявки на добавление товаров</li>
          <li>Предоставьте фотографии и описание товаров</li>
          <li>После модерации ваши товары появятся в каталоге</li>
        </ol>
        <p style={{ marginTop: '1rem' }}>
          <strong>Условия:</strong> Возраст до 25 лет, товары должны быть произведены вами или вашей командой.
        </p>
      </div>

      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ padding: '0.5rem 1rem', fontSize: '1rem', borderRadius: '5px' }}
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {products.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center' }}>Товары скоро появятся здесь. Станьте первым участником!</p>
        </div>
      ) : (
        <div className="card-grid">
          {products.map(product => (
            <div key={product.id} className="card">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} style={{ width: '100%', borderRadius: '5px', marginBottom: '1rem' }} />
              ) : (
                <div style={{ width: '100%', height: '200px', background: '#adaea9', borderRadius: '5px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#7e1a1b' }}>Нет фото</span>
                </div>
              )}
              <h3>{product.name}</h3>
              <p style={{ margin: '0.5rem 0', lineHeight: '1.6' }}>{product.description}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea', margin: '1rem 0' }}>
                {product.price ? `${product.price} ₽` : 'Цена по запросу'}
              </p>
              {product.first_name && (
                <p style={{ color: '#93a7bd', fontSize: '0.9rem' }}>
                  Предприниматель: {product.first_name} {product.last_name}
                </p>
              )}
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                Связаться с продавцом
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Market;

