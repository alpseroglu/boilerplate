const express = require('express');
const serverless = require('serverless-http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = 'your_secret_key'; // In a real app, use an environment variable

// Mock database
const users = [
  { id: 1, email: 'demo@example.com', password: bcrypt.hashSync('password123', 10), isAdmin: false },
  { id: 2, email: 'editor', password: bcrypt.hashSync('editor123', 10), isAdmin: true }
];

app.post('/api/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = { id: users.length + 1, email, password: hashedPassword, isAdmin: false };
  users.push(newUser);
  res.status(201).json({ message: "User created successfully" });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ message: "Invalid password" });
  }
  const token = jwt.sign({ id: user.id, email: user.email, isAdmin: user.isAdmin }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token, isAdmin: user.isAdmin, message: "Logged in successfully" });
});

app.get('/api/user', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    res.json({ email: user.email, isAdmin: user.isAdmin });
  });
});

module.exports.handler = serverless(app);