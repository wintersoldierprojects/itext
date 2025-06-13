// Load environment variables from .env.local if available
require('dotenv').config({ path: '.env.local' });

// Check if Supabase module is available
let createClient;
try {
  createClient = require('@supabase/supabase-js').createClient;
  console.log('✅ Supabase module loaded successfully');
} catch (error) {
  console.error('❌ Failed to load @supabase/supabase-js');
  console.error('Run: npm install @supabase/supabase-js');
  process.exit(1);
}

// Environment variables with fallbacks
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tlgiqnqdtnowmciilnba.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsZ2lxbnFkdG5vd21jaWlsbmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTg5ODIsImV4cCI6MjA2NDk5NDk4Mn0.qF2w9StacVZZj7U578N_HrhGbsZvEPASBThaJkWjzYI';

console.log('🔧 Configuration:');
console.log(`   URL: ${SUPABASE_URL}`);
console.log(`   Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
console.log('');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSpeed() {
  console.log('🔍 Testing database connection speed...\n');
  
  const tests = [
    { table: 'users', description: 'User authentication table' },
    { table: 'conversations', description: 'Chat conversations' },
    { table: 'messages', description: 'Chat messages' }
  ];
  
  for (const test of tests) {
    const start = Date.now();
    try {
      const { data, error } = await supabase
        .from(test.table)
        .select('*')
        .limit(1);
      
      const time = Date.now() - start;
      const status = time < 100 ? '✅ EXCELLENT' : time < 500 ? '⚠️ ACCEPTABLE' : '❌ SLOW';
      
      console.log(`${test.table.padEnd(15)} | ${time.toString().padStart(4)}ms | ${status} | ${test.description}`);
      
      if (error) {
        console.log(`   Error: ${error.message}`);
      } else {
        console.log(`   Records found: ${data?.length || 0}`);
      }
    } catch (error) {
      console.log(`${test.table.padEnd(15)} | ERROR | ❌ FAILED | ${error.message}`);
    }
    console.log('');
  }
  
  console.log('📊 Performance Guidelines:');
  console.log('   ✅ < 100ms: Excellent (Production ready)');
  console.log('   ⚠️ 100-500ms: Acceptable (May need optimization)');
  console.log('   ❌ > 500ms: Slow (Requires immediate attention)');
}

testSpeed().catch(console.error);
