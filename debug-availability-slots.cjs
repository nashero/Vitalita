const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  console.log('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log('🔍 Debugging Availability Slots Issue...\n');
console.log('Using Supabase URL:', supabaseUrl);
console.log('Current Date:', new Date().toISOString());

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugAvailabilitySlots() {
  try {
    console.log('\n📊 Checking Database State...\n');

    // 1. Check if tables exist and have data
    console.log('1. Checking Table Existence...');
    
    const { data: centers, error: centersError } = await supabase
      .from('donation_centers')
      .select('count')
      .limit(1);
    
    if (centersError) {
      console.error('❌ donation_centers table error:', centersError.message);
    } else {
      console.log('✅ donation_centers table accessible');
    }

    const { data: slots, error: slotsError } = await supabase
      .from('availability_slots')
      .select('count')
      .limit(1);
    
    if (slotsError) {
      console.error('❌ availability_slots table error:', slotsError.message);
    } else {
      console.log('✅ availability_slots table accessible');
    }

    // 2. Check total counts
    console.log('\n2. Checking Data Counts...');
    
    const { count: centersCount } = await supabase
      .from('donation_centers')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📍 Total donation centers: ${centersCount}`);

    const { count: totalSlots } = await supabase
      .from('availability_slots')
      .select('*', { count: 'exact', head: true });
    
    console.log(`⏰ Total availability slots: ${totalSlots}`);

    // 3. Check slot distribution by date
    console.log('\n3. Checking Slot Distribution by Date...');
    
    const { data: dateDistribution, error: dateError } = await supabase
      .from('availability_slots')
      .select('slot_datetime, donation_type, is_available')
      .order('slot_datetime', { ascending: true })
      .limit(20);

    if (dateError) {
      console.error('❌ Error fetching date distribution:', dateError.message);
    } else if (dateDistribution && dateDistribution.length > 0) {
      console.log('📅 First 20 slots by date:');
      dateDistribution.forEach((slot, index) => {
        const date = new Date(slot.slot_datetime);
        const status = slot.is_available ? '✅ Available' : '❌ Booked';
        console.log(`   ${index + 1}. ${date.toLocaleDateString()} ${date.toLocaleTimeString()} - ${slot.donation_type} - ${status}`);
      });
    }

    // 4. Check available slots specifically
    console.log('\n4. Checking Available Slots...');
    
    const { data: availableSlots, error: availableError } = await supabase
      .from('availability_slots')
      .select('slot_datetime, donation_type, center_id, capacity, current_bookings')
      .eq('is_available', true)
      .gt('slot_datetime', new Date().toISOString())
      .order('slot_datetime', { ascending: true })
      .limit(10);

    if (availableError) {
      console.error('❌ Error fetching available slots:', availableError.message);
    } else if (availableSlots && availableSlots.length > 0) {
      console.log(`✅ Found ${availableSlots.length} available slots in the future:`);
      availableSlots.forEach((slot, index) => {
        const date = new Date(slot.slot_datetime);
        console.log(`   ${index + 1}. ${date.toLocaleDateString()} ${date.toLocaleTimeString()} - ${slot.donation_type} (${slot.capacity - slot.current_bookings}/${slot.capacity})`);
      });
    } else {
      console.log('⚠️  No available slots found in the future!');
    }

    // 5. Check slots by donation type
    console.log('\n5. Checking Slots by Donation Type...');
    
    const { data: bloodSlots, error: bloodError } = await supabase
      .from('availability_slots')
      .select('slot_datetime, is_available')
      .eq('donation_type', 'Blood')
      .eq('is_available', true)
      .gt('slot_datetime', new Date().toISOString())
      .limit(5);

    if (bloodError) {
      console.error('❌ Error fetching blood slots:', bloodError.message);
    } else {
      console.log(`🩸 Blood donation slots available: ${bloodSlots?.length || 0}`);
    }

    const { data: plasmaSlots, error: plasmaError } = await supabase
      .from('availability_slots')
      .select('slot_datetime, is_available')
      .eq('donation_type', 'Plasma')
      .eq('is_available', true)
      .gt('slot_datetime', new Date().toISOString())
      .limit(5);

    if (plasmaError) {
      console.error('❌ Error fetching plasma slots:', plasmaError.message);
    } else {
      console.log(`💙 Plasma donation slots available: ${plasmaSlots?.length || 0}`);
    }

    // 6. Check the view
    console.log('\n6. Checking Available Slots View...');
    
    const { data: viewSlots, error: viewError } = await supabase
      .from('available_slots_view')
      .select('*')
      .limit(5);

    if (viewError) {
      console.error('❌ Error fetching available_slots_view:', viewError.message);
      console.log('💡 The view may not exist or have permission issues');
    } else if (viewSlots && viewSlots.length > 0) {
      console.log(`✅ View working: ${viewSlots.length} slots found`);
      viewSlots.forEach((slot, index) => {
        const date = new Date(slot.slot_datetime);
        console.log(`   ${index + 1}. ${date.toLocaleDateString()} ${date.toLocaleTimeString()} - ${slot.donation_type} at ${slot.center_name}`);
      });
    } else {
      console.log('⚠️  View returned no slots');
    }

    // 7. Check RLS policies
    console.log('\n7. Checking RLS Policies...');
    
    try {
      const { data: policyCheck, error: policyError } = await supabase
        .from('availability_slots')
        .select('slot_id')
        .limit(1);
      
      if (policyError) {
        console.error('❌ RLS policy issue:', policyError.message);
        console.log('💡 This suggests a Row Level Security policy is blocking access');
      } else {
        console.log('✅ RLS policies allow access to availability_slots');
      }
    } catch (err) {
      console.error('❌ RLS check failed:', err.message);
    }

    // Summary
    console.log('\n========================================');
    console.log('🔍 AVAILABILITY SLOTS DIAGNOSIS COMPLETE');
    console.log('========================================');
    
    if (totalSlots > 0) {
      console.log(`✅ Database has ${totalSlots} total slots`);
      
      if (availableSlots && availableSlots.length > 0) {
        console.log(`✅ Found ${availableSlots.length} available slots in the future`);
        console.log('💡 The issue might be in the frontend query or RLS policies');
      } else {
        console.log('⚠️  No available slots found in the future');
        console.log('💡 This suggests the slots were generated but are not marked as available');
      }
    } else {
      console.log('❌ No slots found in database');
      console.log('💡 You need to run the setup script to generate slots');
    }

    console.log('\n📝 Next Steps:');
    if (totalSlots === 0) {
      console.log('   1. Run the AVIS setup script: node run-avis-setup.cjs');
    } else if (availableSlots && availableSlots.length === 0) {
      console.log('   1. Check if slots are properly marked as available');
      console.log('   2. Verify the slot generation logic');
      console.log('   3. Check RLS policies in Supabase dashboard');
    } else {
      console.log('   1. Check frontend query logic');
      console.log('   2. Verify date filtering in AppointmentBooking component');
      console.log('   3. Check browser console for errors');
    }

  } catch (error) {
    console.error('\n❌ Debug failed:', error);
  }
}

// Run the debug
debugAvailabilitySlots();
