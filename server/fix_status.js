const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Add status column if it doesn't exist
    ['products', 'contacts', 'success_stories', 'mentorship_requests', 'grant_applications'].forEach(table => {
        db.run(`ALTER TABLE ${table} ADD COLUMN status TEXT DEFAULT 'pending'`, (err) => {
            if (err && !err.message.includes('duplicate column')) console.log(`Error adding status to ${table}:`, err.message);
        });
        db.run(`UPDATE ${table} SET status = 'pending' WHERE status IS NULL`, (err) => {
            if (err) console.log(`Error updating status in ${table}:`, err.message);
        });
    });
});
db.close();
