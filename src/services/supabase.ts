// Supabase Client Initialization with AsyncStorage persistence

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Environment variables configured in .env / app.json
export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://lsdrlcfyaltkjrzzhhqa.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZHJsY2Z5YWx0a2pyenpoaHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NTI1NjEsImV4cCI6MjEwNjMyODU2MX0.Cb9c218Ye2HeDvApM8DUUBbiqWgcwWUeX3tBL7YVllQ';

export const isSupabaseConfigured = true;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
