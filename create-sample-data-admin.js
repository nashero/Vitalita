import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Use service role key for admin access
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSampleData() {
  console.log('🌱 Creating sample donation history data with admin privileges...\n');

  try {
    // First, let's check what donation centers we have
    const { data: centers, error: centersError } = await supabase
      .from('donation_centers')
      .select('center_id, name')
      .limit(5);

    if (centersError) {
      console.error('❌ Error accessing donation centers:', centersError);
      return;
    }

    console.log(`✅ Found ${centers?.length || 0} donation centers`);
    if (centers && centers.length > 0) {
      console.log('Available centers:', centers.map(c => c.name));
    }

    // Check if we have any existing appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('appointment_id, donor_hash_id, donation_type, donation_center_id')
      .limit(5);

    if (appointmentsError) {
      console.error('❌ Error accessing appointments:', appointmentsError);
      return;
    }

    console.log(`✅ Found ${appointments?.length || 0} existing appointments`);

    if (appointments && appointments.length > 0) {
      // Create sample donation history for existing appointments
      for (let i = 0; i < Math.min(3, appointments.length); i++) {
        const appointment = appointments[i];
        const center = centers?.find(c => c.center_id === appointment.donation_center_id);
        
        if (center) {
          const sampleHistory = {
            donor_hash_id: appointment.donor_hash_id,
            appointment_id: appointment.appointment_id,
            donation_date: new Date(Date.now() - (i * 30 * 24 * 60 * 60 * 1000)).toISOString(), // 30 days apart
            donation_type: appointment.donation_type || 'whole_blood',
            donation_volume: 450,
            donation_center_id: appointment.donation_center_id,
            staff_id: null, // No staff assigned for now
            status: 'completed',
            notes: `Sample donation completed at ${center.name}`,
            completion_timestamp: new Date().toISOString()
          };

          console.log(`📝 Creating donation history for appointment ${appointment.appointment_id}...`);
          
          const { error: insertError } = await supabase
            .from('donation_history')
            .insert(sampleHistory);

          if (insertError) {
            console.error(`❌ Error inserting donation history:`, insertError);
          } else {
            console.log(`✅ Created donation history for appointment ${appointment.appointment_id}`);
          }
        }
      }
    } else {
      // Create sample donation history with a known donor
      const knownDonorId = 'b701606e3f5a8339fac38dd89eef44d127d4a04e10294aa0f6a8cf4a4976ba14';
      const center = centers?.[0];
      
      if (center) {
        const sampleHistory = [
          {
            donor_hash_id: knownDonorId,
            appointment_id: '550e8400-e29b-41d4-a716-446655440000',
            donation_date: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)).toISOString(), // 30 days ago
            donation_type: 'whole_blood',
            donation_volume: 450,
            donation_center_id: center.center_id,
            staff_id: null,
            status: 'completed',
            notes: `Sample whole blood donation completed at ${center.name}`,
            completion_timestamp: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)).toISOString()
          },
          {
            donor_hash_id: knownDonorId,
            appointment_id: '550e8400-e29b-41d4-a716-446655440001',
            donation_date: new Date(Date.now() - (60 * 24 * 60 * 60 * 1000)).toISOString(), // 60 days ago
            donation_type: 'plasma',
            donation_volume: 600,
            donation_center_id: center.center_id,
            staff_id: null,
            status: 'completed',
            notes: `Sample plasma donation completed at ${center.name}`,
            completion_timestamp: new Date(Date.now() - (60 * 24 * 60 * 60 * 1000)).toISOString()
          },
          {
            donor_hash_id: knownDonorId,
            appointment_id: '550e8400-e29b-41d4-a716-446655440002',
            donation_date: new Date(Date.now() - (90 * 24 * 60 * 60 * 1000)).toISOString(), // 90 days ago
            donation_type: 'platelets',
            donation_volume: 200,
            donation_center_id: center.center_id,
            staff_id: null,
            status: 'completed',
            notes: `Sample platelet donation completed at ${center.name}`,
            completion_timestamp: new Date(Date.now() - (90 * 24 * 60 * 60 * 1000)).toISOString()
          }
        ];

        console.log(`📝 Creating sample donation history for donor ${knownDonorId.substring(0, 8)}...`);
        
        for (const history of sampleHistory) {
          const { error: insertError } = await supabase
            .from('donation_history')
            .insert(history);

          if (insertError) {
            console.error(`❌ Error inserting donation history:`, insertError);
          } else {
            console.log(`✅ Created donation history for ${history.donation_type} donation`);
          }
        }
      }
    }

    // Wait a moment for all inserts to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify the data was created
    const { data: historyData, error: historyError } = await supabase
      .from('donation_history')
      .select('*')
      .limit(10);

    if (historyError) {
      console.error('❌ Error checking donation history:', historyError);
    } else {
      console.log(`\n📊 Donation history now has ${historyData?.length || 0} records`);
      if (historyData && historyData.length > 0) {
        console.log('Sample records:');
        historyData.slice(0, 3).forEach((record, index) => {
          console.log(`${index + 1}. ${record.donation_type} donation on ${new Date(record.donation_date).toLocaleDateString()}`);
        });
      }
    }

    // Also create some sample appointments if none exist
    if (appointments && appointments.length === 0) {
      console.log('\n📅 Creating sample appointments...');
      const knownDonorId = 'b701606e3f5a8339fac38dd89eef44d127d4a04e10294aa0f6a8cf4a4976ba14';
      const center = centers?.[0];
      
      if (center) {
        const sampleAppointments = [
          {
            donor_hash_id: knownDonorId,
            donation_center_id: center.center_id,
            appointment_datetime: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString(), // 7 days from now
            donation_type: 'whole_blood',
            status: 'scheduled',
            booking_channel: 'web',
            confirmation_sent: true,
            reminder_sent: false
          },
          {
            donor_hash_id: knownDonorId,
            donation_center_id: center.center_id,
            appointment_datetime: new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)).toISOString(), // 14 days from now
            donation_type: 'plasma',
            status: 'scheduled',
            booking_channel: 'web',
            confirmation_sent: true,
            reminder_sent: false
          }
        ];

        for (const appointment of sampleAppointments) {
          const { error: insertError } = await supabase
            .from('appointments')
            .insert(appointment);

          if (insertError) {
            console.error(`❌ Error inserting appointment:`, insertError);
          } else {
            console.log(`✅ Created appointment for ${appointment.donation_type} donation`);
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }

  console.log('\n🏁 Sample data creation completed');
}

createSampleData(); 