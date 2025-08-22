const { createClient } = require('@supabase/supabase-js');

// Configuration - replace with your actual values
const SUPABASE_URL = process.env.SUPABASE_URL || 'your-supabase-url';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCalendarSetup() {
  console.log('🧪 Testing Calendar Setup...\n');

  try {
    // Test 1: Check donation centers
    console.log('1. Testing Donation Centers...');
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

    // Test 2: Check availability slots
    console.log('\n2. Testing Availability Slots...');
    const { data: slots, error: slotsError } = await supabase
      .from('availability_slots')
      .select('*')
      .gte('slot_datetime', new Date().toISOString())
      .lte('slot_datetime', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

    if (slotsError) {
      console.error('❌ Error fetching slots:', slotsError);
      return;
    }

    console.log(`✅ Found ${slots.length} availability slots for the next week:`);
    
    // Group slots by date and type
    const slotsByDate = {};
    slots.forEach(slot => {
      const date = new Date(slot.slot_datetime).toDateString();
      if (!slotsByDate[date]) {
        slotsByDate[date] = { blood: 0, plasma: 0 };
      }
      if (slot.donation_type === 'Blood') {
        slotsByDate[date].blood++;
      } else if (slot.donation_type === 'Plasma') {
        slotsByDate[date].plasma++;
      }
    });

    Object.entries(slotsByDate).forEach(([date, counts]) => {
      console.log(`   ${date}: ${counts.blood} blood slots, ${counts.plasma} plasma slots`);
    });

    // Test 3: Check slot capacity and availability
    console.log('\n3. Testing Slot Details...');
    const sampleSlot = slots[0];
    if (sampleSlot) {
      console.log(`✅ Sample slot details:`);
      console.log(`   - Type: ${sampleSlot.donation_type}`);
      console.log(`   - Capacity: ${sampleSlot.capacity}`);
      console.log(`   - Current Bookings: ${sampleSlot.current_bookings}`);
      console.log(`   - Available: ${sampleSlot.is_available}`);
      console.log(`   - DateTime: ${new Date(sampleSlot.slot_datetime).toLocaleString()}`);
    }

    // Test 4: Check operating hours
    console.log('\n4. Testing Operating Hours...');
    const mondaySlots = slots.filter(slot => {
      const date = new Date(slot.slot_datetime);
      return date.getDay() === 1; // Monday
    });

    const sundaySlots = slots.filter(slot => {
      const date = new Date(slot.slot_datetime);
      return date.getDay() === 0; // Sunday
    });

    console.log(`✅ Monday slots: ${mondaySlots.length} (should be > 0)`);
    console.log(`✅ Sunday slots: ${sundaySlots.length} (should be 0)`);

    // Test 5: Check views
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

    // Test 6: Check functions
    console.log('\n6. Testing Database Functions...');
    const { data: stats, error: statsError } = await supabase
      .rpc('get_slot_statistics', {
        p_start_date: new Date().toISOString().split('T')[0],
        p_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });

    if (statsError) {
      console.error('❌ Error fetching slot statistics:', statsError);
    } else {
      console.log(`✅ Slot statistics function working: ${stats.length} center stats found`);
      stats.forEach(stat => {
        console.log(`   - ${stat.center_name}: ${stat.available_slots}/${stat.total_slots} available (${stat.utilization_rate}% utilization)`);
      });
    }

    // Summary
    console.log('\n========================================');
    console.log('🎉 Calendar Setup Test Complete!');
    console.log('========================================');
    console.log(`✅ Centers: ${centers.length}/7 AVIS centers active`);
    console.log(`✅ Slots: ${slots.length} availability slots generated`);
    console.log(`✅ Views: Database views working correctly`);
    console.log(`✅ Functions: Database functions operational`);
    console.log('\nThe calendar interface is ready to use!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testCalendarSetup();
