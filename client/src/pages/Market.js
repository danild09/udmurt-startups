import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Market = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'other', proof_link: '', project_id: '' });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/guide/products/approved`);
      let data = res.data;
      if (selectedCategory !== 'all') {
        data = data.filter(p => p.category === selectedCategory);
      }
      setProducts(data);
      
      // Загружаем проекты пользователя для связи
      if (user && user.role !== 'admin') {
        try {
          const projRes = await axios.get(`${API_URL}/api/guide/projects`, { headers });
          setMyProjects(projRes.data || []);
        } catch (e) {
          console.warn("Could not load projects", e);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      setProducts([]); // Оставляем пустым если база пустая или недоступна
    }
  };

  const handleContactSeller = async (product) => {
    if (!user) {
        alert('Пожалуйста, авторизуйтесь для связи с продавцом.');
        navigate('/login');
        return;
    }
    if (user.id === product.entrepreneur_id) {
        alert('Это ваш собственный товар!');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        await axios.post(`${API_URL}/api/chat/start`, {
            product_id: product.id,
            seller_id: product.entrepreneur_id
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // Переходим в дашборд с активной вкладкой чатов (реализуем это через localStorage или как-то еще)
        localStorage.setItem('dashboardTab', 'chats');
        navigate('/dashboard');
    } catch (err) {
        alert('Ошибка при создании чата: ' + (err.response?.data?.error || err.message));
    }
  };

  const categories = [
    { value: 'all', label: 'Все товары' },
    { value: 'jewelry', label: 'Украшения' },
    { value: 'souvenirs', label: 'Сувениры' },
    { value: 'clothing', label: 'Одежда' },
    { value: 'other', label: 'Другое' }
  ];

  const handleSubmit = async () => {
    if (!form.name || !form.description || !form.proof_link) {
      alert('Заполните название, описание и ссылку док-ва.');
      return;
    }
    try {
      await axios.post(`${API_URL}/api/guide/product`, form, { headers });
      alert('✅ Ваш товар отправлен на модерацию администратору!');
      setShowForm(false);
      setForm({ name: '', description: '', price: '', category: 'other', proof_link: '', project_id: '' });
    } catch (err) {
      alert('❌ Ошибка отправки: ' + (err.response?.data?.error || err.message));
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.8rem 1rem', borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(20,20,30,0.8)',
    color: '#fff', marginBottom: '0.8rem', fontSize: '0.95rem',
    outline: 'none', transition: 'border-color 0.3s ease'
  };

  return (
    <div className="container">
      <h1 className="page-title">Маркет молодых</h1>
      <p style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '2rem' }}>
        Онлайн-магазин товаров от молодых предпринимателей
      </p>

      {user && user.role !== 'admin' && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Скрыть форму' : '+ Предложить товар в Маркет'}
          </button>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem', border: '1px solid #ff0033' }}>
          <h2 className="section-title" style={{ color: '#ff0033' }}>Добавить товар</h2>
          <p style={{ color: '#ccc', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Вам необходимо доказать, что вы являетесь производителем (укажите ссылку на портфолио, соцсеть проекта или др.)
          </p>
          <input style={inputStyle} placeholder="Название товара *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <textarea style={{...inputStyle, minHeight: '80px'}} placeholder="Подробное описание товара *" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <input style={inputStyle} type="text" inputMode="numeric" pattern="[0-9]*" placeholder="Цена (в руб, только цифры) *" value={form.price} 
            onChange={e => {
              const val = e.target.value.replace(/\D/g, ''); // Только цифры
              setForm({...form, price: val});
            }} 
          />
          <input style={inputStyle} type="url" placeholder="Ссылка на доказательства производства (VK, Сайт, Фото) *" value={form.proof_link} onChange={e => setForm({...form, proof_link: e.target.value})} />
          
          <select style={inputStyle} value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
            {categories.filter(c => c.value !== 'all').map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          
          {myProjects.length > 0 && (
            <select style={inputStyle} value={form.project_id || ''} onChange={e => setForm({...form, project_id: e.target.value})}>
              <option value="">-- Привязать к существующему проекту (необязательно) --</option>
              {myProjects.map(proj => <option key={proj.id} value={proj.id}>{proj.name}</option>)}
            </select>
          )}

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSubmit}>Отправить на модерацию</button>
        </div>
      )}

      {/* Инструкция, если не раскрыта форма */}
      {!showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 className="section-title">Как стать участником?</h2>
          <ol style={{ lineHeight: '2', marginLeft: '2rem', marginTop: '1rem', color: '#ccc' }}>
            <li>Зарегистрируйтесь на сайте и авторизуйтесь</li>
            <li>Нажмите "Предложить товар" и заполните анкету</li>
            <li>Предоставьте ссылку-доказательство вашей разработки/производства</li>
            <li>После модерации суперадмином ваш товар появится в каталоге</li>
          </ol>
        </div>
      )}

      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <select 
          className="market-category-select"
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ padding: '0.8rem 1.5rem', borderRadius: '30px', background: '#1e1e28', color: '#fff', border: '1px solid #ff0033', outline: 'none', cursor: 'pointer', fontSize: '1rem', transition: 'all 0.3s ease' }}
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value} style={{color: '#000'}}>{cat.label}</option>
          ))}
        </select>
      </div>

      {products.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#999' }}>Товары загружаются или каталог пока пуст. Вы можете стать первым!</p>
        </div>
      ) : (
        <div className="card-grid">
          {products.map(product => (
            <div key={product.id} className="card">
              <div style={{ width: '100%', height: '200px', background: 'rgba(255,0,51,0.05)', borderRadius: '5px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#ccc', fontSize: '2rem' }}>🛍️</span>
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{product.name}</h3>
              <p style={{ margin: '0 0 1rem 0', lineHeight: '1.4', color: '#ccc', fontSize: '0.9rem' }}>{product.description}</p>
              <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#ff0033', margin: '0 0 1rem 0' }}>
                {product.price ? `${product.price} ₽` : 'Цена по запросу'}
              </p>
              <button className="btn btn-secondary" style={{ width: '100%', borderColor: '#ff0033' }} onClick={() => handleContactSeller(product)}>
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
