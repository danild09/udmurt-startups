const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_DIR ? path.join(process.env.DB_DIR, 'database.sqlite') : path.join(__dirname, 'database.sqlite');

// Проверка существования директории
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.message);
  } else {
    console.log('✅ Подключение к базе данных установлено');
    // Включаем поддержку внешних ключей
    db.run('PRAGMA foreign_keys = ON');
  }
});

// Список всех таблиц для создания
const tables = [
  {
    name: 'users',
    sql: `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id TEXT UNIQUE,
      email TEXT UNIQUE,
      password_hash TEXT,
      role TEXT DEFAULT 'startup',
      username TEXT,
      first_name TEXT,
      last_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  },
  {
    name: 'recommendations',
    sql: `CREATE TABLE IF NOT EXISTS recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      link TEXT,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`
  },
  {
    name: 'podcasts',
    sql: `CREATE TABLE IF NOT EXISTS podcasts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      audio_url TEXT,
      image_url TEXT,
      duration TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  },
  {
    name: 'grants',
    sql: `CREATE TABLE IF NOT EXISTS grants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      amount TEXT,
      deadline DATE,
      requirements TEXT,
      link TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  },
  {
    name: 'mentors',
    sql: `CREATE TABLE IF NOT EXISTS mentors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      specialization TEXT,
      bio TEXT,
      photo_url TEXT,
      contact_info TEXT,
      experience_years INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  },
  {
    name: 'accelerators',
    sql: `CREATE TABLE IF NOT EXISTS accelerators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      website TEXT,
      contact_info TEXT,
      programs TEXT,
      logo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  },
  {
    name: 'partners',
    sql: `CREATE TABLE IF NOT EXISTS partners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      website TEXT,
      logo_url TEXT,
      banner_url TEXT,
      contact_info TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  },
  {
    name: 'products',
    sql: `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL,
      image_url TEXT,
      entrepreneur_id INTEGER,
      category TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (entrepreneur_id) REFERENCES users(id)
    )`
  },
  {
    name: 'articles',
    sql: `CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      category TEXT,
      image_url TEXT,
      author_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    )`
  },
  {
    name: 'lessons',
    sql: `CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      video_url TEXT,
      duration TEXT,
      category TEXT,
      resources TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  },
  {
    name: 'contacts',
    sql: `CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  }
];

// Создание таблиц последовательно
const createTables = (index = 0, callback) => {
  if (index >= tables.length) {
    console.log('✅ Все таблицы созданы');
    callback(null);
    return;
  }

  const table = tables[index];
  db.run(table.sql, (err) => {
    if (err) {
      console.error(`❌ Ошибка создания таблицы ${table.name}:`, err.message);
      callback(err);
      return;
    }
    createTables(index + 1, callback);
  });
};

// Вставка начальных данных
const seedDatabase = (callback) => {
  // Примеры акселераторов
  db.run(`INSERT OR IGNORE INTO accelerators (name, description, website, programs) VALUES 
    ('Удмуртский акселератор', 'Поддержка стартапов в Удмуртии', 'https://example.com', 'Программа для подростков, Менторство'),
    ('Сбер Акселератор', 'Акселератор от Сбербанка', 'https://sber.ru', 'Инкубатор, Финансирование'),
    ('Акселератор Удмуртии', 'Региональная программа поддержки', 'https://example.com', 'Гранты, Обучение')`, (err) => {
    if (err) {
      console.error('Ошибка вставки акселераторов:', err.message);
      callback(err);
      return;
    }

    // Примеры наставников
    db.run(`INSERT OR IGNORE INTO mentors (name, specialization, bio, experience_years) VALUES 
      ('Иван Петров', 'Маркетинг и продажи', 'Опытный маркетолог с 10-летним стажем', 10),
      ('Мария Сидорова', 'Финансы и учет', 'Финансовый консультант, помогает молодым предпринимателям', 8),
      ('Алексей Иванов', 'IT и технологии', 'Основатель IT-стартапа, эксперт по технологиям', 12)`, (err) => {
      if (err) {
        console.error('Ошибка вставки наставников:', err.message);
        callback(err);
        return;
      }

      // Примеры грантов
      db.run(`INSERT OR IGNORE INTO grants (title, description, amount, deadline, requirements) VALUES 
        ('Грант для молодых предпринимателей', 'Поддержка бизнес-проектов подростков', 'до 500 000 руб', '2024-12-31', 'Возраст 14-18 лет, наличие бизнес-плана'),
        ('Стартовый грант Удмуртии', 'Финансирование новых проектов', 'до 300 000 руб', '2024-11-30', 'Регистрация в Удмуртии, возраст до 25 лет')`, (err) => {
        if (err) {
          console.error('Ошибка вставки грантов:', err.message);
          callback(err);
          return;
        }

        // Вставка тестовых пользователей (email login)
        // Пароль для обоих: password123
        const bcrypt = require('bcryptjs');
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync('password123', salt);

        db.run(`INSERT OR IGNORE INTO users (email, password_hash, role, first_name) VALUES 
          ('admin@example.com', ?, 'admin', 'Super Admin'),
          ('startup@example.com', ?, 'startup', 'Ivan Startup')`, [hash, hash], (err) => {
          if (err) {
            console.error('Ошибка вставки пользователей:', err.message);
          } else {
            console.log('✅ Тестовые пользователи добавлены (пароль: password123)');
          }
          console.log('✅ Начальные данные добавлены');
          callback();
        });
      });
    });
  });
};

module.exports = {
  db,
  initDatabase: (callback) => {
    // Используем serialize для правильной последовательности операций
    db.serialize(() => {
      createTables(0, (err) => {
        if (err) {
          console.error('❌ Ошибка при создании таблиц:', err.message);
          if (callback) callback(err);
          return;
        }
        seedDatabase((err) => {
          if (err) {
            console.error('❌ Ошибка при заполнении данных:', err.message);
            // Не критично, продолжаем работу
            if (callback) callback(null);
          } else {
            if (callback) callback(null);
          }
        });
      });
    });
  }
};

