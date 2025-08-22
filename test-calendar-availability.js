const { createClient } = require('@supabase/supabase-js');

// Configuration - replace with your actual values
const SUPABASE_URL = process.env.SUPABASE_URL || 'your-supabase-url';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCalendarAvailability() {
  console.log('🧪 Testing Calendar Availability...\n');

  try {
    // Test 1: Check if availability slots exist
    console.log('1. Checking Availability Slots...');
    const { data: slots, error: slotsError } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('is_available', true)
      .gte('slot_datetime', new Date().toISOString())
      .lte('slot_datetime', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(10);

    if (slotsError) {
      console.error('❌ Error fetching slots:', slotsError);
      return;
    }

    if (!slots || slots.length === 0) {
      console.log('⚠️  No availability slots found! This is why the calendar shows all days as grayed out.');
      console.log('💡 You need to run the setup script to create availability slots.');
      return;
    }

    console.log(`✅ Found ${slots.length} availability slots for the next 30 days:`);
    slots.forEach(slot => {
      const date = new Date(slot.slot_datetime);
      console.log(`   - ${date.toLocaleDateString()} ${date.toLocaleTimeString()}: ${slot.donation_type} (${slot.capacity - slot.current_bookings}/${slot.capacity} available)`);
    });

    // Test 2: Check donation centers
    console.log('\n2. Checking Donation Centers...');
    const { data: centers, error: centersError } = await supabase
      .from('donation_centers')
      .select('*')
      .eq('is_active', true);

    if (centersError) {
      console.error('❌ Error fetching centers:', centersError);
      return;
    }

    console.log(`✅ Found ${centers.length} active donation centers:`);
    centers.forEach(center => {
      console.log(`   - ${center.name} (${center.city})`);
    });

    // Test 3: Check slot distribution by date
    console.log('\n3. Checking Slot Distribution by Date...');
    const slotsByDate = {};
    slots.forEach(slot => {
      const date = new Date(slot.slot_datetime).toDateString();
      if (!slotsByDate[date]) {
        slotsByDate[date] = { blood: 0, plasma: 0, total: 0 };
      }
      if (slot.donation_type === 'Blood') {
        slotsByDate[date].blood += slot.capacity - slot.current_bookings;
      } else if (slot.donation_type === 'Plasma') {
        slotsByDate[date].plasma += slot.capacity - slot.current_bookings;
      }
      slotsByDate[date].total += slot.capacity - slot.current_bookings;
    });

    Object.entries(slotsByDate).forEach(([date, counts]) => {
      console.log(`   ${date}: ${counts.blood} blood, ${counts.plasma} plasma (${counts.total} total available)`);
    });

    // Test 4: Check if slots are in operating hours
    console.log('\n4. Checking Operating Hours Compliance...');
    const operatingHoursSlots = slots.filter(slot => {
      const date = new Date(slot.slot_datetime);
      const day = date.getDay();
      const hour = date.getHours();
      return day >= 1 && day <= 6 && hour >= 7 && hour < 15;
    });

    console.log(`✅ ${operatingHoursSlots.length}/${slots.length} slots are within operating hours (Mon-Sat, 7 AM - 3 PM)`);

    // Test 5: Check database views
    console.log('\n5. Testing Database Views...');
    const { data: availableSlotsView, error: viewError } = await supabase
      .from('available_slots_view')
      .select('*')
      .limit(5);

    if (viewError) {
      console.error('❌ Error fetching available slots view:', viewError);
    } else {
      console.log(`✅ Available slots view working: ${availableSlotsView.length} slots found`);
    }

    // Summary
    console.log('\n========================================');
    console.log('🎉 Calendar Availability Test Complete!');
    console.log('========================================');
    console.log(`✅ Slots: ${slots.length} availability slots found`);
    console.log(`✅ Centers: ${centers.length} donation centers active`);
    console.log(`✅ Operating Hours: ${operatingHoursSlots.length} slots compliant`);
    
    if (slots.length > 0) {
      console.log('\n💡 The calendar should now display available days properly!');
      console.log('   - Days with available slots will be clickable');
      console.log('   - Blood donation slots will be shown in red');
      console.log('   - Plasma donation slots will be shown in blue');
      console.log('   - Days without slots will be grayed out');
    } else {
      console.log('\n⚠️  No slots found! Run the setup script:');
      console.log('   npm run setup-avis');
      console.log('   or');
      console.log('   node setup-avis-centers-and-slots.js');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testCalendarAvailability();
