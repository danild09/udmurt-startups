const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.all("SELECT id, name, status FROM products", (err, rows) => {
        console.log("Products:", rows);
    });
    db.all("SELECT id, message, status FROM contacts", (err, rows) => {
        console.log("Contacts:", rows);
    });
});
db.close();
