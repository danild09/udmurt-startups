const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.run('INSERT INTO contacts (user_id, name, email, phone, message) VALUES (?, ?, ?, ?, ?)',
    [1, 'Test', 'test@test.com', '123', 'Hello'],
    function(err) {
      if (err) console.error('Contacts Insert Error:', err.message);
      else console.log('Contacts Insert Success');
});

db.run('INSERT INTO products (entrepreneur_id, name, description, price, category, proof_link) VALUES (?, ?, ?, ?, ?, ?)',
    [1, 'Name', 'Desc', 100, 'other', 'link'],
    function(err) {
      if (err) console.error('Products Insert Error:', err.message);
      else console.log('Products Insert Success');
});
