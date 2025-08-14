// frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // The Supabase client for the frontend
import Auth from './Auth'; // The component for the login/signup form
import MindVaultApp from './MindVaultApp'; // The main application component for logged-in users

export default function App() {
  // We will store the user's session information in state.
  // It starts as null because we don't know if the user is logged in yet.
  const [session, setSession] = useState(null);

  // The useEffect hook runs after the component mounts.
  // It's perfect for setting up listeners or fetching initial data.
  useEffect(() => {
    // 1. Check for an active session when the app loads.
    // This handles the case where a user is already logged in and refreshes the page.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Set up a listener for authentication state changes.
    // This is the magic part. It will fire whenever a user logs in, logs out,
    // or their session is refreshed.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // The callback updates our state with the new session information.
      // If the user logs out, `session` will be null.
      setSession(session);
    });

    // 3. Cleanup function.
    // This is returned from useEffect and will run when the component unmounts.
    // It's crucial for preventing memory leaks by removing the auth listener.
    return () => subscription.unsubscribe();
  }, []); // The empty dependency array [] means this effect runs only once.

  // This is the render logic. It's a simple conditional (ternary) statement.
  return (
    <div className="container">
      {/* If there is NO session, show the Auth component. */}
      {!session ? (
        <Auth />
      ) : (
        // If there IS a session, show the main MindVaultApp component.
        // We pass the entire session object as a prop.
        // We also pass a `key` prop with the user's ID. This is a React best-practice
        // that ensures the component fully remounts if the user logs out and a
        // different user logs in, preventing any state from leaking between users.
        <MindVaultApp key={session.user.id} session={session} />
      )}
    </div>
  );
}