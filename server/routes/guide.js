const express = require('express');
const router = express.Router();
const { db } = require('../database/init');
const { authMiddleware } = require('./auth');
const { sendTelegramNotification } = require('../bot');

// Middleware: только для админов
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
    }
    next();
};

// ============ ПОДКАСТЫ ============
router.get('/podcasts', (req, res) => {
  db.all('SELECT * FROM podcasts ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка БД' });
    res.json(rows);
  });
});

router.post('/podcast', authMiddleware, adminOnly, (req, res) => {
  const { title, description, audio_url, image_url, duration } = req.body;
  db.run('INSERT INTO podcasts (title, description, audio_url, image_url, duration) VALUES (?, ?, ?, ?, ?)',
    [title, description, audio_url, image_url, duration],
    function(err) {
      if (err) return res.status(500).json({ error: 'Ошибка создания подкаста' });
      res.json({ id: this.lastID, message: 'Подкаст добавлен' });
    });
});

// ============ ГРАНТЫ ============
router.get('/grants', (req, res) => {
  db.all('SELECT * FROM grants ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка БД' });
    res.json(rows);
  });
});

router.post('/grant', authMiddleware, adminOnly, (req, res) => {
  const { title, description, amount, deadline, requirements, link } = req.body;
  db.run('INSERT INTO grants (title, description, amount, deadline, requirements, link) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description, amount, deadline, requirements, link],
    function(err) {
      if (err) return res.status(500).json({ error: 'Ошибка создания гранта' });
      res.json({ id: this.lastID, message: 'Грант добавлен' });
    });
});

router.delete('/grant/:id', authMiddleware, adminOnly, (req, res) => {
  db.run('DELETE FROM grants WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Ошибка удаления' });
    res.json({ message: 'Грант удалён' });
  });
});

// ============ КОНКУРСЫ ============
router.get('/contests', (req, res) => {
  db.all('SELECT * FROM contests ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка БД' });
    res.json(rows);
  });
});

router.post('/contest', authMiddleware, adminOnly, (req, res) => {
  const { title, description, deadline, prize, requirements, link } = req.body;
  db.run('INSERT INTO contests (title, description, deadline, prize, requirements, link) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description, deadline, prize, requirements, link],
    function(err) {
      if (err) return res.status(500).json({ error: 'Ошибка создания конкурса' });
      res.json({ id: this.lastID, message: 'Конкурс добавлен' });
    });
});

router.delete('/contest/:id', authMiddleware, adminOnly, (req, res) => {
  db.run('DELETE FROM contests WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Ошибка удаления' });
    res.json({ message: 'Конкурс удалён' });
  });
});

// ============ ПРОГРАММЫ ОБУЧЕНИЯ ============
router.get('/programs', (req, res) => {
  db.all('SELECT * FROM programs ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка БД' });
    res.json(rows);
  });
});

router.post('/program', authMiddleware, adminOnly, (req, res) => {
  const { title, description, duration, format, requirements, link, category } = req.body;
  db.run('INSERT INTO programs (title, description, duration, format, requirements, link, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, description, duration, format, requirements, link, category || 'training'],
    function(err) {
      if (err) return res.status(500).json({ error: 'Ошибка создания программы' });
      res.json({ id: this.lastID, message: 'Программа добавлена' });
    });
});

router.delete('/program/:id', authMiddleware, adminOnly, (req, res) => {
  db.run('DELETE FROM programs WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Ошибка удаления' });
    res.json({ message: 'Программа удалена' });
  });
});

// ============ ПАРТНЁРЫ ============
router.get('/partners', (req, res) => {
  db.all('SELECT * FROM partners WHERE is_active = 1 ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка БД' });
    res.json(rows);
  });
});

router.post('/partner', authMiddleware, adminOnly, (req, res) => {
  const { name, description, website, logo_url, contact_info } = req.body;
  db.run('INSERT INTO partners (name, description, website, logo_url, contact_info) VALUES (?, ?, ?, ?, ?)',
    [name, description, website, logo_url, contact_info],
    function(err) {
      if (err) return res.status(500).json({ error: 'Ошибка добавления партнёра' });
      res.json({ id: this.lastID, message: 'Партнёр добавлен' });
    });
});

// ============ НАСТАВНИКИ ============
router.get('/mentors', (req, res) => {
  db.all('SELECT * FROM mentors ORDER BY experience_years DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка БД' });
    res.json(rows);
  });
});

