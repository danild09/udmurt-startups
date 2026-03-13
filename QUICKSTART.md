# Быстрый старт

## Шаг 1: Установка зависимостей

```bash
# Установить зависимости для backend и frontend
npm run install-all
```

## Шаг 2: Настройка окружения

Создайте файл `.env` в корне проекта (скопируйте из `.env.example`):

```env
PORT=5000
NODE_ENV=development
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_BOT_USERNAME=your_bot_username
```

## Шаг 3: Запуск проекта

### Вариант 1: Запуск в режиме разработки

**Терминал 1 - Backend:**
```bash
npm run dev
```

**Терминал 2 - Frontend:**
```bash
npm run client
```

### Вариант 2: Запуск только backend (для тестирования API)

```bash
npm start
```

## Шаг 4: Открыть в браузере

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Первый запуск

При первом запуске автоматически создастся база данных SQLite в `server/database/database.sqlite` с начальными данными:
- Примеры акселераторов
- Примеры наставников
- Примеры грантов

## Тестирование авторизации

Для тестирования авторизации через Telegram:
1. Нажмите кнопку "Войти через Telegram" в навигации
2. В режиме разработки будет создан тестовый пользователь
3. Для реальной авторизации откройте сайт через Telegram Web App

## Структура проекта

```
project/
├── server/           # Backend (Node.js + Express)
│   ├── database/     # База данных и инициализация
│   ├── routes/       # API маршруты
│   └── index.js      # Точка входа сервера
├── client/           # Frontend (React)
│   ├── public/       # Статические файлы
│   └── src/          # Исходный код React
│       ├── components/  # Компоненты
│       └── pages/       # Страницы
└── package.json      # Зависимости проекта
```

## Полезные команды

- `npm start` - запуск backend сервера
- `npm run dev` - запуск backend с автоперезагрузкой
- `npm run client` - запуск React приложения
- `npm run build` - сборка production версии frontend

## Следующие шаги

1. Настройте Telegram бота для полной интеграции
2. Добавьте реальные данные в базу данных
3. Настройте ИИ-логику для генерации рекомендаций
4. Загрузите контент (статьи, уроки, подкасты)

