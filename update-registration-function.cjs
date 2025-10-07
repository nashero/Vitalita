const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateRegistrationFunction() {
  console.log('🔧 Updating Registration Function to Use DonorID...\n');

  try {
    // Test current function call first
    console.log('1. Testing current function call...');
    const testParams = {
      p_donor_hash_id: 'test_hash_' + Date.now(),
      p_salt: 'test_salt_' + Date.now(),
      p_email: 'test' + Date.now() + '@example.com',
      p_donor_id: 'USER123'  // This is what the frontend sends
    };
    
    console.log('   Calling with donor_id parameter:', testParams);
    
    const { data: result, error } = await supabase
      .rpc('register_donor_with_email', testParams);

    if (error) {
      console.log('   ❌ Current error (expected):', error.message);
      console.log('   This confirms the function signature mismatch');
    } else {
      console.log('   ✅ Function works:', result);
      console.log('   Function already accepts donor_id parameter!');
      return;
    }

    console.log('\n2. The function needs to be updated in the database.');
    console.log('   Since we cannot execute DDL statements through the Supabase client,');
    console.log('   you will need to run the migration manually.');
    
    console.log('\n3. To fix this, run the following SQL in your Supabase dashboard:');
    console.log('   ');
    console.log('   -- Drop the existing function');
    console.log('   DROP FUNCTION IF EXISTS register_donor_with_email(VARCHAR, VARCHAR, VARCHAR, VARCHAR);');
    console.log('   ');
    console.log('   -- Create the updated function');
    console.log('   CREATE OR REPLACE FUNCTION register_donor_with_email(');
    console.log('     p_donor_hash_id VARCHAR(255),');
    console.log('     p_salt VARCHAR(255),');
    console.log('     p_email VARCHAR(255),');
    console.log('     p_donor_id VARCHAR(255)');
    console.log('   )');
    console.log('   RETURNS TABLE(donor_id VARCHAR, success BOOLEAN, message TEXT) AS $$');
    console.log('   DECLARE');
    console.log('     v_verification_token VARCHAR(255);');
    console.log('     v_token_expires TIMESTAMP WITH TIME ZONE;');
    console.log('     v_default_avis_center VARCHAR(255);');
    console.log('   BEGIN');
    console.log('     v_default_avis_center := \'AVIS Casalmaggiore\';');
    console.log('     v_verification_token := encode(gen_random_bytes(32), \'hex\');');
    console.log('     v_token_expires := NOW() + INTERVAL \'24 hours\';');
    console.log('     ');
    console.log('     INSERT INTO donors (');
    console.log('       donor_hash_id, donor_id, salt, email, email_verified,');
    console.log('       verification_token, verification_token_expires, account_activated,');
    console.log('       preferred_language, preferred_communication_channel, initial_vetting_status,');
    console.log('       total_donations_this_year, last_donation_date, is_active, avis_donor_center');
    console.log('     ) VALUES (');
    console.log('       p_donor_hash_id, p_donor_id, p_salt, p_email, FALSE,');
    console.log('       v_verification_token, v_token_expires, FALSE,');
    console.log('       \'en\', \'email\', FALSE,');
    console.log('       0, NULL, FALSE, v_default_avis_center');
    console.log('     );');
    console.log('     ');
    console.log('     PERFORM send_verification_email(p_email, v_verification_token, p_donor_hash_id);');
    console.log('     ');
    console.log('     PERFORM create_audit_log(');
    console.log('       p_user_id := p_donor_hash_id,');
    console.log('       p_user_type := \'donor\',');
    console.log('       p_action := \'registration_with_email\',');
    console.log('       p_details := format(\'New donor registration with ID %s and email %s submitted for verification\', p_donor_id, p_email),');
    console.log('       p_resource_type := \'donors\',');
    console.log('       p_resource_id := p_donor_hash_id,');
    console.log('       p_status := \'success\'');
    console.log('     );');
    console.log('     ');
    console.log('     RETURN QUERY SELECT p_donor_id, TRUE, \'Registration successful\'::TEXT;');
    console.log('   EXCEPTION');
    console.log('     WHEN OTHERS THEN');
    console.log('       PERFORM create_audit_log(');
    console.log('         p_user_id := p_donor_hash_id,');
    console.log('         p_user_type := \'system\',');
    console.log('         p_action := \'registration_error\',');
    console.log('         p_details := format(\'Registration failed: %s\', SQLERRM),');
    console.log('         p_resource_type := \'donors\',');
    console.log('         p_resource_id := p_donor_hash_id,');
    console.log('         p_status := \'error\'');
    console.log('       );');
    console.log('       RETURN QUERY SELECT NULL::VARCHAR, FALSE, format(\'Registration failed: %s\', SQLERRM)::TEXT;');
    console.log('   END;');
    console.log('   $$ LANGUAGE plpgsql SECURITY DEFINER;');
    
    console.log('\n4. After running the SQL, test the function with:');
    console.log('   node update-registration-function.cjs');
    
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

updateRegistrationFunction();
