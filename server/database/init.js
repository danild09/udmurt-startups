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
      date_of_birth DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  },
  {
    name: 'magic_links',
    sql: `CREATE TABLE IF NOT EXISTS magic_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT UNIQUE,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
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
      name TEXT UNIQUE NOT NULL,
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
      name TEXT UNIQUE NOT NULL,
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
      status TEXT DEFAULT 'pending',
      proof_link TEXT,
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
      format TEXT,
      resources TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  },
  {
    name: 'contacts',
    sql: `CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      message TEXT,
      status TEXT DEFAULT 'pending',
      reply TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`
  },
  {
    name: 'contests',
    sql: `CREATE TABLE IF NOT EXISTS contests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      deadline DATE,
      prize TEXT,
      requirements TEXT,
      link TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  },
  {
    name: 'programs',
    sql: `CREATE TABLE IF NOT EXISTS programs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      duration TEXT,
      format TEXT,
      requirements TEXT,
      link TEXT,
      category TEXT DEFAULT 'training',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  },
  {
    name: 'grant_applications',
    sql: `CREATE TABLE IF NOT EXISTS grant_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      grant_id INTEGER NOT NULL,
      project_name TEXT NOT NULL,
      project_description TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (grant_id) REFERENCES grants(id)
    )`
  },
  {
    name: 'mentorship_requests',
    sql: `CREATE TABLE IF NOT EXISTS mentorship_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      mentor_id INTEGER NOT NULL,
      message TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (mentor_id) REFERENCES mentors(id)
    )`
  },
  {
    name: 'projects',
    sql: `CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      stage TEXT,
      target_audience TEXT,
      monetization_model TEXT,
      proof_link TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`
  },
  {
    name: 'success_stories',
    sql: `CREATE TABLE IF NOT EXISTS success_stories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
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
      // Удалена вставка заспамленных данных (уроки, гранты, кураторы).
      callback();
    }
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

