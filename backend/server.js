// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
// We will now import createClient directly to make per-request clients
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS CONFIGURATION (Use your verified one) ---
const corsOptions = {
  origin: (origin, callback) => {
    // Regex to allow any subdomain of vercel.app for your project
    const vercelPattern = /^https:\/\/mindvault.*\.vercel\.app$/;

    // The unique origin for your Chrome extension
    const extensionOrigin = 'chrome-extension://cjdeolopabbnjlcmpafkbhlibfjnknpc';

    // The whitelist of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
    ];

    // Check if the incoming origin is in the whitelist, matches the Vercel pattern,
    // or is the extension's origin. The `!origin` check allows for tools like Postman.
    if (!origin || allowedOrigins.includes(origin) || vercelPattern.test(origin) || origin === extensionOrigin) {
      callback(null, true);
    } else {
      callback(new Error('This origin is not allowed by CORS policy.'));
    }
  },
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// --- END CORS ---

app.use(express.json());

// --- NEW AUTHENTICATION MIDDLEWARE (Refactored) ---
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];

  // 1. Create a temporary Supabase client with the user's token
  // This client will have the user's permissions, NOT admin permissions.
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
    global: {
      headers: { Authorization: `Bearer ${token}` }
    }
  });

  // 2. Get the user's data from this temporary client
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // 3. Attach the user-scoped Supabase client to the request object
  // Now, every subsequent route handler will use this user-specific client.
  req.supabase = supabase;
  req.user = user;
  next();
};
// --- END AUTHENTICATION MIDDLEWARE ---

app.get('/api/health', (req, res) => {
  res.json({ message: "Server is healthy and running!" });
});

// --- PROTECTED ROUTES ---
// Apply the auth middleware to all routes that need protection
app.use('/api/items', authMiddleware);
app.use('/api/search', authMiddleware);

// GET ALL ITEMS (Now uses the user-scoped client from middleware)
app.get('/api/items', async (req, res) => {
  // Use the per-request client attached by the middleware
  const { data, error } = await req.supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// CREATE AN ITEM (Now uses the user-scoped client and user ID)
app.post('/api/items', async (req, res) => {
  const { url } = req.body;
  const user_id = req.user.id;

  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    const { data: html } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }});
    const $ = cheerio.load(html);
    const title = $('title').text();
    $('script, style').remove();
    const content = $('body').text().replace(/\s\s+/g, ' ').trim();

    if (!content) return res.status(400).json({ error: "Could not extract content." });

    // Use the per-request client to insert data
    const { data: savedItem, error } = await req.supabase
      .from('items')
      .insert([{ url, title, content, user_id }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ error: `Failed to process URL. ${error.message}` });
  }
});



// SEARCH ITEMS (Now uses the user-scoped client)
app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Search query "q" is required.' });

  // Use the per-request client to call the database function
  // RLS is automatically applied to database function calls
  const { data, error } = await req.supabase.rpc('search_items', { search_term: q });
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));