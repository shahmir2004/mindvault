// backend/server.js
require('dotenv').config();
const scraperService = require('./scraperService');
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

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // Step 1: Fetch the raw HTML from the URL
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      }
    });

    // Step 2: Use our new modular service to extract the clean article content
    const article = scraperService.extractArticle(html, url);

    if (!article || !article.textContent) {
      return res.status(400).json({ error: "Could not extract readable content from the URL." });
    }

    // Step 3: Save the CLEAN data to Supabase
    const { data: savedItem, error } = await req.supabase
      .from('items')
      .insert([
        { 
          url: url,
          title: article.title,         // Use the clean title from Readability
          content: article.textContent, // Use the clean plain text for searching
          user_id: user_id,
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message); // Will be caught by the catch block
    }

    // Step 4: Return the newly created item
    res.status(201).json(savedItem);

  } catch (error) {
    // This will catch network errors (from axios) or database errors
    console.error(`Failed to process URL ${url}:`, error.message);
    let errorMessage = 'Failed to process URL.';
    if(error.response && error.response.status) {
        errorMessage = `Failed to fetch URL. Server responded with status ${error.response.status}.`
    }
    return res.status(500).json({ error: errorMessage });
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