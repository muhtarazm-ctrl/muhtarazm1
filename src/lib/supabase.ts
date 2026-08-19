import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gnbftvgonovauqspmuia.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduYmZ0dmdvbm92YXVxc3BtdWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNzI2ODksImV4cCI6MjEwMjY0ODY4OX0.cTeh8w3hvmZdDSEE6_FmX0kXkJCnxjliQ87JZyrGeg4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
