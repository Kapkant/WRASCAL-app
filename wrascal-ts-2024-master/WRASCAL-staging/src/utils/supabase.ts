import { createClient } from "@supabase/supabase-js";

/* Create a utiliy to create a supabase client object */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
