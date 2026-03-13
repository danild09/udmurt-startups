const express = require('express');
const router = express.Router();
const { db } = require('../database/init');

// Отправить обращение
router.post('/submit', (req, res) => {
  const { name, email, phone, message } = req.body;
  
  db.run(
    'INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)',
    [name, email, phone, message],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка отправки обращения' });
      }
      res.json({ id: this.lastID, message: 'Обращение отправлено' });
    }
  );
});

// Получить все обращения (для админа)
router.get('/messages', (req, res) => {
  db.all('SELECT * FROM contacts ORDER BY created_at DESC', [], (err, messages) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    res.json(messages);
  });
});

module.exports = router;

