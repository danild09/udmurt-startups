const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Импорт роутов
const { router: authRoutes } = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const contentRoutes = require('./routes/content');
const guideRoutes = require('./routes/guide');
const marketRoutes = require('./routes/market');
const contactsRoutes = require('./routes/contacts');

// Роуты
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/guide', guideRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/contacts', contactsRoutes);

// Корневой маршрут для разработки
if (process.env.NODE_ENV !== 'production') {
  app.get('/', (req, res) => {
    res.json({
      message: 'Backend API сервер работает!',
      info: 'Это API сервер. Для просмотра сайта запустите React приложение:',
      instructions: {
        step1: 'Откройте новый терминал',
        step2: 'Выполните: npm run client',
        step3: 'Откройте браузер: http://localhost:3000'
      },
      api: {
        baseUrl: `http://localhost:${PORT}/api`,
        endpoints: {
          auth: '/api/auth',
          content: '/api/content',
          guide: '/api/guide',
          market: '/api/market',
          contacts: '/api/contacts'
        }
      }
    });
  });
}

// Статические файлы (React build)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Инициализация базы данных
const db = require('./database/init');

// Обработка ошибок запуска
process.on('uncaughtException', (error) => {
  console.error('❌ Необработанная ошибка:', error.message);
  console.error('Стек ошибки:', error.stack);
  // Не завершаем процесс, чтобы сервер продолжал работать
  // process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️  Необработанное отклонение промиса:', reason);
  // Не завершаем процесс
});

// Запуск сервера
app.listen(PORT, (err) => {
  if (err) {
    console.error('Ошибка запуска сервера:', err);
    if (err.code === 'EADDRINUSE') {
      console.error(`Порт ${PORT} уже занят. Измените PORT в .env файле или освободите порт.`);
    }
    process.exit(1);
  }
  console.log(`✅ Сервер запущен на порту ${PORT}`);
  console.log(`🌐 API доступен по адресу: http://localhost:${PORT}`);

  // Инициализация базы данных с обработкой ошибок
  // Не блокируем запуск сервера, даже если БД не инициализирована
  setTimeout(() => {
    db.initDatabase((err) => {
      if (err) {
        console.error('❌ Ошибка инициализации базы данных:', err.message);
        console.log('⚠️  Сервер продолжает работу, но некоторые функции могут быть недоступны');
      } else {
        console.log('✅ База данных готова к работе');
      }
    });
  }, 100);
});

