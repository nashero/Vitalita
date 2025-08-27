const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testSlotCount() {
  try {
    console.log('Testing slot count...\n');
    
    // Test 1: Count all available slots
    const { count: totalCount, error: totalError } = await supabase
      .from('availability_slots')
      .select('*', { count: 'exact', head: true })
      .eq('is_available', true);
    
    if (totalError) {
      console.error('Error getting total count:', totalError);
    } else {
      console.log(`Total available slots: ${totalCount}`);
    }
    
    // Test 2: Count Blood donation slots
    const { count: bloodCount, error: bloodError } = await supabase
      .from('availability_slots')
      .select('*', { count: 'exact', head: true })
      .eq('is_available', true)
      .eq('donation_type', 'Blood');
    
    if (bloodError) {
      console.error('Error getting blood count:', bloodError);
    } else {
      console.log(`Blood donation slots: ${bloodCount}`);
    }
    
    // Test 3: Count Plasma donation slots
    const { count: plasmaCount, error: plasmaError } = await supabase
      .from('availability_slots')
      .select('*', { count: 'exact', head: true })
      .eq('is_available', true)
      .eq('donation_type', 'Plasma');
    
    if (plasmaError) {
      console.error('Error getting plasma count:', plasmaError);
    } else {
      console.log(`Plasma donation slots: ${plasmaCount}`);
    }
    
    // Test 4: Get date range
    const { data: dateRange, error: rangeError } = await supabase
      .from('availability_slots')
      .select('slot_datetime')
      .eq('is_available', true)
      .order('slot_datetime', { ascending: true });
    
    if (rangeError) {
      console.error('Error getting date range:', rangeError);
    } else if (dateRange && dateRange.length > 0) {
      const earliest = new Date(dateRange[0].slot_datetime);
      const latest = new Date(dateRange[dateRange.length - 1].slot_datetime);
      
      console.log(`\nDate range: ${earliest.toISOString().split('T')[0]} to ${latest.toISOString().split('T')[0]}`);
      console.log(`Total days covered: ${Math.ceil((latest - earliest) / (1000 * 60 * 60 * 24))}`);
    }
    
    // Test 5: Test the exact query from the component
    console.log('\nTesting component query...');
    const { data: componentSlots, error: componentError } = await supabase
      .from('availability_slots')
      .select(`
        *,
        donation_centers (
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
      .order('slot_datetime', { ascending: true })
      .limit(100000);
    
    if (componentError) {
      console.error('Component query error:', componentError);
    } else {
      console.log(`Component query result: ${componentSlots?.length || 0} slots`);
      if (componentSlots && componentSlots.length > 0) {
        console.log(`First slot: ${componentSlots[0].slot_datetime}`);
        console.log(`Last slot: ${componentSlots[componentSlots.length - 1].slot_datetime}`);
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testSlotCount();
