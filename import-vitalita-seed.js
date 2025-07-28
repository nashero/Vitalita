import { createClient } from '@supabase/supabase-js';
import { generateSHA256Hash } from './src/utils/crypto.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Create donation centers
    console.log('📍 Creating donation centers...');
    const centers = [
      {
        name: 'AVIS Casalmaggiore',
        address: 'Via Roma 123',
        city: 'Casalmaggiore',
        country: 'Italy',
        contact_phone: '+39 0375 123456',
        email: 'info@aviscasalmaggiore.it',
        is_active: true
      },
      {
        name: 'AVIS Gussola',
        address: 'Via Garibaldi 45',
        city: 'Gussola',
        country: 'Italy',
        contact_phone: '+39 0375 654321',
        email: 'info@avisgussola.it',
        is_active: true
      },
      {
        name: 'AVIS Viadana',
        address: 'Piazza Matteotti 67',
        city: 'Viadana',
        country: 'Italy',
        contact_phone: '+39 0375 789012',
        email: 'info@avisviadana.it',
        is_active: true
      }
    ];

    const { data: createdCenters, error: centersError } = await supabase
      .from('donation_centers')
      .insert(centers)
      .select();

    if (centersError) {
      console.error('Error creating centers:', centersError);
      return;
    }

    console.log(`✅ Created ${createdCenters.length} donation centers`);

    // 2. Create roles
    console.log('👥 Creating roles...');
    const roles = [
      { role_name: 'Administrator', description: 'Full system access' },
      { role_name: 'Manager', description: 'Management and oversight' },
      { role_name: 'Staff', description: 'Basic operational access' },
      { role_name: 'Nurse', description: 'Medical staff access' },
      { role_name: 'Receptionist', description: 'Appointment management' }
    ];

    const { data: createdRoles, error: rolesError } = await supabase
      .from('roles')
      .insert(roles)
      .select();

    if (rolesError) {
      console.error('Error creating roles:', rolesError);
      return;
    }

    console.log(`✅ Created ${createdRoles.length} roles`);

    // 3. Create permissions
    console.log('🔐 Creating permissions...');
    const permissions = [
      { permission_name: 'view_dashboard', description: 'View dashboard' },
      { permission_name: 'manage_appointments', description: 'Manage appointments' },
      { permission_name: 'view_appointments', description: 'View appointments' },
      { permission_name: 'manage_donors', description: 'Manage donors' },
      { permission_name: 'view_donors', description: 'View donors' },
      { permission_name: 'manage_centers', description: 'Manage centers' },
      { permission_name: 'view_centers', description: 'View centers' },
      { permission_name: 'manage_slots', description: 'Manage availability slots' },
      { permission_name: 'view_slots', description: 'View availability slots' },
      { permission_name: 'view_staff', description: 'View staff' },
      { permission_name: 'view_roles', description: 'View roles' },
      { permission_name: 'generate_reports', description: 'Generate reports' },
      { permission_name: 'audit_logs', description: 'View audit logs' },
      { permission_name: 'notification_settings', description: 'Manage notifications' }
    ];

    const { data: createdPermissions, error: permissionsError } = await supabase
      .from('permissions')
      .insert(permissions)
      .select();

    if (permissionsError) {
      console.error('Error creating permissions:', permissionsError);
      return;
    }

    console.log(`✅ Created ${createdPermissions.length} permissions`);

    // 4. Create staff members
    console.log('👨‍💼 Creating staff members...');
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

    const { data: createdStaff, error: staffError } = await supabase
      .from('staff')
      .insert(staffMembers)
      .select();

    if (staffError) {
      console.error('Error creating staff:', staffError);
      return;
    }

    console.log(`✅ Created ${createdStaff.length} staff members`);

    // 5. Create sample donors
    console.log('🩸 Creating sample donors...');
    const donorData = [
      {
        firstName: 'Mario',
        lastName: 'Rossi',
        dateOfBirth: '1985-03-15',
        avisDonorCenter: 'Casalmaggiore'
      },
      {
        firstName: 'Giulia',
        lastName: 'Bianchi',
        dateOfBirth: '1990-07-22',
        avisDonorCenter: 'Gussola'
      },
      {
        firstName: 'Luca',
        lastName: 'Verdi',
        dateOfBirth: '1988-11-08',
        avisDonorCenter: 'Viadana'
      }
    ];

    const donors = [];
    for (const data of donorData) {
      const authString = `${data.firstName}${data.lastName}${data.dateOfBirth}${data.avisDonorCenter}`;
      const donorHashId = await generateSHA256Hash(authString);
      const salt = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      donors.push({
        donor_hash_id: donorHashId,
        salt: salt,
        preferred_language: 'en',
        preferred_communication_channel: 'email',
        initial_vetting_status: true,
        total_donations_this_year: Math.floor(Math.random() * 5),
        last_donation_date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_active: true,
        avis_donor_center: data.avisDonorCenter
      });
    }

    const { data: createdDonors, error: donorsError } = await supabase
      .from('donors')
      .insert(donors)
      .select();

    if (donorsError) {
      console.error('Error creating donors:', donorsError);
      return;
    }

    console.log(`✅ Created ${createdDonors.length} sample donors`);

    // 6. Create availability slots
    console.log('📅 Creating availability slots...');
    const slots = [];
    const centerIds = createdCenters.map(c => c.center_id);
    const donationTypes = ['Blood', 'Plasma'];

    // Create slots for the next 7 days
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      for (const centerId of centerIds) {
        for (const donationType of donationTypes) {
          // Create 2 slots per day per center per type
          for (let j = 0; j < 2; j++) {
            const slotTime = new Date(date);
            slotTime.setHours(9 + j * 3, 0, 0, 0); // 9 AM and 12 PM

            slots.push({
              center_id: centerId,
              slot_datetime: slotTime.toISOString(),
              donation_type: donationType,
              capacity: 10,
              current_bookings: Math.floor(Math.random() * 5),
              is_available: true
            });
          }
        }
      }
    }

    const { data: createdSlots, error: slotsError } = await supabase
      .from('availability_slots')
      .insert(slots)
      .select();

    if (slotsError) {
      console.error('Error creating slots:', slotsError);
      return;
    }

    console.log(`✅ Created ${createdSlots.length} availability slots`);

    // 7. Create sample appointments
    console.log('📋 Creating sample appointments...');
    const appointments = [];
    const donorIds = createdDonors.map(d => d.donor_hash_id);
    const slotIds = createdSlots.slice(0, 5).map(s => s.slot_id); // Use first 5 slots

    for (let i = 0; i < 3; i++) {
      appointments.push({
        donor_hash_id: donorIds[i],
        donation_center_id: createdCenters[i % createdCenters.length].center_id,
        appointment_datetime: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
        donation_type: i % 2 === 0 ? 'Blood' : 'Plasma',
        status: 'scheduled',
        booking_channel: 'online',
        confirmation_sent: true,
        reminder_sent: false
      });
    }

    const { data: createdAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .insert(appointments)
      .select();

    if (appointmentsError) {
      console.error('Error creating appointments:', appointmentsError);
      return;
    }

    console.log(`✅ Created ${createdAppointments.length} sample appointments`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Sample Data Summary:');
    console.log(`- ${createdCenters.length} donation centers`);
    console.log(`- ${createdRoles.length} roles`);
    console.log(`- ${createdPermissions.length} permissions`);
    console.log(`- ${createdStaff.length} staff members`);
    console.log(`- ${createdDonors.length} sample donors`);
    console.log(`- ${createdSlots.length} availability slots`);
    console.log(`- ${createdAppointments.length} sample appointments`);
    
    console.log('\n🔑 Test Credentials:');
    console.log('Admin: username=admin, password=admin123');
    console.log('Staff: username=staff1, password=staff123');
    console.log('\n🩸 Sample Donor Login:');
    console.log('Mario Rossi: FirstName=Mario, LastName=Rossi, DateOfBirth=1985-03-15, Center=Casalmaggiore');
    console.log('Giulia Bianchi: FirstName=Giulia, LastName=Bianchi, DateOfBirth=1990-07-22, Center=Gussola');
    console.log('Luca Verdi: FirstName=Luca, LastName=Verdi, DateOfBirth=1988-11-08, Center=Viadana');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  }
}

// Run the seeding function
seedDatabase();