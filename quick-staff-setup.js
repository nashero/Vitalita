import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration - use service role key to bypass RLS
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pxvimagfvonwxygmtgpi.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env file');
  console.log('💡 Please add SUPABASE_SERVICE_ROLE_KEY to your .env file');
  process.exit(1);
}

// Create client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Simple SHA256 hash function for Node.js
async function generateSHA256Hash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

async function quickStaffSetup() {
  console.log('🚀 Quick Staff Setup - Creating essential accounts...\n');
  console.log('🔑 Using service role key to bypass RLS policies\n');

  try {
    // Step 1: Create basic roles
    console.log('📝 Step 1: Creating basic roles...');
    
    const roles = [
      { role_name: 'Administrator', description: 'Full system access with all administrative privileges' },
      { role_name: 'Staff', description: 'Standard staff access for daily operations' }
    ];

    const createdRoles = [];
    for (const role of roles) {
      const { data: createdRole, error } = await supabase
        .from('roles')
        .insert(role)
        .select()
        .single();

      if (error) {
        console.error(`   ❌ Failed to create role ${role.role_name}:`, error.message);
      } else {
        console.log(`   ✅ Created role: ${role.role_name}`);
        createdRoles.push(createdRole);
      }
    }

    if (createdRoles.length === 0) {
      console.log('\n❌ No roles could be created. Cannot proceed with staff accounts.');
      return;
    }

    // Step 2: Create staff accounts
    console.log('\n👨‍💼 Step 2: Creating staff accounts...');
    
    const adminRole = createdRoles.find(r => r.role_name === 'Administrator');
    const staffRole = createdRoles.find(r => r.role_name === 'Staff');

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

    let successCount = 0;
    for (const staffMember of staffMembers) {
      console.log(`   Creating ${staffMember.username} account...`);
      
      const { data: createdStaff, error } = await supabase
        .from('staff')
        .insert(staffMember)
        .select()
        .single();

      if (error) {
        console.error(`   ❌ Failed to create ${staffMember.username}:`, error.message);
      } else {
        console.log(`   ✅ Successfully created ${staffMember.username} account`);
        successCount++;
      }
    }

    // Step 3: Verification
    console.log('\n🔍 Step 3: Verification...');
    
    const { data: finalRoles } = await supabase.from('roles').select('*');
    const { data: finalStaff } = await supabase.from('staff').select('*');
    
    console.log(`📊 Final counts - Roles: ${finalRoles?.length || 0}, Staff: ${finalStaff?.length || 0}`);

    if (successCount > 0) {
      console.log('\n🎉 SUCCESS! Staff portal is now accessible!');
      console.log('\n📋 Login credentials:');
      console.log('   Admin: username=admin, password=admin123');
      console.log('   Staff: username=staff1, password=staff123');
      console.log('\n🌐 You can now:');
      console.log('   1. Go to your Vitalita app');
      console.log('   2. Click "Staff Portal"');
      console.log('   3. Login with the credentials above');
      console.log('\n🔒 Security Note:');
      console.log('   - The service role key bypasses all RLS policies');
      console.log('   - Consider re-enabling RLS after initial setup');
      console.log('   - Change default passwords in production');
    } else {
      console.log('\n❌ No staff accounts were created successfully.');
      console.log('💡 Check the error messages above and fix the issues.');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }

  console.log('\n🏁 Quick staff setup completed');
}

// Run the setup
quickStaffSetup(); 