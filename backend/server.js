require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabase = require('./supabaseClient'); // Import our new client

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
  
  const { data, error } = await supabase
    .from('items')
    .insert([{ url: url }])
    .select() // This returns the newly created row
    .single(); // We expect a single object back

  if (error) {
    console.error("Error creating item:", error);
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

// === START THE SERVER ===
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});