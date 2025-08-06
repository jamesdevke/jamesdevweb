const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const USERS_FILE = path.join(__dirname, 'users.json');
const SUGGESTIONS_FILE = path.join(__dirname, 'suggestions.json');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/admin', express.static('admin'));

// Log User
app.post('/log-user', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });

  const users = fs.existsSync(USERS_FILE)
    ? JSON.parse(fs.readFileSync(USERS_FILE))
    : [];

  const record = {
    username,
    timestamp: new Date().toISOString()
  };

  users.push(record);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ success: true });
});

// Handle Suggestions
app.post('/suggest', (req, res) => {
  const { name, text } = req.body;
  if (!name || !text) return res.status(400).send('Name and suggestion are required');

  const suggestions = fs.existsSync(SUGGESTIONS_FILE)
    ? JSON.parse(fs.readFileSync(SUGGESTIONS_FILE))
    : [];

  suggestions.push({
    name,
    suggestion: text,
    timestamp: new Date().toISOString()
  });

  fs.writeFileSync(SUGGESTIONS_FILE, JSON.stringify(suggestions, null, 2));
  res.send('✅ Suggestion submitted successfully');
});

// Admin View Users
app.get('/admin/users', (req, res) => {
  const adminKey = req.query.key;
  if (adminKey !== process.env.ADMIN_KEY) return res.status(403).json({ error: 'Forbidden' });

  const data = fs.existsSync(USERS_FILE) ? JSON.parse(fs.readFileSync(USERS_FILE)) : [];
  res.json(data);
});

// Admin View Suggestions
app.get('/admin/suggestions', (req, res) => {
  const adminKey = req.query.key;
  if (adminKey !== process.env.ADMIN_KEY) return res.status(403).json({ error: 'Forbidden' });

  const data = fs.existsSync(SUGGESTIONS_FILE) ? JSON.parse(fs.readFileSync(SUGGESTIONS_FILE)) : [];
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});