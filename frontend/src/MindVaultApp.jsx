// frontend/src/MindVaultApp.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { supabase } from './supabaseClient';
import toast from 'react-hot-toast';
import { FiLogOut, FiPlus, FiSearch, FiFileText, FiAlertCircle } from 'react-icons/fi';

import './MindVaultApp.css';
import './Loader.css'; // Assuming you have the loader css

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const getAuthenticatedAxios = (session) => {
  return axios.create({ headers: { 'Authorization': `Bearer ${session.access_token}` } });
};

// Reusable components for cleaner JSX
const Loader = () => <div className="loader"></div>;
const EmptyState = ({ icon, title, message }) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{message}</p>
  </div>
);

export default function MindVaultApp({ session }) {
  const [items, setItems] = useState([]);
  const [newItemUrl, setNewItemUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const authenticatedAxios = useMemo(() => getAuthenticatedAxios(session), [session]);

  const fetchItems = () => {
    setIsLoadingItems(true);
    authenticatedAxios.get(`${API_URL}/api/items`)
      .then(response => setItems(response.data))
      .catch(() => toast.error("Could not fetch your saved items."))
      .finally(() => setIsLoadingItems(false));
  };

  useEffect(() => { fetchItems(); }, [authenticatedAxios]);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemUrl.trim()) return toast.error("Please enter a URL");
    
    setIsSaving(true);
    const promise = authenticatedAxios.post(`${API_URL}/api/items`, { url: newItemUrl });
    toast.promise(promise, {
      loading: 'Scraping and saving...',
      success: (response) => {
        fetchItems();
        setNewItemUrl('');
        return `Saved: ${response.data.title || response.data.url}`;
      },
      error: (err) => `Error: ${err.response?.data?.error || err.message}`
    }).finally(() => setIsSaving(false));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    authenticatedAxios.get(`${API_URL}/api/search`, { params: { q: searchQuery } })
      .then(response => setSearchResults(response.data))
      .catch(() => toast.error("An error occurred while searching."))
      .finally(() => setIsSearching(false));
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully.');
  };

  const renderContent = () => {
    if (hasSearched) {
      if (isSearching) return <Loader />;
      if (searchResults.length > 0) {
        return (
          <ul className="search-results-list">
            {searchResults.map((item, index) => (
              <li key={item.id} className="list-item" style={{ animationDelay: `${index * 50}ms` }}>
                <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                <p className="item-headline" dangerouslySetInnerHTML={{ __html: item.headline }} />
              </li>
            ))}
          </ul>
        );
      }
      return <EmptyState icon={<FiAlertCircle />} title="No Results Found" message={`Your search for "${searchQuery}" did not return any results.`} />;
    }

    if (isLoadingItems) return <Loader />;
    if (items.length > 0) {
      return (
        <ul className="items-list">
          {items.map((item, index) => (
            <li key={item.id} className="list-item" style={{ animationDelay: `${index * 50}ms` }}>
              <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title || item.url}</a>
            </li>
          ))}
        </ul>
      );
    }
    return <EmptyState icon={<FiFileText />} title="Your Vault is Empty" message="Save your first article or video using the form on the left." />;
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="logo">MindVault</div>
        <div className="user-info">
          <div className="user-avatar">{session.user.email[0].toUpperCase()}</div>
          <div className="user-email">{session.user.email}</div>
          <button title="Logout" className="logout-button" onClick={handleLogout}>
            <FiLogOut size={20} />
          </button>
        </div>
      </header>
      
      <div className="app-grid">
        <aside className="sidebar">
          <div className="action-card">
            <h2 className="card-title"><FiPlus /> Save New Knowledge</h2>
            <form onSubmit={handleAddItem}>
              <div className="input-group">
                <input
                  className="input-field"
                  placeholder="Paste a URL..."
                  value={newItemUrl}
                  onChange={(e) => setNewItemUrl(e.target.value)}
                  disabled={isSaving}
                />
                <button type="submit" className="btn" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>

          <div className="action-card">
            <h2 className="card-title"><FiSearch /> Search Your Vault</h2>
            <form onSubmit={handleSearch}>
              <div className="input-group">
                <input
                  className="input-field"
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isSearching}
                />
                <button type="submit" className="btn" disabled={isSearching}>
                  {isSearching ? '...' : 'Go'}
                </button>
              </div>
            </form>
          </div>
        </aside>

        <main className="content-card">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}