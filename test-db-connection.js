import { createClient } from '@supabase/supabase-js';

// Test database connection
async function testConnection() {
  console.log('🔍 Testing database connection...');
  
  // Try to get environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://host.docker.internal:54321';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4dmltYWdmdm9ud3h5Z210Z3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODg4NjcsImV4cCI6MjA2Njg2NDg2N30.U0ZAojLgRS680JpP2HXZhm1Q_vce6i8o9k5zZ3Jx6LA';
  
  console.log('📡 Supabase URL:', supabaseUrl);
  console.log('🔑 Using default anon key (you may need to update this)');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test basic connection
    console.log('🔄 Testing basic connection...');
    const { data, error } = await supabase
      .from('donors')
      .select('donor_hash_id')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      console.log('\n🔧 Troubleshooting steps:');
      console.log('1. Make sure your Supabase instance is running');
      console.log('2. Check your .env file has correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
      console.log('3. Verify the database is accessible');
      return;
    }
    
    console.log('✅ Database connection successful!');
    
    // Test if donation_history table exists
    console.log('🔄 Checking if donation_history table exists...');
    const { data: historyData, error: historyError } = await supabase
      .from('donation_history')
      .select('history_id')
      .limit(1);
    
    if (historyError && historyError.code === '42P01') {
      console.log('❌ donation_history table does not exist');
      console.log('\n📋 To fix this, you need to run the migration:');
      console.log('1. Install Supabase CLI: https://supabase.com/docs/guides/cli');
      console.log('2. Run: supabase db push');
      console.log('3. Or manually run the SQL from: supabase/migrations/20250630200100_add_donation_history.sql');
    } else if (historyError) {
      console.log('❌ Error checking donation_history table:', historyError.message);
    } else {
      console.log('✅ donation_history table exists!');
    }
    
    // Test if functions exist
    console.log('🔄 Checking if database functions exist...');
    try {
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_donor_statistics', {
          p_donor_hash_id: 'test'
        });
      
      if (statsError && statsError.code === '42883') {
        console.log('❌ get_donor_statistics function does not exist');
        console.log('📋 This function should be created by the migration');
      } else if (statsError) {
        console.log('⚠️  Function exists but returned error (expected for test donor):', statsError.message);
      } else {
        console.log('✅ get_donor_statistics function exists!');
      }
    } catch (funcError) {
      console.log('❌ Error testing function:', funcError.message);
    }
    
    console.log('\n📝 Next steps:');
    console.log('1. If tables/functions are missing, run the migration');
    console.log('2. If connection fails, check your environment variables');
    console.log('3. Once everything is set up, run: node seed-donation-history.js');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the test
testConnection(); 