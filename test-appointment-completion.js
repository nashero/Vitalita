const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAppointmentCompletion() {
  console.log('🧪 Testing Appointment Completion Trigger System\n');
  
  try {
    // Step 1: Check current state
    console.log('📊 Step 1: Checking current database state...');
    
    const { data: appointmentCount, error: appointmentCountError } = await supabase
      .from('appointments')
      .select('count', { count: 'exact' });
    
    if (appointmentCountError) {
      console.error('❌ Error counting appointments:', appointmentCountError);
      return;
    }
    
    const { data: historyCount, error: historyCountError } = await supabase
      .from('donation_history')
      .select('count', { count: 'exact' });
    
    if (historyCountError) {
      console.error('❌ Error counting donation history:', historyCountError);
      return;
    }
    
    console.log(`✅ Current appointments: ${appointmentCount}`);
    console.log(`✅ Current donation history records: ${historyCount}\n`);
    
    // Step 2: Find an appointment to test with
    console.log('🔍 Step 2: Finding an appointment to test with...');
    
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .neq('status', 'COMPLETED')
      .limit(1);
    
    if (appointmentsError) {
      console.error('❌ Error fetching appointments:', appointmentsError);
      return;
    }
    
    if (!appointments || appointments.length === 0) {
      console.log('⚠️  No appointments found for testing. Creating a test appointment...');
      
      // Create a test appointment
      const { data: testAppointment, error: createError } = await supabase
        .from('appointments')
        .insert({
          donor_hash_id: 'test-donor-hash',
          donation_center_id: 'test-center-id',
          appointment_datetime: new Date().toISOString(),
          donation_type: 'whole_blood',
          status: 'scheduled',
          booking_channel: 'test'
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error creating test appointment:', createError);
        return;
      }
      
      console.log(`✅ Created test appointment: ${testAppointment.appointment_id}`);
      appointments = [testAppointment];
    }
    
    const testAppointment = appointments[0];
    console.log(`✅ Found test appointment: ${testAppointment.appointment_id} (Status: ${testAppointment.status})\n`);
    
    // Step 3: Test the trigger by updating status to COMPLETED
    console.log('🚀 Step 3: Testing appointment completion trigger...');
    console.log(`📝 Updating appointment ${testAppointment.appointment_id} status to 'COMPLETED'...`);
    
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'COMPLETED' })
      .eq('appointment_id', testAppointment.appointment_id)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Error updating appointment status:', updateError);
      return;
    }
    
    console.log(`✅ Appointment status updated to: ${updatedAppointment.status}\n`);
    
    // Step 4: Wait a moment for the trigger to execute
    console.log('⏳ Step 4: Waiting for trigger to execute...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 5: Verify the results
    console.log('🔍 Step 5: Verifying trigger execution results...');
    
    // Check if appointment was deleted
    const { data: deletedAppointment, error: checkDeletedError } = await supabase
      .from('appointments')
      .select('*')
      .eq('appointment_id', testAppointment.appointment_id)
      .single();
    
    if (checkDeletedError && checkDeletedError.code === 'PGRST116') {
      console.log('✅ Appointment was successfully deleted from appointments table');
    } else if (deletedAppointment) {
      console.log('⚠️  Appointment still exists in appointments table');
    } else {
      console.log('❌ Error checking appointment deletion:', checkDeletedError);
    }
    
    // Check if donation history was created
    const { data: donationHistory, error: historyError } = await supabase
      .from('donation_history')
      .select('*')
      .eq('appointment_id', testAppointment.appointment_id)
      .single();
    
    if (historyError) {
      console.error('❌ Error checking donation history:', historyError);
    } else if (donationHistory) {
      console.log('✅ Donation history record was created successfully');
      console.log(`   - History ID: ${donationHistory.history_id}`);
      console.log(`   - Donor ID: ${donationHistory.donor_hash_id}`);
      console.log(`   - Status: ${donationHistory.status}`);
      console.log(`   - Notes: ${donationHistory.notes}`);
    } else {
      console.log('❌ No donation history record found');
    }
    
    // Check audit logs
    console.log('\n📋 Step 6: Checking audit logs...');
    
    const { data: auditLogs, error: auditError } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('resource_id', testAppointment.appointment_id)
      .order('timestamp', { ascending: false });
    
    if (auditError) {
      console.error('❌ Error checking audit logs:', auditError);
    } else if (auditLogs && auditLogs.length > 0) {
      console.log(`✅ Found ${auditLogs.length} audit log entries:`);
      auditLogs.forEach(log => {
        console.log(`   - ${log.action}: ${log.details}`);
      });
    } else {
      console.log('⚠️  No audit logs found for this appointment');
    }
    
    // Final verification
    console.log('\n📊 Final verification...');
    
    const { data: finalAppointmentCount, error: finalCountError } = await supabase
      .from('appointments')
      .select('count', { count: 'exact' });
    
    const { data: finalHistoryCount, error: finalHistoryError } = await supabase
      .from('donation_history')
      .select('count', { count: 'exact' });
    
    if (!finalCountError && !finalHistoryError) {
      console.log(`✅ Final appointments count: ${finalAppointmentCount}`);
      console.log(`✅ Final donation history count: ${finalHistoryCount}`);
      
      if (finalAppointmentCount < appointmentCount && finalHistoryCount > historyCount) {
        console.log('\n🎉 SUCCESS: Appointment completion trigger is working correctly!');
        console.log('   - Appointment was removed from appointments table');
        console.log('   - Donation history record was created');
        console.log('   - Audit logs were generated');
      } else {
        console.log('\n⚠️  PARTIAL SUCCESS: Some aspects of the trigger may not be working as expected');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

async function checkTriggerStatus() {
  console.log('🔍 Checking trigger system status...\n');
  
  try {
    // Check if trigger exists
    const { data: triggers, error: triggerError } = await supabase
      .rpc('check_trigger_exists', { trigger_name: 'appointment_completion_trigger' });
    
    if (triggerError) {
      console.log('⚠️  Could not check trigger status directly');
      
      // Alternative check - try to see if the function exists
      const { data: functions, error: funcError } = await supabase
        .rpc('check_function_exists', { function_name: 'handle_appointment_completion' });
      
      if (funcError) {
        console.log('❌ Could not verify trigger system status');
      } else {
        console.log('✅ Trigger function exists');
      }
    } else {
      console.log('✅ Appointment completion trigger is active');
    }
    
  } catch (error) {
    console.error('❌ Error checking trigger status:', error);
  }
}

async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    // Remove test donation history records
    const { error: deleteHistoryError } = await supabase
      .from('donation_history')
      .delete()
      .eq('donor_hash_id', 'test-donor-hash');
    
    if (deleteHistoryError) {
      console.log('⚠️  Could not clean up test donation history:', deleteHistoryError.message);
    } else {
      console.log('✅ Test donation history records cleaned up');
    }
    
    // Remove test appointments
    const { error: deleteAppointmentError } = await supabase
      .from('appointments')
      .delete()
      .eq('donor_hash_id', 'test-donor-hash');
    
    if (deleteAppointmentError) {
      console.log('⚠️  Could not clean up test appointments:', deleteAppointmentError.message);
    } else {
      console.log('✅ Test appointments cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Main execution
async function main() {
  console.log('🏥 Vitalita Appointment Completion Trigger Test\n');
  
  await checkTriggerStatus();
  await testAppointmentCompletion();
  await cleanupTestData();
  
  console.log('\n🏁 Test completed!');
}

// Run the test
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testAppointmentCompletion,
  checkTriggerStatus,
  cleanupTestData
};
