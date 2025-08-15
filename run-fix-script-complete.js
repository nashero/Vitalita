import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

async function runCompleteFixScript() {
  console.log('🚀 Starting complete appointment completion error fix...\n');
  console.log('This will fix both status and donation type constraint violations.\n');

  try {
    // 1. Update existing lowercase statuses in donation_history
    console.log('1. Updating existing lowercase statuses in donation_history...');
    const { error: updateHistoryStatusError } = await supabase
      .from('donation_history')
      .update({ status: 'COMPLETED' })
      .eq('status', 'completed');

    if (updateHistoryStatusError) {
      console.log('   No lowercase statuses found in donation_history or error:', updateHistoryStatusError.message);
    } else {
      console.log('   ✅ Updated donation_history statuses');
    }

    // 2. Update existing donation types in donation_history
    console.log('\n2. Updating existing donation types in donation_history...');
    const { error: updateHistoryTypeError } = await supabase
      .from('donation_history')
      .update({ donation_type: 'whole_blood' })
      .eq('donation_type', 'Blood');

    if (updateHistoryTypeError) {
      console.log('   No "Blood" donation types found in donation_history or error:', updateHistoryTypeError.message);
    } else {
      console.log('   ✅ Updated "Blood" to "whole_blood" in donation_history');
    }

    const { error: updateHistoryTypeError2 } = await supabase
      .from('donation_history')
      .update({ donation_type: 'plasma' })
      .eq('donation_type', 'Plasma');

    if (updateHistoryTypeError2) {
      console.log('   No "Plasma" donation types found in donation_history or error:', updateHistoryTypeError2.message);
    } else {
      console.log('   ✅ Updated "Plasma" to "plasma" in donation_history');
    }

    // 3. Update existing lowercase statuses in appointments
    console.log('\n3. Updating existing lowercase statuses in appointments...');
    const { error: updateAppointmentsStatusError } = await supabase
      .from('appointments')
      .update({ status: 'COMPLETED' })
      .eq('status', 'completed');

    if (updateAppointmentsStatusError) {
      console.log('   No lowercase statuses found in appointments or error:', updateAppointmentsStatusError.message);
    } else {
      console.log('   ✅ Updated appointment statuses');
    }

    // 4. Update existing donation types in appointments
    console.log('\n4. Updating existing donation types in appointments...');
    const { error: updateAppointmentsTypeError } = await supabase
      .from('appointments')
      .update({ donation_type: 'whole_blood' })
      .eq('donation_type', 'Blood');

    if (updateAppointmentsTypeError) {
      console.log('   No "Blood" donation types found in appointments or error:', updateAppointmentsTypeError.message);
    } else {
      console.log('   ✅ Updated "Blood" to "whole_blood" in appointments');
    }

    const { error: updateAppointmentsTypeError2 } = await supabase
      .from('appointments')
      .update({ donation_type: 'plasma' })
      .eq('donation_type', 'Plasma');

    if (updateAppointmentsTypeError2) {
      console.log('   No "Plasma" donation types found in appointments or error:', updateAppointmentsTypeError2.message);
    } else {
      console.log('   ✅ Updated "Plasma" to "plasma" in appointments');
    }

    // 5. Check current statuses and donation types
    console.log('\n5. Checking current data...');
    const { data: historyData, error: historyError } = await supabase
      .from('donation_history')
      .select('status, donation_type')
      .limit(10);

    if (historyError) {
      console.log('   Error checking donation_history:', historyError.message);
    } else {
      console.log('   ✅ Sample donation_history data:', historyData.map(d => ({ status: d.status, type: d.donation_type })));
    }

    const { data: appointmentData, error: appointmentError } = await supabase
      .from('appointments')
      .select('status, donation_type')
      .limit(10);

    if (appointmentError) {
      console.log('   Error checking appointments:', appointmentError.message);
    } else {
      console.log('   ✅ Sample appointment data:', appointmentData.map(a => ({ status: a.status, type: a.donation_type })));
    }

    console.log('\n🎉 Data update completed successfully!');
    console.log('\nNext steps:');
    console.log('1. You need to manually run the SQL script in your Supabase dashboard');
    console.log('2. Go to SQL Editor in your Supabase dashboard');
    console.log('3. Copy and paste the contents of fix-appointment-completion-error-complete.sql');
    console.log('4. Execute the SQL script');
    console.log('5. Test by updating an appointment status to "COMPLETED"');
    console.log('\nThe SQL script will:');
    console.log('  - Update the constraints to allow both formats');
    console.log('  - Fix the trigger function to normalize donation types');
    console.log('  - Ensure all data is consistent');

  } catch (error) {
    console.error('❌ Error running fix script:', error);
    process.exit(1);
  }
}

// Run the complete fix script
runCompleteFixScript();
