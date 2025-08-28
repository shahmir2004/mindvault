// frontend/src/Auth.jsx
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import { FiMail, FiLock, FiEye, FiEyeOff, FiCpu, FiArrowRight } from 'react-icons/fi';
import { supabase } from './supabaseClient';
import toast from 'react-hot-toast';
import './Auth.css';
import { particlesOptions } from './particlesConfig';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  
  const particlesInit = useCallback(async (engine) => { await loadFull(engine); }, []);

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
      <Particles id="auth-particles" init={particlesInit} options={particlesOptions} />
      
      {/* Floating Background Elements */}
      <div className="auth-background-elements">
        <div className="floating-orb auth-orb-1"></div>
        <div className="floating-orb auth-orb-2"></div>
      </div>

      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Auth Header */}
        <div className="auth-header">
          <motion.div 
            className="auth-logo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <FiCpu className="logo-icon" />
            MindVault
          </motion.div>
          <motion.p 
            className="auth-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Access your digital brain
          </motion.p>
        </div>
        
        <motion.form 
          className="auth-form" 
          onSubmit={showPasswordInput ? handlePasswordLogin : handleMagicLinkLogin}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="form-group">
            <label htmlFor="email">
              <FiMail className="label-icon" />
              Email Address
            </label>
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

          {showPasswordInput && (
            <motion.div 
              className="form-group"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              <label htmlFor="password">
                <FiLock className="label-icon" />
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  className="input-field"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </motion.div>
          )}

          <button className="btn btn-primary auth-submit-btn" disabled={loading}>
            {loading ? (
              <div className="loading-spinner"></div>
            ) : showPasswordInput ? (
              <>Sign In <FiArrowRight /></>
            ) : (
              <>Continue with Email <FiArrowRight /></>
            )}
          </button>
        </motion.form>

        <motion.button 
          className="auth-toggle-btn"
          onClick={() => setShowPasswordInput(!showPasswordInput)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          {showPasswordInput ? 'Or use a magic link instead' : 'Or sign in with password'}
        </motion.button>

        <motion.div 
          className="auth-features"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <div className="feature-item">
            <FiCpu />
            <span>AI-Powered Search</span>
          </div>
          <div className="feature-item">
            <FiLock />
            <span>Secure & Private</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}