const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRegistrationFix() {
  console.log('🧪 Testing Registration Function Fix...\n');

  try {
    // Test 1: Check if function exists and has correct signature
    console.log('1. Checking function signature...');
    const { data: functionInfo, error: functionError } = await supabase
      .from('information_schema.routines')
      .select('routine_name, routine_type, data_type')
      .eq('routine_name', 'register_donor_with_email')
      .eq('routine_schema', 'public');

    if (functionError) {
      console.error('❌ Error checking function:', functionError);
      return;
    }

    if (functionInfo && functionInfo.length > 0) {
      console.log('✅ Function exists');
      console.log('   Type:', functionInfo[0].routine_type);
      console.log('   Return type:', functionInfo[0].data_type);
      
      // Check if it returns the correct type (should be TABLE)
      if (functionInfo[0].data_type === 'USER-DEFINED') {
        console.log('   ✅ Function returns TABLE type (correct)');
      } else {
        console.log('   ❌ Function returns wrong type:', functionInfo[0].data_type);
        console.log('   Expected: USER-DEFINED (TABLE), Got:', functionInfo[0].data_type);
      }
    } else {
      console.log('❌ Function not found');
      return;
    }

    // Test 2: Check if required dependencies exist
    console.log('\n2. Checking required dependencies...');
    
    // Check generate_verification_token
    const { data: tokenFunc, error: tokenError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_name', 'generate_verification_token')
      .eq('routine_schema', 'public');
    
    if (tokenFunc && tokenFunc.length > 0) {
      console.log('   ✅ generate_verification_token function exists');
    } else {
      console.log('   ❌ generate_verification_token function missing');
    }

    // Check generate_donor_id
    const { data: donorIdFunc, error: donorIdError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_name', 'generate_donor_id')
      .eq('routine_schema', 'public');
    
    if (donorIdFunc && donorIdFunc.length > 0) {
      console.log('   ✅ generate_donor_id function exists');
    } else {
      console.log('   ❌ generate_donor_id function missing');
    }

    // Check send_verification_email
    const { data: emailFunc, error: emailError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_name', 'send_verification_email')
      .eq('routine_schema', 'public');
    
    if (emailFunc && emailFunc.length > 0) {
      console.log('   ✅ send_verification_email function exists');
    } else {
      console.log('   ❌ send_verification_email function missing');
    }

    // Test 3: Try to call the function with test data
    console.log('\n3. Testing function call...');
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
        
        // Check if result has expected structure
        if (result.length > 0 && result[0].donor_id && result[0].success) {
          console.log('   ✅ Result has correct structure');
        } else {
          console.log('   ❌ Result has incorrect structure');
        }
      } else {
        console.log('   ❌ Result is not an array as expected');
      }
    }

    // Test 4: Clean up test data
    if (result && Array.isArray(result) && result.length > 0 && result[0].donor_id) {
      console.log('\n4. Cleaning up test data...');
      
      // Delete test donor
      const { error: deleteError } = await supabase
        .from('donors')
        .delete()
        .eq('donor_hash_id', testParams.p_donor_hash_id);
      
      if (deleteError) {
        console.log('   ⚠️ Could not clean up test donor:', deleteError.message);
      } else {
        console.log('   ✅ Test donor cleaned up');
      }
      
      // Delete test audit logs
      const { error: auditDeleteError } = await supabase
        .from('audit_logs')
        .delete()
        .eq('user_id', testParams.p_donor_hash_id);
      
      if (auditDeleteError) {
        console.log('   ⚠️ Could not clean up test audit logs:', auditDeleteError.message);
      } else {
        console.log('   ✅ Test audit logs cleaned up');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testRegistrationFix();
