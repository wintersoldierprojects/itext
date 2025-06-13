// Quick debug script to test Supabase connection and admin user
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tlgiqnqdtnowmciilnba.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsZ2lxbnFkdG5vd21jaWlsbmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTg5ODIsImV4cCI6MjA2NDk5NDk4Mn0.qF2w9StacVZZj7U578N_HrhGbsZvEPASBThaJkWjzYI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('🔍 Testing Supabase authentication...');
  
  try {
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Try to sign in with admin credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@cherrygifts.com',
      password: 'MySecurePassword123'
    });
    
    if (error) {
      console.error('❌ Admin login failed:', error);
      
      // Check if user exists in auth.users
      console.log('📋 Checking if admin user exists in auth system...');
      
    } else {
      console.log('✅ Admin login successful!');
      console.log('👤 User ID:', data.user.id);
      console.log('📧 Email:', data.user.email);
      
      // Check user role in database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (userError) {
        console.error('❌ User data fetch failed:', userError);
      } else {
        console.log('👤 User data:', userData);
      }
      
      // Sign out
      await supabase.auth.signOut();
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testAuth();