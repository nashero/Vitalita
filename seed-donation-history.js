import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample donation history data
const sampleDonationHistory = [
  {
    donor_hash_id: 'b701606e3f5a8339fac38dd89eef44d127d4a04e10294aa0f6a8cf4a4976ba14',
    appointment_id: '550e8400-e29b-41d4-a716-446655440000',
    donation_date: '2024-01-15T10:00:00Z',
    donation_type: 'whole_blood',
    donation_volume: 450,
    donation_center_id: '123e4567-e89b-12d3-a456-426614174000',
    staff_id: '987fcdeb-51a2-43d1-9f12-345678901234',
    status: 'COMPLETED',
    notes: 'Donor was in good health, donation completed successfully',
    completion_timestamp: '2024-01-15T10:45:00Z'
  },
  {
    donor_hash_id: 'b701606e3f5a8339fac38dd89eef44d127d4a04e10294aa0f6a8cf4a4976ba14',
    appointment_id: '550e8400-e29b-41d4-a716-446655440001',
    donation_date: '2024-02-20T14:30:00Z',
    donation_type: 'plasma',
    donation_volume: 600,
    donation_center_id: '123e4567-e89b-12d3-a456-426614174001',
    staff_id: '987fcdeb-51a2-43d1-9f12-345678901235',
    status: 'COMPLETED',
    notes: 'Plasma donation completed without complications',
    completion_timestamp: '2024-02-20T15:15:00Z'
  },
  {
    donor_hash_id: 'b701606e3f5a8339fac38dd89eef44d127d4a04e10294aa0f6a8cf4a4976ba14',
    appointment_id: '550e8400-e29b-41d4-a716-446655440002',
    donation_date: '2024-03-10T09:00:00Z',
    donation_type: 'whole_blood',
    donation_volume: 450,
    donation_center_id: '123e4567-e89b-12d3-a456-426614174002',
    staff_id: '987fcdeb-51a2-43d1-9f12-345678901236',
    status: 'COMPLETED',
    notes: 'Regular blood donation, donor eligible for next donation in 56 days',
    completion_timestamp: '2024-03-10T09:40:00Z'
  },
  {
    donor_hash_id: 'b701606e3f5a8339fac38dd89eef44d127d4a04e10294aa0f6a8cf4a4976ba14',
    appointment_id: '550e8400-e29b-41d4-a716-446655440003',
    donation_date: '2024-04-05T11:00:00Z',
    donation_type: 'platelets',
    donation_volume: 200,
    donation_center_id: '123e4567-e89b-12d3-a456-426614174003',
    staff_id: '987fcdeb-51a2-43d1-9f12-345678901237',
    status: 'COMPLETED',
    notes: 'Platelet donation for emergency patient, donor was very cooperative',
    completion_timestamp: '2024-04-05T12:30:00Z'
  },
  {
    donor_hash_id: 'b701606e3f5a8339fac38dd89eef44d127d4a04e10294aa0f6a8cf4a4976ba14',
    appointment_id: '550e8400-e29b-41d4-a716-446655440004',
    donation_date: '2024-05-12T13:00:00Z',
    donation_type: 'whole_blood',
    donation_volume: 450,
    donation_center_id: '123e4567-e89b-12d3-a456-426614174004',
    staff_id: '987fcdeb-51a2-43d1-9f12-345678901238',
    status: 'COMPLETED',
    notes: 'Donor mentioned feeling slightly lightheaded after donation, monitored for 15 minutes',
    completion_timestamp: '2024-05-12T13:45:00Z'
  },
  {
    donor_hash_id: 'b701606e3f5a8339fac38dd89eef44d127d4a04e10294aa0f6a8cf4a4976ba14',
    appointment_id: '550e8400-e29b-41d4-a716-446655440005',
    donation_date: '2024-06-18T15:30:00Z',
    donation_type: 'double_red',
    donation_volume: 400,
    donation_center_id: '123e4567-e89b-12d3-a456-426614174005',
    staff_id: '987fcdeb-51a2-43d1-9f12-345678901239',
    status: 'COMPLETED',
    notes: 'Double red cell donation completed successfully, donor eligible for next donation in 112 days',
    completion_timestamp: '2024-06-18T16:45:00Z'
  }
];

