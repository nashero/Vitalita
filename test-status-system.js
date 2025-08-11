import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStatusSystem() {
  console.log('🧪 Testing Blood Donation Status System...\n');

  try {
    // Test 1: Check if status categories exist
    console.log('1️⃣ Testing status categories...');
    const { data: categories, error: catError } = await supabase
      .from('donation_status_categories')
      .select('*')
      .order('sort_order');

    if (catError) {
      console.error('❌ Error fetching categories:', catError.message);
      return;
    }

    if (categories && categories.length > 0) {
      console.log(`✅ Found ${categories.length} status categories:`);
      categories.forEach(cat => {
        console.log(`   - ${cat.category_name} (ID: ${cat.category_id})`);
      });
    } else {
      console.log('❌ No status categories found');
      return;
    }

    // Test 2: Check if statuses exist
    console.log('\n2️⃣ Testing donation statuses...');
    const { data: statuses, error: statusError } = await supabase
      .from('donation_statuses')
      .select('*')
      .order('category_id, sort_order');

    if (statusError) {
      console.error('❌ Error fetching statuses:', statusError.message);
      return;
    }

    if (statuses && statuses.length > 0) {
      console.log(`✅ Found ${statuses.length} donation statuses:`);
      statuses.forEach(status => {
        const category = categories.find(c => c.category_id === status.category_id);
        console.log(`   - ${status.status_code}: ${status.status_name} (${category?.category_name})`);
      });
    } else {
      console.log('❌ No donation statuses found');
      return;
    }

    // Test 3: Test the get_donation_statuses_by_category function
    console.log('\n3️⃣ Testing get_donation_statuses_by_category function...');
    const { data: preDonationStatuses, error: func1Error } = await supabase
      .rpc('get_donation_statuses_by_category', { p_category_name: 'Pre-Donation Statuses' });

    if (func1Error) {
      console.error('❌ Error calling get_donation_statuses_by_category:', func1Error.message);
    } else if (preDonationStatuses && preDonationStatuses.length > 0) {
      console.log(`✅ Pre-donation statuses (${preDonationStatuses.length}):`);
      preDonationStatuses.forEach(status => {
        console.log(`   - ${status.status_code}: ${status.status_name}`);
      });
    }

    // Test 4: Test the get_appointment_statuses function
    console.log('\n4️⃣ Testing get_appointment_statuses function...');
    const { data: appointmentStatuses, error: func2Error } = await supabase
      .rpc('get_appointment_statuses');

    if (func2Error) {
      console.error('❌ Error calling get_appointment_statuses:', func2Error.message);
    } else if (appointmentStatuses && appointmentStatuses.length > 0) {
      console.log(`✅ Appointment statuses (${appointmentStatuses.length}):`);
      appointmentStatuses.forEach(status => {
        console.log(`   - ${status.status_code}: ${status.status_name}`);
      });
    }

    // Test 5: Test the get_donation_history_statuses function
    console.log('\n5️⃣ Testing get_donation_history_statuses function...');
    const { data: historyStatuses, error: func3Error } = await supabase
      .rpc('get_donation_history_statuses');

    if (func3Error) {
      console.error('❌ Error calling get_donation_history_statuses:', func3Error.message);
    } else if (historyStatuses && historyStatuses.length > 0) {
      console.log(`✅ Donation history statuses (${historyStatuses.length}):`);
      historyStatuses.forEach(status => {
        console.log(`   - ${status.status_code}: ${status.status_name}`);
      });
    }

    // Test 6: Test individual status lookup
    console.log('\n6️⃣ Testing individual status lookup...');
    const { data: scheduledStatus, error: func4Error } = await supabase
      .rpc('get_donation_status', { p_status_code: 'SCHEDULED' });

    if (func4Error) {
      console.error('❌ Error calling get_donation_status:', func4Error.message);
    } else if (scheduledStatus && scheduledStatus.length > 0) {
      const status = scheduledStatus[0];
      console.log(`✅ SCHEDULED status details:`);
      console.log(`   - Name: ${status.status_name}`);
      console.log(`   - Description: ${status.description}`);
      console.log(`   - Category: ${status.category_name}`);
    }

    // Test 7: Check appointments table constraints
    console.log('\n7️⃣ Testing appointments table status constraints...');
    const { data: appointmentConstraints, error: constraintError } = await supabase
      .from('information_schema.check_constraints')
      .select('constraint_name, check_clause')
      .eq('table_name', 'appointments')
      .eq('constraint_name', 'chk_appointments_status');

    if (constraintError) {
      console.error('❌ Error checking constraints:', constraintError.message);
    } else if (appointmentConstraints && appointmentConstraints.length > 0) {
      console.log('✅ Appointments table has status check constraint');
      console.log(`   - Constraint: ${appointmentConstraints[0].constraint_name}`);
    } else {
      console.log('❌ Appointments table missing status check constraint');
    }

    console.log('\n🎉 Status system test completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Categories: ${categories?.length || 0}`);
    console.log(`   - Total Statuses: ${statuses?.length || 0}`);
    console.log(`   - Pre-donation Statuses: ${preDonationStatuses?.length || 0}`);
    console.log(`   - Appointment Statuses: ${appointmentStatuses?.length || 0}`);
    console.log(`   - History Statuses: ${historyStatuses?.length || 0}`);

  } catch (error) {
    console.error('❌ Unexpected error during testing:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testStatusSystem(); 