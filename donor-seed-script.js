import { createClient } from '@supabase/supabase-js';
import { generateSHA256Hash } from './node-crypto.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Donor information for login
const DONOR_INFO = {
  firstName: 'Alessandro',
  lastName: 'Moretti',
  dateOfBirth: '1988-06-12',
  avisDonorCenter: 'AVIS Casalmaggiore',
  email: 'alessandro.moretti@example.com',
  phone: '+39 333 123 4567'
};

async function createDonorSeed() {
  console.log('🩸 Creating registered donor seed data...');
  console.log(`📋 Donor Information:`);
  console.log(`   First Name: ${DONOR_INFO.firstName}`);
  console.log(`   Last Name: ${DONOR_INFO.lastName}`);
  console.log(`   Date of Birth: ${DONOR_INFO.dateOfBirth}`);
  console.log(`   AVIS Donor Center: ${DONOR_INFO.avisDonorCenter}`);
  console.log(`   Email: ${DONOR_INFO.email}`);
  console.log(`   Phone: ${DONOR_INFO.phone}`);

  try {
    // 1. Ensure donation center exists
    console.log('\n📍 Checking/creating donation center...');
    const { data: existingCenter, error: centerCheckError } = await supabase
      .from('donation_centers')
      .select('center_id')
      .eq('name', DONOR_INFO.avisDonorCenter)
      .single();

    let centerId;
    if (centerCheckError && centerCheckError.code !== 'PGRST116') {
      console.error('Error checking center:', centerCheckError);
      return;
    }

    if (!existingCenter) {
      // Create the donation center if it doesn't exist
      const { data: newCenter, error: centerCreateError } = await supabase
        .from('donation_centers')
        .insert({
          name: DONOR_INFO.avisDonorCenter,
          address: 'Via Roma 123',
          city: 'Casalmaggiore',
          country: 'Italy',
          contact_phone: '+39 0375 123456',
          email: 'info@aviscasalmaggiore.it',
          is_active: true
        })
        .select('center_id')
        .single();

      if (centerCreateError) {
        console.error('Error creating center:', centerCreateError);
        return;
      }
      centerId = newCenter.center_id;
      console.log(`✅ Created donation center: ${DONOR_INFO.avisDonorCenter}`);
    } else {
      centerId = existingCenter.center_id;
      console.log(`✅ Found existing donation center: ${DONOR_INFO.avisDonorCenter}`);
    }

    // 2. Create donor record
    console.log('\n👤 Creating donor record...');
    const authString = `${DONOR_INFO.firstName}${DONOR_INFO.lastName}${DONOR_INFO.dateOfBirth}${DONOR_INFO.avisDonorCenter}`;
    const donorHashId = await generateSHA256Hash(authString);
    const salt = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Check if donor already exists
    const { data: existingDonor, error: donorCheckError } = await supabase
      .from('donors')
      .select('*')
      .eq('donor_hash_id', donorHashId)
      .single();

    let donor;
    if (donorCheckError && donorCheckError.code !== 'PGRST116') {
      console.error('Error checking donor:', donorCheckError);
      return;
    }

    if (existingDonor) {
      console.log(`✅ Found existing donor record with hash ID: ${donorHashId}`);
      donor = existingDonor;
    } else {
      // Create new donor record
      const { data: newDonor, error: donorError } = await supabase
        .from('donors')
        .insert({
          donor_hash_id: donorHashId,
          salt: salt,
          email: DONOR_INFO.email,
          email_verified: true, // Set to true for testing
          verification_token: null,
          verification_token_expires: null,
          account_activated: true, // Set to true for testing
          activation_date: new Date().toISOString(),
          preferred_language: 'en',
          preferred_communication_channel: 'email',
          initial_vetting_status: true,
          total_donations_this_year: 2,
          last_donation_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
          is_active: true,
          avis_donor_center: DONOR_INFO.avisDonorCenter
        })
        .select()
        .single();

      if (donorError) {
        console.error('Error creating donor:', donorError);
        return;
      }

      donor = newDonor;
      console.log(`✅ Created new donor record with hash ID: ${donorHashId}`);
    }

    // 3. Create availability slots for the donor's center
    console.log('\n📅 Creating availability slots...');
    const slots = [];
    const donationTypes = ['Blood', 'Plasma'];

    // Create slots for the next 14 days
    for (let i = 1; i <= 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      for (const donationType of donationTypes) {
        // Create 3 slots per day (9 AM, 12 PM, 3 PM)
        for (let j = 0; j < 3; j++) {
          const slotTime = new Date(date);
          slotTime.setHours(9 + j * 3, 0, 0, 0);

          slots.push({
            center_id: centerId,
            slot_datetime: slotTime.toISOString(),
            donation_type: donationType,
            capacity: 8,
            current_bookings: Math.floor(Math.random() * 3), // Random bookings 0-2
            is_available: true
          });
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

    // 4. Create a sample appointment for the donor
    console.log('\n📋 Creating sample appointment...');
    const sampleSlot = createdSlots[0]; // Use the first available slot
    const appointmentDate = new Date(sampleSlot.slot_datetime);
    appointmentDate.setHours(appointmentDate.getHours() + 1); // 1 hour after slot start

    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        donor_hash_id: donorHashId,
        donation_center_id: centerId,
        appointment_datetime: appointmentDate.toISOString(),
        donation_type: 'Blood',
        status: 'scheduled',
        booking_channel: 'online',
        confirmation_sent: true,
        reminder_sent: false
      })
      .select()
      .single();

    if (appointmentError) {
      console.error('Error creating appointment:', appointmentError);
      return;
    }

    console.log(`✅ Created sample appointment for ${appointmentDate.toLocaleDateString()}`);

    // 5. Create audit log entry
    console.log('\n📝 Creating audit log entry...');
    const { data: auditLog, error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        user_id: donorHashId,
        user_type: 'donor',
        action: 'donor_seed_created',
        details: `Seed donor ${DONOR_INFO.firstName} ${DONOR_INFO.lastName} created for testing`,
        resource_type: 'donors',
        resource_id: donorHashId,
        status: 'success'
      })
      .select()
      .single();

    if (auditError) {
      console.error('Error creating audit log:', auditError);
    } else {
      console.log('✅ Created audit log entry');
    }

    // 6. Display login information
    console.log('\n🎉 Donor seed creation completed successfully!');
    console.log('\n🔑 Login Information for the donor:');
    console.log('=====================================');
    console.log(`First Name: ${DONOR_INFO.firstName}`);
    console.log(`Last Name: ${DONOR_INFO.lastName}`);
    console.log(`Date of Birth: ${DONOR_INFO.dateOfBirth}`);
    console.log(`AVIS Donor Center: ${DONOR_INFO.avisDonorCenter}`);
    console.log(`Email: ${DONOR_INFO.email}`);
    console.log(`Phone: ${DONOR_INFO.phone}`);
    console.log('\n📊 Donor Profile:');
    console.log(`- Total donations this year: 2`);
    console.log(`- Last donation: 30 days ago`);
    console.log(`- Account status: Active and verified`);
    console.log(`- Preferred language: English`);
    console.log(`- Communication channel: Email`);
    console.log('\n📅 Available for booking:');
    console.log(`- ${createdSlots.length} availability slots created`);
    console.log(`- Next 14 days of availability`);
    console.log(`- Blood and Plasma donation types`);
    console.log(`- 3 time slots per day (9 AM, 12 PM, 3 PM)`);
    console.log('\n📋 Sample appointment created for testing');

  } catch (error) {
    console.error('❌ Error during donor seeding:', error);
  }
}

// Run the seeding function
createDonorSeed(); 