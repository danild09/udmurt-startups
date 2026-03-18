const TelegramBot = require('node-telegram-bot-api');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const token = process.env.TELEGRAM_BOT_TOKEN;
let bot = null;

const dbPath = process.env.DB_DIR ? path.join(process.env.DB_DIR, 'database.sqlite') : path.join(__dirname, 'database', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// In-memory status
const userStates = new Map();

const grantsData = [
  { id: 1, title: 'Грант "Студенческий стартап"', info: 'До 1 млн рублей на реализацию бизнес-идеи.' },
  { id: 2, title: 'Субсидия для молодых предпринимателей (до 25 лет)', info: 'От 100 до 500 тыс. рублей на развитие бизнеса.' }
];

const eventsData = [
  { id: 1, title: 'Форум "Сделано в Удмуртии"', date: '15 Сентября' },
  { id: 2, title: 'Акселератор "Бизнес-старт"', date: 'Октябрь-Ноябрь' }
];

const mainMenu = {
  reply_markup: {
    keyboard: [
      ['🔑 Войти на сайт', '🚪 Войти по Email'],
      ['🔍 Поиск (База знаний)', '✍️ Оставить отзыв']
    ],
    resize_keyboard: true
  }
};

const searchMenu = {
  reply_markup: {
    keyboard: [
      ['💰 Гранты', '📅 Мероприятия'],
      ['⬅️ Назад в меню']
    ],
    resize_keyboard: true
  }
};

const backOnlyMenu = {
  reply_markup: {
    keyboard: [
      ['⬅️ Назад в меню']
    ],
    resize_keyboard: true
  }
};

if (token) {
    try {
        bot = new TelegramBot(token, { polling: true });
        
        // /start COMMAND
        bot.onText(/\/start(.*)/, (msg, match) => {
            const chatId = msg.chat.id;
            const linkCode = match[1] ? match[1].trim() : null;

            userStates.delete(chatId);

            if (linkCode) {
                // Пытаемся привязать по ссылке из ЛК
                db.get('SELECT * FROM users WHERE telegram_link_code = ?', [linkCode], (err, user) => {
                    if (err) return bot.sendMessage(chatId, '❌ Ошибка базы данных.', mainMenu);
                    
                    if (user) {
                        db.run('UPDATE users SET telegram_chat_id = ?, telegram_link_code = NULL WHERE id = ?', [chatId, user.id], (err) => {
                            if (err) return bot.sendMessage(chatId, '❌ Ошибка при привязке аккаунта.', mainMenu);
                            bot.sendMessage(chatId, `✅ Успешно! Ваш аккаунт (email: ${user.email}) привязан к этому Telegram. Теперь вы будете получать уведомления здесь.`, mainMenu);
                        });
                    } else {
                        // Попробуем старый метод link_
                        if (linkCode.startsWith('link_')) {
                            const userId = linkCode.split('_')[1];
                            db.get('SELECT * FROM users WHERE id = ?', [userId], (err, u) => {
                                if (err || !u) return bot.sendMessage(chatId, '❌ Ошибка привязки аккаунта: пользователь не найден.', mainMenu);
                                db.run('UPDATE users SET telegram_id = ? WHERE id = ?', [chatId.toString(), userId], (err) => {
                                    if (err) return bot.sendMessage(chatId, '❌ Ошибка базы данных при привязке.', mainMenu);
                                    bot.sendMessage(chatId, `✅ Отлично, ${u.first_name || 'Пользователь'}! Ваш Telegram успешно привязан к аккаунту на сайте. Теперь вы можете входить в один клик.`, mainMenu);
                                });
                            });
                        } else {
                            bot.sendMessage(chatId, '❌ Неверный или устаревший код привязки.', mainMenu);
                        }
                    }
                });
                return;
            }

            bot.sendMessage(
                chatId,
                'Привет! 👋 Я твой помощник в мире предпринимательства Удмуртии.\n\nЗдесь ты можешь в один клик авторизоваться на сайте, искать информацию о грантах и оставлять отзывы.\n\nВыбери нужное действие в меню ниже 👇',
                mainMenu
            );
        });

        // MESSAGES HANDLER
        bot.on('message', (msg) => {
            const chatId = msg.chat.id;
            const text = msg.text;
            if (!text || text.startsWith('/')) return;

            const userState = userStates.get(chatId);

            // Back to main menu
            if (text === '⬅️ Назад в меню') {
                userStates.delete(chatId);
                return bot.sendMessage(chatId, 'Вы вернулись в главное меню.', mainMenu);
            }



            // Search categories
            if (text === '🔍 Поиск (База знаний)') {
                return bot.sendMessage(chatId, 'Выберите категорию поиска:', searchMenu);
            }

            if (text === '💰 Гранты') {
                let response = '💰 *Доступные гранты и субсидии:*\n\n';
                grantsData.forEach(g => { response += `*${g.title}*\n${g.info}\n\n`; });
                return bot.sendMessage(chatId, response, { parse_mode: 'Markdown', ...searchMenu });
            }

            if (text === '📅 Мероприятия') {
                let response = '📅 *Ближайшие мероприятия:*\n\n';
                eventsData.forEach(e => { response += `*${e.title}* (${e.date})\n`; });
                return bot.sendMessage(chatId, response, { parse_mode: 'Markdown', ...searchMenu });
            }

            // Feedback
            if (text === '✍️ Оставить отзыв') {
                userStates.set(chatId, { state: 'AWAITING_FEEDBACK' });
                return bot.sendMessage(chatId, 'Напишите ваши пожелания, идеи или жалобы. Следующее ваше сообщение будет отправлено в службу поддержки в качестве официального тикета. 📝', backOnlyMenu);
            }



            // Magic Link Login
            if (text === '🔑 Войти на сайт') {
                const telegramId = msg.from.id.toString();
                const username = msg.from.username || '';
                const firstName = msg.from.first_name || '';
                const lastName = msg.from.last_name || '';

                db.get('SELECT * FROM users WHERE telegram_id = ? OR telegram_chat_id = ?', [telegramId, telegramId], (err, user) => {
                    if (err) return bot.sendMessage(chatId, 'Произошла ошибка при обращении к базе данных.');

                    const generateAndSendLink = (userId) => {
                        const linkToken = crypto.randomBytes(32).toString('hex');
                        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); 

                        db.run('INSERT INTO magic_links (token, user_id, expires_at) VALUES (?, ?, ?)', 
                            [linkToken, userId, expiresAt.toISOString()], 
                            (err) => {
                                if (err) return bot.sendMessage(chatId, 'Ошибка генерации ссылки для входа.');
                                const backendLink = `http://localhost:5000/api/auth/magic-link/${linkToken}`;
                                bot.sendMessage(chatId, 'Нажмите на кнопку ниже, чтобы мгновенно войти в личный кабинет на платформе. Ссылка действительна 15 минут ⏳', {
                                    reply_markup: {
                                        inline_keyboard: [[{ text: '🌐 Войти на платформу', url: backendLink }]]
                                    }
                                });
                        });
                    };

                    if (user) {
                        generateAndSendLink(user.id);
                    } else {
                        db.run('INSERT INTO users (telegram_id, username, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
                            [telegramId, username, firstName, lastName, 'startup'],
                            function(err) {
                                if (err) return bot.sendMessage(chatId, 'Ошибка при автоматической регистрации.');
                                bot.sendMessage(chatId, '🎉 Мы автоматически создали для вас аккаунт на платформе!');
                                generateAndSendLink(this.lastID);
                            }
                        );
                    }
                });
                return;
            }

            // Email Link
            if (text === '🚪 Войти по Email') {
                userStates.set(chatId, { state: 'AWAITING_EMAIL' });
                return bot.sendMessage(chatId, 'Пожалуйста, введите ваш Email от аккаунта на сайте:', backOnlyMenu);
            }

            // STATE HANDLERS
            if (userState && userState.state === 'AWAITING_FEEDBACK') {
                userStates.delete(chatId);
                
                const telegramId = msg.from.id.toString();
                const defaultName = msg.from.first_name || msg.from.username || 'Пользователь Telegram';

                db.get('SELECT id, email, first_name, last_name FROM users WHERE telegram_id = ? OR telegram_chat_id = ?', [telegramId, chatId.toString()], (err, user) => {
                    const userId = user ? user.id : null;
                    const name = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || defaultName : defaultName;
                    const email = user ? user.email : null;
                    const phone = 'Из Telegram бота';

                    db.run('INSERT INTO contacts (user_id, name, email, phone, message) VALUES (?, ?, ?, ?, ?)', 
                        [userId, name, email, phone, text], 
                        (err) => {
                            if (err) console.error('Ошибка сохранения тикета поддержки:', err);
                            bot.sendMessage(chatId, '✨ Спасибо за ваш отзыв! Ваш тикет был доставлен в каталог Поддержки Администрации платформы.', mainMenu);
                        }
                    );
                });
                return;
            }

            if (userState && userState.state === 'AWAITING_EMAIL') {
                userStates.set(chatId, { state: 'AWAITING_PASSWORD', email: text });
                return bot.sendMessage(chatId, 'Отлично! Теперь введите пароль:');
            }

            if (userState && userState.state === 'AWAITING_PASSWORD') {
                const email = userState.email;
                const password = text;
                userStates.delete(chatId);
                
                db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
                    if (err) return bot.sendMessage(chatId, 'Ошибка при обращении к базе данных.', mainMenu);
                    if (!user) return bot.sendMessage(chatId, '❌ Пользователь с таким Email не найден.', mainMenu);
                    if (!user.password_hash) return bot.sendMessage(chatId, '❌ Вход по паролю недоступен для этого аккаунта.', mainMenu);

                    const isMatch = bcrypt.compareSync(password, user.password_hash);
                    if (!isMatch) return bot.sendMessage(chatId, '❌ Неверный пароль. Попробуйте снова через меню.', mainMenu);

                    db.run('UPDATE users SET telegram_chat_id = ? WHERE id = ?', [chatId.toString(), user.id], (err) => {
                        if (err) return bot.sendMessage(chatId, '❌ Ошибка базы данных при привязке.', mainMenu);
                        return bot.sendMessage(chatId, `✅ Успешно! Аккаунт (Email: ${email}) привязан к вашему Telegram.\nТеперь вы можете быстро входить на сайт по кнопке "🔑 Войти на сайт".`, mainMenu);
                    });
                });
                return;
            }

            // Fallback Search
            const lowerText = text.toLowerCase();
            if (lowerText.includes('грант') || lowerText.includes('субсиди')) {
                let response = '💰 *Доступные гранты и субсидии:*\n\n';
                grantsData.forEach(g => { response += `*${g.title}*\n${g.info}\n\n`; });
                return bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
            }

            if (lowerText.includes('мероприят') || lowerText.includes('форум') || lowerText.includes('акселератор')) {
                let response = '📅 *Ближайшие мероприятия:*\n\n';
                eventsData.forEach(e => { response += `*${e.title}* (${e.date})\n`; });
                return bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
            }

            bot.sendMessage(chatId, 'Я не нашел точной информации. Попробуйте выбрать нужную опцию в меню 👇', mainMenu);
        });

        console.log('✅ Telegram Bot успешно инициализирован.');
    } catch (e) {
        console.error('❌ Ошибка инициализации Telegram Bot:', e);
    }
} else {
    console.error('⚠️ TELEGRAM_BOT_TOKEN не задан в .env файле.');
}

const sendTelegramNotification = (userId, message) => {
    if (!bot) return;
    db.get('SELECT telegram_chat_id, telegram_id FROM users WHERE id = ?', [userId], (err, row) => {
        if (!err && row) {
            const chatId = row.telegram_chat_id || row.telegram_id;
            if (chatId) {
                bot.sendMessage(chatId, message).catch(e => console.error('Ошибка отправки в ТГ:', e.message));
            }
        }
    });
};

module.exports = {
    bot,
    sendTelegramNotification
};
