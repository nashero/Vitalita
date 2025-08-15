import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pxvimagfvonwxygmtgpi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4dmltYWdmdm9ud3h5Z210Z3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODg4NjcsImV4cCI6MjA2Njg2NDg2N30.U0ZAojLgRS680JpP2HXZhm1Q_vce6i8o9k5zZ3Jx6LA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCenters() {
  try {
    console.log('Checking available AVIS donor centers...');
    
    // Check donation_centers table
    console.log('\n--- Available donation centers ---');
    const { data: centers, error: centersError } = await supabase
      .from('donation_centers')
      .select('*');
    
    if (centersError) {
      console.error('Error fetching centers:', centersError);
    } else {
      console.log('Donation centers:', centers);
    }
    
    // Check if there's a constraint on avis_donor_center
    console.log('\n--- Checking existing donors for valid centers ---');
    const { data: existingCenters, error: existingError } = await supabase
      .from('donors')
      .select('avis_donor_center')
      .not('avis_donor_center', 'is', null);
    
    if (existingError) {
      console.error('Error fetching existing centers:', existingError);
    } else {
      const uniqueCenters = [...new Set(existingCenters.map(d => d.avis_donor_center))];
      console.log('Existing donor centers:', uniqueCenters);
    }
    
    // Check the constraint definition
    console.log('\n--- Testing with "Avis Calvatone" ---');
    const { data: testCenter, error: testError } = await supabase
      .from('donors')
      .select('avis_donor_center')
      .eq('avis_donor_center', 'Avis Calvatone')
      .limit(1);
    
    if (testError) {
      console.error('Error testing "Avis Calvatone":', testError);
    } else {
      console.log('"Avis Calvatone" test result:', testCenter);
    }
    
  } catch (error) {
    console.error('Check failed:', error);
  }
}

// Run the check
console.log('Starting center check...');
checkCenters().then(() => {
  console.log('Center check completed');
}).catch((error) => {
  console.error('Center check failed:', error);
}); 