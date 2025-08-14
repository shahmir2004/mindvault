require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabase = require('./supabaseClient');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'https://mindvault-delta.vercel.app', // Your actual Vercel production URL
  'http://localhost:5173'             // Your local development environment for testing
];

const corsOptions = {
  origin: function (origin, callback) {
    // The `!origin` check allows for server-to-server requests or REST clients like Postman
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('This origin is not allowed by CORS policy.'));
    }
  },
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// --- NEW AUTHENTICATION MIDDLEWARE ---
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = user; // Attach user to the request object
  next(); // Proceed to the next middleware or route handler
};

// Apply the auth middleware to all routes that need protection
app.use('/api/items', authMiddleware);
app.use('/api/search', authMiddleware);
// --- END AUTHENTICATION MIDDLEWARE ---

app.get('/api/health', (req, res) => {
  res.json({ message: "Server is healthy and running!" });
});

// GET /api/items is now automatically filtered by RLS, no code change needed
app.get('/api/items', async (req, res) => {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/items now uses the user's ID from the middleware
app.post('/api/items', async (req, res) => {
  const { url } = req.body;
  const user_id = req.user.id; // Get user ID from the middleware

  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    const { data: html } = await axios.get(url, { headers: { /* ... headers ... */ }});
    const $ = cheerio.load(html);
    const title = $('title').text();
    $('script, style').remove();
    const content = $('body').text().replace(/\s\s+/g, ' ').trim();

    if (!content) return res.status(400).json({ error: "Could not extract content." });

    const { data: savedItem, error } = await supabase
      .from('items')
      .insert([{ url, title, content, user_id }]) // Add user_id here
      .select()
      .single();

    if (error) throw new Error(error.message);
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ error: `Failed to process URL. ${error.message}` });
  }
});

// GET /api/search is also automatically filtered by RLS
app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Search query "q" is required.' });

  const { data, error } = await supabase.rpc('search_items', { search_term: q });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));