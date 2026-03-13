const { db, initDatabase } = require('./server/database/init');

console.log('Тестирование базы данных...\n');

initDatabase((err) => {
  if (err) {
    console.error('❌ Ошибка:', err.message);
    console.error('Полная ошибка:', err);
    process.exit(1);
  } else {
    console.log('\n✅ База данных успешно инициализирована!');
    
    // Проверяем таблицы
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
      if (err) {
        console.error('Ошибка при проверке таблиц:', err.message);
        process.exit(1);
      }
      
      console.log('\n📊 Созданные таблицы:');
      tables.forEach(table => {
        console.log(`  - ${table.name}`);
      });
      
      // Проверяем данные
      db.get('SELECT COUNT(*) as count FROM accelerators', [], (err, row) => {
        if (err) {
          console.error('Ошибка при проверке данных:', err.message);
        } else {
          console.log(`\n📦 Акселераторов в базе: ${row.count}`);
        }
        
        db.get('SELECT COUNT(*) as count FROM mentors', [], (err, row) => {
          if (err) {
            console.error('Ошибка при проверке данных:', err.message);
          } else {
            console.log(`📦 Наставников в базе: ${row.count}`);
          }
          
          db.get('SELECT COUNT(*) as count FROM grants', [], (err, row) => {
            if (err) {
              console.error('Ошибка при проверке данных:', err.message);
            } else {
              console.log(`📦 Грантов в базе: ${row.count}`);
            }
            
            db.close((err) => {
              if (err) {
                console.error('Ошибка при закрытии БД:', err.message);
              } else {
                console.log('\n✅ Тест завершен успешно!');
              }
              process.exit(0);
            });
          });
        });
      });
    });
  }
});

