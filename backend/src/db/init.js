import { db } from './sqlite.js';

export async function initDb(){
  db.exec(`
    CREATE TABLE IF NOT EXISTS vendors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendor_id INTEGER,
      platform TEXT,
      order_id TEXT,
      customer_name TEXT,
      customer_phone TEXT,
      address TEXT,
      items TEXT,
      total_amount REAL,
      status TEXT DEFAULT 'NEW',
      source_email_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(vendor_id) REFERENCES vendors(id)
    );
  `);

  const count = db.prepare('SELECT COUNT(*) as c FROM vendors').get().c;
  if(count === 0){
    const insert = db.prepare('INSERT INTO vendors (name, email) VALUES (?,?)');
    insert.run('Pait Pooja', 'paitpooja.orders@gmail.com');
    insert.run('MIG Mayo', 'migmayo.orders@gmail.com');
  }
}