// Sample appointment history data (including some that are not completed)
const sampleAppointments = [
  {
    appointment_id: '550e8400-e29b-41d4-a716-446655440000',
    donor_hash_id: 'b701606e3f5a8339fac38dd89eef44d127d4a04e10294aa0f6a8cf4a4976ba14',
    donation_center_id: '123e4567-e89b-12d3-a456-426614174000',
    appointment_datetime: '2024-01-15T10:00:00Z',
    donation_type: 'whole_blood',
    status: 'COMPLETED',
    booking_channel: 'online',
    confirmation_sent: true,
    reminder_sent: true,
    creation_timestamp: '2024-01-10T14:30:00Z',
    last_updated_timestamp: '2024-01-15T10:45:00Z'
  },
  {
    appointment_id: '550e8400-e29b-41d4-a716-446655440001',
    donor_hash_id: 'b701606e3f5a8339fac38dd89eef44d127d4a04e10294aa0f6a8cf4a4976ba14',
    donation_center_id: '123e4567-e89b-12d3-a456-426614174001',
    appointment_datetime: '2024-02-20T14:30:00Z',
    donation_type: 'plasma',
    status: 'COMPLETED',
    booking_channel: 'online',
    confirmation_sent: true,
    reminder_sent: true,
    creation_timestamp: '2024-02-15T09:15:00Z',
    last_updated_timestamp: '2024-02-20T15:15:00Z'
  },
  {
    appointment_id: '550e8400-e29b-41d4-a716-446655440002',
    donor_hash_id: 'b701606e3f5a8339fac38dd89eef44d127d4a04e10294aa0f6a8cf4a4976ba14',
    donation_center_id: '123e4567-e89b-12d3-a456-426614174002',
    appointment_datetime: '2024-03-10T09:00:00Z',
    donation_type: 'whole_blood',
    status: 'COMPLETED',
    booking_channel: 'online',
    confirmation_sent: true,
    reminder_sent: true,
    creation_timestamp: '2024-03-05T16:45:00Z',
    last_updated_timestamp: '2024-03-10T09:40:00Z'
  },
  {
    appointment_id: '550e8400-e29b-41d4-a716-446655440003',
    donor_hash_id: 'b701606e3f5a8339fac38dd89eef44d127d4a04e10294aa0f6a8cf4a4976ba14',
    donation_center_id: '123e4567-e89b-12d3-a456-426614174003',
    appointment_datetime: '2024-04-05T11:00:00Z',
    donation_type: 'platelets',
    status: 'COMPLETED',
    booking_channel: 'phone',
    confirmation_sent: true,
    reminder_sent: true,
    creation_timestamp: '2024-04-01T10:20:00Z',
    last_updated_timestamp: '2024-04-05T12:30:00Z'
  },
  {
    appointment_id: '550e8400-e29b-41d4-a716-446655440004',
    donor_hash_id: 'b701606e3f5a8339fac38dd89eef44d127d4a04e10294aa0f6a8cf4a4976ba14',
    donation_center_id: '123e4567-e89b-12d3-a456-426614174004',
    appointment_datetime: '2024-05-12T13:00:00Z',
    donation_type: 'whole_blood',
    status: 'COMPLETED',
    booking_channel: 'online',
    confirmation_sent: true,
    reminder_sent: true,
    creation_timestamp: '2024-05-08T11:30:00Z',
    last_updated_timestamp: '2024-05-12T13:45:00Z'
  },
  {
    appointment_id: '550e8400-e29b-41d4-a716-446655440005',
    donor_hash_id: 'b701606e3f5a8339fac38dd89eef44d127d4a04e10294aa0f6a8cf4a4976ba14',
    donation_center_id: '123e4567-e89b-12d3-a456-426614174005',
    appointment_datetime: '2024-06-18T15:30:00Z',
    donation_type: 'double_red',
    status: 'COMPLETED',
    booking_channel: 'online',
    confirmation_sent: true,
    reminder_sent: true,
    creation_timestamp: '2024-06-14T13:45:00Z',
    last_updated_timestamp: '2024-06-18T16:45:00Z'
  },
  {
    appointment_id: '550e8400-e29b-41d4-a716-446655440006',
    donor_hash_id: 'b701606e3f5a8339fac38dd89eef44d127d4a04e10294aa0f6a8cf4a4976ba14',
    donation_center_id: '123e4567-e89b-12d3-a456-426614174006',
    appointment_datetime: '2024-07-25T10:00:00Z',
    donation_type: 'whole_blood',
    status: 'scheduled',
    booking_channel: 'online',
    confirmation_sent: true,
    reminder_sent: false,
    creation_timestamp: '2024-07-20T14:20:00Z',
    last_updated_timestamp: '2024-07-20T14:20:00Z'
  },
  {
    appointment_id: '550e8400-e29b-41d4-a716-446655440007',
    donor_hash_id: 'b701606e3f5a8339fac38dd89eef44d127d4a04e10294aa0f6a8cf4a4976ba14',
    donation_center_id: '123e4567-e89b-12d3-a456-426614174007',
    appointment_datetime: '2024-08-30T14:00:00Z',
    donation_type: 'plasma',
    status: 'cancelled',
    booking_channel: 'online',
    confirmation_sent: true,
    reminder_sent: false,
    creation_timestamp: '2024-08-25T09:15:00Z',
    last_updated_timestamp: '2024-08-28T16:30:00Z'
  }
];

