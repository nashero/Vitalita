import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pxvimagfvonwxygmtgpi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4dmltYWdmdm9ud3h5Z210Z3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODg4NjcsImV4cCI6MjA2Njg2NDg2N30.U0ZAojLgRS680JpP2HXZhm1Q_vce6i8o9k5zZ3Jx6LA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFunction() {
  try {
    console.log('Testing register_donor_with_email function...');
    
    // Test 1: Check if the function exists by calling it with minimal parameters
    console.log('\n--- Test 1: Check if function exists ---');
    const { data: functionTest, error: functionError } = await supabase
      .rpc('register_donor_with_email', {
        p_donor_hash_id: 'test_hash_id',
        p_salt: 'test_salt',
        p_email: 'test@example.com',
        p_avis_donor_center: 'Test Center'
      });
    
    if (functionError) {
      console.error('Function call error:', functionError);
      console.error('Error details:', {
        code: functionError.code,
        message: functionError.message,
        details: functionError.details,
        hint: functionError.hint
      });
    } else {
      console.log('Function exists and returned:', functionTest);
    }
    
    // Test 2: Check if the donors table structure is correct
    console.log('\n--- Test 2: Check donors table structure ---');
    const { data: tableInfo, error: tableError } = await supabase
      .from('donors')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('Table access error:', tableError);
    } else {
      console.log('Table structure sample:', Object.keys(tableInfo[0] || {}));
    }
    
    // Test 3: Check if audit_logs table exists
    console.log('\n--- Test 3: Check audit_logs table ---');
    const { data: auditInfo, error: auditError } = await supabase
      .from('audit_logs')
      .select('*')
      .limit(1);
    
    if (auditError) {
      console.error('Audit logs table error:', auditError);
    } else {
      console.log('Audit logs table accessible');
    }
    
    // Test 4: Check if the generate_verification_token function exists
    console.log('\n--- Test 4: Check generate_verification_token function ---');
    const { data: tokenResult, error: tokenError } = await supabase
      .rpc('generate_verification_token');
    
    if (tokenError) {
      console.error('Token generation error:', tokenError);
    } else {
      console.log('Token generation successful:', tokenResult);
    }
    
    // Test 5: Check if the send_verification_email function exists
    console.log('\n--- Test 5: Check send_verification_email function ---');
    const { data: emailResult, error: emailError } = await supabase
      .rpc('send_verification_email', {
        p_email: 'test@example.com',
        p_verification_token: 'test_token',
        p_donor_hash_id: 'test_hash_id'
      });
    
    if (emailError) {
      console.error('Email function error:', emailError);
    } else {
      console.log('Email function successful:', emailResult);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
    console.error('Error stack:', error.stack);
  }
}

// Run the test
console.log('Starting function test...');
testFunction().then(() => {
  console.log('Function test completed');
}).catch((error) => {
  console.error('Function test failed with promise rejection:', error);
}); 