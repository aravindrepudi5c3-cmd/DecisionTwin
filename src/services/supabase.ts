import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isRealSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-supabase-url') &&
  supabaseUrl.startsWith('https://')
)

export const isSupabaseConfigured = isRealSupabaseConfigured

export const supabase = isRealSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null

