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

async function testFixedRegistration() {
  try {
    console.log('Testing registration with corrected AVIS center names...');
    
    // Test data with correct center name
    const firstName = 'Test';
    const lastName = 'User';
    const dateOfBirth = '1990-01-01';
    const avisDonorCenter = 'AVIS Calvatone'; // Correct format
    const email = 'test.user.fixed@example.com';
    
    const authString = `${firstName}${lastName}${dateOfBirth}${avisDonorCenter}`;
    const donorHashId = generateSHA256Hash(authString);
    const salt = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    console.log('Test donor_hash_id:', donorHashId);
    console.log('Test salt:', salt);
    console.log('Test center:', avisDonorCenter);
    
    // Test 1: Try manual insert with correct center name
    console.log('\n--- Test 1: Manual insert with correct center name ---');
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
    
    // Test 2: Try the registration function
    console.log('\n--- Test 2: Testing registration function ---');
    const registrationParams = {
      p_donor_hash_id: donorHashId + '_func', // Different hash for function test
      p_salt: salt + '_func',
      p_email: 'test.user.func@example.com',
      p_avis_donor_center: avisDonorCenter
    };
    
    const { data: registrationResult, error: functionError } = await supabase
      .rpc('register_donor_with_email', registrationParams);
    
    if (functionError) {
      console.error('Registration function error:', functionError);
      console.error('Error details:', {
        code: functionError.code,
        message: functionError.message,
        details: functionError.details,
        hint: functionError.hint
      });
    } else {
      console.log('Registration result:', registrationResult);
    }
    
    // Test 3: Verify the donor was created
    console.log('\n--- Test 3: Verifying donor creation ---');
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
    
    // Test 4: Check audit logs
    console.log('\n--- Test 4: Checking audit logs ---');
    const { data: auditLogs, error: auditError } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(5);
    
    if (auditError) {
      console.error('Audit log error:', auditError);
    } else {
      console.log('Recent audit logs:', auditLogs);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
    console.error('Error stack:', error.stack);
  }
}

// Run the test
console.log('Starting fixed registration test...');
testFixedRegistration().then(() => {
  console.log('Fixed registration test completed');
}).catch((error) => {
  console.error('Fixed registration test failed:', error);
}); 