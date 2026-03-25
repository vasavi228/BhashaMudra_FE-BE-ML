import { supabase } from '../lib/supabase'
export const signUp = async (fullName: string, email: string, password: string) => {
  // Step 1: Create auth user
  const { data, error } = await supabase.auth.signUp({ email, password })
  
  if (error) {
    console.error('Auth signup error:', error)
    throw error
  }

  console.log('Auth signup success, user id:', data.user?.id)

  // Step 2: Create profile
  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user!.id,
    full_name: fullName,
    email: email
  })

  if (profileError) {
    console.error('Profile insert error:', profileError)
    throw profileError
  }

  console.log('Profile created successfully')

  // Step 3: Create progress row
  const { error: progressError } = await supabase.from('user_progress').insert({
    user_id: data.user!.id
  })

  if (progressError) {
    console.error('Progress insert error:', progressError)
    throw progressError
  }

  console.log('Progress row created successfully')

  return data
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    console.error('Sign in error:', error)
    throw error
  }
  return data
}

export const signOut = async () => {
  await supabase.auth.signOut()
}

export const getUser = async () => {
  const { data } = await supabase.auth.getUser()
  return data.user
}