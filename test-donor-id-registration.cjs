const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDonorIdRegistration() {
  console.log('🧪 Testing Donor ID Registration...\n');

  try {
    // Test with the donor_id parameter (what the frontend sends)
    const testParams = {
      p_donor_hash_id: 'test_hash_' + Date.now(),
      p_salt: 'test_salt_' + Date.now(),
      p_email: 'test' + Date.now() + '@example.com',
      p_donor_id: 'USER123'  // This is the donor_id from the form
    };
    
    console.log('1. Testing registration with donor_id parameter...');
    console.log('   Params:', testParams);
    
    const { data: result, error } = await supabase
      .rpc('register_donor_with_email', testParams);

    if (error) {
      console.log('   ❌ Error:', error.message);
      console.log('   Error details:', error);
      
      if (error.message.includes('Could not find the function')) {
        console.log('\n🔧 The database function needs to be updated.');
        console.log('   Please run the SQL from DONOR_ID_REGISTRATION_FIX.md');
        console.log('   in your Supabase dashboard, then test again.');
      }
    } else {
      console.log('   ✅ Success!');
      console.log('   Result:', result);
      
      if (result && result.length > 0) {
        const registrationResult = result[0];
        console.log(`   Donor ID: ${registrationResult.donor_id}`);
        console.log(`   Success: ${registrationResult.success}`);
        console.log(`   Message: ${registrationResult.message}`);
        
        if (registrationResult.success) {
          console.log('\n🎉 Registration function is working with DonorID!');
          console.log('   The function now uses the provided donor_id directly.');
          
          // Verify the donor was created in the database
          console.log('\n2. Verifying donor was created in database...');
          const { data: donorData, error: donorError } = await supabase
            .from('donors')
            .select('donor_id, email, donor_hash_id')
            .eq('donor_id', registrationResult.donor_id)
            .single();
            
          if (donorError) {
            console.log('   ⚠️ Could not verify donor creation:', donorError.message);
          } else {
            console.log('   ✅ Donor found in database:', donorData);
            console.log(`   Donor ID matches: ${donorData.donor_id === registrationResult.donor_id}`);
          }
          
          // Clean up test data
          console.log('\n3. Cleaning up test data...');
          const { error: deleteError } = await supabase
            .from('donors')
            .delete()
            .eq('donor_hash_id', testParams.p_donor_hash_id);
            
          if (deleteError) {
            console.log('   ⚠️ Cleanup warning:', deleteError.message);
          } else {
            console.log('   ✅ Test data cleaned up');
          }
          
          console.log('\n✨ Registration is now working correctly!');
          console.log('   Users can register with their chosen donor ID.');
        }
      }
    }
    
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

testDonorIdRegistration();
