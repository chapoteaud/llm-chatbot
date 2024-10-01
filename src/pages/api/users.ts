import { NextApiRequest, NextApiResponse } from 'next'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import jwt from 'jsonwebtoken'
import requestIp from 'request-ip'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

async function openDb() {
  return open({
    filename: './users.db',
    driver: sqlite3.Database
  })
}

async function initDb() {
  const db = await openDb()
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      isAdmin INTEGER
    )
  `)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      token TEXT,
      ip TEXT,
      userAgent TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `)
  const adminUser = await db.get('SELECT * FROM users WHERE username = ?', 'admin')
  if (!adminUser) {
    await db.run('INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)', 'admin', 'password', 1)
  }
  await db.close()
}

initDb()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = await openDb()

  if (req.method === 'GET') {
    const users = await db.all('SELECT id, username, isAdmin FROM users')
    await db.close()
    res.status(200).json(users)
  } else if (req.method === 'POST') {
    const { username, password } = req.body
    try {
      await db.run('INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)', username, password, 0)
      await db.close()
      res.status(201).json({ message: 'User created successfully' })
    } catch (error) {
      await db.close()
      res.status(500).json({ message: 'Failed to create user' })
    }
  } else if (req.method === 'PUT' && req.body.action === 'login') {
    const { username, password } = req.body
    const user = await db.get('SELECT * FROM users WHERE username = ?', username)
    if (user && user.password === password) {
      const token = jwt.sign({ userId: user.id, username: user.username, isAdmin: user.isAdmin === 1 }, JWT_SECRET, { expiresIn: '1h' })
      const ip = requestIp.getClientIp(req) || 'Unknown'
      const userAgent = req.headers['user-agent'] || 'Unknown'
      await db.run('INSERT INTO sessions (userId, token, ip, userAgent) VALUES (?, ?, ?, ?)', user.id, token, ip, userAgent)
      await db.close()
      res.status(200).json({ isAuthenticated: true, isAdmin: user.isAdmin === 1, token })
    } else {
      await db.close()
      res.status(401).json({ isAuthenticated: false })
    }
  } else {
    await db.close()
    res.status(405).json({ message: 'Method not allowed' })
  }
}