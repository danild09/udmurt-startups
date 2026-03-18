const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Ошибка подключения к БД:', err.message);
        return;
    }
    console.log('Подключено к базе данных.');

    db.run("ALTER TABLE lessons ADD COLUMN format TEXT DEFAULT 'video'", (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Колонка format уже существует.');
            } else {
                console.error('Ошибка добавления колонки:', err.message);
            }
        } else {
            console.log('✅ Колонка format успешно добавлена в таблицу lessons.');
        }
        db.close();
    });
});
