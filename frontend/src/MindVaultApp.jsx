// frontend/src/MindVaultApp.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { supabase } from './supabaseClient';
import toast from 'react-hot-toast';
import { FiLogOut, FiPlus, FiSearch, FiFileText, FiAlertCircle, FiLoader, FiCpu, FiUser, FiBookmark, FiTrendingUp } from 'react-icons/fi';

import './MindVaultApp.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const getAuthenticatedAxios = (session) => {
  return axios.create({ headers: { 'Authorization': `Bearer ${session.access_token}` } });
};

// Polished loader and empty state components
const Loader = () => {
  const styles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '4rem',
    animation: 'spin 1s linear infinite',
  };
  const iconStyles = {
    fontSize: '2rem',
    color: 'var(--color-accent-blue)',
  };
  return <div style={styles}><FiLoader style={iconStyles} /></div>;
};
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
    if (!searchQuery.trim()) { setSearchResults([]); return; }

    setIsSearching(true);
    authenticatedAxios.get(`${API_URL}/api/search`, { params: { q: searchQuery } })
      .then(response => setSearchResults(response.data))
      .catch(() => toast.error("An error occurred while searching."))
      .finally(() => setIsSearching(false));
  };

  const handleLogout = async () => {
  setIsLoggingOut(true);
  const { error } = await supabase.auth.signOut();

  // We only care about unexpected errors.
  // The 403 error is expected if the session is already expired, so we don't need to show it.
  // The onAuthStateChange listener will handle the redirect regardless.
  if (error && error.message !== 'Auth session missing!') {
    toast.error("Failed to log out.");
    console.error("Logout Error: ", error);
    setIsLoggingOut(false);
  }
  // No need for a success toast or navigation here. The listener in App.jsx handles it all.
};
  const renderContent = () => {
    const displayItems = hasSearched ? searchResults : items;
    const isLoading = hasSearched ? isSearching : isLoadingItems;

    if (isLoading) return <Loader />;
    if (displayItems.length > 0) {
      return (
        <ul className="items-list">
          {displayItems.map((item, index) => (
            <li key={item.id} className="list-item" style={{ animationDelay: `${index * 50}ms` }}>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="list-item-link">{item.title || item.url}</a>
              {item.headline && <p className="item-headline" dangerouslySetInnerHTML={{ __html: item.headline }} />}
            </li>
          ))}
        </ul>
      );
    }
    if (hasSearched) return <EmptyState icon={<FiAlertCircle />} title="No Results Found" message={`Your search for "${searchQuery}" did not return any results.`} />;
    return <EmptyState icon={<FiFileText />} title="Your Vault is Empty" message="Save your first article or video using the form on the left." />;
  };

  return (
    <div className="app-shell">
      {/* Enhanced Header */}
      <motion.header 
        className="app-header"
        initial={{ y: -70 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="header-left">
          <div className="logo">
            <FiCpu className="logo-icon" />
            MindVault
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <FiBookmark />
              <span>{items.length} saved</span>
            </div>
          </div>
        </div>
        <div className="user-info">
          <div className="user-details">
            <div className="user-avatar">
              <FiUser />
            </div>
            <div className="user-text">
              <div className="user-name">Welcome back!</div>
              <div className="user-email">{session.user.email}</div>
            </div>
          </div>
          <motion.button 
            type="button" 
            title="Sign Out" 
            className="logout-button" 
            onClick={handleLogout} 
            disabled={isLoggingOut}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiLogOut size={18} />
          </motion.button>
        </div>
      </motion.header>

      <div className="app-grid">
        {/* Enhanced Sidebar */}
        <motion.aside 
          className="sidebar"
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <motion.div 
            className="action-card save-card"
            whileHover={{ y: -2, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h2 className="card-title">
              <FiPlus /> 
              Save New Knowledge
            </h2>
            <form className="action-form" onSubmit={handleAddItem}>
              <input
                className="input-field"
                placeholder="Paste a URL to save..."
                value={newItemUrl}
                onChange={(e) => setNewItemUrl(e.target.value)}
                disabled={isSaving}
              />
              <button 
                type="submit" 
                className="btn btn-primary save-btn" 
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="loading-spinner"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiPlus />
                    Save to Vault
                  </>
                )}
              </button>
            </form>
          </motion.div>

          <motion.div 
            className="action-card search-card"
            whileHover={{ y: -2, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h2 className="card-title">
              <FiSearch /> 
              Search Your Vault
            </h2>
            <form onSubmit={handleSearch}>
              <div className="search-input-wrapper">
                <input
                  className="input-field"
                  placeholder="Search saved content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isSearching}
                />
                <button 
                  type="submit" 
                  className="search-btn" 
                  disabled={isSearching} 
                  aria-label="Search"
                >
                  {isSearching ? (
                    <FiLoader className="spinning" />
                  ) : (
                    <FiSearch />
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.aside>

        {/* Enhanced Main Content */}
        <motion.main 
          className="main-content"
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        >
          <div className="content-header">
            <h1 className="content-title">
              {hasSearched ? (
                <>
                  <FiSearch />
                  Search Results for "{searchQuery}"
                </>
              ) : (
                <>
                  <FiBookmark />
                  Your Knowledge Vault
                </>
              )}
            </h1>
            {hasSearched && (
              <button 
                className="btn btn-secondary clear-search-btn"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setHasSearched(false);
                }}
              >
                Clear Search
              </button>
            )}
          </div>
          
          <motion.div 
            className="action-card content-card"
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {renderContent()}
          </motion.div>
        </motion.main>
      </div>
    </div>
  );
}