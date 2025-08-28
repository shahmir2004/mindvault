import React from 'react';
import { NavLink } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './Navbar.css';

const Navbar = ({ session }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
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
              <button onClick={handleLogout} className="nav-links-btn">
                Logout
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
