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
    // 1. Update existing lowercase statuses in donation_history
    console.log('1. Updating existing lowercase statuses in donation_history...');
    const { error: updateHistoryError } = await supabase
      .from('donation_history')
      .update({ status: 'COMPLETED' })
      .eq('status', 'completed');

    if (updateHistoryError) {
      console.log('   No lowercase statuses found in donation_history or error:', updateHistoryError.message);
    } else {
      console.log('   ✅ Updated donation_history statuses');
    }

    // 2. Update existing lowercase statuses in appointments
    console.log('\n2. Updating existing lowercase statuses in appointments...');
    const { error: updateAppointmentsError } = await supabase
      .from('appointments')
      .update({ status: 'COMPLETED' })
      .eq('status', 'completed');

    if (updateAppointmentsError) {
      console.log('   No lowercase statuses found in appointments or error:', updateAppointmentsError.message);
    } else {
      console.log('   ✅ Updated appointment statuses');
    }

    // 3. Check current statuses
    console.log('\n3. Checking current statuses...');
    const { data: historyData, error: historyError } = await supabase
      .from('donation_history')
      .select('status')
      .limit(10);

    if (historyError) {
      console.log('   Error checking donation_history:', historyError.message);
    } else {
      console.log('   ✅ Sample donation_history statuses:', historyData.map(d => d.status));
    }

    const { data: appointmentData, error: appointmentError } = await supabase
      .from('appointments')
      .select('status')
      .limit(10);

    if (appointmentError) {
      console.log('   Error checking appointments:', appointmentError.message);
    } else {
      console.log('   ✅ Sample appointment statuses:', appointmentData.map(a => a.status));
    }

    console.log('\n🎉 Fix script completed successfully!');
    console.log('\nNext steps:');
    console.log('1. You need to manually run the SQL script in your Supabase dashboard');
    console.log('2. Go to SQL Editor in your Supabase dashboard');
    console.log('3. Copy and paste the contents of fix-appointment-completion-error.sql');
    console.log('4. Execute the SQL script');
    console.log('5. Test by updating an appointment status to "COMPLETED"');

  } catch (error) {
    console.error('❌ Error running fix script:', error);
    process.exit(1);
  }
}

// Run the fix script
runFixScript();
