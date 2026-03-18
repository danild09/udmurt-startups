import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Dashboard = () => {
    const { user, checkUser } = useAuth();
    
    // Данные
    const [projects, setProjects] = useState([]);
    const [myCuratorRequests, setMyCuratorRequests] = useState([]);
    const [curators, setCurators] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [tickets, setTickets] = useState([]);

    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    // Состояния модалок
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showCuratorModal, setShowCuratorModal] = useState(null);
    const [showAIModal, setShowAIModal] = useState(false);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    // Формы
    const [profileForm, setProfileForm] = useState({ first_name: '', last_name: '', date_of_birth: '' });
    const [projectForm, setProjectForm] = useState({ name: '', description: '', stage: 'Идея', target_audience: '', monetization_model: '', proof_link: '' });
    const [curatorFormState, setCuratorFormState] = useState({ current_state: '', goals: '', help_needed: '', project_id: '' });
    const [aiPlan, setAiPlan] = useState('');
    const [ticketForm, setTicketForm] = useState({ name: user?.first_name || '', email: user?.email || '', phone: '', message: '' });

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        if (user) loadUserData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const loadUserData = async () => {
        try {
            const [projRes, appsRes, reqsRes, curRes, recRes, tickRes, chatsRes] = await Promise.all([
                axios.get(`${API_URL}/api/guide/projects`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/api/guide/my-applications`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/api/guide/mentorship-requests`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/api/guide/mentors`).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/api/guide/recommendations/${user.id}`).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/api/guide/tickets`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/api/chat/my-chats`, { headers }).catch(() => ({ data: [] }))
            ]);
            setProjects(projRes.data);
            setMyCuratorRequests(reqsRes.data);
            setCurators(curRes.data);
            setRecommendations(recRes.data);
            setTickets(tickRes.data);
            setChats(chatsRes.data);
            
            // Если пришли с маркета
            if (localStorage.getItem('dashboardTab') === 'chats') {
                localStorage.removeItem('dashboardTab');
                // Прокрутить до чатов или выбрать первый чат
                if (chatsRes.data.length > 0) {
                    loadChatMessages(chatsRes.data[0].id);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const loadChatMessages = async (chatId) => {
        try {
            setActiveChat(chats.find(c => c.id === chatId) || null);
            const res = await axios.get(`${API_URL}/api/chat/${chatId}/messages`, { headers });
            setMessages(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !activeChat) return;
        try {
            await axios.post(`${API_URL}/api/chat/${activeChat.id}/message`, { text: newMessage }, { headers });
            setNewMessage('');
            loadChatMessages(activeChat.id); // Перезагружаем сообщения
        } catch (err) {
            alert('Ошибка отправки сообщения');
        }
    };

    const handleAddProject = async () => {
        if (!projectForm.name || !projectForm.description) {
            alert('Название и описание обязательны');
            return;
        }
        try {
            await axios.post(`${API_URL}/api/guide/project`, projectForm, { headers });
            alert('✅ Проект успешно добавлен!');
            setShowProjectModal(false);
            setProjectForm({ name: '', description: '', stage: 'Идея', target_audience: '', monetization_model: '', proof_link: '' });
            loadUserData();
        } catch (err) {
            alert('❌ Ошибка: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleRequestCurator = async () => {
        const { current_state, goals, help_needed, project_id } = curatorFormState;
        if (current_state.trim().length < 10 || goals.trim().length < 10 || help_needed.trim().length < 10) {
            alert('Пожалуйста, подробно заполните все три поля (минимум 10 символов в каждом)');
            return;
        }
        
        const projName = projects.find(p => String(p.id) === String(project_id))?.name || 'Не указан явно, смотрите профиль';
        const combinedMessage = `📍 Текущее состояние:\n${current_state}\n\n🎯 Цели:\n${goals}\n\n🆘 Требуется помощь:\n${help_needed}\n🔗 Проект для работы: ${projName}`;
        
        try {
            await axios.post(`${API_URL}/api/guide/mentorship-request`, {
                mentor_id: showCuratorModal,
                message: combinedMessage
            }, { headers });
            alert('✅ Заявка куратору отправлена!');
            setShowCuratorModal(null);
            setCuratorFormState({ current_state: '', goals: '', help_needed: '', project_id: '' });
            loadUserData();
        } catch (err) {
            alert('❌ Ошибка: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleGenerateAI = async () => {
        if (aiPlan.trim().length < 20) {
            alert('Опишите бизнес хотя бы в нескольких предложениях');
            return;
        }
        try {
            await axios.post(`${API_URL}/api/guide/ai/generate`, { project_description: aiPlan }, { headers });
            alert('✅ ИИ проанализировал ваш план и составил рекомендации!');
            setShowAIModal(false);
            setAiPlan('');
            loadUserData();
        } catch (err) {
            alert('❌ Ошибка генерации: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleSendTicket = async () => {
        if (!ticketForm.message) return;
        try {
            await axios.post(`${API_URL}/api/guide/ticket`, ticketForm, { headers });
            alert('✅ Обращение отправлено. Ожидайте ответа администратора.');
            setShowTicketModal(false);
            setTicketForm({ name: user?.first_name || '', email: user?.email || '', phone: '', message: '' });
            loadUserData();
        } catch (err) {
            alert('❌ Ошибка отправки: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleConnectTelegram = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/auth/telegram-link`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.link) {
                alert('⏳ Сейчас откроется Telegram.\n\nВажно: Обязательно нажмите кнопку "Запустить" (Start) в самом низу вашего экрана в боте, чтобы привязка завершилась!');
                window.open(res.data.link, '_blank');
            }
        } catch (error) {
            console.error('Ошибка получения ссылки Telegram:', error);
            alert('Не удалось получить ссылку для привязки Telegram.');
        }
    };

    const handleOpenProfile = () => {
        setProfileForm({
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            date_of_birth: user?.date_of_birth ? user?.date_of_birth.substring(0, 10) : ''
        });
        setShowProfileModal(true);
    };

    const handleUpdateProfile = async () => {
        if (!profileForm.first_name || !profileForm.date_of_birth) {
            alert('Имя и Дата рождения обязательны');
            return;
        }
        try {
            await axios.put(`${API_URL}/api/auth/profile`, profileForm, { headers });
            alert('✅ Профиль успешно обновлен!');
            setShowProfileModal(false);
            checkUser();
        } catch (err) {
            alert('❌ Ошибка обновления: ' + (err.response?.data?.error || err.message));
        }
    };

    const statusColor = (status) => {
        const colors = { pending: '#ffa502', approved: '#2ed573', rejected: '#ff4757', answered: '#2ed573' };
        return colors[status] || '#ccc';
    };

    const statusLabel = (status) => {
        const labels = { pending: 'Ожидает', approved: 'Одобрена', rejected: 'Отклонена', answered: 'Получен ответ' };
        return labels[status] || status;
    };

    const inputStyle = {
        width: '100%', padding: '0.8rem', borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
        color: '#fff', marginBottom: '0.8rem', fontSize: '0.95rem'
    };

    // Фрагменты рендера
    const renderChatSection = () => (
        <div className="dashboard-card" style={{ gridColumn: '1 / -1', background: 'rgba(30, 30, 40, 0.95)', marginTop: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                💬 Мои Чаты (Маркет)
            </h3>
            
            {chats.length === 0 ? (
                <p style={{ color: '#ccc', fontSize: '0.9rem', fontStyle: 'italic' }}>У вас пока нет активных диалогов с продавцами.</p>
            ) : (
                <div style={{ display: 'flex', gap: '1rem', height: '400px' }}>
                    {/* Список чатов */}
                    <div style={{ flex: '1', borderRight: '1px solid rgba(255,255,255,0.1)', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {chats.map(chat => {
                            const isBuyer = chat.buyer_id === user.id;
                            const roleLabel = isBuyer ? 'ВЫ - ПОКУПАТЕЛЬ' : 'ВЫ - ПРОДАВЕЦ';
                            const otherUserEmail = isBuyer ? chat.seller_email : chat.buyer_email;
                            const isActive = activeChat?.id === chat.id;

                            return (
                                <div 
                                    key={chat.id} 
                                    onClick={() => loadChatMessages(chat.id)}
                                    style={{ 
                                        padding: '1rem', 
                                        background: isActive ? 'rgba(0, 180, 255, 0.15)' : 'rgba(255,255,255,0.03)', 
                                        borderLeft: isActive ? '3px solid #00b4ff' : '3px solid transparent',
                                        borderRadius: '8px', 
                                        marginBottom: '0.5rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <strong style={{ display: 'block', color: '#fff', fontSize: '1.05rem' }}>{chat.product_name}</strong>
                                    <span style={{ fontSize: '0.75rem', background: isBuyer ? 'rgba(46, 213, 115, 0.2)' : 'rgba(167, 139, 250, 0.2)', color: isBuyer ? '#2ed573' : '#a78bfa', padding: '0.2rem 0.4rem', borderRadius: '4px', display: 'inline-block', margin: '0.3rem 0' }}>{roleLabel}</span>
                                    <p style={{ color: '#ccc', fontSize: '0.85rem', margin: 0 }}>Собеседник: {otherUserEmail}</p>
                                </div>
                            )
                        })}
                    </div>

                    {/* Окно сообщений */}
                    <div style={{ flex: '2', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '1rem' }}>
                        {activeChat ? (
                            <>
                                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                                    <h4 style={{ color: '#fff', margin: 0 }}>Чат по товару: {activeChat.product_name}</h4>
                                </div>
                                
                                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem', marginBottom: '1rem' }}>
                                    {messages.length === 0 ? (
                                        <p style={{ color: '#666', textAlign: 'center', marginTop: '2rem' }}>Нет сообщений. Напишите первым!</p>
                                    ) : (
                                        messages.map(msg => {
                                            const isMe = msg.sender_id === user.id;
                                            return (
                                                <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', background: isMe ? '#00b4ff' : '#2e2e38', color: '#fff', padding: '0.6rem 1rem', borderRadius: '15px', borderBottomRightRadius: isMe ? '0' : '15px', borderBottomLeftRadius: isMe ? '15px' : '0', maxWidth: '80%' }}>
                                                    {msg.text}
                                                </div>
                                            )
                                        })
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input 
                                        style={{ flex: 1, padding: '0.8rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff' }} 
                                        placeholder="Введите сообщение..." 
                                        value={newMessage} 
                                        onChange={e => setNewMessage(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                    />
                                    <button className="btn-primary" style={{ borderRadius: '20px', padding: '0 1.5rem' }} onClick={handleSendMessage}>Отправить</button>
                                </div>
                            </>
                        ) : (
                            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                                Выберите чат из списка
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    const renderModal = (title, children, onClose, onSubmit, submitText) => (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
            <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                <h2 style={{ marginBottom: '1.5rem', color: '#ff0033' }}>{title}</h2>
                {children}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button className="btn-primary" style={{ flex: 1, padding: '1rem', fontSize: '1rem' }} onClick={onSubmit}>{submitText}</button>
                    <button className="btn-secondary" style={{ flex: 1, padding: '1rem', fontSize: '1rem' }} onClick={onClose}>Отмена</button>
                </div>
            </div>
        </div>
    );

    const renderStartupDashboard = () => (
        <>
            <div className="dashboard-grid">
                
                {/* 1. Мои проекты (Стартапы) */}
                <div className="dashboard-card">
                    <h3>🚀 Мои проекты</h3>
                    <p style={{ color: '#ccc', marginBottom: '1rem' }}>Полная анкета вашего стартапа для рынка и инвесторов.</p>
                    
                    {projects.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1rem' }}>
                            {projects.map(p => (
                                <div key={p.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                                    <strong style={{ display: 'block', fontSize: '1.1rem', color: '#fff', marginBottom: '0.3rem' }}>{p.name}</strong>
                                    <span style={{ fontSize: '0.85rem', color: '#a78bfa', background: 'rgba(167, 139, 250, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>Стадия: {p.stage}</span>
                                    <p style={{ marginTop: '0.5rem', color: '#ccc', fontSize: '0.9rem' }}>{p.description}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ fontStyle: 'italic', fontSize: '0.9rem', marginBottom: '1rem' }}>Проектов пока нет.</p>
                    )}
                    
                    <button className="btn-primary" style={{ width: '100%', padding: '0.8rem', fontSize: '1rem' }} onClick={() => setShowProjectModal(true)}>
                        + Добавить проект
                    </button>
                </div>

                {/* 2. План бизнеса и ИИ-рекомендации */}
                <div className="dashboard-card" style={{ background: 'linear-gradient(145deg, rgba(30,30,40,0.9), rgba(20,20,30,0.9))', border: '1px solid rgba(0, 180, 255, 0.3)' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        ИИ-аналитик бизнеса
                    </h3>
                    
                    {recommendations.length > 0 ? (
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h4 style={{ color: '#a78bfa', marginBottom: '0.8rem' }}>Персональные рекомендации:</h4>
                            <ul style={{ paddingLeft: '1.2rem', color: '#ccc' }}>
                                {recommendations.map(r => (
                                    <li key={r.id} style={{ marginBottom: '0.5rem' }}>
                                        <strong>{r.title}</strong> — {r.description}
                                        {r.link && <a href={r.link} target="_blank" rel="noopener noreferrer" style={{ color: '#00b4ff', marginLeft: '0.5rem' }}>Смотреть урок</a>}
                                    </li>
                                ))}
                            </ul>
                            <button className="btn-secondary" style={{ marginTop: '1rem', fontSize: '0.85rem', padding: '0.5rem' }} onClick={() => setShowAIModal(true)}>
                                Обновить план
                            </button>
                        </div>
                    ) : (
                        <>
                            <p style={{ color: '#ccc', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                                Заполните бланк описания стартапа. Нейросеть выявит потребности и составит персональный план обучения.
                            </p>
                            <button className="btn-primary" onClick={() => setShowAIModal(true)} style={{ background: 'linear-gradient(45deg, #00b4ff, #0072ff)', border: 'none', width: '100%', padding: '0.8rem', fontSize: '1rem' }}>
                                Сгенерировать план ИИ
                            </button>
                        </>
                    )}
                </div>

                {/* 3. Кураторы */}
                <div className="dashboard-card">
                    <h3>🤝 Кураторы</h3>
                    <p style={{ color: '#ccc', marginBottom: '1rem' }}>Выберите куратора для сопровождения вашего проекта.</p>
                    
                    {myCuratorRequests.length > 0 && (
                        <div style={{ marginBottom: '1.5rem', background: 'rgba(255,0,51,0.05)', padding: '1rem', borderRadius: '8px' }}>
                            <p style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 'bold' }}>Мои заявки:</p>
                            {myCuratorRequests.map(r => (
                                <div key={r.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#ccc' }}>{r.mentor_name}</span>
                                    <span style={{ color: statusColor(r.status), fontSize: '0.85rem', fontWeight: 600 }}>{statusLabel(r.status)}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {curators.length > 0 ? (
                            curators.map(c => (
                                <div key={c.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <strong style={{ color: '#fff', fontSize: '1.1rem' }}>{c.name}</strong>
                                    <p style={{ color: '#999', fontSize: '0.9rem', margin: '0.3rem 0' }}>Специализация: {c.specialization}</p>
                                    {c.experience_years && <p style={{ color: '#a78bfa', fontSize: '0.85rem' }}>Опыт: {c.experience_years} лет</p>}
                                    <button className="btn-secondary" style={{ marginTop: '0.8rem', width: '100%', padding: '0.6rem' }} onClick={() => setShowCuratorModal(c.id)}>
                                        Подать заявку куратору
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>База кураторов загружается</p>
                        )}
                    </div>
                </div>

                {/* 4. Обращения в поддержку */}
                <div className="dashboard-card">
                    <h3>📞 Связь с платформой</h3>
                    <p style={{ color: '#ccc', marginBottom: '1rem' }}>Служба поддержки и администрация платформы.</p>
                    
                    <button className="btn-secondary" style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', marginBottom: '1.5rem' }} onClick={() => setShowTicketModal(true)}>
                        Создать обращение
                    </button>

                    {tickets.length > 0 && (
                        <div>
                            <p style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 'bold' }}>Ваши тикеты:</p>
                            {tickets.map(t => (
                                <div key={t.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
                                    <p style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '0.3rem' }}>{t.message.substring(0, 50)}...</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#999' }}>{new Date(t.created_at).toLocaleDateString()}</span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: statusColor(t.status) }}>{statusLabel(t.status)}</span>
                                    </div>
                                    {t.reply && (
                                        <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(46, 213, 115, 0.1)', borderRadius: '4px', borderLeft: '3px solid #2ed573' }}>
                                            <p style={{ fontSize: '0.85rem', color: '#ccc', margin: 0 }}><strong>Ответ:</strong> {t.reply}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 5. Мои Чаты (Маркет) */}
                {renderChatSection()}

            </div>

            {/* МОДАЛКИ */}
            {showProjectModal && renderModal('Добавить проект', (
                <>
                    <input style={inputStyle} placeholder="Название проекта *" value={projectForm.name} onChange={e => setProjectForm({...projectForm, name: e.target.value})} />
                    <textarea style={{...inputStyle, minHeight: '80px'}} placeholder="Краткое описание бизнес-идеи *" value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} />
                    <select style={inputStyle} value={projectForm.stage} onChange={e => setProjectForm({...projectForm, stage: e.target.value})}>
                        <option>Идея / CustDev</option>
                        <option>MVP (Прототип)</option>
                        <option>Первые продажи</option>
                        <option>Масштабирование</option>
                    </select>
                    <input style={inputStyle} placeholder="Целевая аудитория (B2B, B2C, портрет)" value={projectForm.target_audience} onChange={e => setProjectForm({...projectForm, target_audience: e.target.value})} />
                    <input style={inputStyle} placeholder="Модель монетизации (подписка, разовая покупка и т.д.)" value={projectForm.monetization_model} onChange={e => setProjectForm({...projectForm, monetization_model: e.target.value})} />
                    <input style={inputStyle} type="url" placeholder="Ссылка на доказательства/презентацию (Pitchdeck)" value={projectForm.proof_link} onChange={e => setProjectForm({...projectForm, proof_link: e.target.value})} />
                </>
            ), () => setShowProjectModal(false), handleAddProject, 'Опубликовать проект')}

            {showCuratorModal && renderModal('Заявка куратору', (
                <>
                    <p style={{color: '#ccc', marginBottom: '1rem'}}>
                        Убедитесь, что вы уже заполнили профиль вашего проекта.<br/>
                        Опишите ваш запрос подробно, чтобы куратор понимал, с чем предстоит работать.
                    </p>
                    <textarea style={{...inputStyle, minHeight: '80px'}} 
                        placeholder="1. Текущее состояние проекта (что уже есть, на какой стадии) *" 
                        value={curatorFormState.current_state} onChange={e => setCuratorFormState({...curatorFormState, current_state: e.target.value})} />
                    <textarea style={{...inputStyle, minHeight: '80px'}} 
                        placeholder="2. Главная цель (к чему хотите прийти через 3-6 месяцев) *" 
                        value={curatorFormState.goals} onChange={e => setCuratorFormState({...curatorFormState, goals: e.target.value})} />
                    <textarea style={{...inputStyle, minHeight: '80px'}} 
                        placeholder="3. Чем конкретно должен помочь куратор? (маркетинг, инвестиции, связи и т.д.) *" 
                        value={curatorFormState.help_needed} onChange={e => setCuratorFormState({...curatorFormState, help_needed: e.target.value})} />
                    
                    {projects.length > 0 && (
                        <select style={inputStyle} value={curatorFormState.project_id || ''} onChange={e => setCuratorFormState({...curatorFormState, project_id: e.target.value})}>
                            <option value="">-- Привязать к проекту (опционально) --</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    )}
                </>
            ), () => setShowCuratorModal(null), handleRequestCurator, 'Отправить заявку')}

            {showAIModal && renderModal('ИИ Бизнес-аналитик', (
                <>
                    <p style={{color: '#ccc', marginBottom: '1rem'}}>
                        Опишите ваш бизнес или идею максимально подробно. Что вы продаете? Кому? Какие основные трудности вы испытываете? (маркетинг, финансы, команда).
                    </p>
                    <textarea style={{...inputStyle, minHeight: '150px'}} 
                        placeholder="Мой бизнес занимается... Мы хотим привлечь... Наша проблема в... *" 
                        value={aiPlan} onChange={e => setAiPlan(e.target.value)} />
                </>
            ), () => setShowAIModal(false), handleGenerateAI, 'Получить рекомендации')}

            {showTicketModal && renderModal('Связь с администрацией', (
                <>
                    <input style={inputStyle} placeholder="Как к вам обращаться" value={ticketForm.name} onChange={e => setTicketForm({...ticketForm, name: e.target.value})} />
                    <input style={inputStyle} placeholder="Email для связи *" type="email" value={ticketForm.email} onChange={e => setTicketForm({...ticketForm, email: e.target.value})} disabled={!!user?.email} />
                    <textarea style={{...inputStyle, minHeight: '120px'}} placeholder="Ваш вопрос или предложение *" value={ticketForm.message} onChange={e => setTicketForm({...ticketForm, message: e.target.value})} />
                </>
            ), () => setShowTicketModal(false), handleSendTicket, 'Отправить обращение')}
        </>
    );

    const renderMentorDashboard = () => (
        <div className="dashboard-grid">
            <div className="dashboard-card">
                <h3>📩 Мои подопечные (кураторство)</h3>
                {myCuratorRequests.length > 0 ? (
                    myCuratorRequests.map(r => (
                        <div key={r.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ color: '#fff' }}>{r.first_name || r.email}</span>
                            <span style={{ color: statusColor(r.status), marginLeft: '0.5rem', fontSize: '0.85rem' }}>{statusLabel(r.status)}</span>
                            {r.message && <p style={{ color: '#999', fontSize: '0.85rem', marginTop: '0.3rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)' }}>{r.message}</p>}
                        </div>
                    ))
                ) : <p style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>Новых запросов пока нет</p>}
            </div>
        </div>
    );

    const renderAdminPendingDashboard = () => (
        <div>
            <div className="admin-pending-banner">
                <h2>⏳ Ожидание подтверждения</h2>
                <p>Ваша заявка на роль администратора отправлена. Суперадмин должен одобрить ваши права доступа.</p>
            </div>
        </div>
    );

    const renderAdminUserDashboard = () => (
        <div className="dashboard-grid">
            <div className="dashboard-card" style={{ gridColumn: '1 / -1', marginBottom: '2rem' }}>
                <h3 style={{ color: '#ff4757' }}>👑 Панель управления профилем Администратора</h3>
                <p style={{ color: '#ccc', marginTop: '1rem' }}>
                    Здесь вы можете редактировать свой личный профиль через верхнее меню, привязывать Telegram-бота для получения системных уведомлений, а также вести диалоги с продавцами Маркета в роли покупателя. Основной функционал модерации платформы (тикеты, заявки, управление) находится в отдельном разделе — <a href="/admin" style={{color: '#00b4ff', textDecoration: 'underline'}}>Панели Администратора</a>.
                </p>
            </div>
            {renderChatSection()}
        </div>
    );

    const renderDashboardContent = () => {
        switch (user?.role) {
            case 'admin': return renderAdminUserDashboard();
            case 'admin_pending': return renderAdminPendingDashboard();
            case 'startup': return renderStartupDashboard();
            case 'mentor': return renderMentorDashboard(); // Роль mentor тоже означает куратор (в БД остался 'mentor')
            default: return renderStartupDashboard();
        }
    };

    const getRoleNameForDisplay = (role) => {
        const roles = { startup: 'Стартапера', mentor: 'Куратора', admin_pending: 'Ожидание подтверждения' };
        return roles[role] || 'Пользователя';
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Дашборд {getRoleNameForDisplay(user?.role)}</h1>
                <div className="user-info">
                    <span>Привет, {user?.first_name || user?.username || user?.email}! 🚀</span>
                    <button onClick={handleConnectTelegram} style={{ background: '#00b4ff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', marginLeft: '0.5rem' }}>Привязать Telegram</button>
                    <button onClick={handleOpenProfile} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '0.4rem 0.8rem', borderRadius: '4px', color: '#ccc', cursor: 'pointer', fontSize: '0.85rem', marginLeft: '0.5rem' }}>Редактировать профиль</button>
                </div>
            </header>
            {renderDashboardContent()}
            
            {showProfileModal && renderModal('Редактировать профиль', (
                <>
                    <input style={inputStyle} placeholder="Имя *" value={profileForm.first_name} onChange={e => setProfileForm({...profileForm, first_name: e.target.value})} />
                    <input style={inputStyle} placeholder="Фамилия" value={profileForm.last_name} onChange={e => setProfileForm({...profileForm, last_name: e.target.value})} />
                    <label style={{ display: 'block', color: '#ccc', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Дата рождения *</label>
                    <input style={inputStyle} type="date" value={profileForm.date_of_birth} onChange={e => setProfileForm({...profileForm, date_of_birth: e.target.value})} />
                </>
            ), () => setShowProfileModal(false), handleUpdateProfile, 'Сохранить')}
        </div>
    );
};

export default Dashboard;
