#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://tlgiqnqdtnowmciilnba.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsZ2lxbnFkdG5vd21jaWlsbmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTg5ODIsImV4cCI6MjA2NDk5NDk4Mn0.qF2w9StacVZZj7U578N_HrhGbsZvEPASBThaJkWjzYI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAdminLogin() {
  console.log('🔍 Testing Admin Login...\n')

  try {
    const adminEmail = 'admin@cherrygifts.com'
    const adminPassword = 'MySecurePassword123'

    console.log(`Attempting to login with: ${adminEmail}`)
    
    // Try to sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    })

    if (authError) {
      console.log('❌ Login failed:', authError.message)
      console.log('Error details:', JSON.stringify(authError, null, 2))
      
      // Let's check if the user exists in auth.users
      console.log('\n🔍 Checking if user exists in database...')
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .eq('email', adminEmail)
      
      if (users && users.length > 0) {
        console.log('✅ User exists in users table:', users[0])
      } else {
        console.log('❌ User not found in users table')
      }
      
      return
    }

    console.log('✅ Login successful!')
    console.log('User ID:', authData.user?.id)
    console.log('Email:', authData.user?.email)
    console.log('Session exists:', !!authData.session)

    if (authData.user) {
      // Check user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (profileError) {
        console.log('❌ Cannot fetch user profile:', profileError.message)
      } else {
        console.log('✅ User profile:', userProfile)
      }
    }

    // Sign out
    await supabase.auth.signOut()
    console.log('✅ Signed out successfully')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testAdminLogin()