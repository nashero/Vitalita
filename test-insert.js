import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Supabase configuration
const supabaseUrl = 'https://pxvimagfvonwxygmtgpi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4dmltYWdmdm9ud3h5Z210Z3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODg4NjcsImV4cCI6MjA2Njg2NDg2N30.U0ZAojLgRS680JpP2HXZhm1Q_vce6i8o9k5zZ3Jx6LA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to generate SHA256 hash
function generateSHA256Hash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

async function testManualInsert() {
  try {
    console.log('Testing manual donor insertion...');
    
    // Generate test data
    const firstName = 'Test';
    const lastName = 'User';
    const dateOfBirth = '1990-01-01';
    const avisDonorCenter = 'Test Center';
    const email = 'test.user@example.com';
    
    const authString = `${firstName}${lastName}${dateOfBirth}${avisDonorCenter}`;
    const donorHashId = generateSHA256Hash(authString);
    const salt = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    console.log('Test donor_hash_id:', donorHashId);
    console.log('Test salt:', salt);
    
    // Test 1: Try to insert directly into donors table
    console.log('\n--- Test 1: Manual insert into donors table ---');
    const { data: insertResult, error: insertError } = await supabase
      .from('donors')
      .insert({
        donor_hash_id: donorHashId,
        salt: salt,
        email: email,
        email_verified: false,
        verification_token: null,
        verification_token_expires: null,
        account_activated: false,
        activation_date: null,
        preferred_language: 'en',
        preferred_communication_channel: 'email',
        initial_vetting_status: false,
        total_donations_this_year: 0,
        last_donation_date: null,
        is_active: false,
        avis_donor_center: avisDonorCenter
      })
      .select();
    
    if (insertError) {
      console.error('Manual insert error:', insertError);
      console.error('Error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
    } else {
      console.log('Manual insert successful:', insertResult);
    }
    
    // Test 2: Check if the record was actually created
    console.log('\n--- Test 2: Verify record creation ---');
    const { data: verifyResult, error: verifyError } = await supabase
      .from('donors')
      .select('*')
      .eq('donor_hash_id', donorHashId)
      .single();
    
    if (verifyError) {
      console.error('Verification error:', verifyError);
    } else {
      console.log('Record verified:', verifyResult);
    }
    
    // Test 3: Try to insert audit log
    console.log('\n--- Test 3: Test audit log insertion ---');
    const { data: auditResult, error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        user_id: donorHashId,
        user_type: 'donor',
        action: 'test_registration',
        details: 'Test registration for debugging',
        resource_type: 'donors',
        resource_id: donorHashId,
        status: 'success'
      })
      .select();
    
    if (auditError) {
      console.error('Audit log error:', auditError);
    } else {
      console.log('Audit log created:', auditResult);
    }
    
    // Test 4: Check if email_verified column exists
    console.log('\n--- Test 4: Check email_verified column ---');
    const { data: columnCheck, error: columnError } = await supabase
      .from('donors')
      .select('email_verified')
      .limit(1);
    
    if (columnError) {
      console.error('Column check error:', columnError);
    } else {
      console.log('email_verified column accessible:', columnCheck);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
    console.error('Error stack:', error.stack);
  }
}

// Run the test
console.log('Starting manual insert test...');
testManualInsert().then(() => {
  console.log('Manual insert test completed');
}).catch((error) => {
  console.error('Manual insert test failed with promise rejection:', error);
}); 