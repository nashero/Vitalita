import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDonationHistory() {
  console.log('🔍 Testing donation history system...\n');

  try {
    // Test 1: Check if donation_history table exists and has data
    console.log('--- Test 1: Check donation_history table ---');
    const { data: historyData, error: historyError } = await supabase
      .from('donation_history')
      .select('*')
      .limit(5);

    if (historyError) {
      console.error('❌ Error accessing donation_history table:', historyError);
    } else {
      console.log(`✅ donation_history table accessible`);
      console.log(`📊 Found ${historyData?.length || 0} records`);
      if (historyData && historyData.length > 0) {
        console.log('Sample record:', historyData[0]);
      }
    }

    // Test 2: Check if appointments table has completed appointments
    console.log('\n--- Test 2: Check completed appointments ---');
    const { data: completedAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .eq('status', 'COMPLETED')
      .limit(5);

    if (appointmentsError) {
      console.error('❌ Error accessing appointments table:', appointmentsError);
    } else {
      console.log(`✅ appointments table accessible`);
      console.log(`📅 Found ${completedAppointments?.length || 0} completed appointments`);
      if (completedAppointments && completedAppointments.length > 0) {
        console.log('Sample completed appointment:', completedAppointments[0]);
      }
    }

    // Test 3: Test the get_donor_statistics function
    console.log('\n--- Test 3: Test get_donor_statistics function ---');
    const testDonorId = 'b701606e3f5a8339fac38dd89eef44d127d4a04e10294aa0f6a8cf4a4976ba14';
    
    const { data: statsData, error: statsError } = await supabase
      .rpc('get_donor_statistics', {
        p_donor_hash_id: testDonorId
      });

    if (statsError) {
      console.error('❌ Error calling get_donor_statistics:', statsError);
    } else {
      console.log(`✅ get_donor_statistics function working`);
      console.log('Statistics:', statsData);
    }

    // Test 4: Test the get_donor_donation_history function
    console.log('\n--- Test 4: Test get_donor_donation_history function ---');
    const { data: historyRPC, error: historyRPCError } = await supabase
      .rpc('get_donor_donation_history', {
        p_donor_hash_id: testDonorId,
        p_limit: 5,
        p_offset: 0
      });

    if (historyRPCError) {
      console.error('❌ Error calling get_donor_donation_history:', historyRPCError);
    } else {
      console.log(`✅ get_donor_donation_history function working`);
      console.log(`📊 Found ${historyRPC?.length || 0} donation history records`);
      if (historyRPC && historyRPC.length > 0) {
        console.log('Sample donation history:', historyRPC[0]);
      }
    }

    // Test 5: Direct query to donation_history table
    console.log('\n--- Test 5: Direct query to donation_history ---');
    const { data: directHistory, error: directError } = await supabase
      .from('donation_history')
      .select(`
        history_id,
        donor_hash_id,
        appointment_id,
        donation_date,
        donation_type,
        donation_volume,
        status,
        donation_centers!inner(name, address, city)
      `)
      .eq('donor_hash_id', testDonorId)
      .limit(5);

    if (directError) {
      console.error('❌ Error with direct query:', directError);
    } else {
      console.log(`✅ Direct query successful`);
      console.log(`📊 Found ${directHistory?.length || 0} records for donor`);
      if (directHistory && directHistory.length > 0) {
        console.log('Sample direct query result:', directHistory[0]);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }

  console.log('\n🏁 Test completed');
}

testDonationHistory(); 