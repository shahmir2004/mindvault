import { createClient } from '@supabase/supabase-js'


const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Hardcode the values directly as strings

// --- END TEMPORARY DEBUGGING ---

// This will now definitely have values
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Cant get values from env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);