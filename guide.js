const express = require('express');
const router = express.Router();
const { db } = require('../database/init');

// Подкасты
router.get('/podcasts', (req, res) => {
  db.all('SELECT * FROM podcasts ORDER BY created_at DESC', [], (err, podcasts) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    res.json(podcasts);
  });
});

router.post('/podcast', (req, res) => {
  const { title, description, audio_url, image_url, duration } = req.body;
  
  db.run(
    'INSERT INTO podcasts (title, description, audio_url, image_url, duration) VALUES (?, ?, ?, ?, ?)',
    [title, description, audio_url, image_url, duration],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка создания подкаста' });
      }
      res.json({ id: this.lastID, message: 'Подкаст добавлен' });
    }
  );
});

// Гранты
router.get('/grants', (req, res) => {
  db.all('SELECT * FROM grants ORDER BY deadline ASC', [], (err, grants) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    res.json(grants);
  });
});

router.get('/grant/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM grants WHERE id = ?', [id], (err, grant) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    if (!grant) {
      return res.status(404).json({ error: 'Грант не найден' });
    }
    res.json(grant);
  });
});

router.post('/grant', (req, res) => {
  const { title, description, amount, deadline, requirements, link } = req.body;
  
  db.run(
    'INSERT INTO grants (title, description, amount, deadline, requirements, link) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description, amount, deadline, requirements, link],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка создания гранта' });
      }
      res.json({ id: this.lastID, message: 'Грант добавлен' });
    }
  );
});

// Наставники
router.get('/mentors', (req, res) => {
  db.all('SELECT * FROM mentors ORDER BY experience_years DESC', [], (err, mentors) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    res.json(mentors);
  });
});

router.get('/mentor/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM mentors WHERE id = ?', [id], (err, mentor) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    if (!mentor) {
      return res.status(404).json({ error: 'Наставник не найден' });
    }
    res.json(mentor);
  });
});

// Акселераторы
router.get('/accelerators', (req, res) => {
  db.all('SELECT * FROM accelerators ORDER BY name', [], (err, accelerators) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    res.json(accelerators);
  });
});

router.get('/accelerator/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM accelerators WHERE id = ?', [id], (err, accelerator) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    if (!accelerator) {
      return res.status(404).json({ error: 'Акселератор не найден' });
    }
    res.json(accelerator);
  });
});

// Партнеры (реклама)
router.get('/partners', (req, res) => {
  db.all('SELECT * FROM partners WHERE is_active = 1 ORDER BY created_at DESC', [], (err, partners) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    res.json(partners);
  });
});

// Рекомендации для пользователя
router.get('/recommendations/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.all(
    'SELECT * FROM recommendations WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, recommendations) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка базы данных' });
      }
      res.json(recommendations);
    }
  );
});

router.post('/recommendation', (req, res) => {
  const { user_id, title, description, link, category } = req.body;
  
  db.run(
    'INSERT INTO recommendations (user_id, title, description, link, category) VALUES (?, ?, ?, ?, ?)',
    [user_id, title, description, link, category],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка создания рекомендации' });
      }
      res.json({ id: this.lastID, message: 'Рекомендация добавлена' });
    }
  );
});

module.exports = router;

