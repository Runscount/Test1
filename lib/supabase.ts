import { createClient } from "@supabase/supabase-js";

// TODO: Replace these with your actual Supabase project URL and anon key
// You can find these in your Supabase project settings > API
// For now, these are placeholder values - the app will work with mock data
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

