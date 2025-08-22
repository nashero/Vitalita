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

console.log('Using Supabase URL:', supabaseUrl);
console.log('Anon Key present:', supabaseAnonKey ? 'Yes' : 'No');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runAvisSetup() {
  try {
    console.log('\n🚀 Starting AVIS Centers and Slots Setup...\n');

    // First, check if tables exist
    console.log('📋 Checking required tables...');
    
    const { data: centersCheck, error: centersError } = await supabase
      .from('donation_centers')
      .select('count')
      .limit(1);
    
    if (centersError) {
      console.error('❌ donation_centers table not found:', centersError.message);
      console.log('Please run the migration scripts first to create the required tables.');
      return;
    }

    const { data: slotsCheck, error: slotsError } = await supabase
      .from('availability_slots')
      .select('count')
      .limit(1);
    
    if (slotsError) {
      console.error('❌ availability_slots table not found:', slotsError.message);
      console.log('Please run the migration scripts first to create the required tables.');
      return;
    }

    const { data: appointmentsCheck, error: appointmentsError } = await supabase
      .from('appointments')
      .select('count')
      .limit(1);
    
    if (appointmentsError) {
      console.error('❌ appointments table not found:', appointmentsError.message);
      console.log('Please run the migration scripts first to create the required tables.');
      return;
    }

    console.log('✅ All required tables exist');

    // Check current data
    console.log('\n📊 Checking current data...');
    
    const { data: existingCenters, error: centersCountError } = await supabase
      .from('donation_centers')
      .select('center_id, name, city')
      .eq('is_active', true);
    
    if (centersCountError) {
      console.error('❌ Error checking centers:', centersCountError.message);
      return;
    }

    console.log(`📍 Found ${existingCenters?.length || 0} active centers`);

    const { data: existingSlots, error: slotsCountError } = await supabase
      .from('availability_slots')
      .select('slot_id, slot_datetime, donation_type')
      .limit(5);
    
    if (slotsCountError) {
      console.error('❌ Error checking slots:', slotsCountError.message);
      return;
    }

    console.log(`⏰ Found ${existingSlots?.length || 0} existing slots (showing first 5)`);
    if (existingSlots && existingSlots.length > 0) {
      existingSlots.forEach(slot => {
        console.log(`   - ${slot.donation_type} slot on ${new Date(slot.slot_datetime).toLocaleDateString()}`);
      });
    }

    // Read and execute the SQL setup script
    console.log('\n📝 Reading setup script...');
    const fs = require('fs');
    const path = require('path');
    
    const setupScriptPath = path.join(__dirname, 'setup-avis-centers-and-slots.sql');
    if (!fs.existsSync(setupScriptPath)) {
      console.error('❌ Setup script not found:', setupScriptPath);
      return;
    }

    const setupScript = fs.readFileSync(setupScriptPath, 'utf8');
    console.log('✅ Setup script loaded');

    // Split the script into individual statements
    const statements = setupScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));

    console.log(`\n🔧 Executing ${statements.length} SQL statements...`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim().length === 0) continue;

      try {
        console.log(`\n[${i + 1}/${statements.length}] Executing statement...`);
        
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct execution for functions and views
          if (statement.includes('CREATE OR REPLACE FUNCTION') || 
              statement.includes('CREATE OR REPLACE VIEW') ||
              statement.includes('CREATE INDEX')) {
            console.log(`   ⚠️  Statement may need manual execution in Supabase dashboard`);
            successCount++;
          } else {
            console.error(`   ❌ Error:`, error.message);
            errorCount++;
          }
        } else {
          console.log(`   ✅ Success`);
          successCount++;
        }
      } catch (err) {
        console.error(`   ❌ Exception:`, err.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Execution Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    if (errorCount > 0) {
      console.log(`\n⚠️  Some statements had errors. You may need to run the setup manually in the Supabase dashboard.`);
      console.log(`   Dashboard URL: ${supabaseUrl.replace('https://', 'https://app.supabase.com/project/')}`);
    }

    // Verify the setup worked
    console.log('\n🔍 Verifying setup...');
    
    const { data: newCenters, error: newCentersError } = await supabase
      .from('donation_centers')
      .select('center_id, name, city')
      .eq('is_active', true);
    
    if (!newCentersError && newCenters) {
      console.log(`📍 Centers after setup: ${newCenters.length}`);
      newCenters.forEach(center => {
        console.log(`   - ${center.name} (${center.city})`);
      });
    }

    const { data: newSlots, error: newSlotsError } = await supabase
      .from('availability_slots')
      .select('slot_id, slot_datetime, donation_type, center_id')
      .limit(10);
    
    if (!newSlotsError && newSlots) {
      console.log(`⏰ Slots after setup: ${newSlots.length} (showing first 10)`);
      newSlots.forEach(slot => {
        console.log(`   - ${slot.donation_type} slot on ${new Date(slot.slot_datetime).toLocaleDateString()}`);
      });
    }

    console.log('\n🎉 Setup complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Check your calendar interface - slots should now be available');
    console.log('   2. Try booking an appointment for August 25th or other available dates');
    console.log('   3. If you still see issues, check the Supabase dashboard for any errors');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check your .env file has correct Supabase credentials');
    console.log('   2. Ensure your database has the required tables');
    console.log('   3. Try running the setup manually in the Supabase dashboard');
  }
}

// Run the setup
runAvisSetup();
