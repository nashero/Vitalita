/**
 * Test Script for Donor Password System
 * 
 * This script tests the password system functionality including:
 * - Password creation and verification
 * - Session management
 * - Device tracking
 * - Database functions
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.log('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPasswordSystem() {
  console.log('🧪 Testing Donor Password System...\n');

  try {
    // Test 1: Check if new columns exist
    console.log('1. Checking database schema...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'donors')
      .eq('table_schema', 'public')
      .in('column_name', [
        'password_hash', 'password_salt', 'password_created_at', 'password_updated_at',
        'last_login_at', 'last_login_ip', 'last_login_device', 'session_token', 'session_expires_at'
      ]);

    if (columnsError) {
      console.error('❌ Error checking columns:', columnsError);
      return;
    }

    const expectedColumns = [
      'password_hash', 'password_salt', 'password_created_at', 'password_updated_at',
      'last_login_at', 'last_login_ip', 'last_login_device', 'session_token', 'session_expires_at'
    ];

    const foundColumns = columns.map(col => col.column_name);
    const missingColumns = expectedColumns.filter(col => !foundColumns.includes(col));

    if (missingColumns.length > 0) {
      console.error('❌ Missing columns:', missingColumns);
      return;
    }

    console.log('✅ All required columns found');
    console.log('   Found columns:', foundColumns.join(', '));

    // Test 2: Check if functions exist
    console.log('\n2. Checking database functions...');
    const { data: functions, error: functionsError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_schema', 'public')
      .in('routine_name', [
        'set_donor_password', 'verify_donor_password', 'create_donor_session',
        'validate_donor_session', 'clear_donor_session', 'log_password_event'
      ]);

    if (functionsError) {
      console.error('❌ Error checking functions:', functionsError);
      return;
    }

    const expectedFunctions = [
      'set_donor_password', 'verify_donor_password', 'create_donor_session',
      'validate_donor_session', 'clear_donor_session', 'log_password_event'
    ];

    const foundFunctions = functions.map(func => func.routine_name);
    const missingFunctions = expectedFunctions.filter(func => !foundFunctions.includes(func));

    if (missingFunctions.length > 0) {
      console.error('❌ Missing functions:', missingFunctions);
      return;
    }

    console.log('✅ All required functions found');
    console.log('   Found functions:', foundFunctions.join(', '));

    // Test 3: Check if indexes exist
    console.log('\n3. Checking database indexes...');
    const { data: indexes, error: indexesError } = await supabase
      .from('pg_indexes')
      .select('indexname')
      .eq('tablename', 'donors')
      .in('indexname', [
        'idx_donors_session_token', 'idx_donors_last_login', 'idx_donors_active_sessions'
      ]);

    if (indexesError) {
      console.error('❌ Error checking indexes:', indexesError);
      return;
    }

    const expectedIndexes = [
      'idx_donors_session_token', 'idx_donors_last_login', 'idx_donors_active_sessions'
    ];

    const foundIndexes = indexes.map(idx => idx.indexname);
    const missingIndexes = expectedIndexes.filter(idx => !foundIndexes.includes(idx));

    if (missingIndexes.length > 0) {
      console.error('❌ Missing indexes:', missingIndexes);
      return;
    }

    console.log('✅ All required indexes found');
    console.log('   Found indexes:', foundIndexes.join(', '));

    // Test 4: Test password function (with a test donor)
    console.log('\n4. Testing password functions...');
    
    // Create a test donor hash ID
    const testDonorHashId = 'test_' + Date.now().toString(36);
    const testPassword = 'TestPassword123';

    // Test set_donor_password function
    const { data: setPasswordResult, error: setPasswordError } = await supabase.rpc('set_donor_password', {
      p_donor_hash_id: testDonorHashId,
      p_password: testPassword
    });

    if (setPasswordError) {
      console.error('❌ Error setting password:', setPasswordError);
      return;
    }

    console.log('✅ Password set successfully');

    // Test verify_donor_password function
    const { data: verifyResult, error: verifyError } = await supabase.rpc('verify_donor_password', {
      p_donor_hash_id: testDonorHashId,
      p_password: testPassword
    });

    if (verifyError) {
      console.error('❌ Error verifying password:', verifyError);
      return;
    }

    if (verifyResult) {
      console.log('✅ Password verification successful');
    } else {
      console.error('❌ Password verification failed');
      return;
    }

    // Test with wrong password
    const { data: wrongPasswordResult, error: wrongPasswordError } = await supabase.rpc('verify_donor_password', {
      p_donor_hash_id: testDonorHashId,
      p_password: 'WrongPassword123'
    });

    if (wrongPasswordError) {
      console.error('❌ Error testing wrong password:', wrongPasswordError);
      return;
    }

    if (!wrongPasswordResult) {
      console.log('✅ Wrong password correctly rejected');
    } else {
      console.error('❌ Wrong password incorrectly accepted');
      return;
    }

    // Test 5: Test session functions
    console.log('\n5. Testing session functions...');
    
    // Test create_donor_session function
    const { data: sessionToken, error: createSessionError } = await supabase.rpc('create_donor_session', {
      p_donor_hash_id: testDonorHashId,
      p_ip_address: '127.0.0.1',
      p_device_info: 'Test Device'
    });

    if (createSessionError) {
      console.error('❌ Error creating session:', createSessionError);
      return;
    }

    if (sessionToken) {
      console.log('✅ Session created successfully');
      console.log('   Session token:', sessionToken.substring(0, 16) + '...');
    } else {
      console.error('❌ Session creation failed');
      return;
    }

    // Test validate_donor_session function
    const { data: sessionValidation, error: validateSessionError } = await supabase.rpc('validate_donor_session', {
      p_session_token: sessionToken
    });

    if (validateSessionError) {
      console.error('❌ Error validating session:', validateSessionError);
      return;
    }

    if (sessionValidation && sessionValidation.length > 0 && sessionValidation[0].is_valid) {
      console.log('✅ Session validation successful');
    } else {
      console.error('❌ Session validation failed');
      return;
    }

    // Test clear_donor_session function
    const { data: clearSessionResult, error: clearSessionError } = await supabase.rpc('clear_donor_session', {
      p_donor_hash_id: testDonorHashId
    });

    if (clearSessionError) {
      console.error('❌ Error clearing session:', clearSessionError);
      return;
    }

    if (clearSessionResult) {
      console.log('✅ Session cleared successfully');
    } else {
      console.error('❌ Session clearing failed');
      return;
    }

    // Test 6: Clean up test data
    console.log('\n6. Cleaning up test data...');
    
    // Remove test donor record
    const { error: cleanupError } = await supabase
      .from('donors')
      .delete()
      .eq('donor_hash_id', testDonorHashId);

    if (cleanupError) {
      console.warn('⚠️  Warning: Could not clean up test donor record:', cleanupError);
    } else {
      console.log('✅ Test data cleaned up');
    }

    // Final success message
    console.log('\n🎉 All tests passed! The password system is working correctly.');
    console.log('\n📋 Summary of verified features:');
    console.log('   ✅ Database schema updated');
    console.log('   ✅ Password management functions working');
    console.log('   ✅ Session management functions working');
    console.log('   ✅ Security indexes created');
    console.log('   ✅ Password verification working');
    console.log('   ✅ Session creation and validation working');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  }
}

// Run the tests
testPasswordSystem().catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
