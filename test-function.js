import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFunction() {
  try {
    console.log('Testing create_audit_log function...');
    
    // Test 1: Check if function exists
    const { data: functions, error: funcError } = await supabase
      .from('information_schema.routines')
      .select('routine_name, routine_definition')
      .eq('routine_name', 'create_audit_log');
    
    if (funcError) {
      console.error('Error checking functions:', funcError);
    } else {
      console.log('Functions found:', functions);
    }
    
    // Test 2: Try to call the function
    const { data, error } = await supabase.rpc('create_audit_log', {
      p_user_id: 'test-user',
      p_user_type: 'test',
      p_action: 'test_action',
      p_details: 'Testing function call'
    });
    
    if (error) {
      console.error('Function call error:', error);
      
      // Check what functions are available
      const { data: allFunctions, error: allFuncError } = await supabase
        .from('information_schema.routines')
        .select('routine_name')
        .like('routine_name', '%audit%');
      
      if (!allFuncError) {
        console.log('Available audit-related functions:', allFunctions);
      }
    } else {
      console.log('Function call successful:', data);
    }
    
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testFunction(); 