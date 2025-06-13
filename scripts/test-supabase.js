#!/usr/bin/env node

/**
 * Test Supabase Connection and Authentication
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Testing Supabase Connection...')
console.log('================================')
console.log('')

// Test 1: Connection
console.log('1️⃣  Testing Supabase connection...')
console.log(`   URL: ${supabaseUrl}`)
console.log(`   Key: ${supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NOT SET'}`)

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
console.log('✅ Supabase client created')
console.log('')

// Test 2: Database Tables
console.log('2️⃣  Testing database tables...')

async function testTables() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log(`❌ Database error: ${error.message}`)
      console.log('   Make sure you ran the SQL schema in Supabase dashboard')
      return false
    }
    
    console.log('✅ Database tables accessible')
    return true
  } catch (err) {
    console.log(`❌ Connection error: ${err.message}`)
    return false
  }
}

// Test 3: Check for admin user
async function checkAdminUser() {
  console.log('')
  console.log('3️⃣  Checking for admin user...')
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@cherrygifts.com')
    
    if (error) {
      console.log(`❌ Error checking user: ${error.message}`)
      return false
    }
    
    if (data && data.length > 0) {
      console.log('✅ Admin user found in database:')
      console.log(`   Email: ${data[0].email}`)
      console.log(`   Role: ${data[0].role}`)
      console.log(`   ID: ${data[0].id}`)
      return true
    } else {
      console.log('❌ Admin user not found in users table')
      console.log('   The user might exist in auth.users but not in public.users')
      return false
    }
  } catch (err) {
    console.log(`❌ Error: ${err.message}`)
    return false
  }
}

// Test 4: Authentication
async function testAuth() {
  console.log('')
  console.log('4️⃣  Testing authentication...')
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@cherrygifts.com',
      password: 'MySecurePassword123'
    })
    
    if (error) {
      console.log(`❌ Auth error: ${error.message}`)
      
      if (error.message.includes('Invalid login credentials')) {
        console.log('')
        console.log('💡 SOLUTION: The user exists in Supabase Auth but login failed.')
        console.log('   This could be because:')
        console.log('   1. Email confirmation is required')
        console.log('   2. Wrong password')
        console.log('   3. User is disabled')
        console.log('')
        console.log('   Go to: https://supabase.com/dashboard/project/tlgiqnqdtnowmciilnba/auth/users')
        console.log('   Find the user and check:')
        console.log('   - ✅ Email Confirmed: YES')
        console.log('   - Or delete and recreate with "Auto Confirm" enabled')
      }
      
      return false
    }
    
    if (data.user) {
      console.log('✅ Authentication successful!')
      console.log(`   User ID: ${data.user.id}`)
      console.log(`   Email: ${data.user.email}`)
      
      // Sign out after test
      await supabase.auth.signOut()
      return true
    }
    
  } catch (err) {
    console.log(`❌ Auth test error: ${err.message}`)
    return false
  }
}

// Run all tests
async function runTests() {
  const tablesOk = await testTables()
  if (!tablesOk) return
  
  const userExists = await checkAdminUser()
  const authWorks = await testAuth()
  
  console.log('')
  console.log('📋 Summary:')
  console.log(`   Database: ${tablesOk ? '✅' : '❌'}`)
  console.log(`   Admin User: ${userExists ? '✅' : '❌'}`)
  console.log(`   Authentication: ${authWorks ? '✅' : '❌'}`)
  
  if (tablesOk && authWorks) {
    console.log('')
    console.log('🎉 Everything is working! Try logging in again.')
  }
}

runTests().catch(console.error)