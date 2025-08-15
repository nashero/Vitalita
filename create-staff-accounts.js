import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Simple SHA256 hash function for Node.js
async function generateSHA256Hash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

async function createStaffAccounts() {
  console.log('👨‍💼 Creating staff accounts...\n');

  try {
    // First, let's check if we can access the staff table
    console.log('🔍 Checking current staff table access...');
    const { data: existingStaff, error: staffError } = await supabase
      .from('staff')
      .select('*');

    if (staffError) {
      console.error('❌ Error accessing staff table:', staffError);
      console.log('\n💡 This suggests RLS policies are blocking access.');
      console.log('   We need to either:');
      console.log('   1. Use the service role key (SUPABASE_SERVICE_ROLE_KEY)');
      console.log('   2. Temporarily disable RLS policies');
      console.log('   3. Create accounts through the Supabase dashboard');
      return;
    }

    console.log(`📊 Found ${existingStaff?.length || 0} existing staff accounts`);

    // Check if roles exist
    console.log('\n🔐 Checking roles table...');
    const { data: existingRoles, error: rolesError } = await supabase
      .from('roles')
      .select('*');

    if (rolesError) {
      console.error('❌ Error accessing roles table:', rolesError);
      console.log('\n💡 Roles table access is also blocked by RLS.');
      return;
    }

    console.log(`📊 Found ${existingRoles?.length || 0} existing roles`);

    if (existingRoles && existingRoles.length > 0) {
      console.log('Available roles:');
      existingRoles.forEach((role, index) => {
        console.log(`   ${index + 1}. ${role.role_name} (${role.role_id})`);
      });
    }

    // If we can access the tables, try to create staff accounts
    if (existingStaff && existingStaff.length === 0 && existingRoles && existingRoles.length > 0) {
      console.log('\n🆕 No staff accounts exist, attempting to create them...');
      
      const adminRole = existingRoles.find(r => r.role_name === 'Administrator');
      const staffRole = existingRoles.find(r => r.role_name === 'Staff');

      if (!adminRole || !staffRole) {
        console.error('❌ Required roles not found. Need Administrator and Staff roles.');
        return;
      }

      const staffMembers = [
        {
          username: 'admin',
          password_hash: await generateSHA256Hash('admin123' + 'admin_salt'),
          salt: 'admin_salt',
          role_id: adminRole.role_id,
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@vitalita.com',
          phone_number: '+39 123 456 789',
          is_active: true,
          mfa_enabled: false
        },
        {
          username: 'staff1',
          password_hash: await generateSHA256Hash('staff123' + 'staff_salt'),
          salt: 'staff_salt',
          role_id: staffRole.role_id,
          first_name: 'Staff',
          last_name: 'Member',
          email: 'staff@vitalita.com',
          phone_number: '+39 987 654 321',
          is_active: true,
          mfa_enabled: false
        }
      ];

      console.log('📝 Attempting to insert staff accounts...');
      
      for (const staffMember of staffMembers) {
        console.log(`   Creating ${staffMember.username} account...`);
        
        const { data: createdStaff, error: insertError } = await supabase
          .from('staff')
          .insert(staffMember)
          .select()
          .single();

        if (insertError) {
          console.error(`   ❌ Failed to create ${staffMember.username}:`, insertError);
        } else {
          console.log(`   ✅ Successfully created ${staffMember.username} account`);
        }
      }
    } else if (existingStaff && existingStaff.length > 0) {
      console.log('\n✅ Staff accounts already exist:');
      existingStaff.forEach((staff, index) => {
        console.log(`   ${index + 1}. ${staff.username} (${staff.first_name} ${staff.last_name})`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }

  console.log('\n🏁 Staff account creation attempt completed');
  console.log('\n💡 If staff accounts could not be created due to RLS policies:');
  console.log('   1. Check your .env file for SUPABASE_SERVICE_ROLE_KEY');
  console.log('   2. Or create accounts manually through the Supabase dashboard');
  console.log('   3. Or temporarily disable RLS policies for the staff table');
}

createStaffAccounts(); 