import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios


function App() {
  const [serverStatus, setServerStatus] = useState('Checking server status...');

  // useEffect hook to run code on component mount
  useEffect(() => {
    // We will define the API URL. For development, it's our backend server.
    // The VITE_API_URL part is for production later, don't worry about it now.
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

    axios.get(`${API_URL}/api/health`)
      .then(response => {
        // If the request is successful, update the status with the message from the server
        setServerStatus(`Server status: ${response.data.message}`);
      })
      .catch(error => {
        // If there's an error (like the server is not running), show an error message
        console.error("Error fetching server status:", error);
        setServerStatus('Error: Could not connect to the server.');
      });
  }, []); // The empty array [] means this effect runs only once when the component first renders
    return (
    <div>
      <header>
        <h1>MindVault</h1>
        <p>Your Personal Knowledge Search Engine</p>
        {/* Display the server status */}
        <p><i>{serverStatus}</i></p>
      </header>
      <main>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search across your articles, videos, and notes..."
          />
          <button>Search</button>
        </div>
      </main>
    </div>
  );
}


export default App;