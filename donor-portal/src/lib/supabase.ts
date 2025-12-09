import { createClient } from '@supabase/supabase-js'

// Note: In Vite, use VITE_ prefix for environment variables (not NEXT_PUBLIC_)
// Set these in Vercel as: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

