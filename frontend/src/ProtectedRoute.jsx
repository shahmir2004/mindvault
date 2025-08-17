// frontend/src/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

const ProtectedRoute = ({ children }) => {
  const { data: { session } } = supabase.auth.getSession();

  if (!session) {
    // User not logged in, redirect them to the /login page
    return <Navigate to="/login" replace />;
  }

  // User is logged in, render the component they were trying to access
  return children;
};

export default ProtectedRoute;