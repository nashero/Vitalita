import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function extendAvailabilitySlots() {
  try {
    console.log('Extending availability slots...\n');
    
    // First, let's check the current state
    const { data: currentSlots, error: currentError } = await supabase
      .from('availability_slots')
      .select('slot_datetime')
      .order('slot_datetime', { ascending: false })
      .limit(1);
    
    if (currentError) {
      console.error('Error checking current slots:', currentError);
      return;
    }
    
    if (!currentSlots || currentSlots.length === 0) {
      console.error('No existing slots found. Please run the initial setup first.');
      return;
    }
    
    const latestSlotDate = new Date(currentSlots[0].slot_datetime);
    const newEndDate = new Date(latestSlotDate);
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    
    console.log(`Latest existing slot date: ${latestSlotDate.toDateString()}`);
    console.log(`Extending slots to: ${newEndDate.toDateString()}\n`);
    
    // Read the SQL script
    const sqlScript = readFileSync('./extend-availability-slots.sql', 'utf8');
    
    // Execute the SQL script
    const { error: sqlError } = await supabase.rpc('exec_sql', { sql: sqlScript });
    
    if (sqlError) {
      // If the RPC method doesn't exist, try to execute the functions directly
      console.log('Trying to execute functions directly...');
      
      // Execute the extension function
      const { error: extendError } = await supabase.rpc('extend_slots_next_year');
      
      if (extendError) {
        console.error('Error extending slots:', extendError);
        console.log('\nThe extension function may not exist yet. Please run the SQL script manually in your Supabase dashboard.');
        return;
      }
    }
    
    // Verify the extension
    const { data: newSlots, error: verifyError } = await supabase
      .from('availability_slots')
      .select('slot_datetime')
      .order('slot_datetime', { ascending: false })
      .limit(1);
    
    if (verifyError) {
      console.error('Error verifying extension:', verifyError);
      return;
    }
    
    if (newSlots && newSlots.length > 0) {
      const newLatestDate = new Date(newSlots[0].slot_datetime);
      console.log(`\n✅ Success! Availability slots extended to: ${newLatestDate.toDateString()}`);
      
      // Count total slots
      const { count: totalSlots, error: countError } = await supabase
        .from('availability_slots')
        .select('*', { count: 'exact', head: true });
      
      if (!countError && totalSlots !== null) {
        console.log(`Total availability slots: ${totalSlots}`);
      }
    }
    
  } catch (error) {
    console.error('Script failed:', error);
    console.log('\nAlternative: You can run the SQL script manually in your Supabase dashboard:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of extend-availability-slots.sql');
    console.log('4. Click Run');
  }
}

extendAvailabilitySlots();
