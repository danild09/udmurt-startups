const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run("ALTER TABLE users ADD COLUMN date_of_birth DATE", (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('Column date_of_birth already exists.');
      } else {
        console.error('Error adding column:', err.message);
      }
    } else {
      console.log('Successfully added date_of_birth to users table.');
    }
  });
});

db.close();
