// frontend/src/LandingPage.jsx
import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiLink, FiSearch, FiZap, FiChevronRight, FiFileText, FiAlertCircle, FiPlus, FiCpu, FiStar, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import toast from 'react-hot-toast';

import './LandingPage.css';
import { particlesOptions } from './particlesConfig';

// --- DEMO DATA & LOGIC (self-contained) ---
const initialDemoItems = [
  { id: 1, title: 'React Hooks: A Deep Dive', url: '#', content: 'This article explores the power of React Hooks, including useState, useEffect, and custom hooks for managing state and side effects in your applications.' },
  { id: 2, title: 'The Pomodoro Technique for Productivity', url: '#', content: 'The Pomodoro Technique is a time management method that uses a timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks. Boost your productivity with this simple method.' },
  { id: 3, title: 'Understanding Asynchronous JavaScript', url: '#', content: 'Learn about asynchronous operations in JavaScript, including callbacks, Promises, and the modern async/await syntax. This is key for any web developer.' },
];

const EmptyState = ({ icon, title, message }) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{message}</p>
  </div>
);

const InteractiveDemo = () => {
  const [demoItems, setDemoItems] = useState(initialDemoItems);
  const [newItemUrl, setNewItemUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemUrl.trim()) return toast.error("Please enter a URL to try saving.");
    setIsSaving(true);
    toast.loading('Simulating scraping...');
    
    setTimeout(() => {
      const newItem = {
        id: Date.now(),
        title: `Saved: ${newItemUrl}`,
        url: '#',
        content: `This is a demonstration of how MindVault saves content from URLs like ${newItemUrl}. The full text would be indexed and made searchable in your real vault.`
      };
      setDemoItems([newItem, ...demoItems]);
      setNewItemUrl('');
      setIsSaving(false);
      toast.dismiss();
      toast.success("Article saved to demo vault!");
    }, 1500);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const results = demoItems.filter(item =>
      item.title.toLowerCase().includes(query) || item.content.toLowerCase().includes(query)
    ).map(item => {
      const contentIndex = item.content.toLowerCase().indexOf(query);
      const headline = contentIndex !== -1
        ? `...${item.content.substring(contentIndex - 20, contentIndex + 50)}...`.replace(new RegExp(query, 'gi'), `<b>${query}</b>`)
        : `Found in title: <b>${item.title}</b>`;
      return { ...item, headline };
    });
    setSearchResults(results);
  };

  const renderContent = () => {
    const displayItems = hasSearched ? searchResults : demoItems;
    
    if (displayItems.length > 0) {
      return (
        <ul className="items-list">
          {displayItems.map((item) => (
            <li key={item.id} className="list-item">
              <a href={item.url} onClick={(e) => e.preventDefault()} className="list-item-link">{item.title}</a>
              {item.headline && <p className="item-headline" dangerouslySetInnerHTML={{ __html: item.headline }} />}
            </li>
          ))}
        </ul>
      );
    }

    if (hasSearched) return <EmptyState icon={<FiAlertCircle />} title="No Results Found" message={`Your search for "${searchQuery}" did not return any results.`} />;
    return <EmptyState icon={<FiFileText />} title="Demo Vault" message="The items in your vault would appear here." />;
  };

  return (
    <motion.div 
      className="interactive-demo-container"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
    >
      <aside className="demo-sidebar">
        <div className="demo-card">
          <h2 className="card-title"><FiPlus /> Try Saving</h2>
          <form className="action-form" onSubmit={handleAddItem}>
            <input
              className="input-field"
              placeholder="Paste any URL..."
              value={newItemUrl}
              onChange={(e) => setNewItemUrl(e.target.value)}
              disabled={isSaving}
            />
            <button type="submit" className="btn btn-primary" style={{width: '100%'}} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save to Demo'}
            </button>
          </form>
        </div>
        <div className="demo-card">
          <h2 className="card-title"><FiSearch /> Try Searching</h2>
          <form onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <input
                className="input-field"
                placeholder="Try 'React' or 'Productivity'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-btn" aria-label="Search"><FiSearch /></button>
            </div>
          </form>
        </div>
      </aside>
      <main className="demo-main-content">
        <div className="demo-card" style={{minHeight: '440px'}}>
          {renderContent()}
        </div>
      </main>
    </motion.div>
  );
};

