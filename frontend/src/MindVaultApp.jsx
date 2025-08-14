// frontend/src/MindVaultApp.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from './supabaseClient'; // Import supabase client to use its methods

// This is the URL of our backend API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// This is a CRITICAL helper function.
// It creates an instance of axios that automatically includes the user's
// authentication token in the headers of every request.
const getAuthenticatedAxios = (session) => {
  return axios.create({
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    }
  });
};

export default function MindVaultApp({ session }) {
  // State for the main list of all saved items
  const [items, setItems] = useState([]);
  // State for the text in the "add new URL" input field
  const [newItemUrl, setNewItemUrl] = useState('');
  
  // State for the text in the search input field
  const [searchQuery, setSearchQuery] = useState('');
  // State for the list of items returned by a search
  const [searchResults, setSearchResults] = useState([]);
  // State to manage the loading status of the search button
  const [isSearching, setIsSearching] = useState(false);

  // We create an authenticated axios instance using the session passed as a prop
  const authenticatedAxios = getAuthenticatedAxios(session);

  // --- DATA FETCHING AND ACTIONS ---

  // Fetches all items for the logged-in user
  const fetchItems = () => {
    authenticatedAxios.get(`${API_URL}/api/items`)
      .then(response => {
        setItems(response.data);
      })
      .catch(error => {
        console.error("Error fetching items:", error);
        alert("Could not fetch your saved items. Please try again.");
      });
  };

  // This useEffect hook runs once when the component is first loaded.
  // Its job is to fetch the initial list of items for the user.
  useEffect(() => {
    fetchItems();
  }, [session]); // The dependency array ensures this runs again if the session changes

  // Handles the form submission for adding a new item
  const handleAddItem = (e) => {
    e.preventDefault(); // Prevents the browser from reloading the page
    if (!newItemUrl.trim()) return alert("Please enter a URL");

    authenticatedAxios.post(`${API_URL}/api/items`, { url: newItemUrl })
      .then(() => {
        fetchItems(); // After adding, we re-fetch the list to show the new item
        setNewItemUrl(''); // Clear the input field
      })
      .catch(error => {
        console.error("Error adding item:", error);
        alert(`Failed to add item. The server said: ${error.response?.data?.error || error.message}`);
      });
  };

  // Handles the form submission for searching items
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]); // Clear results if the search query is empty
      return;
    }
    setIsSearching(true);
    authenticatedAxios.get(`${API_URL}/api/search`, { params: { q: searchQuery } })
      .then(response => {
        setSearchResults(response.data);
      })
      .catch(error => {
        console.error("Error searching:", error);
        alert("An error occurred while searching.");
      })
      .finally(() => {
        setIsSearching(false); // Stop the loading state regardless of outcome
      });
  };
  
  // Handles logging the user out
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    }
    // The main App.jsx component will detect the session change and show the Auth page.
  };

  // --- JSX RENDER ---

  return (
    <div>
      <header>
        <h1>MindVault</h1>
        <div className="user-info">
          <span>Welcome, {session.user.email}!</span>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      
      <main>
        <form onSubmit={handleAddItem} className="capture-container">
          <input
            type="text"
            placeholder="Paste a URL to save..."
            value={newItemUrl}
            onChange={(e) => setNewItemUrl(e.target.value)}
          />
          <button type="submit">Save</button>
        </form>

        <hr />

        <div className="search-area">
          <h2>Search Your Vault</h2>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search for... (e.g., react hooks)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>
        
        <div className="results-container">
          {searchQuery && (
            <div className="search-results">
              <h3>Search Results for "{searchQuery}"</h3>
              {isSearching ? <p>Loading...</p> : (
                searchResults.length === 0 ? (
                  <p>No results found.</p>
                ) : (
                  <ul>
                    {searchResults.map(item => (
                      <li key={item.id} className="search-result-item">
                        <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                        <p className="headline" dangerouslySetInnerHTML={{ __html: item.headline }}></p>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          )}
        </div>

        <hr />

        <div className="items-list">
          <h2>All Saved Items ({items.length})</h2>
          <ul>
            {items.map(item => (
              <li key={item.id}>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.title || item.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}