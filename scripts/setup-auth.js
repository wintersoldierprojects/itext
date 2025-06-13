#!/usr/bin/env node

/**
 * Automated Supabase Authentication Setup
 * This script will guide you through setting up authentication
 */

console.log('🚀 Supabase Authentication Setup')
console.log('================================\n')

console.log('📋 Please follow these steps:\n')

console.log('1️⃣  Go to your Supabase dashboard:')
console.log('   https://supabase.com/dashboard/project/tlgiqnqdtnowmciilnba\n')

console.log('2️⃣  Navigate to Authentication > Settings')
console.log('   URL: https://supabase.com/dashboard/project/tlgiqnqdtnowmciilnba/auth/users\n')

console.log('3️⃣  Enable "Allow new users to sign up" if it\'s disabled\n')

console.log('4️⃣  Go to Authentication > Users and click "Add user"')
console.log('   - Email: admin@cherrygifts.com')
console.log('   - Password: MySecurePassword123')
console.log('   - Auto-confirm: YES\n')

console.log('5️⃣  After creating the user, test the login:')
console.log('   npm run dev')
console.log('   Open: http://localhost:3000/admin')
console.log('   Login with the credentials above\n')

console.log('🎉 The app will automatically create the admin profile in the database!')
console.log('✅ Authentication setup will be complete!')