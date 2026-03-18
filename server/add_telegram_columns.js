const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Ошибка подключения к БД:', err.message);
        return;
    }
    console.log('Подключено к базе данных для миграции Telegram.');

    db.serialize(() => {
        db.run('ALTER TABLE users ADD COLUMN telegram_chat_id TEXT', (err) => {
            if (err) {
                if (err.message.includes('duplicate column name')) {
                    console.log('Колонка telegram_chat_id уже существует.');
                } else {
                    console.error('Ошибка добавления telegram_chat_id:', err.message);
                }
            } else {
                console.log('Колонка telegram_chat_id успешно добавлена.');
            }
        });

        db.run('ALTER TABLE users ADD COLUMN telegram_link_code TEXT', (err) => {
            if (err) {
                if (err.message.includes('duplicate column name')) {
                    console.log('Колонка telegram_link_code уже существует.');
                } else {
                    console.error('Ошибка добавления telegram_link_code:', err.message);
                }
            } else {
                console.log('Колонка telegram_link_code успешно добавлена.');
            }
            
            // Закрываем соединение после выполнения обеих команд
            db.close((err) => {
                if (err) {
                    console.error('Ошибка закрытия БД:', err.message);
                } else {
                    console.log('Миграция завершена. Соединение закрыто.');
                }
            });
        });
    });
});
