const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAvailabilitySlots() {
  try {
    console.log('Testing availability slots...\n');
    
    // Test 1: Check total count of available slots
    const { data: totalSlots, error: totalError } = await supabase
      .from('availability_slots')
      .select('slot_id, slot_datetime, donation_type, is_available')
      .eq('is_available', true);
    
    if (totalError) {
      console.error('Error fetching total slots:', totalError);
      return;
    }
    
    console.log(`Total available slots: ${totalSlots?.length || 0}`);
    
    // Test 2: Check slots by donation type
    const { data: bloodSlots, error: bloodError } = await supabase
      .from('availability_slots')
      .select('slot_id, slot_datetime, donation_type, is_available')
      .eq('is_available', true)
      .eq('donation_type', 'Blood');
    
    if (bloodError) {
      console.error('Error fetching blood slots:', bloodError);
      return;
    }
    
    console.log(`Blood donation slots: ${bloodSlots?.length || 0}`);
    
    const { data: plasmaSlots, error: plasmaError } = await supabase
      .from('availability_slots')
      .select('slot_id, slot_datetime, donation_type, is_available')
      .eq('is_available', true)
      .eq('donation_type', 'Plasma');
    
    if (plasmaError) {
      console.error('Error fetching plasma slots:', plasmaError);
      return;
    }
    
    console.log(`Plasma donation slots: ${plasmaSlots?.length || 0}`);
    
    // Test 3: Check date range
    if (totalSlots && totalSlots.length > 0) {
      const dates = totalSlots.map(slot => new Date(slot.slot_datetime));
      const sortedDates = dates.sort((a, b) => a - b);
      
      console.log(`\nDate range:`);
      console.log(`Earliest slot: ${sortedDates[0].toISOString()}`);
      console.log(`Latest slot: ${sortedDates[sortedDates.length - 1].toISOString()}`);
      
      // Test 4: Check specific months
      const currentDate = new Date();
      const futureMonths = [];
      
      for (let i = 0; i < 12; i++) {
        const futureDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
        const monthName = futureDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        const slotsInMonth = totalSlots.filter(slot => {
          const slotDate = new Date(slot.slot_datetime);
          return slotDate.getMonth() === futureDate.getMonth() && 
                 slotDate.getFullYear() === futureDate.getFullYear();
        });
        
        if (slotsInMonth.length > 0) {
          futureMonths.push({ month: monthName, count: slotsInMonth.length });
        }
      }
      
      console.log(`\nSlots by month:`);
      futureMonths.forEach(({ month, count }) => {
        console.log(`${month}: ${count} slots`);
      });
      
      // Test 5: Check if there are weekend slots
      const weekendSlots = totalSlots.filter(slot => {
        const slotDate = new Date(slot.slot_datetime);
        const dayOfWeek = slotDate.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
      });
      
      console.log(`\nWeekend slots: ${weekendSlots.length}`);
      if (weekendSlots.length > 0) {
        console.log('Sample weekend slots:');
        weekendSlots.slice(0, 5).forEach(slot => {
          const date = new Date(slot.slot_datetime);
          console.log(`  ${date.toDateString()} (${date.toLocaleDateString('en-US', { weekday: 'long' })})`);
        });
      }
    }
    
    // Test 6: Check the exact query used in the component
    console.log(`\nTesting component query...`);
    const { data: componentQuerySlots, error: componentError } = await supabase
      .from('availability_slots')
      .select(`
        *,
        donation_centers!inner (
          center_id,
          name,
          address,
          city,
          country,
          contact_phone,
          email
        )
      `)
      .eq('donation_type', 'Blood')
      .eq('is_available', true)
      .gt('slot_datetime', new Date().toISOString())
      .order('slot_datetime', { ascending: true });
    
    if (componentError) {
      console.error('Error with component query:', componentError);
      return;
    }
    
    console.log(`Component query returned: ${componentQuerySlots?.length || 0} slots`);
    
    if (componentQuerySlots && componentQuerySlots.length > 0) {
      console.log('First 5 slots from component query:');
      componentQuerySlots.slice(0, 5).forEach((slot, index) => {
        const date = new Date(slot.slot_datetime);
        console.log(`  ${index + 1}. ${date.toISOString()} (${date.toDateString()})`);
      });
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAvailabilitySlots();
