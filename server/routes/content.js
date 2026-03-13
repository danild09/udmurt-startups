const express = require('express');
const router = express.Router();
const { db } = require('../database/init');

// Получить все статьи по категории
router.get('/articles/:category?', (req, res) => {
  const { category } = req.params;
  let query = 'SELECT * FROM articles ORDER BY created_at DESC';
  let params = [];

  if (category) {
    query = 'SELECT * FROM articles WHERE category = ? ORDER BY created_at DESC';
    params = [category];
  }

  db.all(query, params, (err, articles) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    res.json(articles);
  });
});

// Получить статью по ID
router.get('/article/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM articles WHERE id = ?', [id], (err, article) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    if (!article) {
      return res.status(404).json({ error: 'Статья не найдена' });
    }
    res.json(article);
  });
});

// Создать статью
router.post('/article', (req, res) => {
  const { title, content, category, image_url, author_id } = req.body;
  
  db.run(
    'INSERT INTO articles (title, content, category, image_url, author_id) VALUES (?, ?, ?, ?, ?)',
    [title, content, category, image_url, author_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка создания статьи' });
      }
      res.json({ id: this.lastID, message: 'Статья создана' });
    }
  );
});

// Получить все уроки
router.get('/lessons/:category?', (req, res) => {
  const { category } = req.params;
  let query = 'SELECT * FROM lessons ORDER BY created_at DESC';
  let params = [];

  if (category) {
    query = 'SELECT * FROM lessons WHERE category = ? ORDER BY created_at DESC';
    params = [category];
  }

  db.all(query, params, (err, lessons) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    res.json(lessons);
  });
});

// Получить урок по ID
router.get('/lesson/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM lessons WHERE id = ?', [id], (err, lesson) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    if (!lesson) {
      return res.status(404).json({ error: 'Урок не найден' });
    }
    res.json(lesson);
  });
});

module.exports = router;

