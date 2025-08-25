const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor TEXT,
    order_id TEXT,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert dummy order
  db.run(`INSERT INTO orders (vendor, order_id, details) VALUES (?, ?, ?)`,
    ["Zomato", "ORD123", "2x Pizza, 1x Coke"]
  );
});

module.exports = db;
