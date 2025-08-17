// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { Toaster } from 'react-hot-toast';

import Auth from './Auth';
import MindVaultApp from './MindVaultApp';
import './index.css';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth state changes (SIGNED_IN, SIGNED_OUT, etc.)
    // This is what handles the magic link callback!
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return null; // Or a full-screen loader
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              session ? <MindVaultApp session={session} /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/login"
            element={
              !session ? <Auth /> : <Navigate to="/" />
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}