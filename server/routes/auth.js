const express = require('express');
const router = express.Router();
const { db } = require('../database/init');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { sendTelegramNotification } = require('../bot');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy');

// --- Авторизация через Email/Пароль ---

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, first_name, last_name, date_of_birth } = req.body;

    if (!email || !password || !date_of_birth) {
      return res.status(400).json({ error: 'Email, пароль и дата рождения обязательны' });
    }

    // Проверяем, существует ли пользователь
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
      if (err) return res.status(500).json({ error: 'Ошибка базы данных' });
      if (user) return res.status(400).json({ error: 'Пользователь с таким email уже существует' });

      // Хэшируем пароль
      const salt = bcrypt.genSaltSync(10);
      const password_hash = bcrypt.hashSync(password, salt);

      // Определяем роль (если просится в админы, ставим admin_pending, иначе startup)
      const assignedRole = role === 'admin' ? 'admin_pending' : 'startup';

      db.run(
        'INSERT INTO users (email, password_hash, role, first_name, last_name, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)',
        [email, password_hash, assignedRole, first_name || '', last_name || '', date_of_birth],
        function (err) {
          if (err) return res.status(500).json({ error: 'Ошибка создания пользователя' });

          const newUserId = this.lastID;
          const token = jwt.sign({ id: newUserId, role: assignedRole }, JWT_SECRET, { expiresIn: '24h' });

          sendTelegramNotification(newUserId, '👋 Добро пожаловать! Вы успешно зарегистрировались на платформе MolStartupUR.');

          res.json({
            token,
            user: { id: newUserId, email, role: assignedRole, first_name, last_name, date_of_birth }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Логин
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
      if (err) return res.status(500).json({ error: 'Ошибка базы данных' });
      if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
      if (!user.password_hash) return res.status(400).json({ error: 'Вход по паролю недоступен (пользователь зарегистрирован через Telegram без пароля)' });

      const isMatch = bcrypt.compareSync(password, user.password_hash);
      if (!isMatch) return res.status(400).json({ error: 'Неверный пароль' });

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

      sendTelegramNotification(user.id, '🔑 Выполнен вход в ваш аккаунт на платформе MolStartupUR.');

      res.json({
        token,
        user: { id: user.id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});


// --- Авторизация через Telegram ---
router.post('/telegram', async (req, res) => {
  try {
    const { id, username, first_name, last_name, hash, auth_date } = req.body;

    // Проверка подлинности данных от Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
    if (botToken && hash) {
      const dataCheckArr = [];
      for (const key in req.body) {
        if (key !== 'hash' && req.body[key] !== undefined && req.body[key] !== null) {
          dataCheckArr.push(`${key}=${req.body[key]}`);
        }
      }
      dataCheckArr.sort();
      const dataCheckString = dataCheckArr.join('\n');
      const secretKey = crypto.createHash('sha256').update(botToken).digest();
      const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

      if (calculatedHash !== hash) {
        return res.status(401).json({ error: 'Неверная подпись Telegram авторизации (ошибка валидации)' });
      }

      if (auth_date) {
        const now = Math.floor(Date.now() / 1000);
        if (now - auth_date > 86400) { // 24 часа
          return res.status(401).json({ error: 'Сессия Telegram авторизации устарела' });
        }
      }
    }

    db.get(
      'SELECT * FROM users WHERE telegram_id = ?',
      [id.toString()],
      (err, user) => {
        if (err) return res.status(500).json({ error: 'Ошибка базы данных' });

        if (user) {
          // Обновляем данные Telegram пользователя
          db.run(
            'UPDATE users SET username = ?, first_name = ?, last_name = ? WHERE telegram_id = ?',
            [username, first_name, last_name, id.toString()],
            (err) => {
              if (err) return res.status(500).json({ error: 'Ошибка обновления' });

              const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
              res.json({ token, user: { ...user, username, first_name, last_name } });
            }
          );
        } else {
          // Новый Telegram пользователь по умолчанию получает роль startup
          db.run(
            'INSERT INTO users (telegram_id, username, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
            [id.toString(), username, first_name, last_name, 'startup'],
            function (err) {
              if (err) return res.status(500).json({ error: 'Ошибка создания пользователя' });

              const newUserId = this.lastID;
              const token = jwt.sign({ id: newUserId, role: 'startup' }, JWT_SECRET, { expiresIn: '24h' });
              res.json({
                token,
                user: { id: newUserId, telegram_id: id.toString(), username, first_name, last_name, role: 'startup' }
              });
            }
          );
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Ошибка авторизации' });
  }
});

// --- Обработка Магической Ссылки (Magic Link) ---
router.get('/magic-link/:token', async (req, res) => {
  try {
    const { token } = req.params;

    db.get('SELECT * FROM magic_links WHERE token = ?', [token], (err, magicLink) => {
      if (err) return res.status(500).json({ error: 'Ошибка БД' });
      if (!magicLink) return res.redirect('http://localhost:3000/login?error=InvalidLink');

      // Проверка срока действия
      const now = new Date();
      const expiresAt = new Date(magicLink.expires_at);
      if (now > expiresAt) {
        db.run('DELETE FROM magic_links WHERE id = ?', [magicLink.id]);
        return res.redirect('http://localhost:3000/login?error=LinkExpired');
      }

      // Получаем пользователя
      db.get('SELECT * FROM users WHERE id = ?', [magicLink.user_id], (err, user) => {
        if (err || !user) return res.redirect('http://localhost:3000/login?error=UserNotFound');

        // Генерируем JWT и удаляем одноразовую ссылку
        const jwtToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        db.run('DELETE FROM magic_links WHERE id = ?', [magicLink.id]);

        // Редирект на фронтенд с токеном
        res.redirect(`http://localhost:3000/auth-success?token=${jwtToken}`);
      });
    });
  } catch (error) {
    res.redirect('http://localhost:3000/login?error=ServerError');
  }
});

// --- Авторизация через Google ---
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(400).json({ error: 'Google Client ID не настроен на сервере.' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, given_name, family_name } = payload;

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
      if (err) return res.status(500).json({ error: 'Ошибка базы данных' });

      if (user) {
        const jwtToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.json({
          token: jwtToken,
          user: { id: user.id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name }
        });
      } else {
        db.run(
          'INSERT INTO users (email, role, first_name, last_name) VALUES (?, ?, ?, ?)',
          [email, 'startup', given_name || '', family_name || ''],
          function (err) {
            if (err) return res.status(500).json({ error: 'Ошибка создания пользователя' });

            const newUserId = this.lastID;
            const jwtToken = jwt.sign({ id: newUserId, role: 'startup' }, JWT_SECRET, { expiresIn: '24h' });

            res.json({
              token: jwtToken,
              user: { id: newUserId, email, role: 'startup', first_name: given_name, last_name: family_name }
            });
          }
        );
      }
    });
  } catch (error) {
    console.error('Ошибка Google Auth:', error);
    res.status(401).json({ error: 'Неверный Google токен или авторизация отклонена' });
  }
});

// Получить данные текущего пользователя по JWT
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Нет токена авторизации' });

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    req.user = decoded; // { id, role, ... }
    next();
  } catch (err) {
    res.status(401).json({ error: 'Токен недействителен' });
  }
};

router.get('/me', authMiddleware, (req, res) => {
  db.get('SELECT id, email, telegram_id, username, first_name, last_name, date_of_birth, role, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ error: 'Ошибка БД' });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user);
  });
});

// Обновление профиля
router.put('/profile', authMiddleware, (req, res) => {
  const { first_name, last_name, date_of_birth } = req.body;
  if (!first_name || !date_of_birth) {
    return res.status(400).json({ error: 'Имя и Дата рождения обязательны' });
  }

  db.run(
    'UPDATE users SET first_name = ?, last_name = ?, date_of_birth = ? WHERE id = ?',
    [first_name, last_name || '', date_of_birth, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Ошибка обновления профиля' });
      res.json({ message: 'Профиль успешно обновлен' });
    }
  );
});

// Генерация кода привязки Telegram
router.get('/telegram-link', authMiddleware, (req, res) => {
  const linkCode = crypto.randomBytes(8).toString('hex');
  db.run('UPDATE users SET telegram_link_code = ? WHERE id = ?', [linkCode, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: 'Ошибка генерации ссылки' });
    res.json({ link: `https://t.me/MolStartupUR_bot?start=${linkCode}` });
  });
});

module.exports = { router, authMiddleware, JWT_SECRET };
