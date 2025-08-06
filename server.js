const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const USERS_FILE = path.join(__dirname, 'users.json');
const SUGGESTIONS_FILE = path.join(__dirname, 'suggestions.json');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/admin', express.static('admin'));

// Save new user
app.post('/log-user', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });

  const data = fs.existsSync(USERS_FILE)
    ? JSON.parse(fs.readFileSync(USERS_FILE))
    : [];

  const record = {
    username,
    timestamp: new Date().toISOString()
  };

  data.push(record);
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

// Save new suggestion
app.post('/send-suggestion', (req, res) => {
  const { name, text } = req.body;
  if (!name || !text) return res.status(400).json({ error: 'Invalid input' });

  const suggestions = fs.existsSync(SUGGESTIONS_FILE)
    ? JSON.parse(fs.readFileSync(SUGGESTIONS_FILE))
    : [];

  const newSuggestion = {
    name,
    text,
    timestamp: new Date().toISOString(),
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
  };

  suggestions.push(newSuggestion);
  fs.writeFileSync(SUGGESTIONS_FILE, JSON.stringify(suggestions, null, 2));
  res.json({ success: true });
});

// Admin: View users
app.get('/admin/users', (req, res) => {
  const adminKey = req.query.key;
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const data = fs.existsSync(USERS_FILE)
    ? JSON.parse(fs.readFileSync(USERS_FILE))
    : [];

  res.json(data);
});

// Admin: View suggestions
app.get('/admin/suggestions', (req, res) => {
  const adminKey = req.query.key;
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const suggestions = fs.existsSync(SUGGESTIONS_FILE)
    ? JSON.parse(fs.readFileSync(SUGGESTIONS_FILE))
    : [];

  res.json(suggestions);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});