const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Admin Access Key
const adminKey = process.env.ADMIN_KEY || 'jamesdev';

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// ✅ Ensure data files exist
const usersPath = path.join(__dirname, 'users.json');
const suggestionsPath = path.join(__dirname, 'suggestions.json');

if (!fs.existsSync(usersPath)) fs.writeFileSync(usersPath, '[]');
if (!fs.existsSync(suggestionsPath)) fs.writeFileSync(suggestionsPath, '[]');

// ✅ User Tracking API
app.post('/track-user', (req, res) => {
  try {
    const { username = 'Guest', ip, userAgent } = req.body;
    if (!username) return res.status(400).send('Missing username');

    const users = JSON.parse(fs.readFileSync(usersPath));
    const alreadyExists = users.some(u => u.username === username);

    if (alreadyExists) {
      return res.status(200).send('User already logged in');
    }

    const user = {
      id: Date.now().toString(),
      username,
      ip: ip || req.ip,
      userAgent: userAgent || req.headers['user-agent'],
      timestamp: new Date().toISOString()
    };

    users.push(user);
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    res.status(200).send('✅ User tracked');
  } catch (err) {
    console.error('Error tracking user:', err);
    res.status(500).send('Internal server error');
  }
});

// ✅ Suggestion API
app.post('/suggest', (req, res) => {
  try {
    const { name, text } = req.body;
    if (!name || !text) return res.status(400).send('Missing fields');

    const suggestion = {
      name,
      text,
      timestamp: new Date().toISOString()
    };

    const suggestions = JSON.parse(fs.readFileSync(suggestionsPath));
    suggestions.push(suggestion);
    fs.writeFileSync(suggestionsPath, JSON.stringify(suggestions, null, 2));

    res.send('✅ Suggestion submitted');
  } catch (err) {
    console.error('Suggestion error:', err);
    res.status(500).send('Server error');
  }
});

// ✅ Admin routes (protected)
app.get('/admin/users', (req, res) => {
  if (req.query.key !== adminKey) return res.status(403).send('❌ Invalid key');
  const users = JSON.parse(fs.readFileSync(usersPath));
  res.json(users);
});

app.get('/admin/suggestions', (req, res) => {
  if (req.query.key !== adminKey) return res.status(403).send('❌ Invalid key');
  const suggestions = JSON.parse(fs.readFileSync(suggestionsPath));
  res.json(suggestions);
});

// ❌ 404 fallback
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 TERMINATOR server live at http://localhost:${PORT}`);
});