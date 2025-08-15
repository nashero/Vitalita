const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables:');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDonationHistoryRLS() {
  console.log('🧪 Testing Donation History RLS Policies');
  console.log('==========================================');
  console.log();

  try {
    // Test 1: Check if we can read from donation_history
    console.log('1️⃣ Testing READ access...');
    const { data: readData, error: readError } = await supabase
      .from('donation_history')
      .select('*')
      .limit(1);

    if (readError) {
      console.log('❌ READ test failed:', readError.message);
    } else {
      console.log('✅ READ test passed - can access donation_history table');
    }

    // Test 2: Check if we can insert into donation_history
    console.log('\n2️⃣ Testing INSERT access...');
    const testRecord = {
      donor_hash_id: 'test-donor-' + Date.now(),
      appointment_id: 'test-appointment-' + Date.now(),
      donation_date: new Date().toISOString(),
      donation_type: 'whole_blood',
      donation_volume: 450,
      donation_center_id: 'test-center-' + Date.now(),
      status: 'test',
      notes: 'Test record for RLS verification',
      completion_timestamp: new Date().toISOString()
    };

    const { data: insertData, error: insertError } = await supabase
      .from('donation_history')
      .insert(testRecord)
      .select();

    if (insertError) {
      console.log('❌ INSERT test failed:', insertError.message);
      console.log('   This indicates RLS policies are still blocking inserts');
    } else {
      console.log('✅ INSERT test passed - can insert into donation_history table');
      
      // Clean up the test record
      console.log('   Cleaning up test record...');
      const { error: deleteError } = await supabase
        .from('donation_history')
        .delete()
        .eq('donor_hash_id', testRecord.donor_hash_id);
      
      if (deleteError) {
        console.log('   ⚠️  Warning: Could not clean up test record:', deleteError.message);
      } else {
        console.log('   ✅ Test record cleaned up successfully');
      }
    }

    // Test 3: Check if we can update records
    console.log('\n3️⃣ Testing UPDATE access...');
    if (insertData && insertData.length > 0) {
      const { error: updateError } = await supabase
        .from('donation_history')
        .update({ notes: 'Updated test record' })
        .eq('donor_hash_id', testRecord.donor_hash_id);

      if (updateError) {
        console.log('❌ UPDATE test failed:', updateError.message);
      } else {
        console.log('✅ UPDATE test passed - can update donation_history records');
      }
    } else {
      console.log('⚠️  UPDATE test skipped - no test record available');
    }

    // Test 4: Check current RLS policies
    console.log('\n4️⃣ Checking current RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: 'donation_history' });

    if (policiesError) {
      console.log('⚠️  Could not retrieve RLS policies:', policiesError.message);
      console.log('   This is normal if the function does not exist');
    } else {
      console.log('✅ Current RLS policies:');
      policies.forEach((policy, index) => {
        console.log(`   ${index + 1}. ${policy.policyname} - ${policy.cmd} for ${policy.roles}`);
      });
    }

    // Test 5: Check if appointment completion trigger exists
    console.log('\n5️⃣ Checking appointment completion trigger...');
    const { data: triggers, error: triggersError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_manipulation, action_statement')
      .eq('trigger_name', 'trigger_appointment_completion');

    if (triggersError) {
      console.log('⚠️  Could not check triggers:', triggersError.message);
    } else if (triggers && triggers.length > 0) {
      console.log('✅ Appointment completion trigger found:');
      triggers.forEach(trigger => {
        console.log(`   - ${trigger.trigger_name} (${trigger.event_manipulation})`);
      });
    } else {
      console.log('❌ Appointment completion trigger not found');
      console.log('   You may need to run the setup-appointment-completion-complete.sql script');
    }

    console.log('\n==========================================');
    console.log('🎯 Test Summary:');
    
    if (insertData && insertData.length > 0) {
      console.log('✅ RLS policies are working correctly');
      console.log('✅ You should be able to complete appointments without RLS errors');
      console.log('\nNext steps:');
      console.log('1. Test the actual appointment completion functionality');
      console.log('2. Run: node test-appointment-completion.js');
      console.log('3. Monitor for any remaining issues');
    } else {
      console.log('❌ RLS policies still have issues');
      console.log('❌ Appointment completion will continue to fail');
      console.log('\nTroubleshooting:');
      console.log('1. Check if the migration was applied: supabase db push');
      console.log('2. Verify RLS policies in Supabase dashboard');
      console.log('3. Check the migration logs for errors');
    }

  } catch (error) {
    console.error('❌ Test failed with unexpected error:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Check your environment variables');
    console.log('2. Verify database connection');
    console.log('3. Check if Supabase is running');
  }
}

// Run the test
testDonationHistoryRLS();
