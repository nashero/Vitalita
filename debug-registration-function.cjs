const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugRegistrationFunction() {
  console.log('🔍 Debugging register_donor_with_email function...\n');

  try {
    // Test 1: Check if function exists and get its definition
    console.log('1. Checking function definition...');
    const { data: functionInfo, error: functionError } = await supabase
      .from('information_schema.routines')
      .select('routine_name, routine_type, data_type, routine_definition')
      .eq('routine_name', 'register_donor_with_email')
      .eq('routine_schema', 'public');

    if (functionError) {
      console.error('❌ Error checking function:', functionError);
    } else if (functionInfo && functionInfo.length > 0) {
      console.log('✅ Function exists');
      console.log('   Type:', functionInfo[0].routine_type);
      console.log('   Return type:', functionInfo[0].data_type);
      console.log('   Definition preview:', functionInfo[0].routine_definition?.substring(0, 200) + '...');
    } else {
      console.log('❌ Function not found');
    }

    // Test 2: Try to call the function with test data
    console.log('\n2. Testing function call...');
    const testParams = {
      p_donor_hash_id: 'test_hash_' + Date.now(),
      p_salt: 'test_salt_' + Date.now(),
      p_email: 'test@example.com',
      p_avis_donor_center: 'AVIS Test Center'
    };

    console.log('   Calling with params:', testParams);

    const { data: result, error: callError } = await supabase
      .rpc('register_donor_with_email', testParams);

    if (callError) {
      console.error('❌ Function call error:', callError);
      console.error('   Code:', callError.code);
      console.error('   Message:', callError.message);
      console.error('   Details:', callError.details);
      console.error('   Hint:', callError.hint);
    } else {
      console.log('✅ Function call successful');
      console.log('   Result type:', typeof result);
      console.log('   Result:', result);
      if (Array.isArray(result)) {
        console.log('   Array length:', result.length);
        result.forEach((item, index) => {
          console.log(`   Item ${index}:`, item);
        });
      }
    }

    // Test 3: Check if donors table exists and has correct structure
    console.log('\n3. Checking donors table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'donors')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (tableError) {
      console.error('❌ Error checking table:', tableError);
    } else if (tableInfo && tableInfo.length > 0) {
      console.log('✅ Donors table exists with columns:');
      tableInfo.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    } else {
      console.log('❌ Donors table not found');
    }

    // Test 4: Check RLS policies
    console.log('\n4. Checking RLS policies...');
    const { data: policies, error: policyError } = await supabase
      .from('pg_policies')
      .select('tablename, policyname, permissive, roles, cmd, qual, with_check')
      .eq('tablename', 'donors');

    if (policyError) {
      console.error('❌ Error checking policies:', policyError);
    } else if (policies && policies.length > 0) {
      console.log('✅ RLS policies for donors table:');
      policies.forEach(policy => {
        console.log(`   ${policy.policyname}: ${policy.cmd} (${policy.permissive ? 'permissive' : 'restrictive'})`);
      });
    } else {
      console.log('❌ No RLS policies found for donors table');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugRegistrationFunction();
