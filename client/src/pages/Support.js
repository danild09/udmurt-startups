import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Support = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [activeSection, setActiveSection] = useState('grants');

  const [grants, setGrants] = useState([]);
  const [contests, setContests] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [partners, setPartners] = useState([]);

  // Формы администратора
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});

  // Форма подачи заявки на грант
  const [applyGrant, setApplyGrant] = useState(null);
  const [applicationForm, setApplicationForm] = useState({ project_name: '', project_description: '' });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    axios.get(`${API_URL}/api/guide/grants`).then(r => setGrants(r.data)).catch(() => {});
    axios.get(`${API_URL}/api/guide/contests`).then(r => setContests(r.data)).catch(() => {});
    axios.get(`${API_URL}/api/guide/programs`).then(r => setPrograms(r.data)).catch(() => {});
    axios.get(`${API_URL}/api/guide/partners`).then(r => setPartners(r.data)).catch(() => {});
  };

  const handleAdminSubmit = async (type) => {
    try {
      await axios.post(`${API_URL}/api/guide/${type}`, form, { headers });
      setForm({});
      setShowForm(false);
      loadData();
      alert('✅ Успешно добавлено!');
    } catch (err) {
      alert('❌ Ошибка: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Удалить?')) return;
    try {
      await axios.delete(`${API_URL}/api/guide/${type}/${id}`, { headers });
      loadData();
    } catch (err) {
      alert('Ошибка удаления');
    }
  };

  const handleApplyForGrant = async (grantId) => {
    try {
      await axios.post(`${API_URL}/api/guide/grant-application`, {
        grant_id: grantId,
        ...applicationForm
      }, { headers });
      alert('✅ Заявка на грант отправлена!');
      setApplyGrant(null);
      setApplicationForm({ project_name: '', project_description: '' });
    } catch (err) {
      alert('❌ Ошибка: ' + (err.response?.data?.error || err.message));
    }
  };

  const sections = [
    { id: 'grants', title: 'Гранты и субсидии' },
    { id: 'contests', title: 'Конкурсы' },
    { id: 'programs', title: 'Программы обучения и стажировок' },
    { id: 'partners', title: 'Партнерские организации и проекты поддержки' }
  ];

  const inputStyle = {
    width: '100%', padding: '0.8rem', borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)',
    color: '#fff', marginBottom: '0.6rem', fontSize: '0.95rem'
  };

  const renderItemCard = (item, type, extra) => (
    <div key={item.id} style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
      <h3 style={{ color: '#fff', marginBottom: '0.8rem', fontSize: '1.2rem' }}>{item.title || item.name}</h3>
      {item.description && <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{item.description}</p>}
      {extra}
      {item.link && (
        type === 'grant' ? (
          <button onClick={() => alert('Эта функция во временной разработке')} className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block', fontSize: '0.85rem', padding: '0.5rem 1.2rem', cursor: 'pointer', border: 'none' }}>
            Подробнее →
          </button>
        ) : (
          <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block', fontSize: '0.85rem', padding: '0.5rem 1.2rem' }}>
            Подробнее →
          </a>
        )
      )}
      {isAdmin && (
        <button onClick={() => handleDelete(type, item.id)} style={{ marginTop: '0.5rem', marginLeft: '0.5rem', background: 'rgba(255,71,87,0.2)', color: '#ff4757', border: '1px solid rgba(255,71,87,0.3)', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
          🗑 Удалить
        </button>
      )}
    </div>
  );

  return (
    <div className="container">
      <h1 className="page-title">Меры поддержки</h1>
      <p style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '2rem' }}>
        Гранты, субсидии и программы для молодых предпринимателей
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem', justifyContent: 'center' }}>
        {sections.map(section => (
          <button key={section.id} onClick={() => { setActiveSection(section.id); setShowForm(false); }}
            className={`btn ${activeSection === section.id ? 'btn-primary' : 'btn-secondary'}`} style={{ margin: '0.25rem' }}>
            {section.title}
          </button>
        ))}
      </div>

      {/* ======= ГРАНТЫ ======= */}
      {activeSection === 'grants' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="section-title">Гранты и субсидии</h2>
            {isAdmin && <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem' }}>{showForm ? 'Скрыть' : '+ Добавить грант'}</button>}
          </div>

          {isAdmin && showForm && (
            <div style={{ margin: '1.5rem 0', padding: '1.5rem', background: 'rgba(255,0,51,0.05)', borderRadius: '12px', border: '1px solid rgba(255,0,51,0.2)' }}>
              <h4 style={{ color: '#ff0033', marginBottom: '1rem' }}>Новый грант</h4>
              <input style={inputStyle} placeholder="Название гранта *" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
              <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Описание" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
              <input style={inputStyle} type="text" inputMode="numeric" pattern="[0-9]*" placeholder="Размер суммы (только числа)" value={form.amount || ''} onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  setForm({ ...form, amount: val });
              }} />
              <input style={inputStyle} type="date" placeholder="Дедлайн" value={form.deadline || ''} onChange={e => setForm({ ...form, deadline: e.target.value })} />
              <input style={inputStyle} placeholder="Требования" value={form.requirements || ''} onChange={e => setForm({ ...form, requirements: e.target.value })} />
              <input style={inputStyle} placeholder="Ссылка (URL)" value={form.link || ''} onChange={e => setForm({ ...form, link: e.target.value })} />
              <button className="btn btn-primary" onClick={() => handleAdminSubmit('grant')} style={{ marginTop: '0.5rem' }}>Создать</button>
            </div>
          )}

          {grants.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Грантов пока нет. {isAdmin ? 'Добавьте первый!' : 'Скоро здесь появятся!'}</p>
          ) : (
            grants.map(grant => renderItemCard(grant, 'grant', (
              <>
                {grant.amount && <p><strong>Размер:</strong> <span style={{ color: '#2ed573' }}>{grant.amount}</span></p>}
                {grant.deadline && <p><strong>Срок подачи:</strong> <span style={{ color: '#ffa502' }}>{grant.deadline}</span></p>}
                {grant.requirements && <p><strong>Требования:</strong> <span style={{ color: 'var(--text-muted)' }}>{grant.requirements}</span></p>}
                {user && user.role === 'startup' && (
                  <>
                    {applyGrant === grant.id ? (
                      <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(46,213,115,0.05)', borderRadius: '10px', border: '1px solid rgba(46,213,115,0.2)' }}>
                        <input style={inputStyle} placeholder="Название вашего проекта *" value={applicationForm.project_name} onChange={e => setApplicationForm({ ...applicationForm, project_name: e.target.value })} />
                        <textarea style={{ ...inputStyle, minHeight: '60px' }} placeholder="Описание проекта" value={applicationForm.project_description} onChange={e => setApplicationForm({ ...applicationForm, project_description: e.target.value })} />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }} onClick={() => handleApplyForGrant(grant.id)}>Отправить заявку</button>
                          <button className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }} onClick={() => setApplyGrant(null)}>Отмена</button>
                        </div>
                      </div>
                    ) : (
                      <button className="btn btn-secondary" style={{ marginTop: '0.8rem', fontSize: '0.85rem', padding: '0.4rem 1rem' }} onClick={() => setApplyGrant(grant.id)}>
                        📨 Подать заявку
                      </button>
                    )}
                  </>
                )}
              </>
            )))
          )}
        </div>
      )}

      {/* ======= КОНКУРСЫ ======= */}
      {activeSection === 'contests' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="section-title">Конкурсы</h2>
            {isAdmin && <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem' }}>{showForm ? 'Скрыть' : '+ Добавить конкурс'}</button>}
          </div>

          {isAdmin && showForm && (
            <div style={{ margin: '1.5rem 0', padding: '1.5rem', background: 'rgba(255,0,51,0.05)', borderRadius: '12px', border: '1px solid rgba(255,0,51,0.2)' }}>
              <h4 style={{ color: '#ff0033', marginBottom: '1rem' }}>Новый конкурс</h4>
              <input style={inputStyle} placeholder="Название конкурса *" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
              <textarea style={{ ...inputStyle, minHeight: '80px' }} placeholder="Описание" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
              <input style={inputStyle} type="date" placeholder="Дедлайн" value={form.deadline || ''} onChange={e => setForm({ ...form, deadline: e.target.value })} />
              <input style={inputStyle} placeholder="Приз" value={form.prize || ''} onChange={e => setForm({ ...form, prize: e.target.value })} />
              <input style={inputStyle} placeholder="Требования" value={form.requirements || ''} onChange={e => setForm({ ...form, requirements: e.target.value })} />
              <input style={inputStyle} placeholder="Ссылка (URL)" value={form.link || ''} onChange={e => setForm({ ...form, link: e.target.value })} />
              <button className="btn btn-primary" onClick={() => handleAdminSubmit('contest')} style={{ marginTop: '0.5rem' }}>Создать</button>
            </div>
          )}

          {contests.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Конкурсов пока нет. {isAdmin ? 'Добавьте первый!' : 'Скоро здесь появятся!'}</p>
          ) : (
            contests.map(c => renderItemCard(c, 'contest', (
              <>
                {c.prize && <p><strong>Приз:</strong> <span style={{ color: '#ffd700' }}>{c.prize}</span></p>}
                {c.deadline && <p><strong>Дедлайн:</strong> <span style={{ color: '#ffa502' }}>{c.deadline}</span></p>}
                {c.requirements && <p><strong>Требования:</strong> <span style={{ color: 'var(--text-muted)' }}>{c.requirements}</span></p>}
              </>
            )))
          )}
        </div>
      )}

      {/* ======= ПРОГРАММЫ ======= */}
      {activeSection === 'programs' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="section-title">Программы обучения и стажировок</h2>
            {isAdmin && <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem' }}>{showForm ? 'Скрыть' : '+ Добавить программу'}</button>}
          </div>

          {isAdmin && showForm && (
            <div style={{ margin: '1.5rem 0', padding: '1.5rem', background: 'rgba(255,0,51,0.05)', borderRadius: '12px', border: '1px solid rgba(255,0,51,0.2)' }}>
              <h4 style={{ color: '#ff0033', marginBottom: '1rem' }}>Новая программа</h4>
              <input style={inputStyle} placeholder="Название программы *" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
              <textarea style={{ ...inputStyle, minHeight: '80px' }} placeholder="Описание" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
              <input style={inputStyle} placeholder="Длительность (напр. 3 месяца)" value={form.duration || ''} onChange={e => setForm({ ...form, duration: e.target.value })} />
              <input style={inputStyle} placeholder="Формат (очно/онлайн/смешанный)" value={form.format || ''} onChange={e => setForm({ ...form, format: e.target.value })} />
              <input style={inputStyle} placeholder="Требования" value={form.requirements || ''} onChange={e => setForm({ ...form, requirements: e.target.value })} />
              <input style={inputStyle} placeholder="Ссылка (URL)" value={form.link || ''} onChange={e => setForm({ ...form, link: e.target.value })} />
              <button className="btn btn-primary" onClick={() => handleAdminSubmit('program')} style={{ marginTop: '0.5rem' }}>Создать</button>
            </div>
          )}

          {programs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Программ пока нет. {isAdmin ? 'Добавьте первую!' : 'Скоро здесь появятся!'}</p>
          ) : (
            programs.map(p => renderItemCard(p, 'program', (
              <>
                {p.duration && <p><strong>Длительность:</strong> <span style={{ color: '#00b4ff' }}>{p.duration}</span></p>}
                {p.format && <p><strong>Формат:</strong> <span style={{ color: 'var(--text-muted)' }}>{p.format}</span></p>}
                {p.requirements && <p><strong>Требования:</strong> <span style={{ color: 'var(--text-muted)' }}>{p.requirements}</span></p>}
              </>
            )))
          )}
        </div>
      )}

      {/* ======= ПАРТНЁРЫ ======= */}
      {activeSection === 'partners' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="section-title">Партнерские организации</h2>
            {isAdmin && <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem' }}>{showForm ? 'Скрыть' : '+ Добавить партнёра'}</button>}
          </div>

          {isAdmin && showForm && (
            <div style={{ margin: '1.5rem 0', padding: '1.5rem', background: 'rgba(255,0,51,0.05)', borderRadius: '12px', border: '1px solid rgba(255,0,51,0.2)' }}>
              <h4 style={{ color: '#ff0033', marginBottom: '1rem' }}>Новый партнёр</h4>
              <input style={inputStyle} placeholder="Название организации *" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
              <textarea style={{ ...inputStyle, minHeight: '80px' }} placeholder="Описание" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
              <input style={inputStyle} placeholder="Сайт (URL)" value={form.website || ''} onChange={e => setForm({ ...form, website: e.target.value })} />
              <input style={inputStyle} placeholder="Контактная информация" value={form.contact_info || ''} onChange={e => setForm({ ...form, contact_info: e.target.value })} />
              <button className="btn btn-primary" onClick={() => handleAdminSubmit('partner')} style={{ marginTop: '0.5rem' }}>Добавить</button>
            </div>
          )}

          {partners.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Партнёров пока нет. {isAdmin ? 'Добавьте первого!' : 'Скоро здесь появятся!'}</p>
          ) : (
            partners.map(p => renderItemCard(p, 'partner', (
              <>
                {p.website && <p><strong>Сайт:</strong> <a href={p.website} target="_blank" rel="noopener noreferrer" style={{ color: '#00b4ff' }}>{p.website}</a></p>}
                {p.contact_info && <p><strong>Контакты:</strong> <span style={{ color: 'var(--text-muted)' }}>{p.contact_info}</span></p>}
              </>
            )))
          )}
        </div>
      )}
    </div>
  );
};

export default Support;
