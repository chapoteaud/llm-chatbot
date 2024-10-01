import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'users.db'));

// Initialize the database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    isAdmin INTEGER
  )
`);

// Check if admin user exists, if not create it
const adminUser = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
if (!adminUser) {
  db.prepare('INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)').run('admin', 'password', 1);
}

export function getUser(username: string) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

export function createUser(username: string, password: string, isAdmin: boolean = false) {
  try {
    db.prepare('INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)').run(username, password, isAdmin ? 1 : 0);
    return true;
  } catch (error) {
    console.error('Error creating user:', error);
    return false;
  }
}

export function getAllUsers() {
  return db.prepare('SELECT id, username, isAdmin FROM users').all();
}
