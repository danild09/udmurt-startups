const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Ошибка подключения к БД:', err.message);
        return;
    }
    console.log('Подключено к базе данных для сидирования уроков.');

    const lessons = [
        {
            title: 'Основы маркетинга для стартапа (Видео)',
            description: 'Пошаговый разбор маркетинговых стратегий для начинающего бизнеса.',
            video_url: 'dummy_video',
            duration: '45',
            category: 'marketing',
            format: 'video'
        },
        {
            title: 'Введение в маркетинг (Текст)',
            description: 'Базовые понятия и термины продвижения продуктов.',
            video_url: '/summary.html',
            duration: '10 стр',
            category: 'marketing',
            format: 'document'
        },
        {
            title: 'Финансовая грамотность: Бюджетирование (Видео)',
            description: 'Как правильно вести учет расходов и доходов.',
            video_url: 'dummy_video',
            duration: '60',
            category: 'finance',
            format: 'video'
        },
        {
            title: 'Финансовое моделирование (Текст)',
            description: 'Шаблоны и методики финансового планирования.',
            video_url: '/summary.html',
            duration: '15 стр',
            category: 'finance',
            format: 'document'
        },
        {
            title: 'Управление командой и временем (Видео)',
            description: 'Методологии Agile и Scrum для малых команд.',
            video_url: 'dummy_video',
            duration: '50',
            category: 'management',
            format: 'video'
        },
        {
            title: 'Инструменты управления проектами (Текст)',
            description: 'Сравнительный анализ систем трекинга задач.',
            video_url: '/summary.html',
            duration: '5 стр',
            category: 'management',
            format: 'document'
        }
    ];

    db.serialize(() => {
        // Очищаем старые тестовые данные
        db.run('DELETE FROM lessons', (err) => {
            if (err) console.error('Ошибка очистки:', err.message);
        });

        const stmt = db.prepare('INSERT INTO lessons (title, description, video_url, duration, category, format) VALUES (?, ?, ?, ?, ?, ?)');
        
        lessons.forEach(l => {
            stmt.run(l.title, l.description, l.video_url, l.duration, l.category, l.format, (err) => {
                if (err) console.error('Ошибка вставки:', err.message);
            });
        });
        
        stmt.finalize(() => {
            console.log('✅ Данные уроков успешно добавлены.');
            db.close();
        });
    });
});
