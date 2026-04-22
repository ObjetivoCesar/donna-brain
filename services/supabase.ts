
import { createClient } from '@supabase/supabase-js';

// Access environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials needed! Check .env file.');
}

// Create Supabase client
export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);

export const isSupabaseConfigured = () => {
    return !!supabaseUrl && !!supabaseAnonKey;
};
