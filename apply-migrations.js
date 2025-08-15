import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pxvimagfvonwxygmtgpi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4dmltYWdmdm9ud3h5Z210Z3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODg4NjcsImV4cCI6MjA2Njg2NDg2N30.U0ZAojLgRS680JpP2HXZhm1Q_vce6i8o9k5zZ3Jx6LA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function applyMigrations() {
  try {
    console.log('Applying database migrations...');
    
    // Migration 1: Fix AVIS center constraint
    console.log('\n--- Migration 1: Fixing AVIS center constraint ---');
    
    // Drop the outdated constraint
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE donors DROP CONSTRAINT IF EXISTS chk_donors_avis_center;'
    });
    
    if (dropError) {
      console.error('Error dropping constraint:', dropError);
    } else {
      console.log('Dropped outdated constraint');
    }
    
    // Create new constraint that references donation_centers table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE donors ADD CONSTRAINT chk_donors_avis_center 
            CHECK (avis_donor_center IN (
              SELECT name FROM donation_centers WHERE is_active = true
            ));`
    });
    
    if (createError) {
      console.error('Error creating new constraint:', createError);
    } else {
      console.log('Created new constraint');
    }
    
    // Migration 2: Fix audit_logs RLS policies
    console.log('\n--- Migration 2: Fixing audit_logs RLS policies ---');
    
    // Drop existing policies
    const { error: dropPolicyError } = await supabase.rpc('exec_sql', {
      sql: `DROP POLICY IF EXISTS "Public can read audit logs" ON audit_logs;
            DROP POLICY IF EXISTS "Authenticated users can create audit logs" ON audit_logs;
            DROP POLICY IF EXISTS "Authenticated users can update audit logs" ON audit_logs;`
    });
    
    if (dropPolicyError) {
      console.error('Error dropping policies:', dropPolicyError);
    } else {
      console.log('Dropped existing policies');
    }
    
    // Create new policy
    const { error: createPolicyError } = await supabase.rpc('exec_sql', {
      sql: `CREATE POLICY "System can manage audit logs"
            ON audit_logs
            FOR ALL
            TO public
            USING (true)
            WITH CHECK (true);`
    });
    
    if (createPolicyError) {
      console.error('Error creating new policy:', createPolicyError);
    } else {
      console.log('Created new policy');
    }
    
    // Migration 3: Fix create_audit_log function
    console.log('\n--- Migration 3: Fixing create_audit_log function ---');
    
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `CREATE OR REPLACE FUNCTION create_audit_log(
        p_user_id VARCHAR DEFAULT NULL,
        p_user_type VARCHAR DEFAULT 'system',
        p_action VARCHAR DEFAULT 'unknown',
        p_details TEXT DEFAULT NULL,
        p_ip_address VARCHAR DEFAULT NULL,
        p_user_agent VARCHAR DEFAULT NULL,
        p_resource_type VARCHAR DEFAULT NULL,
        p_resource_id VARCHAR DEFAULT NULL,
        p_status VARCHAR DEFAULT 'success'
      )
      RETURNS VARCHAR AS $$
      DECLARE
        v_log_id VARCHAR;
      BEGIN
        v_log_id := gen_random_uuid()::VARCHAR;
        
        INSERT INTO audit_logs (
          log_id, timestamp, user_id, user_type, action, details,
          ip_address, user_agent, resource_type, resource_id, status
        ) VALUES (
          v_log_id, NOW(), p_user_id, p_user_type, p_action, p_details,
          p_ip_address, p_user_agent, p_resource_type, p_resource_id, p_status
        );
        
        RETURN v_log_id;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE WARNING 'Failed to create audit log: %', SQLERRM;
          RETURN NULL;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;`
    });
    
    if (functionError) {
      console.error('Error creating function:', functionError);
    } else {
      console.log('Created/updated function');
    }
    
    console.log('\n--- Migrations completed ---');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migrations
console.log('Starting migration application...');
applyMigrations().then(() => {
  console.log('Migration application completed');
}).catch((error) => {
  console.error('Migration application failed:', error);
}); 