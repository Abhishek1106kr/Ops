import { createClient } from "@supabase/supabase-js";

// Load Supabase environment keys with default fallbacks for local guest bypass
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
