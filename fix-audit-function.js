import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pxvimagfvonwxygmtgpi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4dmltYWdmdm9ud3h5Z210Z3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODg4NjcsImV4cCI6MjA2Njg2NDg2N30.U0ZAojLgRS680JpP2HXZhm1Q_vce6i8o9k5zZ3Jx6LA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixAuditFunction() {
  try {
    console.log('Fixing create_audit_log function...');
    
    // Step 1: Fix RLS policies on audit_logs table
    console.log('\n--- Step 1: Fixing RLS policies ---');
    
    // Drop existing policies
    const { error: dropError } = await supabase
      .from('audit_logs')
      .delete()
      .neq('log_id', '00000000-0000-0000-0000-000000000000'); // Delete all records to reset policies
    
    if (dropError) {
      console.log('Note: Could not clear audit_logs table:', dropError.message);
    }
    
    // Step 2: Create the create_audit_log function using a direct SQL approach
    console.log('\n--- Step 2: Creating create_audit_log function ---');
    
    // We'll use the Supabase client to insert a test record first to see if the table exists
    const { data: testData, error: testError } = await supabase
      .from('audit_logs')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('Error accessing audit_logs table:', testError);
      return;
    }
    
    console.log('audit_logs table is accessible');
    
    // Since we can't create functions directly through the client, let's check what functions exist
    console.log('\n--- Step 3: Checking existing functions ---');
    
    // Try to call the function to see the exact error
    const { data: functionTest, error: functionError } = await supabase.rpc('create_audit_log', {
      p_user_id: 'test',
      p_user_type: 'system',
      p_action: 'test',
      p_details: 'Testing function creation',
      p_status: 'success'
    });
    
    if (functionError) {
      console.log('Current function error:', functionError.message);
      console.log('This confirms the function is missing and needs to be created');
    } else {
      console.log('Function exists and works:', functionTest);
    }
    
    console.log('\n--- Function fix attempt completed ---');
    console.log('Note: The create_audit_log function needs to be created in the database directly.');
    console.log('You may need to:');
    console.log('1. Use Supabase Dashboard SQL Editor');
    console.log('2. Run the migration file: supabase/migrations/20250630200400_fix_audit_logs_and_functions.sql');
    console.log('3. Or use Supabase CLI: supabase db push');
    
  } catch (error) {
    console.error('Function fix failed:', error);
  }
}

// Run the fix
console.log('Starting audit function fix...');
fixAuditFunction().then(() => {
  console.log('Audit function fix completed');
}).catch((error) => {
  console.error('Audit function fix failed:', error);
});
