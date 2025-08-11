const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.log('Please check your .env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateDonationStatuses() {
  try {
    console.log('Starting to populate donation_statuses table...');

    // First, check if the table exists and has data
    const { data: existingData, error: checkError } = await supabase
      .from('donation_statuses')
      .select('*');

    if (checkError) {
      console.error('Error checking table:', checkError);
      return;
    }

    console.log(`Table exists. Current record count: ${existingData.length}`);

    if (existingData.length > 0) {
      console.log('Table already has data. Skipping population.');
      console.log('Existing statuses:', existingData.map(s => s.status_code).join(', '));
      return;
    }

    // Check if categories exist, if not create them
    const { data: categories, error: catError } = await supabase
      .from('donation_status_categories')
      .select('*');

    if (catError) {
      console.error('Error checking categories:', catError);
      console.log('Creating categories table first...');
      
      // Create categories table
      const { error: createCatError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS donation_status_categories (
            category_id SERIAL PRIMARY KEY,
            category_name VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT now()
          );
        `
      });

      if (createCatError) {
        console.error('Error creating categories table:', createCatError);
        return;
      }
    }

    // Insert categories if they don't exist
    const { error: insertCatError } = await supabase
      .from('donation_status_categories')
      .upsert([
        {
          category_name: 'Pre-Donation Statuses',
          description: 'Statuses that occur before the actual donation process begins',
          sort_order: 1
        },
        {
          category_name: 'In-Progress and Post-Donation Statuses',
          description: 'Statuses that occur during and after the donation process',
          sort_order: 2
        }
      ], { onConflict: 'category_name' });

    if (insertCatError) {
      console.error('Error inserting categories:', insertCatError);
      return;
    }

    console.log('Categories created/updated successfully');

    // Get category IDs
    const { data: categoryData, error: catDataError } = await supabase
      .from('donation_status_categories')
      .select('category_id, category_name')
      .order('sort_order');

    if (catDataError) {
      console.error('Error getting categories:', catDataError);
      return;
    }

    const preDonationCategory = categoryData.find(c => c.category_name === 'Pre-Donation Statuses');
    const postDonationCategory = categoryData.find(c => c.category_name === 'In-Progress and Post-Donation Statuses');

    if (!preDonationCategory || !postDonationCategory) {
      console.error('Could not find required categories');
      return;
    }

    // Insert all predefined statuses
    const statusesToInsert = [
      // Pre-Donation Statuses
      {
        status_code: 'SCHEDULED',
        status_name: 'Scheduled',
        description: 'The donor has successfully booked an appointment',
        category_id: preDonationCategory.category_id,
        sort_order: 1
      },
      {
        status_code: 'CONFIRMED',
        status_name: 'Confirmed',
        description: 'The donor has confirmed their appointment, often through a reminder or follow-up notification',
        category_id: preDonationCategory.category_id,
        sort_order: 2
      },
      {
        status_code: 'REMINDER_SENT',
        status_name: 'Reminder Sent',
        description: 'A reminder notification for the upcoming appointment has been sent to the donor',
        category_id: preDonationCategory.category_id,
        sort_order: 3
      },
      {
        status_code: 'CANCELLED',
        status_name: 'Cancelled',
        description: 'The donor has proactively cancelled their appointment before the scheduled time',
        category_id: preDonationCategory.category_id,
        sort_order: 4
      },
      {
        status_code: 'NO_SHOW',
        status_name: 'No-Show',
        description: 'The donor failed to attend their scheduled appointment without prior cancellation',
        category_id: preDonationCategory.category_id,
        sort_order: 5
      },
      {
        status_code: 'LATE_ARRIVAL',
        status_name: 'Late Arrival',
        description: 'The donor arrived after their scheduled appointment time, which may or may not be acceptable depending on your clinic\'s policy',
        category_id: preDonationCategory.category_id,
        sort_order: 6
      },
      {
        status_code: 'RESCHEDULED',
        status_name: 'Rescheduled',
        description: 'The donor has changed their appointment to a new date and/or time',
        category_id: preDonationCategory.category_id,
        sort_order: 7
      },
      {
        status_code: 'WAITLIST',
        status_name: 'Waitlist',
        description: 'The donor is on a waiting list for a specific date and time that is currently full',
        category_id: preDonationCategory.category_id,
        sort_order: 8
      },

      // In-Progress and Post-Donation Statuses
      {
        status_code: 'IN_PROGRESS',
        status_name: 'In Progress',
        description: 'The donor has arrived and has begun the donation process (e.g., check-in, pre-screening)',
        category_id: postDonationCategory.category_id,
        sort_order: 9
      },
      {
        status_code: 'COMPLETED',
        status_name: 'Completed',
        description: 'The donor has successfully finished the entire donation process',
        category_id: postDonationCategory.category_id,
        sort_order: 10
      },
      {
        status_code: 'DEFERRED',
        status_name: 'Deferred',
        description: 'The donor was unable to donate for a specific reason (e.g., low iron, recent travel, medication). This can be further specified with sub-statuses like Deferred - Temporary or Deferred - Permanent',
        category_id: postDonationCategory.category_id,
        sort_order: 11
      },
      {
        status_code: 'SELF_DEFERRED',
        status_name: 'Self-Deferred',
        description: 'The donor arrived but decided not to donate for personal reasons before the screening process began',
        category_id: postDonationCategory.category_id,
        sort_order: 12
      },
      {
        status_code: 'INCOMPLETE',
        status_name: 'Incomplete',
        description: 'The donation process was started but couldn\'t be finished (e.g., the donor felt unwell during the donation)',
        category_id: postDonationCategory.category_id,
        sort_order: 13
      },
      {
        status_code: 'ELIGIBILITY_EXPIRED',
        status_name: 'Eligibility Expired',
        description: 'The donor\'s eligibility to donate has expired and they need to complete an updated health screening questionnaire',
        category_id: postDonationCategory.category_id,
        sort_order: 14
      },
      {
        status_code: 'POST_DONATION_FOLLOWUP',
        status_name: 'Post-Donation Follow-up',
        description: 'The donor is being followed up with after their donation (e.g., to check on their well-being, to notify them of test results)',
        category_id: postDonationCategory.category_id,
        sort_order: 15
      },
      {
        status_code: 'TEST_RESULTS_READY',
        status_name: 'Test Results Ready',
        description: 'The results of the blood tests conducted on the donated blood are available',
        category_id: postDonationCategory.category_id,
        sort_order: 16
      },
      {
        status_code: 'UNIT_USED',
        status_name: 'Unit Used',
        description: 'The donated blood unit has been processed and sent for use',
        category_id: postDonationCategory.category_id,
        sort_order: 17
      },
      {
        status_code: 'UNIT_DISCARDED',
        status_name: 'Unit Discarded',
        description: 'The donated blood unit was found to be unusable for any number of reasons (e.g., contamination, failed screening tests) and was discarded',
        category_id: postDonationCategory.category_id,
        sort_order: 18
      }
    ];

    console.log(`Inserting ${statusesToInsert.length} statuses...`);

    const { error: insertError } = await supabase
      .from('donation_statuses')
      .insert(statusesToInsert);

    if (insertError) {
      console.error('Error inserting statuses:', insertError);
      return;
    }

    console.log('✅ Successfully populated donation_statuses table!');

    // Verify the data was inserted
    const { data: verifyData, error: verifyError } = await supabase
      .from('donation_statuses')
      .select('status_code, status_name, category_id')
      .order('sort_order');

    if (verifyError) {
      console.error('Error verifying data:', verifyError);
      return;
    }

    console.log(`\n📊 Verification: ${verifyData.length} statuses found in table`);
    console.log('Statuses inserted:');
    verifyData.forEach(status => {
      const categoryName = status.category_id === preDonationCategory.category_id ? 'Pre-Donation' : 'Post-Donation';
      console.log(`  - ${status.status_code}: ${status.status_name} (${categoryName})`);
    });

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the population script
populateDonationStatuses()
  .then(() => {
    console.log('\n🎉 Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 