async function seedDonationHistory() {
  console.log('🌱 Starting donation history seeding...');

  try {
    // First, let's check if the donation_history table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('donation_history')
      .select('history_id')
      .limit(1);

    if (tableError) {
      console.error('❌ Error checking donation_history table:', tableError);
      console.log('Please run the migration first: supabase/migrations/20250630200100_add_donation_history.sql');
      return;
    }

    // Check if we already have data
    if (tableExists && tableExists.length > 0) {
      console.log('⚠️  Donation history table already has data. Skipping seeding.');
      return;
    }

    // Insert sample appointments first
    console.log('📅 Inserting sample appointments...');
    const { error: appointmentError } = await supabase
      .from('appointments')
      .insert(sampleAppointments);

    if (appointmentError) {
      console.error('❌ Error inserting appointments:', appointmentError);
      return;
    }

    console.log('✅ Sample appointments inserted successfully');

    // Insert sample donation history
    console.log('🩸 Inserting sample donation history...');
    const { error: historyError } = await supabase
      .from('donation_history')
      .insert(sampleDonationHistory);

    if (historyError) {
      console.error('❌ Error inserting donation history:', historyError);
      return;
    }

    console.log('✅ Sample donation history inserted successfully');

    // Create audit log entry
    try {
      await supabase.rpc('create_audit_log', {
        p_user_type: 'system',
        p_action: 'donation_history_seeded',
        p_details: 'Sample donation history data seeded for testing View History feature',
        p_status: 'success'
      });
    } catch (auditError) {
      console.warn('⚠️  Could not create audit log entry:', auditError.message);
    }

    console.log('🎉 Donation history seeding completed successfully!');
    console.log('');
    console.log('📊 Sample data includes:');
    console.log('   • 6 completed donations');
    console.log('   • 1 scheduled appointment');
    console.log('   • 1 cancelled appointment');
    console.log('   • Various donation types (whole blood, plasma, platelets, double red)');
    console.log('   • Different donation centers and staff members');
    console.log('');
    console.log('🔗 You can now test the View History feature in the donor dashboard!');

  } catch (error) {
    console.error('❌ Unexpected error during seeding:', error);
  }
}

// Run the seeding
seedDonationHistory(); 