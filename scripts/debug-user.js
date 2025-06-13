#!/usr/bin/env node

/**
 * Debug User Query Issues
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function debugUserQuery() {
  console.log('🔍 Debugging User Query...')
  console.log('========================')
  console.log('')

  // Test 1: Check if we can read users table at all
  console.log('1️⃣  Testing basic users table access...')
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
    
    if (error) {
      console.log(`❌ Cannot access users table: ${error.message}`)
      console.log('   This suggests RLS is blocking unauthenticated access')
      return
    }
    
    console.log(`✅ Users table accessible, count: ${JSON.stringify(data)}`)
  } catch (err) {
    console.log(`❌ Error: ${err.message}`)
    return
  }

  // Test 2: Try to read specific user without authentication
  console.log('')
  console.log('2️⃣  Testing specific user query (unauthenticated)...')
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', 'admin@cherrygifts.com')
    
    if (error) {
      console.log(`❌ Error: ${error.message}`)
      console.log('   RLS is likely blocking this query')
    } else {
      console.log(`✅ Found user: ${JSON.stringify(data)}`)
    }
  } catch (err) {
    console.log(`❌ Error: ${err.message}`)
  }

  // Test 3: Try with authentication
  console.log('')
  console.log('3️⃣  Testing query after authentication...')
  try {
    // First authenticate
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@cherrygifts.com',
      password: 'MySecurePassword123'
    })

    if (authError) {
      console.log(`❌ Auth failed: ${authError.message}`)
      return
    }

    console.log('✅ Authenticated successfully')

    // Now try the query
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, full_name')
      .eq('email', 'admin@cherrygifts.com')
    
    if (error) {
      console.log(`❌ Query failed even after auth: ${error.message}`)
    } else {
      console.log(`✅ Query successful after auth: ${JSON.stringify(data, null, 2)}`)
    }

    // Sign out
    await supabase.auth.signOut()

  } catch (err) {
    console.log(`❌ Error: ${err.message}`)
  }

  console.log('')
  console.log('💡 SOLUTION: The test script needs to authenticate first to read user data')
  console.log('   This is actually correct behavior - RLS is working as intended!')
}

debugUserQuery().catch(console.error)