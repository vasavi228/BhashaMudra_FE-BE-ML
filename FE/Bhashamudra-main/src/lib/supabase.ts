import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ebxrhbsbhjuudrnswllm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVieHJoYnNiaGp1dWRybnN3bGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTA4ODEsImV4cCI6MjA4OTMyNjg4MX0.MmITBU448esWADw4DDhsX7kVKCLTmFWFqDfyGueom6g'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)