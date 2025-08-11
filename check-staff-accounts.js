import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStaffAccounts() {
  console.log('🔍 Checking staff accounts in database...\n');

  try {
    // Check if staff table exists and has data
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('*');

    if (staffError) {
      console.error('❌ Error accessing staff table:', staffError);
      return;
    }

    console.log(`📊 Found ${staffData?.length || 0} staff accounts:`);
    
    if (staffData && staffData.length > 0) {
      staffData.forEach((staff, index) => {
        console.log(`\n${index + 1}. Staff Account:`);
        console.log(`   ID: ${staff.staff_id}`);
        console.log(`   Username: ${staff.username}`);
        console.log(`   Name: ${staff.first_name} ${staff.last_name}`);
        console.log(`   Email: ${staff.email}`);
        console.log(`   Role ID: ${staff.role_id}`);
        console.log(`   Active: ${staff.is_active}`);
        console.log(`   Salt: ${staff.salt}`);
        console.log(`   Password Hash: ${staff.password_hash.substring(0, 20)}...`);
      });
    } else {
      console.log('❌ No staff accounts found in database');
    }

    // Check roles table
    console.log('\n🔐 Checking roles table...');
    const { data: rolesData, error: rolesError } = await supabase
      .from('roles')
      .select('*');

    if (rolesError) {
      console.error('❌ Error accessing roles table:', rolesError);
    } else {
      console.log(`📊 Found ${rolesData?.length || 0} roles:`);
      if (rolesData && rolesData.length > 0) {
        rolesData.forEach((role, index) => {
          console.log(`   ${index + 1}. ${role.role_name} (${role.role_id})`);
        });
      }
    }

    // Test authentication with the known credentials
    console.log('\n🧪 Testing authentication...');
    
    // Test admin login
    console.log('\nTesting admin login (username=admin, password=admin123)...');
    const adminStaff = staffData?.find(s => s.username === 'admin');
    if (adminStaff) {
      console.log(`   Found admin account with salt: ${adminStaff.salt}`);
      console.log(`   Password hash: ${adminStaff.password_hash.substring(0, 20)}...`);
      
      // Test the hash generation
      const crypto = await import('crypto');
      const testHash = crypto.createHash('sha256').update('admin123' + adminStaff.salt).digest('hex');
      console.log(`   Expected hash: ${testHash.substring(0, 20)}...`);
      console.log(`   Hash match: ${testHash === adminStaff.password_hash ? '✅ YES' : '❌ NO'}`);
    } else {
      console.log('   ❌ Admin account not found');
    }

    // Test staff login
    console.log('\nTesting staff login (username=staff1, password=staff123)...');
    const staffMember = staffData?.find(s => s.username === 'staff1');
    if (staffMember) {
      console.log(`   Found staff account with salt: ${staffMember.salt}`);
      console.log(`   Password hash: ${staffMember.password_hash.substring(0, 20)}...`);
      
      // Test the hash generation
      const crypto = await import('crypto');
      const testHash = crypto.createHash('sha256').update('staff123' + staffMember.salt).digest('hex');
      console.log(`   Expected hash: ${testHash.substring(0, 20)}...`);
      console.log(`   Hash match: ${testHash === staffMember.password_hash ? '✅ YES' : '❌ NO'}`);
    } else {
      console.log('   ❌ Staff account not found');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkStaffAccounts(); 