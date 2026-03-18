const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('--- Adding Accelerators ---');

const accelerators = [
    {
        name: 'Сбер (Sber500)',
        description: 'Международный акселератор Сбера и 500 Global для ИТ-стартапов. Помогаем масштабировать бизнес, привлекать инвестиции и находить клиентов.',
        logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Sberbank_Logo_2020.svg/1200px-Sberbank_Logo_2020.svg.png',
        website: 'https://sber500.sberbank.ru/',
        programs: 'Основная программа акселерации, воркшопы, нетворкинг.'
    },
    {
        name: 'Акселератор Удмуртии',
        description: 'Региональная программа поддержки технологических предпринимателей. Гранты, льготные кредиты и сопровождение проектов.',
        logo_url: 'https://madeinudmurtia.ru/upload/iblock/c38/c38a20e23e67098e9b429d71a1c97a2f.png',
        website: 'https://madeinudmurtia.ru/',
        programs: 'Экспортный акселератор, промышленный туризм, бизнес-песочница.'
    }
];

db.serialize(() => {
    accelerators.forEach(acc => {
        db.run('INSERT OR IGNORE INTO accelerators (name, description, logo_url, website, programs) VALUES (?, ?, ?, ?, ?)', 
            [acc.name, acc.description, acc.logo_url, acc.website, acc.programs], 
            function(err) {
                if (err) {
                    console.error('❌ Error adding ' + acc.name + ':', err.message);
                } else {
                    console.log('✅ Added: ' + acc.name);
                }
            }
        );
    });
});

setTimeout(() => {
    db.close();
    console.log('--- Done ---');
}, 2000);
