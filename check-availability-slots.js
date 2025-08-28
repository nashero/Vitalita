const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkAvailabilitySlots() {
  try {
    console.log('Checking availability slots...\n');
    
    // Get the latest slots
    const { data: latestSlots, error: latestError } = await supabase
      .from('availability_slots')
      .select('slot_datetime, donation_type, is_available')
      .order('slot_datetime', { ascending: false })
      .limit(10);
    
    if (latestError) {
      console.error('Error fetching latest slots:', latestError);
      return;
    }
    
    console.log('Latest 10 slots:');
    latestSlots.forEach(slot => {
      console.log(`${slot.slot_datetime} - ${slot.donation_type} - Available: ${slot.is_available}`);
    });
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Get the earliest slots
    const { data: earliestSlots, error: earliestError } = await supabase
      .from('availability_slots')
      .select('slot_datetime, donation_type, is_available')
      .order('slot_datetime', { ascending: true })
      .limit(10);
    
    if (earliestError) {
      console.error('Error fetching earliest slots:', earliestError);
      return;
    }
    
    console.log('Earliest 10 slots:');
    earliestSlots.forEach(slot => {
      console.log(`${slot.slot_datetime} - ${slot.donation_type} - Available: ${slot.is_available}`);
    });
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Get total count and date range
    const { count, error: countError } = await supabase
      .from('availability_slots')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error getting count:', countError);
      return;
    }
    
    console.log(`Total slots in database: ${count}`);
    
    // Get date range
    const { data: dateRange, error: rangeError } = await supabase
      .from('availability_slots')
      .select('slot_datetime')
      .order('slot_datetime', { ascending: true });
    
    if (rangeError) {
      console.error('Error getting date range:', rangeError);
      return;
    }
    
    if (dateRange && dateRange.length > 0) {
      const earliest = new Date(dateRange[0].slot_datetime);
      const latest = new Date(dateRange[dateRange.length - 1].slot_datetime);
      
      console.log(`Date range: ${earliest.toISOString().split('T')[0]} to ${latest.toISOString().split('T')[0]}`);
      console.log(`Total days covered: ${Math.ceil((latest - earliest) / (1000 * 60 * 60 * 24))}`);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkAvailabilitySlots();
