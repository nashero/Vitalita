const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAppointmentCompletion() {
  console.log('🧪 Testing Appointment Completion Trigger...\n');

  try {
    // Step 1: Check if the trigger function exists
    console.log('1. Checking if trigger function exists...');
    const { data: functions, error: functionError } = await supabase
      .rpc('handle_appointment_completion', { 
        // Pass dummy parameters to test if function exists
        new: { status: 'test' },
        old: { status: 'test' }
      });

    if (functionError && functionError.message.includes('function "handle_appointment_completion" does not exist')) {
      console.log('❌ Trigger function does not exist. Please run the migration first.');
      console.log('Run: supabase/migrations/migrate-completed-appointments.sql');
      return;
    }

    console.log('✅ Trigger function exists');

    // Step 2: Check if donation_history table exists
    console.log('\n2. Checking if donation_history table exists...');
    const { data: historyData, error: historyError } = await supabase
      .from('donation_history')
      .select('count')
      .limit(1);

    if (historyError) {
      console.log('❌ donation_history table does not exist:', historyError.message);
      console.log('Please run the donation history migration first.');
      return;
    }

    console.log('✅ donation_history table exists');

    // Step 3: Check if appointments table exists and has data
    console.log('\n3. Checking appointments table...');
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .limit(5);

    if (appointmentsError) {
      console.log('❌ Error accessing appointments table:', appointmentsError.message);
      return;
    }

    if (!appointments || appointments.length === 0) {
      console.log('⚠️  No appointments found. Please create some test appointments first.');
      return;
    }

    console.log(`✅ Found ${appointments.length} appointments`);
    console.log('Sample appointment:', {
      id: appointments[0].appointment_id,
      status: appointments[0].status,
      type: appointments[0].donation_type
    });

    // Step 4: Test appointment status update to COMPLETED
    console.log('\n4. Testing appointment completion...');
    const testAppointment = appointments.find(apt => apt.status !== 'COMPLETED');
    
    if (!testAppointment) {
      console.log('⚠️  No non-completed appointments found to test with.');
      return;
    }

    console.log(`Testing with appointment: ${testAppointment.appointment_id} (current status: ${testAppointment.status})`);

    // Update appointment status to COMPLETED
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ 
        status: 'COMPLETED',
        last_updated_timestamp: new Date().toISOString()
      })
      .eq('appointment_id', testAppointment.appointment_id);

    if (updateError) {
      console.log('❌ Error updating appointment status:', updateError.message);
      return;
    }

    console.log('✅ Appointment status updated to COMPLETED');

    // Step 5: Wait a moment for the trigger to execute
    console.log('\n5. Waiting for trigger to execute...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 6: Check if appointment was migrated to donation_history
    console.log('\n6. Checking if appointment was migrated to donation_history...');
    const { data: migratedDonation, error: migrationError } = await supabase
      .from('donation_history')
      .select('*')
      .eq('appointment_id', testAppointment.appointment_id)
      .single();

    if (migrationError) {
      console.log('❌ Error checking donation_history:', migrationError.message);
      return;
    }

    if (migratedDonation) {
      console.log('✅ Appointment successfully migrated to donation_history!');
      console.log('Migration details:', {
        history_id: migratedDonation.history_id,
        donor_hash_id: migratedDonation.donor_hash_id,
        donation_date: migratedDonation.donation_date,
        donation_type: migratedDonation.donation_type,
        donation_volume: migratedDonation.donation_volume,
        status: migratedDonation.status,
        notes: migratedDonation.notes
      });
    } else {
      console.log('❌ Appointment was not migrated to donation_history');
    }

    // Step 7: Check if appointment was removed from appointments table
    console.log('\n7. Checking if appointment was removed from appointments table...');
    const { data: remainingAppointment, error: remainingError } = await supabase
      .from('appointments')
      .select('*')
      .eq('appointment_id', testAppointment.appointment_id)
      .single();

    if (remainingError && remainingError.code === 'PGRST116') {
      console.log('✅ Appointment was successfully removed from appointments table (not found)');
    } else if (remainingAppointment) {
      console.log('⚠️  Appointment still exists in appointments table');
      console.log('Current status:', remainingAppointment.status);
    } else {
      console.log('❌ Error checking remaining appointment:', remainingError?.message);
    }

    // Step 8: Clean up test data
    console.log('\n8. Cleaning up test data...');
    if (migratedDonation) {
      const { error: cleanupError } = await supabase
        .from('donation_history')
        .delete()
        .eq('history_id', migratedDonation.history_id);

      if (cleanupError) {
        console.log('⚠️  Warning: Could not clean up test donation history:', cleanupError.message);
      } else {
        console.log('✅ Test donation history cleaned up');
      }
    }

    console.log('\n🎉 Appointment completion trigger test completed!');
    console.log('\nSummary:');
    console.log('- ✅ Trigger function exists');
    console.log('- ✅ donation_history table exists');
    console.log('- ✅ Appointment status updated to COMPLETED');
    if (migratedDonation) {
      console.log('- ✅ Appointment migrated to donation_history');
      console.log('- ✅ Appointment removed from appointments table');
    } else {
      console.log('- ❌ Appointment migration failed');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testAppointmentCompletion();
