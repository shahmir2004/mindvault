require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabase = require('./supabaseClient'); // Import our new client
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 5000;

// === MIDDLEWARE ===
app.use(cors());
app.use(express.json());

// === ROUTES ===
app.get('/api/health', (req, res) => {
  res.json({ message: "Server is healthy and running!" });
});

// GET ALL ITEMS (rewritten for Supabase)
app.get('/api/items', async (req, res) => {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false }); // Show newest first

  if (error) {
    console.error("Error fetching items:", error);
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// CREATE AN ITEM (rewritten for Supabase)
app.post('/api/items', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // 1. Fetch the HTML from the provided URL
    const { data: html } = await axios.get(url, {
      // Some sites block requests without a common User-Agent
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // 2. Load the HTML into Cheerio to parse it
    const $ = cheerio.load(html);

    // 3. Extract the title and content
    // The page title is usually inside the <title> tag
    const title = $('title').text();

    // For content, we'll take all the text from the <body> tag.
    // This is a naive approach but great for an MVP.
    // We remove script and style tags to clean it up a bit.
    $('script, style').remove();
    const content = $('body').text().replace(/\s\s+/g, ' ').trim(); // Remove extra whitespace

    if (!content) {
      return res.status(400).json({ error: "Could not extract content from the URL." });
    }

    // 4. Save the extracted data to Supabase
    const { data: savedItem, error } = await supabase
      .from('items')
      .insert([
        { 
          url: url,
          title: title,
          content: content 
        }
      ])
      .select()
      .single();

    if (error) {
      // This will catch database-related errors
      throw new Error(error.message);
    }

    // 5. Return the full saved item
    res.status(201).json(savedItem);

  } catch (error) {
    // This will catch network errors (from axios) or parsing errors
    console.error("Error processing URL:", error.message);
    return res.status(500).json({ error: `Failed to process URL. ${error.message}` });
  }
});

// === START THE SERVER ===
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});