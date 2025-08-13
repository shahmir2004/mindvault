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

// === ROUTES ===
// A simple test route to make sure everything is working
app.get('/api/health', (req, res) => {
  res.json({ message: "Server is healthy and running!" });
});

// === START THE SERVER ===
// This tells the server to listen for incoming requests on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});