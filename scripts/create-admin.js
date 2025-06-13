#!/usr/bin/env node

/**
 * Script to create the first admin user in Supabase
 * 
 * Usage:
 * node scripts/create-admin.js <email> <password>
 * 
 * Example:
 * node scripts/create-admin.js admin@cherrygifts.com mySecurePassword123
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function createAdmin(email, password) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  try {
    console.log('🚀 Creating admin user...')
    
    // First, create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Skip email confirmation
    })

    if (authError) {
      throw authError
    }

    console.log('✅ Auth user created:', authData.user.id)

    // Then create the profile in the users table
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        role: 'admin',
        full_name: 'Admin User',
        is_online: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      throw profileError
    }

    console.log('✅ Admin profile created successfully!')
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Password: ${password}`)
    console.log('🎉 Admin user is ready to use!')

  } catch (error) {
    console.error('❌ Error creating admin:', error.message)
    process.exit(1)
  }
}

// Get command line arguments
const args = process.argv.slice(2)
if (args.length !== 2) {
  console.log('Usage: node scripts/create-admin.js <email> <password>')
  console.log('Example: node scripts/create-admin.js admin@cherrygifts.com mySecurePassword123')
  process.exit(1)
}

const [email, password] = args
createAdmin(email, password)