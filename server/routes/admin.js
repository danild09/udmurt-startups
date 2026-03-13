const express = require('express');
const router = express.Router();
const { db } = require('../database/init');
const { authMiddleware } = require('./auth');

// Middleware проверки роли (только для Admin)
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
    }
    next();
};

// Получение списка всех пользователей (для дашборда админа)
router.get('/users', authMiddleware, adminOnly, (req, res) => {
    db.all('SELECT id, email, role, first_name, created_at FROM users', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Ошибка БД' });
        res.json(rows);
    });
});

// Одобрение статуса администратора ('admin_pending' -> 'admin')
router.post('/approve/:id', authMiddleware, adminOnly, (req, res) => {
    const targetUserId = req.params.id;

    db.get('SELECT role FROM users WHERE id = ?', [targetUserId], (err, user) => {
        if (err) return res.status(500).json({ error: 'Ошибка БД' });
        if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

        if (user.role !== 'admin_pending') {
            return res.status(400).json({ error: 'Пользователь не ожидает подтверждения' });
        }

        db.run('UPDATE users SET role = ? WHERE id = ?', ['admin', targetUserId], function (err) {
            if (err) return res.status(500).json({ error: 'Ошибка обновления роли' });
            res.json({ success: true, message: 'Права администратора успешно выданы.' });
        });
    });
});

module.exports = router;
