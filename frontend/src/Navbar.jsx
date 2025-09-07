import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './Navbar.css';

const Navbar = ({ session }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple logout calls
    
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      // Only log unexpected errors (not 403/session missing errors)
      if (error && !error.message.includes('Auth session missing') && error.status !== 403) {
        console.error('Logout error:', error);
      }
    } catch (err) {
      console.error('Logout exception:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-logo">
          MindVault
        </NavLink>
        <ul className="nav-menu">
          <li className="nav-item">
            <NavLink to="/" className={({ isActive }) => "nav-links" + (isActive ? " active" : "")}>
              Home
            </NavLink>
          </li>
          {session ? (
            <li className="nav-item">
              <button 
                onClick={handleLogout} 
                className="nav-links-btn"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </li>
          ) : (
            <li className="nav-item">
              <NavLink to="/login" className={({ isActive }) => "nav-links" + (isActive ? " active" : "")}>
                Login
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
