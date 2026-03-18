const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  const dummyAccelerators = ['Удмуртский акселератор', 'Сбер Акселератор', 'Акселератор Удмуртии'];
  const dummyMentors = ['Иван Петров', 'Мария Сидорова', 'Алексей Иванов'];
  const dummyGrants = ['Грант для молодых предпринимателей', 'Стартовый грант Удмуртии'];
  const dummyLessons = [
    'Основы маркетинга для стартапов',
    'Что такое Customer Development (CustDev)?',
    'Финансы для нефинансистов',
    'Привлечение первых инвестиций',
    'Управление командой и Agile',
    'Тайм-менеджмент фаундера'
  ];

  db.run(`DELETE FROM accelerators WHERE name IN (${dummyAccelerators.map(n => '?').join(',')})`, dummyAccelerators);
  db.run(`DELETE FROM mentors WHERE name IN (${dummyMentors.map(n => '?').join(',')})`, dummyMentors);
  db.run(`DELETE FROM grants WHERE title IN (${dummyGrants.map(n => '?').join(',')})`, dummyGrants);
  db.run(`DELETE FROM lessons WHERE title IN (${dummyLessons.map(n => '?').join(',')})`, dummyLessons);

  console.log('Dummy data cleaned up.');
});

db.close();
