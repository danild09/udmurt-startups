const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // try to add user_id to contacts
    db.run("ALTER TABLE contacts ADD COLUMN user_id INTEGER", (err) => {
        if (err && !err.message.includes('duplicate column')) console.log("Contacts 'user_id' error:", err.message);
        else console.log("Contacts 'user_id' column ensured.");
    });
    
    // try to add proof_link to products
    db.run("ALTER TABLE products ADD COLUMN proof_link TEXT", (err) => {
        if (err && !err.message.includes('duplicate column')) console.log("Products 'proof_link' error:", err.message);
        else console.log("Products 'proof_link' column ensured.");
    });

    // try to add project_id to products
    db.run("ALTER TABLE products ADD COLUMN project_id INTEGER", (err) => {
        if (err && !err.message.includes('duplicate column')) console.log("Products 'project_id' error:", err.message);
        else console.log("Products 'project_id' column ensured.");
    });
});

db.close();
