import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Define the API URL once, so we can reuse it
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function App() {
  // State for the list of items from our backend
  const [items, setItems] = useState([]);
  // State for the URL input field
  const [newItemUrl, setNewItemUrl] = useState('');
  // State for the server status message
  const [serverStatus, setServerStatus] = useState('Checking server status...');

  // Function to fetch all items from the server
  const fetchItems = () => {
    axios.get(`${API_URL}/api/items`)
      .then(response => {
        // Update the items state with the data from the server
        setItems(response.data);
      })
      .catch(error => {
        console.error("Error fetching items:", error);
      });
  };

  // useEffect hook to run on component mount
  useEffect(() => {
    // Check server health
    axios.get(`${API_URL}/api/health`)
      .then(response => {
        setServerStatus(`Server status: ${response.data.message}`);
      })
      .catch(error => {
        console.error("Error fetching server status:", error);
        setServerStatus('Error: Could not connect to the server.');
      });
    
    // Also fetch all items when the component loads
    fetchItems();
  }, []); // The empty array [] means this effect runs only once

  // Function to handle adding a new item
  const handleAddItem = (e) => {
    // Prevent the default form submission (which reloads the page)
    e.preventDefault();

    // Make sure the URL is not empty
    if (!newItemUrl.trim()) {
      alert("Please enter a URL");
      return;
    }

    // Make a POST request to our new endpoint
    axios.post(`${API_URL}/api/items`, { url: newItemUrl })
      .then(response => {
        // After successfully adding, fetch the updated list of items
        fetchItems();
        // Clear the input field
        setNewItemUrl('');
      })
      .catch(error => {
        console.error("Error adding item:", error);
        alert("Failed to add item.");
      });
  };

  return (
    <div>
      <header>
        <h1>MindVault</h1>
        <p>Your Personal Knowledge Search Engine</p>
        <p><i>{serverStatus}</i></p>
      </header>
      <main>
        {/* We use a form to handle submission */}
        <form onSubmit={handleAddItem} className="capture-container">
          <input
            type="text"
            placeholder="Paste a URL to save..."
            value={newItemUrl}
            onChange={(e) => setNewItemUrl(e.target.value)}
          />
          <button type="submit">Save</button>
        </form>

        <div className="items-list">
          <h2>Saved Items</h2>
          {items.length === 0 ? (
            <p>No items saved yet.</p>
          ) : (
            <ul>
              {/* Map over the items array and display each one */}
              {items.map(item => (
  <li key={item.id}>
    <a href={item.url} target="_blank" rel="noopener noreferrer">
      {item.title || item.url} {/* Show title, but fallback to URL if title is missing */}
    </a>
  </li>
))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;