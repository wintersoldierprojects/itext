#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Supabase configuration (values loaded from environment variables)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabase() {
  console.log('🔍 Testing Supabase Connection...\n')

  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...')
    const { data: healthCheck, error: healthError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })
    
    if (healthError) {
      console.log('❌ Connection failed:', healthError.message)
      return
    }
    console.log('✅ Connection successful\n')

    // Test 2: Check if database schema exists
    console.log('2. Checking database schema...')
    const tableChecks = []
    
    const tables = ['users', 'conversations', 'messages', 'typing_indicators']
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1)
        if (error) {
          tableChecks.push(`❌ ${table} table error: ${error.message}`)
        } else {
          tableChecks.push(`✅ ${table} table exists`)
        }
      } catch (error) {
        tableChecks.push(`❌ ${table} table missing: ${error.message}`)
      }
    }
    
    console.log('Database tables:')
    tableChecks.forEach(item => console.log(`  ${item}`))
    console.log('')

    // Test 3: Test authentication
    console.log('3. Testing authentication...')
    
    // Test sign up
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'test123456'
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    })

    if (signUpError) {
      console.log('❌ Auth test failed:', signUpError.message)
    } else {
      console.log('✅ Authentication working')
      console.log('User ID:', signUpData.user?.id)
      
      // Clean up test user
      if (signUpData.user) {
        await supabase.auth.admin.deleteUser(signUpData.user.id).catch(() => {
          console.log('Note: Could not clean up test user (normal if not admin)')
        })
      }
    }
    console.log('')

    // Test 4: Check if users table has data
    console.log('4. Checking existing users...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role, instagram_username')
      .limit(5)

    if (usersError) {
      console.log('❌ Cannot query users table:', usersError.message)
    } else {
      console.log(`✅ Users table accessible, found ${users.length} users`)
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.role}) @${user.instagram_username || 'no-instagram'}`)
      })
    }
    console.log('')

    // Test 5: Check RLS policies
    console.log('5. Testing Row Level Security...')
    try {
      const { data: publicAccess } = await supabase
        .from('users')
        .select('*')
        .limit(1)
      
      if (publicAccess && publicAccess.length > 0) {
        console.log('❌ RLS might not be properly configured - public access allowed')
      } else {
        console.log('✅ RLS appears to be working - no public access')
      }
    } catch (error) {
      console.log('✅ RLS working - access restricted')
    }
    console.log('')

    console.log('🎉 Supabase test completed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testSupabase()