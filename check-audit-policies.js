import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pxvimagfvonwxygmtgpi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4dmltYWdmdm9ud3h5Z210Z3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODg4NjcsImV4cCI6MjA2Njg2NDg2N30.U0ZAojLgRS680JpP2HXZhm1Q_vce6i8o9k5zZ3Jx6LA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAuditPolicies() {
  try {
    console.log('Checking audit_logs table policies...');
    
    // Test 1: Check if we can read from audit_logs
    console.log('\n--- Test 1: Reading from audit_logs ---');
    const { data: auditRead, error: readError } = await supabase
      .from('audit_logs')
      .select('*')
      .limit(1);
    
    if (readError) {
      console.error('Read error:', readError);
    } else {
      console.log('Read successful, found records:', auditRead.length);
    }
    
    // Test 2: Try to insert into audit_logs
    console.log('\n--- Test 2: Inserting into audit_logs ---');
    const { data: auditInsert, error: insertError } = await supabase
      .from('audit_logs')
      .insert({
        user_id: 'test_user_id',
        user_type: 'system',
        action: 'test_insert',
        details: 'Testing audit log insertion',
        resource_type: 'test',
        resource_id: 'test_id',
        status: 'success'
      })
      .select();
    
    if (insertError) {
      console.error('Insert error:', insertError);
      console.error('Error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
    } else {
      console.log('Insert successful:', auditInsert);
    }
    
    // Test 3: Check if the create_audit_log function works
    console.log('\n--- Test 3: Testing create_audit_log function ---');
    const { data: functionResult, error: functionError } = await supabase
      .rpc('create_audit_log', {
        p_user_id: 'test_user_id',
        p_user_type: 'system',
        p_action: 'test_function',
        p_details: 'Testing create_audit_log function',
        p_status: 'success'
      });
    
    if (functionError) {
      console.error('Function error:', functionError);
    } else {
      console.log('Function successful:', functionResult);
    }
    
  } catch (error) {
    console.error('Check failed:', error);
  }
}

// Run the check
console.log('Starting audit policies check...');
checkAuditPolicies().then(() => {
  console.log('Audit policies check completed');
}).catch((error) => {
  console.error('Audit policies check failed:', error);
}); 