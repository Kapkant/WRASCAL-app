import { createClient, SupabaseClient } from "@supabase/supabase-js";

/* Create a utility to create a supabase client object */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Only create Supabase client if URL and key are provided
// This allows the app to load even if Supabase isn't configured
export const supabase: SupabaseClient | null = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null;
