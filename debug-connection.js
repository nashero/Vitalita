// Debug script to test Supabase connection
// Run with: node debug-connection.js

import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in your supabase.ts file
const supabaseUrl = 'https://pxvimagfvontwxygmtgpi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4dmltYWdmdm9ud3h5Z210Z3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODg4NjcsImV4cCI6MjA2Njg2NDg2N30.U0ZAojLgRS680JpP2HXZhm1Q_vce6i8o9k5zZ3Jx6LA';

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n🔍 Testing basic connection...');
    
    // Test 1: Basic client creation
    console.log('✅ Supabase client created successfully');
    
    // Test 2: Try to query donation_centers table
    console.log('\n🔍 Testing database query...');
    const { data, error } = await supabase.from('donation_centers').select('count').limit(1);
    
    if (error) {
      console.error('❌ Database query failed:', error.message);
      
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('💡 Solution: Run your Supabase migrations to create the required tables');
      } else if (error.message.includes('JWT')) {
        console.log('💡 Solution: Check your Supabase API key in the dashboard');
      } else if (error.message.includes('fetch')) {
        console.log('💡 Solution: Check your internet connection and Supabase URL');
      }
      
      return false;
    } else {
      console.log('✅ Database query successful');
      console.log('📊 Data:', data);
      return true;
    }
    
  } catch (err) {
    console.error('❌ Connection test failed:', err);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Supabase connection is working!');
  } else {
    console.log('\n❌ Supabase connection failed. Check the error messages above.');
  }
  process.exit(success ? 0 : 1);
}); 