// frontend/src/Auth.jsx
import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // The user will be redirected automatically by the App component's listener
    } catch (error) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      alert('Check your email for the login link!');
    } catch (error) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <h1>MindVault</h1>
        <p>Sign in or create an account</p>
      </div>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <button disabled={loading}>
            {loading ? <span>Loading...</span> : <span>Login</span>}
          </button>
          <button type="button" onClick={handleSignUp} disabled={loading}>
            {loading ? <span>Loading...</span> : <span>Sign Up</span>}
          </button>
        </div>
      </form>
    </div>
  );
}