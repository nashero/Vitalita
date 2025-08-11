const { createClient } = require('@supabase/supabase-js');

// You'll need to add your Supabase URL and anon key here
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStatusTables() {
  console.log('Testing donation status tables...\n');

  // Test 1: Check if donation_statuses table exists
  console.log('1. Testing donation_statuses table...');
  try {
    const { data, error } = await supabase
      .from('donation_statuses')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('❌ Error with donation_statuses:', error.message);
    } else {
      console.log('✅ donation_statuses table exists');
      console.log('   Data:', data);
    }
  } catch (err) {
    console.log('❌ Exception with donation_statuses:', err.message);
  }

  // Test 2: Check alternative table names
  const alternativeTables = ['donation_status', 'statuses', 'status_lookup', 'appointment_statuses'];
  
  for (const tableName of alternativeTables) {
    console.log(`\n2. Testing ${tableName} table...`);
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(5);
      
      if (error) {
        console.log(`❌ Error with ${tableName}:`, error.message);
      } else {
        console.log(`✅ ${tableName} table exists`);
        console.log('   Data:', data);
      }
    } catch (err) {
      console.log(`❌ Exception with ${tableName}:`, err.message);
    }
  }

  // Test 3: Check what tables exist in the database
  console.log('\n3. Checking available tables...');
  try {
    // This is a generic approach - Supabase doesn't have a direct "show tables" command
    // But we can try to query information_schema if available
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (error) {
      console.log('❌ Cannot access information_schema:', error.message);
      console.log('   This is normal for Supabase - table discovery is limited');
    } else {
      console.log('✅ Available tables:', data.map(t => t.table_name));
    }
  } catch (err) {
    console.log('❌ Exception with information_schema:', err.message);
  }
}

testStatusTables().catch(console.error); 