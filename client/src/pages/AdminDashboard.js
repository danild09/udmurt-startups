import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [users, setUsers] = useState([]);
    const [grantApps, setGrantApps] = useState([]);
    const [mentorReqs, setMentorReqs] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [products, setProducts] = useState([]);
    const [stories, setStories] = useState([]);
    const [mentors, setMentors] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');

    // Форма стать куратором
    const [showCuratorForm, setShowCuratorForm] = useState(false);
    const [curatorForm, setCuratorForm] = useState({ name: user?.first_name || '', specialization: 'IT и Разработка', bio: '', experience_years: '', contact_info: '' });
    // Ответ на тикет
    const [replyTicketId, setReplyTicketId] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        try {
            const [usersRes, appsRes, tickRes, prodRes, storyRes, reqsRes, curatorReqsRes, mentorsRes] = await Promise.all([
                axios.get(`${API_URL}/api/admin/users`, { headers }),
                axios.get(`${API_URL}/api/guide/grant-applications`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/api/guide/tickets`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/api/guide/products/all`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/api/guide/admin/success-stories`, { headers }).catch(() => ({ data: [] })),
                // Загружаем все заявки для админа (базовая инфа)
                axios.get(`${API_URL}/api/guide/mentorship-requests`, { headers }).catch(() => ({ data: [] })),
                // Загружаем детальные заявки именно как для куратора, если этот админ зарегистрирован как куратор
                axios.get(`${API_URL}/api/guide/mentorship-requests/curator`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/api/guide/mentors`).catch(() => ({ data: [] }))
            ]);
            setUsers(usersRes.data);
            setGrantApps(appsRes.data);
            setTickets(tickRes.data);
            setProducts(prodRes.data);
            setStories(storyRes.data);
            setMentors(mentorsRes.data);

            // Объединяем базовые заявки и детальные заявки от куратора
            const allReqs = reqsRes.data || [];
            const curatorReqs = curatorReqsRes.data || [];
            
            // Если есть детальные заявки, заменяем ими базовые по ID
            const mergedReqs = allReqs.map(req => {
                const detailed = curatorReqs.find(cr => cr.id === req.id);
                return detailed ? detailed : req;
            });
            
            setMentorReqs(mergedReqs);
        } catch (err) {
            console.error('Ошибка загрузки:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        try {
            await axios.post(`${API_URL}/api/admin/approve/${userId}`, {}, { headers });
            alert('✅ Пользователь одобрен!');
            loadAll();
        } catch (err) {
            alert('Ошибка: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleGenericStatus = async (type, id, status) => {
        try {
            let endpoint = '';
            if (type === 'grant') endpoint = `/api/guide/grant-application/${id}/status`;
            if (type === 'mentor') endpoint = `/api/guide/mentorship-request/${id}/status`;
            if (type === 'product') endpoint = `/api/guide/product/${id}/status`;
            if (type === 'story') endpoint = `/api/guide/success-story/${id}/status`;

            await axios.post(`${API_URL}${endpoint}`, { status }, { headers });
            loadAll();
        } catch (err) {
            alert('Ошибка обновления статуса');
        }
    };

    const handleReplyTicket = async (id) => {
        try {
            await axios.post(`${API_URL}/api/guide/ticket/${id}/reply`, { reply: replyMessage }, { headers });
            alert('✅ Ответ отправлен');
            setReplyTicketId(null);
            setReplyMessage('');
            loadAll();
        } catch (err) {
            alert('Ошибка отправки ответа');
        }
    };

    const handleBecomeCurator = async () => {
        if (!curatorForm.name || !curatorForm.specialization) {
            alert('Заполните обязательные поля'); return;
        }
        try {
            await axios.post(`${API_URL}/api/guide/mentor`, curatorForm, { headers });
            alert('✅ Вы успешно добавлены в список кураторов!');
            setShowCuratorForm(false);
            setCuratorForm({ name: user?.first_name || '', specialization: '', bio: '', experience_years: '', contact_info: '' });
            loadAll();
        } catch (err) {
            alert('Ошибка добавления');
        }
    };

    const tabs = [
        { id: 'users', title: '👥 Пользователи', count: users.filter(u => u.role === 'admin_pending').length },
        { id: 'grants', title: '📨 Заявки на гранты', count: grantApps.filter(a => a.status === 'pending').length },
        { id: 'mentorship', title: '🤝 Кураторство', count: mentorReqs.filter(r => r.status === 'pending').length },
        { id: 'tickets', title: '📞 Тикеты Поддержки', count: tickets.filter(t => t.status === 'pending').length },
        { id: 'products', title: '🛒 Модерация Маркета', count: products.filter(p => p.status === 'pending').length },
        { id: 'stories', title: '🏆 Истории Успеха', count: stories.filter(s => s.status === 'pending').length }
    ];

    const isAlreadyCurator = mentors.some(m => m.name.includes(user?.first_name) || (m.contact_info && user?.email && m.contact_info.includes(user?.email)));

    const statusBadge = (status) => {
        const colors = { pending: '#ffa502', approved: '#2ed573', rejected: '#ff4757', answered: '#2ed573' };
        const labels = { pending: 'Ожидает', approved: 'Одобрена', rejected: 'Отклонена', answered: 'Отвечен' };
        return (
            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 600,
                background: `${colors[status] || '#ccc'}22`, color: colors[status] || '#ccc', border: `1px solid ${colors[status] || '#ccc'}44` }}>
                {labels[status] || status}
            </span>
        );
    };

    const inputStyle = {
        width: '100%', padding: '0.8rem', borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
        color: '#fff', marginBottom: '0.5rem', fontSize: '0.95rem'
    };

    return (
        <div className="dashboard-container admin-dashboard">
            <header className="dashboard-header admin-header">
                <h1>Панель Администратора</h1>
                <div className="user-info">
                    <span>Админ: {user?.first_name || user?.email} 💼</span>
                    <button onClick={() => { if(window.confirm('Вы уверены, что хотите выйти?')) logout() }} className="btn-secondary">Выйти</button>
                </div>
            </header>

            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                {/* Навигация по вкладкам */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}
                            style={{ padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', border: 'none' }}>
                            {tab.title} {tab.count > 0 && <span style={{ background: 'rgba(255,0,51,0.5)', padding: '0.1rem 0.4rem', borderRadius: '10px', marginLeft: '0.3rem', fontSize: '0.75rem', color: 'white' }}>{tab.count}</span>}
                        </button>
                    ))}
                </div>
                
                {!isAlreadyCurator && (
                    <button className="btn-primary" style={{ background: '#2ed573', border: 'none', padding: '0.6rem 1.2rem' }} onClick={() => setShowCuratorForm(!showCuratorForm)}>
                        {showCuratorForm ? 'Скрыть анкету' : 'Стать куратором'}
                    </button>
                )}
            </div>

            {/* Анкета стать куратором */}
            {!isAlreadyCurator && showCuratorForm && (
                <div className="dashboard-card" style={{ marginBottom: '2rem', border: '1px solid #2ed573' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowCuratorForm(!showCuratorForm)}>
                        <h3 style={{ color: '#2ed573', margin: 0 }}>Анкета Куратора (Админа)</h3>
                        <span style={{ fontSize: '1.2rem', color: '#ccc' }}>▲</span>
                    </div>
                    <p style={{ color: '#ccc', marginBottom: '1rem', marginTop: '0.5rem' }}>Заполните информацию о себе, чтобы отображаться в Путеводителе для стартапов.</p>
                    
                    <input style={inputStyle} placeholder="Ваше Имя / ФИО *" value={curatorForm.name} onChange={e => setCuratorForm({...curatorForm, name: e.target.value})} />
                    
                    <select style={inputStyle} value={curatorForm.specialization} onChange={e => setCuratorForm({...curatorForm, specialization: e.target.value})}>
                        <option value="IT и Разработка">IT и Разработка</option>
                        <option value="Инвестиции">Инвестиции и Финансы</option>
                        <option value="Маркетинг и PR">Маркетинг и PR</option>
                        <option value="Управление продуктом">Управление продуктом</option>
                        <option value="Продажи">Продажи</option>
                        <option value="Юриспруденция">Юриспруденция</option>
                        <option value="Другое">Другое</option>
                    </select>

                    <input style={inputStyle} placeholder="Опыт (лет, только цифры)" type="text" inputMode="numeric" pattern="[0-9]*" value={curatorForm.experience_years} 
                        onChange={e => {
                            const val = e.target.value.replace(/\D/g, ''); // Только цифры
                            setCuratorForm({...curatorForm, experience_years: val})
                        }} 
                    />
                    
                    <textarea style={{...inputStyle, minHeight: '80px'}} placeholder="Краткое описание биографии / Опыт работы" value={curatorForm.bio} onChange={e => setCuratorForm({...curatorForm, bio: e.target.value})} />
                    <input style={inputStyle} placeholder="Как с вами связаться (Telegram @username / Email)" value={curatorForm.contact_info} onChange={e => setCuratorForm({...curatorForm, contact_info: e.target.value})} />
                    
                    <button className="btn-primary" style={{ width: '100%', background: '#2ed573', border: 'none', padding: '0.8rem' }} onClick={handleBecomeCurator}>
                        Опубликовать анкету куратора
                    </button>
                </div>
            )}

            {/* Свернутая плашка анкеты */}
            {!isAlreadyCurator && !showCuratorForm && (curatorForm.name || curatorForm.bio || curatorForm.contact_info || curatorForm.experience_years) && (
                <div onClick={() => setShowCuratorForm(true)} className="dashboard-card" style={{ marginBottom: '2rem', border: '1px solid rgba(46, 213, 115, 0.3)', padding: '0.8rem 1.2rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(46, 213, 115, 0.05)' }}>
                    <div>
                        <span style={{ color: '#2ed573', fontWeight: 'bold' }}>✍️ У вас есть незаполненная анкета куратора</span>
                        <span style={{ color: '#aaa', fontSize: '0.85rem', marginLeft: '1rem' }}>Нажмите, чтобы развернуть и дозаполнить</span>
                    </div>
                    <span style={{ fontSize: '1.2rem', color: '#ccc' }}>▼</span>
                </div>
            )}

            {loading ? <p>Загрузка...</p> : (
                <div className="dashboard-content">

                    {/* ====== ПОЛЬЗОВАТЕЛИ ====== */}
                    {activeTab === 'users' && (
                        <>
                            <h2 style={{ marginBottom: '1rem' }}>Управление пользователями</h2>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Имя</th>
                                        <th>Email</th>
                                        <th>Роль</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td>{u.id}</td>
                                            <td>{u.first_name || '—'}</td>
                                            <td>{u.email || '—'}</td>
                                            <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                                            <td>
                                                {u.role === 'admin_pending' && (
                                                    <button onClick={() => handleApprove(u.id)} className="btn-success btn-sm">✅ Одобрить</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                    {/* ====== ЗАЯВКИ НА ГРАНТЫ ====== */}
                    {activeTab === 'grants' && (
                        <>
                            <h2 style={{ marginBottom: '1rem' }}>Заявки на гранты</h2>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Заявитель</th>
                                        <th>Грант / Проект</th>
                                        <th>Статус</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {grantApps.map(app => (
                                        <tr key={app.id}>
                                            <td>{app.first_name || app.email}</td>
                                            <td>
                                                <span style={{color: '#999', fontSize: '0.8rem'}}>{app.grant_title}</span>
                                                <br/><strong>{app.project_name}</strong>
                                                <br/><span style={{fontSize: '0.85rem', color: '#ccc'}}>{app.project_description}</span>
                                            </td>
                                            <td>{statusBadge(app.status)}</td>
                                            <td>
                                                {app.status === 'pending' && (
                                                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                                                        <button className="btn-success btn-sm" onClick={() => handleGenericStatus('grant', app.id, 'approved')}>✅</button>
                                                        <button className="btn-danger btn-sm" onClick={() => handleGenericStatus('grant', app.id, 'rejected')}>❌</button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                    {/* ====== КУРАТОРСТВО ====== */}
                    {activeTab === 'mentorship' && (
                        <>
                            <h2 style={{ marginBottom: '1rem' }}>Кураторство</h2>
                            
                            <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#2ed573' }}>Действующие кураторы</h3>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Имя</th>
                                        <th>Специализация</th>
                                        <th>Контакты</th>
                                        <th>Опыт</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mentors.length === 0 ? <tr><td colSpan="4" style={{textAlign: 'center', color: '#ccc'}}>Нет кураторов</td></tr> : mentors.map(m => (
                                        <tr key={m.id}>
                                            <td>{m.name}</td>
                                            <td><span className="role-badge mentor">{m.specialization}</span></td>
                                            <td>{m.contact_info}</td>
                                            <td>{m.experience_years} лет</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <h3 style={{ marginTop: '2.5rem', marginBottom: '1rem', color: '#00b4ff' }}>Заявки на кураторство</h3>
                            <p style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '1rem' }}>Если вы являетесь Куратором, здесь вы также увидите подробную информацию о проектах и товарах подавших заявку стартапов.</p>
                            
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Заявитель</th>
                                        <th>Куратор</th>
                                        <th>Анкета / Оценка</th>
                                        <th>Статус</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mentorReqs.map(req => (
                                        <tr key={req.id}>
                                            <td>{req.first_name || req.email}</td>
                                            <td>{req.mentor_name || 'Вам'}</td>
                                            <td style={{ color: '#ccc', fontSize: '0.9rem', maxWidth: '400px' }}>
                                                <div style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '0.5rem' }}>
                                                    <strong style={{color: '#ff0033'}}>Сообщение:</strong><br/>
                                                    <span style={{ whiteSpace: 'pre-wrap' }}>{req.message}</span>
                                                </div>

                                                {/* Рендеринг проектов, если это детальная заявка для этого куратора */}
                                                {req.projects && req.projects.length > 0 && (
                                                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', borderLeft: '3px solid #00b4ff', background: 'rgba(0, 180, 255, 0.05)' }}>
                                                        <strong style={{color: '#00b4ff', fontSize: '0.85rem'}}>Бизнес-проекты:</strong>
                                                        {req.projects.map(proj => (
                                                            <div key={proj.id} style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
                                                                <span style={{ color: '#fff' }}>[{proj.stage}]</span> {proj.name} — <span style={{color: '#aaa'}}>{proj.description.substring(0, 50)}...</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Рендеринг продуктов Маркета */}
                                                {req.products && req.products.length > 0 && (
                                                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', borderLeft: '3px solid #2ed573', background: 'rgba(46, 213, 115, 0.05)' }}>
                                                        <strong style={{color: '#2ed573', fontSize: '0.85rem'}}>Товары Маркета:</strong>
                                                        {req.products.map(prod => (
                                                            <div key={prod.id} style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
                                                                <span style={{ color: '#fff' }}>{prod.name} ({prod.price}₽)</span> — <span style={{color: statusBadge(prod.status).props.style.color}}>{prod.status}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td>{statusBadge(req.status)}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.3rem', flexDirection: 'column' }}>
                                                    {req.status === 'pending' && (
                                                        <>
                                                            <button className="btn-success btn-sm" onClick={() => handleGenericStatus('mentor', req.id, 'approved')}>✅ Одобрить</button>
                                                            <button className="btn-danger btn-sm" onClick={() => handleGenericStatus('mentor', req.id, 'rejected')}>❌ Отклонить</button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                    {/* ====== ТИКЕТЫ (ПОДДЕРЖКА) ====== */}
                    {activeTab === 'tickets' && (
                        <>
                            <h2 style={{ marginBottom: '1rem' }}>Обращения стартаперов</h2>
                            <div className="dashboard-grid">
                                {tickets.map(t => (
                                    <div key={t.id} className="dashboard-card" style={{ border: t.status === 'pending' ? '1px solid #ff0033' : '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <strong style={{ color: '#fff' }}>От: {t.name} ({t.email})</strong>
                                            {statusBadge(t.status)}
                                        </div>
                                        <p style={{ color: '#ccc', fontSize: '0.95rem', background: 'rgba(0,0,0,0.2)', padding: '0.8rem', borderRadius: '8px' }}>
                                            {t.message}
                                        </p>
                                        
                                        {t.status === 'pending' ? (
                                            replyTicketId === t.id ? (
                                                <div style={{ marginTop: '1rem' }}>
                                                    <textarea style={{...inputStyle, minHeight: '80px', borderColor: '#2ed573'}} placeholder="Написать ответ..." value={replyMessage} onChange={e => setReplyMessage(e.target.value)} />
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button className="btn-primary" style={{ background: '#2ed573', border: 'none', padding: '0.4rem 1rem' }} onClick={() => handleReplyTicket(t.id)}>Отправить</button>
                                                        <button className="btn-secondary" style={{ padding: '0.4rem 1rem' }} onClick={() => {setReplyTicketId(null); setReplyMessage('');}}>Отмена</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button className="btn-secondary" style={{ marginTop: '1rem', padding: '0.4rem 1rem', borderColor: '#2ed573', color: '#2ed573' }} onClick={() => setReplyTicketId(t.id)}>
                                                    Ответить
                                                </button>
                                            )
                                        ) : (
                                            <div style={{ marginTop: '1rem', borderLeft: '3px solid #2ed573', paddingLeft: '0.8rem' }}>
                                                <p style={{ color: '#999', fontSize: '0.85rem' }}>Ваш ответ:</p>
                                                <p style={{ color: '#2ed573', fontSize: '0.95rem', margin: 0 }}>{t.reply}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* ====== МОДЕРАЦИЯ МАРКЕТА ====== */}
                    {activeTab === 'products' && (
                        <>
                            <h2 style={{ marginBottom: '1rem' }}>Модерация предложенных продуктов (Маркет)</h2>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Стартапер</th>
                                        <th>Название</th>
                                        <th>Описание / Док-во</th>
                                        <th>Статус</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p.id}>
                                            <td>{p.entrepreneur_email}</td>
                                            <td><strong>{p.name}</strong><br/><span style={{fontSize: '0.85rem', color: '#ff0033'}}>{p.price} ₽</span></td>
                                            <td>
                                                <p style={{ fontSize: '0.9rem', color: '#ccc', margin: '0 0 0.5rem 0' }}>{p.description}</p>
                                                {p.proof_link && <a href={p.proof_link} target="_blank" rel="noopener noreferrer" style={{ color: '#00b4ff', fontSize: '0.85rem' }}>🔗 Доказательства разработки</a>}
                                            </td>
                                            <td>{statusBadge(p.status)}</td>
                                            <td>
                                                {p.status === 'pending' && (
                                                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                                                        <button className="btn-success btn-sm" onClick={() => handleGenericStatus('product', p.id, 'approved')}>✅ Одобрить</button>
                                                        <button className="btn-danger btn-sm" onClick={() => handleGenericStatus('product', p.id, 'rejected')}>❌</button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                    {/* ====== МОДЕРАЦИЯ ИСТОРИЙ УСПЕХА ====== */}
                    {activeTab === 'stories' && (
                        <>
                            <h2 style={{ marginBottom: '1rem' }}>Модерация историй успеха</h2>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Автор</th>
                                        <th>Заголовок</th>
                                        <th>Текст истории</th>
                                        <th>Статус</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stories.map(s => (
                                        <tr key={s.id}>
                                            <td>{s.first_name || s.email}</td>
                                            <td><strong>{s.title}</strong></td>
                                            <td>
                                                <p style={{ fontSize: '0.85rem', color: '#ccc', margin: 0, maxHeight: '80px', overflowY: 'auto' }}>
                                                    {s.content}
                                                </p>
                                            </td>
                                            <td>{statusBadge(s.status)}</td>
                                            <td>
                                                {s.status === 'pending' && user?.email === 'admin@example.com' && (
                                                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                                                        <button className="btn-success btn-sm" onClick={() => handleGenericStatus('story', s.id, 'approved')}>✅</button>
                                                        <button className="btn-danger btn-sm" onClick={() => handleGenericStatus('story', s.id, 'rejected')}>❌</button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