export default function LandingPage() {
  const particlesInit = useCallback(async (engine) => { 
    try {
      await loadFull(engine); 
    } catch (error) {
      console.log('Particles initialization error (non-critical):', error);
    }
  }, []);

  return (
    <div className="page-container">
      {/* Hero Section with Enhanced Design */}
      <section className="hero-section">
        {/* Particles Background with error handling */}
        {(() => {
          try {
            return <Particles id="tsparticles" init={particlesInit} options={particlesOptions} />;
          } catch (error) {
            console.log('Particles render error (non-critical):', error);
            return null;
          }
        })()}
        
        {/* Floating Background Elements */}
        <div className="hero-background-elements">
          <div className="floating-orb orb-1"></div>
          <div className="floating-orb orb-2"></div>
          <div className="floating-orb orb-3"></div>
        </div>

        {/* Main Hero Content */}
        <motion.div 
          className="hero-content-wrapper"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Attention-grabbing Badge */}
          <motion.div 
            className="hero-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <FiCpu className="badge-icon" />
            <span>Your Digital Brain, Evolved</span>
            <FiStar className="badge-star" />
          </motion.div>

          <motion.div 
            className="hero-text-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h1 className="hero-headline">
              Turn Your <span className="highlight-gradient">Knowledge</span> Into
              <br />
              <span className="highlight-text">Superpowers</span>
            </h1>
            <p className="hero-subheadline">
              Never lose a brilliant idea again. MindVault transforms scattered bookmarks, notes, 
              and articles into an intelligent, searchable second brain that evolves with you.
            </p>
            
            {/* Hero CTA Buttons */}
            <div className="hero-cta-group">
              <Link to="/login" className="btn btn-primary hero-primary-btn">
                <FiZap />
                Start Building Your Vault
                <FiArrowRight />
              </Link>
              <button 
                className="btn btn-secondary hero-demo-btn"
                onClick={() => {
                  document.getElementById('demo-section')?.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  });
                }}
              >
                <FiSearch />
                Try Demo Below
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="trust-indicators">
              <div className="trust-item">
                <span className="trust-number">10K+</span>
                <span className="trust-label">Ideas Saved</span>
              </div>
              <div className="trust-item">
                <span className="trust-number">500+</span>
                <span className="trust-label">Active Users</span>
              </div>
              <div className="trust-item">
                <span className="trust-number">99.9%</span>
                <span className="trust-label">Uptime</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Enhanced Interactive Demo */}
        <motion.div
          id="demo-section"
          className="demo-section-wrapper"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="demo-header">
            <h2 className="demo-title">Experience MindVault Live</h2>
            <p className="demo-subtitle">Try saving and searching content right now</p>
          </div>
          <InteractiveDemo />
        </motion.div>
      </section>

      {/* Enhanced Features Section */}
      <section className="features-section">
        <motion.div
          className="features-content"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <div className="features-header">
            <h2 className="section-title">Beyond Simple Bookmarks</h2>
            <p className="section-subtitle">
              MindVault doesn't just store your content—it understands it, connects it, 
              and helps you rediscover knowledge in powerful new ways.
            </p>
          </div>
          
          <div className="features-grid">
            <motion.div 
              className="feature-card"
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="feature-icon">
                <FiCpu />
              </div>
              <h3>AI-Powered Search</h3>
              <p>Find content by meaning, not just keywords. Our AI understands context and intent.</p>
            </motion.div>
            
            <motion.div 
              className="feature-card"
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="feature-icon">
                <FiZap />
              </div>
              <h3>Instant Capture</h3>
              <p>Save any webpage, article, or idea in seconds. Full content extraction and indexing.</p>
            </motion.div>
            
            <motion.div 
              className="feature-card"
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="feature-icon">
                <FiLink />
              </div>
              <h3>Smart Connections</h3>
              <p>Discover hidden relationships between your saved content and spark new insights.</p>
            </motion.div>
          </div>

          <div className="final-cta-section">
            <Link to="/login" className="btn btn-primary final-cta-btn">
              <FiCpu />
              Create Your Free MindVault
              <FiChevronRight />
            </Link>
            <p className="cta-note">No credit card required • Start organizing in 30 seconds</p>
          </div>
        </motion.div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} MindVault. Empowering minds worldwide.</p>
        </div>
      </footer>
    </div>
  );
}