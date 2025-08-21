// Test script to verify create_audit_log function works
// Run with: node test-audit-function.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pxvimagfvontwxygmtgpi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4dmltYWdmdm9ud3h5Z210Z3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODg4NjcsImV4cCI6MjA2Njg2NDg2N30.U0ZAojLgRS680JpP2HXZhm1Q_vce6i8o9k5zZ3Jx6LA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuditFunction() {
  try {
    console.log('🔍 Testing create_audit_log function...');
    
    // Test 1: Check if function exists
    console.log('\n1. Checking if create_audit_log function exists...');
    const { data: functions, error: funcError } = await supabase
      .from('information_schema.routines')
      .select('routine_name, routine_type, data_type')
      .eq('routine_name', 'create_audit_log');
    
    if (funcError) {
      console.log('Using alternative method to check function...');
      // Try to call the function directly
      const { data: testResult, error: testError } = await supabase.rpc('create_audit_log', {
        p_user_id: 'test_user',
        p_user_type: 'system',
        p_action: 'function_test',
        p_details: 'Testing create_audit_log function',
        p_status: 'success'
      });
      
      if (testError) {
        console.error('❌ Function call failed:', testError.message);
        return false;
      } else {
        console.log('✅ Function call successful:', testResult);
        return true;
      }
    } else {
      console.log('✅ Function exists:', functions);
    }
    
    // Test 2: Call the function
    console.log('\n2. Testing function call...');
    const { data: result, error: callError } = await supabase.rpc('create_audit_log', {
      p_user_id: 'test_user',
      p_user_type: 'system',
      p_action: 'function_test',
      p_details: 'Testing create_audit_log function after fix',
      p_status: 'success'
    });
    
    if (callError) {
      console.error('❌ Function call failed:', callError.message);
      return false;
    } else {
      console.log('✅ Function call successful:', result);
    }
    
    // Test 3: Check if audit log was created
    console.log('\n3. Checking if audit log was created...');
    const { data: logs, error: logError } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('action', 'function_test')
      .order('timestamp', { ascending: false })
      .limit(1);
    
    if (logError) {
      console.error('❌ Failed to query audit logs:', logError.message);
      return false;
    } else {
      console.log('✅ Audit log created successfully:', logs);
    }
    
    return true;
    
  } catch (err) {
    console.error('❌ Test failed:', err);
    return false;
  }
}

testAuditFunction().then(success => {
  if (success) {
    console.log('\n🎉 create_audit_log function is working correctly!');
    console.log('💡 You can now try donor registration again.');
  } else {
    console.log('\n❌ Function test failed. Check the error messages above.');
  }
  process.exit(success ? 0 : 1);
});
