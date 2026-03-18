const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run("ALTER TABLE contacts ADD COLUMN reply TEXT", (err) => {
        if (err) {
            console.log("Error adding reply column to contacts:", err.message);
        } else {
            console.log("Successfully added reply column to contacts.");
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS chats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      buyer_id INTEGER,
      seller_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if(err) console.log(err.message);
        else console.log('chats table created');
    });

    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id INTEGER,
      sender_id INTEGER,
      text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if(err) console.log(err.message);
        else console.log('messages table created');
    });
});
db.close();
