import express from 'express'
import sqlite3 from 'sqlite3'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))

const db = new sqlite3.Database('./users.db')

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password TEXT, isAdmin BOOLEAN DEFAULT 0)")
  
  // Add demo user
  const demoEmail = 'demo@example.com'
  const demoPassword = 'password123'
  const hashedDemoPassword = bcrypt.hashSync(demoPassword, 10)
  
  // Add admin user
  const adminEmail = 'editor'
  const adminPassword = 'editor123'
  const hashedAdminPassword = bcrypt.hashSync(adminPassword, 10)
  
  db.get("SELECT * FROM users WHERE email = ?", [demoEmail], (err, user) => {
    if (err) {
      console.error('Error checking for demo user:', err)
    } else if (!user) {
      db.run("INSERT INTO users (email, password, isAdmin) VALUES (?, ?, 0)", [demoEmail, hashedDemoPassword], (err) => {
        if (err) {
          console.error('Error creating demo user:', err)
        } else {
          console.log('Demo user created successfully')
        }
      })
    } else {
      console.log('Demo user already exists')
    }
  })

  db.get("SELECT * FROM users WHERE email = ?", [adminEmail], (err, user) => {
    if (err) {
      console.error('Error checking for admin user:', err)
    } else if (!user) {
      db.run("INSERT INTO users (email, password, isAdmin) VALUES (?, ?, 1)", [adminEmail, hashedAdminPassword], (err) => {
        if (err) {
          console.error('Error creating admin user:', err)
        } else {
          console.log('Admin user created successfully')
        }
      })
    } else {
      console.log('Admin user already exists')
    }
  })
})

const SECRET_KEY = 'your_secret_key' // In a real app, use an environment variable

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

app.post('/api/register', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" })
  }
  const hashedPassword = bcrypt.hashSync(password, 10)

  db.run("INSERT INTO users (email, password, isAdmin) VALUES (?, ?, 0)", [email, hashedPassword], (err) => {
    if (err) {
      console.error('Error registering user:', err)
      return res.status(400).json({ message: "User already exists or an error occurred" })
    }
    res.status(201).json({ message: "User created successfully" })
  })
})

app.post('/api/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" })
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) {
      console.error('Error during login:', err)
      return res.status(500).json({ message: "Server error" })
    }
    if (!user) {
      return res.status(400).json({ message: "User not found" })
    }
    const validPassword = bcrypt.compareSync(password, user.password)
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" })
    }
    const token = jwt.sign({ id: user.id, email: user.email, isAdmin: user.isAdmin }, SECRET_KEY, { expiresIn: '1h' })
    res.json({ token, isAdmin: user.isAdmin, message: "Logged in successfully" })
  })
})

app.get('/api/user', authenticateToken, (req, res) => {
  res.json({ email: req.user.email, isAdmin: req.user.isAdmin })
})

const PORT = 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))