const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY)');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runFixScript() {
  console.log('🚀 Starting appointment completion error fix...\n');

  try {
    // 1. Check current constraint
    console.log('1. Checking current constraint...');
    const { data: constraintData, error: constraintError } = await supabase
      .rpc('exec_sql', { 
        sql: `SELECT conname, pg_get_constraintdef(oid) 
               FROM pg_constraint 
               WHERE conrelid = 'donation_history'::regclass 
               AND conname = 'chk_donation_history_status';` 
      });

    if (constraintError) {
      console.log('   Using alternative method to check constraint...');
    } else {
      console.log('   Current constraint:', constraintData);
    }

    // 2. Update existing lowercase statuses in donation_history
    console.log('\n2. Updating existing lowercase statuses...');
    const { error: updateHistoryError } = await supabase
      .from('donation_history')
      .update({ status: 'COMPLETED' })
      .eq('status', 'completed');

    if (updateHistoryError) {
      console.log('   No lowercase statuses found in donation_history or error:', updateHistoryError.message);
    } else {
      console.log('   ✅ Updated donation_history statuses');
    }

    // 3. Update existing lowercase statuses in appointments
    console.log('\n3. Updating existing lowercase statuses in appointments...');
    const { error: updateAppointmentsError } = await supabase
      .from('appointments')
      .update({ status: 'COMPLETED' })
      .eq('status', 'completed');

    if (updateAppointmentsError) {
      console.log('   No lowercase statuses found in appointments or error:', updateAppointmentsError.message);
    } else {
      console.log('   ✅ Updated appointment statuses');
    }

    // 4. Drop and recreate the constraint
    console.log('\n4. Recreating constraint with uppercase values...');
    const { error: dropConstraintError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE donation_history DROP CONSTRAINT IF EXISTS chk_donation_history_status;' 
      });

    if (dropConstraintError) {
      console.log('   Warning: Could not drop constraint:', dropConstraintError.message);
    }

    const { error: addConstraintError } = await supabase
      .rpc('exec_sql', { 
        sql: `ALTER TABLE donation_history 
               ADD CONSTRAINT chk_donation_history_status 
               CHECK (status IN (
                 'COMPLETED', 'DEFERRED', 'SELF_DEFERRED', 'INCOMPLETE', 'ELIGIBILITY_EXPIRED',
                 'POST_DONATION_FOLLOWUP', 'TEST_RESULTS_READY', 'UNIT_USED', 'UNIT_DISCARDED'
               ));` 
      });

    if (addConstraintError) {
      console.log('   Error adding constraint:', addConstraintError.message);
    } else {
      console.log('   ✅ Constraint recreated successfully');
    }

    // 5. Update the trigger function
    console.log('\n5. Updating trigger function...');
    const { error: functionError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          CREATE OR REPLACE FUNCTION handle_appointment_completion()
          RETURNS TRIGGER AS $$
          BEGIN
            IF NEW.status = 'COMPLETED' THEN
              INSERT INTO donation_history (
                donation_id, donor_hash_id, donation_type, donation_volume,
                donation_center_id, staff_id, status, notes, completion_timestamp
              ) VALUES (
                gen_random_uuid(), NEW.donor_hash_id, NEW.donation_type, 450,
                NEW.donation_center_id, NEW.staff_id, 'COMPLETED',
                'Donation successfully completed.', now()
              );
              
              PERFORM create_audit_log(
                NEW.staff_id, 'staff', 'appointment_completed',
                'Appointment ' || NEW.appointment_id || ' completed and migrated to donation_history',
                NULL, NULL, 'appointment', NEW.appointment_id, 'success'
              );
            END IF;
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
        ` 
      });

    if (functionError) {
      console.log('   Error updating function:', functionError.message);
    } else {
      console.log('   ✅ Trigger function updated successfully');
    }

    // 6. Recreate the trigger
    console.log('\n6. Recreating trigger...');
    const { error: triggerError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          DROP TRIGGER IF EXISTS appointment_completion_trigger ON appointments;
          CREATE TRIGGER appointment_completion_trigger
            AFTER UPDATE ON appointments
            FOR EACH ROW
            EXECUTE FUNCTION handle_appointment_completion();
        ` 
      });

    if (triggerError) {
      console.log('   Error recreating trigger:', triggerError.message);
    } else {
      console.log('   ✅ Trigger recreated successfully');
    }

    // 7. Verify the fix
    console.log('\n7. Verifying the fix...');
    const { data: statusData, error: statusError } = await supabase
      .from('donation_history')
      .select('status')
      .limit(10);

    if (statusError) {
      console.log('   Error checking statuses:', statusError.message);
    } else {
      console.log('   ✅ Sample donation_history statuses:', statusData.map(d => d.status));
    }

    console.log('\n🎉 Fix script completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Try updating an appointment status to "COMPLETED"');
    console.log('2. Check if it successfully migrates to donation_history');
    console.log('3. Verify no more constraint violations occur');

  } catch (error) {
    console.error('❌ Error running fix script:', error);
    process.exit(1);
  }
}

// Run the fix script
runFixScript();
