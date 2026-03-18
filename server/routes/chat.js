const express = require('express');
const router = express.Router();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, '..', 'database', 'database.sqlite');
const db = new sqlite3.Database(dbPath);
const jwt = require('jsonwebtoken');
const { sendTelegramNotification } = require('../bot');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
      req.user = decoded;
      next();
    } catch (e) {
      res.status(401).json({ error: 'Неверный токен' });
    }
  } else {
    res.status(401).json({ error: 'Требуется авторизация' });
  }
};

// 1. Создание чата или получение существующего
router.post('/start', authMiddleware, (req, res) => {
    const { product_id, seller_id } = req.body;
    const buyer_id = req.user.id;

    if (!product_id || !seller_id) return res.status(400).json({ error: 'Missing ids' });

    db.get('SELECT * FROM chats WHERE product_id = ? AND buyer_id = ? AND seller_id = ?', 
    [product_id, buyer_id, seller_id], (err, row) => {
        if (err) return res.status(500).json({ error: 'DB Error' });
        
        if (row) {
            return res.json({ chat_id: row.id });
        } else {
            db.run('INSERT INTO chats (product_id, buyer_id, seller_id) VALUES (?, ?, ?)', 
            [product_id, buyer_id, seller_id], function(err) {
                if (err) return res.status(500).json({ error: 'Error creating chat' });
                res.json({ chat_id: this.lastID });
            });
        }
    });
});

// 2. Получение всех чатов пользователя
router.get('/my-chats', authMiddleware, (req, res) => {
    const userId = req.user.id;
    // Получаем чаты, где user это либо покупатель, либо продавец
    db.all(`
        SELECT c.*, p.name as product_name, p.price, 
        u1.email as buyer_email, u2.email as seller_email
        FROM chats c
        JOIN products p ON c.product_id = p.id
        JOIN users u1 ON c.buyer_id = u1.id
        JOIN users u2 ON c.seller_id = u2.id
        WHERE c.buyer_id = ? OR c.seller_id = ?
    `, [userId, userId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'DB Error' });
        res.json(rows);
    });
});

// 3. Отправка сообщения
router.post('/:chatId/message', authMiddleware, (req, res) => {
    const { chatId } = req.params;
    const { text } = req.body;
    const sender_id = req.user.id;

    if (!text) return res.status(400).json({ error: 'Empty message' });

    db.run('INSERT INTO messages (chat_id, sender_id, text) VALUES (?, ?, ?)', 
    [chatId, sender_id, text], function(err) {
        if (err) return res.status(500).json({ error: 'Message save error' });

        db.get(`
            SELECT c.*, p.name as product_name, u.first_name as sender_name 
            FROM chats c 
            JOIN products p ON c.product_id = p.id
            JOIN users u ON u.id = ? 
            WHERE c.id = ?
        `, [sender_id, chatId], (err, chat) => {
            if (!err && chat) {
                const receiverId = chat.buyer_id === sender_id ? chat.seller_id : chat.buyer_id;
                sendTelegramNotification(
                    receiverId, 
                    `💬 Новое сообщение по товару "${chat.product_name}" от ${chat.sender_name || 'пользователя'}:\n\n"${text}"\n\nЗайдите в Личный кабинет, чтобы ответить.`
                );
            }
        });

        res.json({ id: this.lastID, success: true });
    });
});

// 4. Получение сообщений чата
router.get('/:chatId/messages', authMiddleware, (req, res) => {
    const { chatId } = req.params;
    db.all('SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC', [chatId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'DB Error' });
        res.json(rows);
    });
});

module.exports = router;
