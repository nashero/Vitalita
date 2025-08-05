import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDonors() {
  console.log('🔍 Checking existing donors...');
  
  try {
    const { data: donors, error } = await supabase
      .from('donors')
      .select('donor_hash_id, avis_donor_center, is_active, total_donations_this_year')
      .limit(10);
    
    if (error) {
      console.error('❌ Error fetching donors:', error);
      return;
    }
    
    if (donors && donors.length > 0) {
      console.log('✅ Found donors:');
      donors.forEach((donor, index) => {
        console.log(`${index + 1}. Hash ID: ${donor.donor_hash_id.substring(0, 20)}...`);
        console.log(`   Center: ${donor.avis_donor_center}`);
        console.log(`   Active: ${donor.is_active}`);
        console.log(`   Donations this year: ${donor.total_donations_this_year}`);
        console.log('');
      });
      
      // Use the first donor's hash ID for seeding
      const firstDonor = donors[0];
      console.log('📝 Using first donor for seeding:', firstDonor.donor_hash_id);
      
      // Update the seeding script to use this donor's hash ID
      console.log('\n🔧 To fix the seeding, update the donor_hash_id in seed-donation-history.js to:');
      console.log(`   '${firstDonor.donor_hash_id}'`);
      
    } else {
      console.log('❌ No donors found in the database');
      console.log('📝 You need to create a donor first or run the donor seeding script');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkDonors(); 