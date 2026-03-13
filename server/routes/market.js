const express = require('express');
const router = express.Router();
const { db } = require('../database/init');

// Получить все товары
router.get('/products', (req, res) => {
  db.all(
    'SELECT p.*, u.first_name, u.last_name FROM products p LEFT JOIN users u ON p.entrepreneur_id = u.id WHERE p.is_active = 1 ORDER BY p.created_at DESC',
    [],
    (err, products) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка базы данных' });
      }
      res.json(products);
    }
  );
});

// Получить товар по ID
router.get('/product/:id', (req, res) => {
  const { id } = req.params;
  
  db.get(
    'SELECT p.*, u.first_name, u.last_name, u.username FROM products p LEFT JOIN users u ON p.entrepreneur_id = u.id WHERE p.id = ?',
    [id],
    (err, product) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка базы данных' });
      }
      if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
      }
      res.json(product);
    }
  );
});

// Получить товары по категории
router.get('/products/category/:category', (req, res) => {
  const { category } = req.params;
  
  db.all(
    'SELECT p.*, u.first_name, u.last_name FROM products p LEFT JOIN users u ON p.entrepreneur_id = u.id WHERE p.category = ? AND p.is_active = 1 ORDER BY p.created_at DESC',
    [category],
    (err, products) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка базы данных' });
      }
      res.json(products);
    }
  );
});

// Создать товар
router.post('/product', (req, res) => {
  const { name, description, price, image_url, entrepreneur_id, category } = req.body;
  
  db.run(
    'INSERT INTO products (name, description, price, image_url, entrepreneur_id, category) VALUES (?, ?, ?, ?, ?, ?)',
    [name, description, price, image_url, entrepreneur_id, category],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка создания товара' });
      }
      res.json({ id: this.lastID, message: 'Товар добавлен' });
    }
  );
});

// Получить товары предпринимателя
router.get('/products/entrepreneur/:id', (req, res) => {
  const { id } = req.params;
  
  db.all(
    'SELECT * FROM products WHERE entrepreneur_id = ? ORDER BY created_at DESC',
    [id],
    (err, products) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка базы данных' });
      }
      res.json(products);
    }
  );
});

module.exports = router;

