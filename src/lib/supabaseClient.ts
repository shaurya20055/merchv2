

import { createClient } from '@supabase/supabase-js'
import { env } from '$env/dynamic/public'

// Get Supabase credentials from environment variables
const supabaseUrl = env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY

// --- NEW DIAGNOSTIC LOGS ---
// These logs will appear in your Vite terminal when the server starts.
console.log("--- Supabase Client Initialization ---");
console.log("Attempting to load Supabase URL:", supabaseUrl ? "Loaded successfully" : "FAILED or UNDEFINED");
console.log("Attempting to load Supabase Anon Key:", supabaseAnonKey ? "Loaded successfully" : "FAILED or UNDEFINED");
if (!supabaseUrl || !supabaseAnonKey) {
    console.error("CRITICAL ERROR: Supabase environment variables are missing. Please check your .env file.");
    console.log("Ensure your .env file is in the root directory and variables are named PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY.");
}
console.log("------------------------------------");
// --- END OF LOGS ---


// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)