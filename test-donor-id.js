const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDonorIdFunctionality() {
  console.log('Testing Donor ID functionality...\n');

  try {
    // Test 1: Check if donor_id column exists in donors table
    console.log('1. Checking if donor_id column exists...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'donors')
      .eq('column_name', 'donor_id');

    if (columnsError) {
      console.error('Error checking columns:', columnsError);
      return;
    }

    if (columns && columns.length > 0) {
      console.log('✅ donor_id column exists in donors table');
    } else {
      console.log('❌ donor_id column does not exist in donors table');
      return;
    }

    // Test 2: Check if generate_donor_id function exists
    console.log('\n2. Checking if generate_donor_id function exists...');
    const { data: functions, error: functionsError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_name', 'generate_donor_id');

    if (functionsError) {
      console.error('Error checking functions:', functionsError);
      return;
    }

    if (functions && functions.length > 0) {
      console.log('✅ generate_donor_id function exists');
    } else {
      console.log('❌ generate_donor_id function does not exist');
      return;
    }

    // Test 3: Test donor ID generation for different AVIS centers
    console.log('\n3. Testing donor ID generation...');
    const testCenters = ['AVIS Casalmaggiore', 'AVIS Gussola', 'AVIS Viadana'];
    
    for (const center of testCenters) {
      try {
        const { data: generatedId, error: genError } = await supabase
          .rpc('generate_donor_id', { p_avis_center: center });

        if (genError) {
          console.log(`❌ Failed to generate ID for ${center}:`, genError.message);
        } else {
          console.log(`✅ Generated ID for ${center}: ${generatedId}`);
        }
      } catch (error) {
        console.log(`❌ Error generating ID for ${center}:`, error.message);
      }
    }

    // Test 4: Check if sequence exists
    console.log('\n4. Checking if donor_id_sequence exists...');
    const { data: sequences, error: seqError } = await supabase
      .from('information_schema.sequences')
      .select('sequence_name')
      .eq('sequence_name', 'donor_id_sequence');

    if (seqError) {
      console.error('Error checking sequences:', seqError);
    } else if (sequences && sequences.length > 0) {
      console.log('✅ donor_id_sequence exists');
    } else {
      console.log('❌ donor_id_sequence does not exist');
    }

    // Test 5: Check if updated register_donor_with_email function exists
    console.log('\n5. Checking if updated register_donor_with_email function exists...');
    const { data: regFunctions, error: regError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_name', 'register_donor_with_email');

    if (regError) {
      console.error('Error checking registration function:', regError);
    } else if (regFunctions && regFunctions.length > 0) {
      console.log('✅ register_donor_with_email function exists');
    } else {
      console.log('❌ register_donor_with_email function does not exist');
    }

    // Test 6: Check if associated tables have donor_id columns
    console.log('\n6. Checking associated tables for donor_id columns...');
    const associatedTables = ['appointments', 'donation_history', 'audit_logs'];
    
    for (const table of associatedTables) {
      try {
        const { data: tableColumns, error: tableError } = await supabase
          .from('information_schema.columns')
          .select('column_name')
          .eq('table_name', table)
          .eq('column_name', 'donor_id');

        if (tableError) {
          console.log(`⚠️  Could not check ${table} table:`, tableError.message);
        } else if (tableColumns && tableColumns.length > 0) {
          console.log(`✅ ${table} table has donor_id column`);
        } else {
          console.log(`❌ ${table} table does not have donor_id column`);
        }
      } catch (error) {
        console.log(`⚠️  Error checking ${table} table:`, error.message);
      }
    }

    console.log('\n✅ Donor ID functionality test completed!');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testDonorIdFunctionality(); 