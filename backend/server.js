// Import the 'dotenv' library to load environment variables
require('dotenv').config();

// Import the Express library
const express = require('express');
const cors = require('cors'); // <-- 1. IMPORT CORS

// Initialize an Express application
const app = express();

// Define the port the server will run on.
// It will try to use the PORT from the .env file, otherwise default to 5000.
const PORT = process.env.PORT || 5000;

// === MIDDLEWARE ===
app.use(cors()); // <-- 2. USE CORS. This must be before your routes.
// This allows our server to accept and parse JSON in request bodies
app.use(express.json());
const itemsDB = [];
let currentId = 1; 

// === ROUTES ===
// A simple test route to make sure everything is working
app.get('/api/health', (req, res) => {
  res.json({ message: "Server is healthy and running!" });
});

// === NEW ENDPOINT TO CREATE AN ITEM ===
app.post('/api/items', (req, res) => {
  // Get the URL from the request body
  const { url } = req.body;

  // Basic validation: make sure we got a URL
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  // For the MVP, we just store the URL.
  // In a future version, we would scrape the content here.
  const newItem = {
    id: currentId++,
    url: url,
    // In the future, we would add: text: scrapedText, title: scrapedTitle
    createdAt: new Date().toISOString()
  };

  // Add the new item to our "database"
  itemsDB.push(newItem);

  console.log("Database updated:", itemsDB);

  // Send back the newly created item as a confirmation
  res.status(201).json(newItem);
});
app.get('/api/items', (req, res) => {
  // Simply return the entire database array
  res.json(itemsDB);
});

// === START THE SERVER ===
// This tells the server to listen for incoming requests on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});