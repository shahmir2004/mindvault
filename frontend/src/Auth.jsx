// frontend/src/Auth.jsx
import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to toggle password view

  const handleMagicLinkLogin = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email address.");

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: 'https://mindvault-delta.vercel.app',
      },
    });

    if (error) {
      toast.error(error.error_description || error.message);
    } else {
      toast.success('Check your email for the magic link!');
    }
    setLoading(false);
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.error_description || error.message);
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-logo">MindVault</h1>
        <p className="subtitle">Sign in or create an account.</p>
        
        <form className="auth-form" onSubmit={handleMagicLinkLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input-field"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Conditionally render the password section */}
          {showPassword ? (
            <div className="password-section">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  className="input-field"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button className="btn" disabled={loading} onClick={handlePasswordLogin}>
                {loading ? 'Processing...' : 'Sign In with Password'}
              </button>
            </div>
          ) : (
            <button className="btn" disabled={loading}>
              {loading ? 'Sending...' : 'Continue with Email'}
            </button>
          )}
        </form>

        <button 
          className="toggle-password-view"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? 'Or use a magic link' : 'Or sign in with a password'}
        </button>

      </div>
    </div>
  );
}