router.post('/mentor', authMiddleware, adminOnly, (req, res) => {
  const { name, specialization, bio, photo_url, contact_info, experience_years } = req.body;
  db.run('INSERT INTO mentors (name, specialization, bio, photo_url, contact_info, experience_years) VALUES (?, ?, ?, ?, ?, ?)',
    [name, specialization, bio, photo_url, contact_info, experience_years],
    function(err) {
      if (err) return res.status(500).json({ error: 'Ошибка добавления наставника' });
      res.json({ id: this.lastID, message: 'Наставник добавлен' });
    });
});

// ============ АКСЕЛЕРАТОРЫ ============
router.get('/accelerators', (req, res) => {
  db.all('SELECT * FROM accelerators ORDER BY name', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка БД' });
    res.json(rows);
  });
});

// ============ РЕКОМЕНДАЦИИ ============
router.get('/recommendations/:userId', (req, res) => {
  db.all('SELECT * FROM recommendations WHERE user_id = ? ORDER BY created_at DESC', [req.params.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка БД' });
    res.json(rows);
  });
});

// ============ ЗАЯВКИ НА ГРАНТЫ ============
router.get('/grant-applications', authMiddleware, adminOnly, (req, res) => {
  db.all(`SELECT ga.*, u.first_name, u.email, g.title as grant_title 
    FROM grant_applications ga 
    JOIN users u ON ga.user_id = u.id 
    JOIN grants g ON ga.grant_id = g.id 
    ORDER BY ga.created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка БД' });
    res.json(rows);
  });
});

// Мои заявки (для стартапера)
router.get('/my-applications', authMiddleware, (req, res) => {
  db.all(`SELECT ga.*, g.title as grant_title 
    FROM grant_applications ga 
    JOIN grants g ON ga.grant_id = g.id
    WHERE ga.user_id = ? 
    ORDER BY ga.created_at DESC`, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка БД' });
    res.json(rows);
  });
});

router.post('/grant-application', authMiddleware, (req, res) => {
  const { grant_id, project_name, project_description } = req.body;
  const user_id = req.user.id;
  
  db.run(
    'INSERT INTO grant_applications (user_id, grant_id, project_name, project_description) VALUES (?, ?, ?, ?)',
    [user_id, grant_id, project_name, project_description],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка подачи заявки' });
      }

      // Уведомление пользователю
      sendTelegramNotification(user_id, `✅ Ваша заявка на грант для проекта "${project_name}" успешно отправлена! Мы уведомим вас о решении через бота.`);

      // Уведомление администраторам
      db.all("SELECT id FROM users WHERE role = 'admin'", [], (err, admins) => {
        if (!err && admins) {
          admins.forEach(admin => {
            sendTelegramNotification(admin.id, `🔔 *Новая заявка на Грант*\nПроект: "${project_name}"\nОтправил: ${req.user.email}`);
          });
        }
      });

      res.json({ id: this.lastID, message: 'Заявка отправлена' });
    }
  );
});

router.post('/grant-application/:id/status', authMiddleware, adminOnly, (req, res) => {
  const { status } = req.body; // 'approved' | 'rejected'
  db.get('SELECT user_id, project_name FROM grant_applications WHERE id = ?', [req.params.id], (err, row) => {
    if (err || !row) return res.status(500).json({ error: 'Ошибка БД' });
    db.run('UPDATE grant_applications SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
      if (err) return res.status(500).json({ error: 'Ошибка обновления статуса' });
      if (status === 'approved') sendTelegramNotification(row.user_id, `🎉 Ваша заявка на грант для проекта "${row.project_name}" одобрена!`);
      if (status === 'rejected') sendTelegramNotification(row.user_id, `❌ Ваша заявка на грант для проекта "${row.project_name}" отклонена.`);
      res.json({ message: `Статус заявки изменён на: ${status}` });
    });
  });
});

// ============ ЗАЯВКИ НА МЕНТОРСТВО ============
router.get('/mentorship-requests', authMiddleware, (req, res) => {
  // Для админов — все, для менторов — только к ним, для стартаперов — только свои
  let query, params;
  if (req.user.role === 'admin') {
    query = `SELECT mr.*, u.first_name, u.email, m.name as mentor_name 
      FROM mentorship_requests mr 
      JOIN users u ON mr.user_id = u.id 
      JOIN mentors m ON mr.mentor_id = m.id 
      ORDER BY mr.created_at DESC`;
    params = [];
  } else {
    query = `SELECT mr.*, m.name as mentor_name
      FROM mentorship_requests mr
      JOIN mentors m ON mr.mentor_id = m.id
      WHERE mr.user_id = ?
      ORDER BY mr.created_at DESC`;
    params = [req.user.id];
  }
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка БД' });
    res.json(rows);
  });
});

// Получение заявок конкретно для куратора (админа, который привязал к себе анкету)
router.get('/mentorship-requests/curator', authMiddleware, adminOnly, (req, res) => {
  // Находим анкету куратора, привязанную к этому админу (предполагаем по имени или email, так как связи по ID пока нет, сделаем поиск по имени/почте)
  const identifier = req.user.first_name || req.user.email;
  
  db.get('SELECT id FROM mentors WHERE name LIKE ? OR contact_info LIKE ?', [`%${identifier}%`, `%${req.user.email}%`], (err, mentor) => {
    if (err || !mentor) return res.status(404).json({ error: 'Анкета куратора не найдена' });

    const query = `
      SELECT mr.*, u.first_name, u.email,
        (SELECT json_group_array(json_object('id', p.id, 'name', p.name, 'stage', p.stage, 'description', p.description)) 
         FROM projects p WHERE p.user_id = mr.user_id) as projects,
        (SELECT json_group_array(json_object('id', prod.id, 'name', prod.name, 'price', prod.price, 'status', prod.status)) 
         FROM products prod WHERE prod.user_id = mr.user_id) as products
      FROM mentorship_requests mr
      JOIN users u ON mr.user_id = u.id
      WHERE mr.mentor_id = ?
      ORDER BY mr.created_at DESC
    `;
    
    db.all(query, [mentor.id], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Ошибка БД при загрузке заявок', details: err.message });
      
      // Парсим JSON строки обратно в объекты
      const mappedRows = rows.map(r => ({
        ...r,
        projects: r.projects ? JSON.parse(r.projects) : [],
        products: r.products ? JSON.parse(r.products) : []
      }));
      
      res.json(mappedRows);
    });
  });
});

router.post('/mentorship-request', authMiddleware, (req, res) => {
  const { mentor_id, message } = req.body;
  const user_id = req.user.id;
  
  db.run(
    'INSERT INTO mentorship_requests (user_id, mentor_id, message) VALUES (?, ?, ?)',
    [user_id, mentor_id, message],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка отправки запроса' });
      }

      sendTelegramNotification(user_id, `✅ Ваша заявка на менторство успешно отправлена! Мы уведомим вас, когда она будет рассмотрена.`);

      // Уведомить администраторов
      db.all("SELECT id FROM users WHERE role = 'admin'", [], (err, admins) => {
          if (!err && admins) {
              admins.forEach(admin => {
                  sendTelegramNotification(admin.id, `🔔 Новая заявка на менторство от пользователя! Зайдите в панель администратора для просмотра.`);
              });
          }
      });

      res.json({ id: this.lastID, message: 'Запрос отправлен' });
    }
  );
});

router.post('/mentorship-request/:id/status', authMiddleware, adminOnly, (req, res) => {
  const { status } = req.body;
  db.get('SELECT user_id FROM mentorship_requests WHERE id = ?', [req.params.id], (err, row) => {
    if (err || !row) return res.status(500).json({ error: 'Ошибка БД' });
    db.run('UPDATE mentorship_requests SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
      if (err) return res.status(500).json({ error: 'Ошибка обновления статуса' });
      if (status === 'approved') sendTelegramNotification(row.user_id, `🎉 Ваша заявка на кураторство одобрена!`);
      if (status === 'rejected') sendTelegramNotification(row.user_id, `❌ Ваша заявка на кураторство отклонена.`);
      res.json({ message: `Заявка на менторство: ${status}` });
    });
  });
});

// ============ УРОКИ (создание — только админ) ============
router.get('/lessons', (req, res) => {
  const { category } = req.query;
  let query = 'SELECT * FROM lessons ORDER BY created_at DESC';
  let params = [];
  if (category) {
    query = 'SELECT * FROM lessons WHERE category = ? ORDER BY created_at DESC';
    params = [category];
  }
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка БД' });
    res.json(rows);
  });
});

router.post('/lesson', authMiddleware, adminOnly, (req, res) => {
  const { title, description, video_url, duration, category } = req.body;
  if (!title) return res.status(400).json({ error: 'Укажите название урока' });

  db.run('INSERT INTO lessons (title, description, video_url, duration, category) VALUES (?, ?, ?, ?, ?)',
    [title, description, video_url, duration, category],
    function(err) {
      if (err) return res.status(500).json({ error: 'Ошибка создания урока' });
      res.json({ id: this.lastID, message: 'Урок добавлен' });
    });
});

router.delete('/lesson/:id', authMiddleware, adminOnly, (req, res) => {
  db.run('DELETE FROM lessons WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Ошибка удаления' });
    res.json({ message: 'Урок удалён' });
  });
});

// ============ ПРОЕКТЫ СТАРТАПОВ (Бизнес-план) ============
router.get('/projects', authMiddleware, (req, res) => {
  if (req.user.role === 'admin') {
    db.all(`SELECT p.*, u.first_name, u.email FROM projects p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC`, [], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Ошибка БД' });
      res.json(rows);
    });
  } else {
    db.all(`SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC`, [req.user.id], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Ошибка БД' });
      res.json(rows);
    });
  }
});

router.post('/project', authMiddleware, (req, res) => {
  const { name, description, stage, target_audience, monetization_model, proof_link } = req.body;
  if (!name || !description) return res.status(400).json({ error: 'Заполните обязательные поля (Название и Описание)' });

  db.run('INSERT INTO projects (user_id, name, description, stage, target_audience, monetization_model, proof_link) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.user.id, name, description, stage, target_audience, monetization_model, proof_link],
    function(err) {
      if (err) return res.status(500).json({ error: 'Ошибка сохранения проекта' });
      res.json({ id: this.lastID, message: 'Проект (Стартап) успешно сохранен' });
    });
});

// ============ ИИ-РЕКОМЕНДАЦИИ (Симуляция) ============
router.post('/ai/generate', authMiddleware, (req, res) => {
  const { project_description } = req.body;
  if (!project_description) return res.status(400).json({ error: 'Нет описания для анализа' });

  const desc = project_description.toLowerCase();
  let recommendedCategory = 'management';
  
  if (desc.includes('маркетинг') || desc.includes('клиент') || desc.includes('продаж')) {
    recommendedCategory = 'marketing';
  } else if (desc.includes('деньги') || desc.includes('финанс') || desc.includes('инвестици') || desc.includes('бюджет')) {
    recommendedCategory = 'finance';
  }

  // Очищаем старые рекомендации
  db.run('DELETE FROM recommendations WHERE user_id = ?', [req.user.id], (err) => {
    if (err) return res.status(500).json({ error: 'Ошибка БД' });

    // Берем 2 урока из нужной категории
    db.all('SELECT * FROM lessons WHERE category = ? LIMIT 2', [recommendedCategory], (err, lessons) => {
      if (err || lessons.length === 0) return res.json({ message: 'Нет подходящих уроков', recommendations: [] });

      const stmt = db.prepare('INSERT INTO recommendations (user_id, title, description, link, category) VALUES (?, ?, ?, ?, ?)');
      lessons.forEach(l => {
        stmt.run(req.user.id, `Изучить: ${l.title}`, l.description, l.video_url, l.category);
      });
      stmt.finalize();

      res.json({ message: 'ИИ-анализ завершен. Рекомендации сформированы.', category: recommendedCategory });
    });
  });
});

// ============ ИСТОРИИ УСПЕХА ============
router.get('/success-stories', (req, res) => {
  db.all('SELECT s.*, u.first_name, u.email FROM success_stories s JOIN users u ON s.author_id = u.id WHERE s.status = "approved" ORDER BY s.created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка БД' });
    res.json(rows);
  });
});

router.get('/success-stories', (req, res) => {
  db.all('SELECT s.*, u.first_name, u.email FROM success_stories s JOIN users u ON s.author_id = u.id WHERE s.status = "approved" ORDER BY s.created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка БД' });
    res.json(rows);
  });
});

router.get('/admin/success-stories', authMiddleware, adminOnly, (req, res) => {
  db.all('SELECT s.*, u.first_name, u.email FROM success_stories s JOIN users u ON s.author_id = u.id ORDER BY s.created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка БД' });
    res.json(rows);
  });
});

router.post('/success-story', authMiddleware, (req, res) => {
  const { title, content } = req.body;
  db.run('INSERT INTO success_stories (author_id, title, content) VALUES (?, ?, ?)',
    [req.user.id, title, content],
    function(err) {
      if (err) return res.status(500).json({ error: 'Ошибка отправки' });
      res.json({ id: this.lastID, message: 'История успеха отправлена на модерацию' });
    });
});

router.post('/success-story/:id/status', authMiddleware, adminOnly, (req, res) => {
  const { status } = req.body;
  db.get('SELECT author_id, title FROM success_stories WHERE id = ?', [req.params.id], (err, row) => {
    if (err || !row) return res.status(500).json({ error: 'Ошибка БД' });
    db.run('UPDATE success_stories SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
      if (err) return res.status(500).json({ error: 'Ошибка обновления' });
      if (status === 'approved') sendTelegramNotification(row.author_id, `🎉 Ваша история успеха "${row.title}" опубликована!`);
      if (status === 'rejected') sendTelegramNotification(row.author_id, `❌ Ваша история успеха "${row.title}" отклонена.`);
      res.json({ message: 'Статус изменен' });
    });
  });
});

// ============ ПОДДЕРЖКА / ТИКЕТЫ (Контакты) ============
router.get('/tickets', authMiddleware, (req, res) => {
  if (req.user.role === 'admin') {
    db.all(`SELECT * FROM contacts ORDER BY created_at DESC`, [], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Ошибка БД' });
      res.json(rows);
    });
  } else {
    db.all(`SELECT * FROM contacts WHERE user_id = ? ORDER BY created_at DESC`, [req.user.id], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Ошибка БД' });
      res.json(rows);
    });
  }
});

router.post('/ticket', (req, res) => {
  // Проверяем токен вручную для опциональной авторизации
  let userId = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
      userId = decoded.id;
    } catch(e) {}
  }

  const { name, email, phone, message } = req.body;
  db.run('INSERT INTO contacts (user_id, name, email, phone, message) VALUES (?, ?, ?, ?, ?)',
    [userId, name, email, phone, message],
    function(err) {
      if (err) return res.status(500).json({ error: 'Ошибка отправки' });
      res.json({ id: this.lastID, message: 'Обращение отправлено в поддержку' });
    });
});

router.post('/ticket/:id/reply', authMiddleware, adminOnly, (req, res) => {
  const { reply } = req.body;
  db.get('SELECT user_id, message FROM contacts WHERE id = ?', [req.params.id], (err, row) => {
    db.run('UPDATE contacts SET reply = ?, status = "answered" WHERE id = ?', [reply, req.params.id], function(err) {
      if (err) return res.status(500).json({ error: 'Ошибка ответа' });
      if (row && row.user_id) {
          sendTelegramNotification(row.user_id, `📩 Получен ответ от поддержки на ваше обращение:\n\n${reply}`);
      }
      res.json({ message: 'Ответ отправлен' });
    });
  });
});

// ============ МАРКЕТ ПРОДУКТОВ ============
router.post('/product', authMiddleware, (req, res) => {
  const { name, description, price, category, proof_link, project_id } = req.body;
  db.run('INSERT INTO products (entrepreneur_id, name, description, price, category, proof_link, project_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.user.id, name, description, price, category, proof_link, project_id || null],
    function(err) {
      if (err) return res.status(500).json({ error: 'Ошибка добавления товара' });

      // Уведомление администраторам
      db.all("SELECT id FROM users WHERE role = 'admin'", [], (err, admins) => {
        if (!err && admins) {
          admins.forEach(admin => {
            sendTelegramNotification(admin.id, `🔔 *Новый товар на модерации*\nТовар: "${name}"\nПродавец: ${req.user.email}`);
          });
        }
      });

      res.json({ id: this.lastID, message: 'Товар отправлен на модерацию' });
    });
});

router.post('/product/:id/status', authMiddleware, adminOnly, (req, res) => {
  const { status } = req.body;
  db.get('SELECT entrepreneur_id, name FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err || !row) return res.status(500).json({ error: 'Ошибка БД' });
    db.run('UPDATE products SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
      if (err) return res.status(500).json({ error: 'Ошибка модерации' });
      if (status === 'approved') sendTelegramNotification(row.entrepreneur_id, `🛍 Ваш товар "${row.name}" успешно прошел модерацию и добавлен в Маркет!`);
      if (status === 'rejected') sendTelegramNotification(row.entrepreneur_id, `❌ Модератор отклонил ваш товар "${row.name}".`);
      res.json({ message: 'Статус товара обновлен' });
    });
  });
});

router.get('/products/all', authMiddleware, adminOnly, (req, res) => {
  db.all('SELECT p.*, u.email as entrepreneur_email FROM products p JOIN users u ON p.entrepreneur_id = u.id ORDER BY p.created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка БД' });
    res.json(rows);
  });
});

router.get('/products/approved', (req, res) => {
  db.all('SELECT * FROM products WHERE status = "approved" ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка БД' });
    res.json(rows);
  });
});

module.exports = router;
