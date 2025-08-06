const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const adminKey = process.env.ADMIN_KEY || 'jamesdev';

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Ensure data files exist
const ensureFile = (file) => {
  if (!fs.existsSync(file)) fs.writeFileSync(file, '[]');
};

ensureFile(path.join(__dirname, 'users.json'));
ensureFile(path.join(__dirname, 'suggestions.json'));

// 📥 Suggestion Handler
app.post('/suggest', (req, res) => {
  const { name, text } = req.body;
  if (!name || !text) return res.status(400).send('Missing fields');

  const suggestion = {
    name,
    text,
    timestamp: new Date().toISOString()
  };

  const file = path.join(__dirname, 'suggestions.json');
  const suggestions = JSON.parse(fs.readFileSync(file));
  suggestions.push(suggestion);
  fs.writeFileSync(file, JSON.stringify(suggestions, null, 2));
  res.send('✅ Suggestion submitted successfully!');
});

// 🧠 User Tracking
app.post('/track-user', (req, res) => {
  const { username = 'Guest', ip, userAgent } = req.body;

  const user = {
    id: Date.now().toString(),
    username,
    ip,
    userAgent,
    timestamp: new Date().toISOString()
  };

  const file = path.join(__dirname, 'users.json');
  const users = JSON.parse(fs.readFileSync(file));
  users.push(user);
  fs.writeFileSync(file, JSON.stringify(users, null, 2));
  res.sendStatus(200);
});

// 🔐 Admin Routes (protected with key)

// Get user logs
app.get('/admin/users', (req, res) => {
  if (req.query.key !== adminKey) return res.status(403).send('❌ Forbidden: Invalid key');
  const file = path.join(__dirname, 'users.json');
  const users = JSON.parse(fs.readFileSync(file));
  res.json(users);
});

// Get suggestions
app.get('/admin/suggestions', (req, res) => {
  if (req.query.key !== adminKey) return res.status(403).send('❌ Forbidden: Invalid key');
  const file = path.join(__dirname, 'suggestions.json');
  const suggestions = JSON.parse(fs.readFileSync(file));
  res.json(suggestions);
});

// ⛔ 404 Fallback
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 TERMINATOR server running at http://localhost:${PORT}`);
});