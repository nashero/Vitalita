import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Supabase configuration
const supabaseUrl = 'https://pxvimagfvonwxygmtgpi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4dmltYWdmdm9ud3h5Z210Z3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODg4NjcsImV4cCI6MjA2Njg2NDg2N30.U0ZAojLgRS680JpP2HXZhm1Q_vce6i8o9k5zZ3Jx6LA';

console.log('Starting debug script...');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key present:', !!supabaseAnonKey);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to generate SHA256 hash (same as in the frontend)
function generateSHA256Hash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

async function testRegistration() {
  try {
    console.log('Testing donor registration...');
    
    // Test data (same as in the image)
    const firstName = 'David smith';
    const lastName = 'Segal';
    const dateOfBirth = '2001-01-01';
    const avisDonorCenter = 'Avis Calvatone';
    const email = 'David.Segal@gmail.com';
    
    // Generate donor_hash_id
    const authString = `${firstName}${lastName}${dateOfBirth}${avisDonorCenter}`;
    console.log('Auth string for hash:', authString);
    const donorHashId = generateSHA256Hash(authString);
    console.log('Generated donor_hash_id:', donorHashId);
    
    // Generate salt
    const salt = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    console.log('Generated salt:', salt);
    
    // Test parameters
    const registrationParams = {
      p_donor_hash_id: donorHashId,
      p_salt: salt,
      p_email: email,
      p_avis_donor_center: avisDonorCenter
    };
    
    console.log('Registration parameters:', registrationParams);
    
    // Test 1: Check if donor already exists
    console.log('\n--- Test 1: Checking if donor exists ---');
    const { data: existingDonor, error: checkError } = await supabase
      .from('donors')
      .select('donor_hash_id')
      .eq('donor_hash_id', donorHashId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing donor:', checkError);
    } else if (existingDonor) {
      console.log('Donor already exists:', existingDonor);
    } else {
      console.log('No existing donor found');
    }
    
    // Test 2: Check if email already exists
    console.log('\n--- Test 2: Checking if email exists ---');
    const { data: existingEmail, error: emailCheckError } = await supabase
      .from('donors')
      .select('email')
      .eq('email', email)
      .single();
    
    if (emailCheckError && emailCheckError.code !== 'PGRST116') {
      console.error('Error checking existing email:', emailCheckError);
    } else if (existingEmail) {
      console.log('Email already exists:', existingEmail);
    } else {
      console.log('No existing email found');
    }
    
    // Test 3: Test the registration function
    console.log('\n--- Test 3: Testing registration function ---');
    const { data: registrationResult, error: insertError } = await supabase
      .rpc('register_donor_with_email', registrationParams);
    
    if (insertError) {
      console.error('Registration function error:', insertError);
      console.error('Error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
    } else {
      console.log('Registration result:', registrationResult);
    }
    
    // Test 4: Verify donor was created
    console.log('\n--- Test 4: Verifying donor creation ---');
    const { data: verifyDonor, error: verifyError } = await supabase
      .from('donors')
      .select('donor_hash_id, email, email_verified, account_activated, is_active')
      .eq('donor_hash_id', donorHashId)
      .single();
    
    if (verifyError) {
      console.error('Verification error:', verifyError);
    } else {
      console.log('Verified donor record:', verifyDonor);
    }
    
    // Test 5: Check audit logs
    console.log('\n--- Test 5: Checking audit logs ---');
    const { data: auditLogs, error: auditError } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', donorHashId)
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
console.log('About to run test...');
testRegistration().then(() => {
  console.log('Test completed');
}).catch((error) => {
  console.error('Test failed with promise rejection:', error);
}); 