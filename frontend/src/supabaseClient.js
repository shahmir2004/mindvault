import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://niqrpkltxuxxzcpctxvi.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcXJwa2x0eHV4eHpjcGN0eHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTgwOTYsImV4cCI6MjA3MDY3NDA5Nn0.8N_YkW029rMT4xVVGT_YEzjKUcQR6EKEy-sNEi6ke24';

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase configuration is missing");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Add custom storage handling to prevent session mismatches
    storage: {
      getItem: (key) => {
        try {
          return window.localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          window.localStorage.setItem(key, value);
        } catch {
          // Ignore storage errors
        }
      },
      removeItem: (key) => {
        try {
          window.localStorage.removeItem(key);
        } catch {
          // Ignore storage errors
        }
      }
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'mindvault-web'
    }
  }
});

// Enhanced logout function that handles session mismatches
export const safeLogout = async () => {
  try {
    // First, try normal logout
    const { error } = await supabase.auth.signOut();
    
    // If we get a session_not_found error (403), it means the session is already invalid
    // In this case, we should clear local storage manually and consider it successful
    if (error && (error.status === 403 || error.message.includes('session_not_found') || error.message.includes('Auth session missing'))) {
      console.log('Session already invalid on server, clearing local storage');
      
      // Clear all auth-related localStorage manually
      const authKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
      try {
        localStorage.removeItem(authKey);
        localStorage.removeItem('supabase.auth.token');
        // Clear any other possible auth keys
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') && key.includes('auth')) {
            localStorage.removeItem(key);
          }
        });
      } catch (storageError) {
        console.log('Storage clear error (non-critical):', storageError);
      }
      
      // Force trigger auth state change
      window.dispatchEvent(new StorageEvent('storage', {
        key: authKey,
        newValue: null,
        oldValue: localStorage.getItem(authKey)
      }));
      
      return { error: null }; // Consider it successful
    }
    
    // For other errors, return them
    return { error };
    
  } catch (exception) {
    console.error('Logout exception:', exception);
    
    // If there's an exception, also try to clear local storage
    try {
      const authKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
      localStorage.removeItem(authKey);
    } catch {
      // Ignore storage errors
    }
    
    return { error: exception };
  }
};

// Session validation utility
export const validateSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('Session validation error:', error);
      return { isValid: false, session: null };
    }
    
    if (!session) {
      return { isValid: false, session: null };
    }
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      console.log('Session token is expired');
      // Clear expired session
      await safeLogout();
      return { isValid: false, session: null };
    }
    
    return { isValid: true, session };
    
  } catch (error) {
    console.error('Session validation exception:', error);
    return { isValid: false, session: null };
  }
};