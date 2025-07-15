const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

// Supabase credentials (use environment variables for security)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing Supabase environment variables");
  console.error("Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are set");
  process.exit(1);
}

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

// Load seed JSON file
let seed;
try {
  seed = JSON.parse(fs.readFileSync("vitalita-viva-seed.json", "utf-8"));
  console.log("📄 Seed file loaded successfully");
} catch (error) {
  console.error("❌ Error loading seed file:", error.message);
  console.error("Please ensure 'vitalita-viva-seed.json' exists in the current directory");
  process.exit(1);
}

// Helper function to insert data with error handling
const insertData = async (tableName, data, description) => {
  if (!data || data.length === 0) {
    console.log(`⏭️  Skipping ${description} - no data provided`);
    return true;
  }

  try {
    console.log(`📝 Inserting ${data.length} ${description}...`);
    
    const { error } = await client
      .from(tableName)
      .insert(data);

    if (error) {
      console.error(`❌ Error inserting ${description}:`, error.message);
      return false;
    }

    console.log(`✅ Successfully inserted ${data.length} ${description}`);
    return true;
  } catch (error) {
    console.error(`❌ Unexpected error inserting ${description}:`, error.message);
    return false;
  }
};

// Helper function to clear existing data (optional)
const clearTable = async (tableName, description) => {
  try {
    const { error } = await client
      .from(tableName)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (error && !error.message.includes('No rows found')) {
      console.warn(`⚠️  Warning clearing ${description}:`, error.message);
    } else {
      console.log(`🧹 Cleared existing ${description}`);
    }
  } catch (error) {
    console.warn(`⚠️  Warning clearing ${description}:`, error.message);
  }
};

// Ordered insertion to avoid foreign key issues
const insertInOrder = async (clearExisting = false) => {
  console.log("🚀 Starting Vitalita seed data import...\n");

  try {
    // Optional: Clear existing data (uncomment if needed)
    if (clearExisting) {
      console.log("🧹 Clearing existing data...");
      await clearTable("appointments", "appointments");
      await clearTable("availability_slots", "availability slots");
      await clearTable("role_permissions", "role permissions");
      await clearTable("staff", "staff members");
      await clearTable("donors", "donors");
      await clearTable("donation_centers", "donation centers");
      await clearTable("permissions", "permissions");
      await clearTable("roles", "roles");
      console.log("");
    }

    // Step 1: Insert roles (no dependencies)
    const rolesSuccess = await insertData("roles", seed.roles, "roles");
    if (!rolesSuccess) throw new Error("Failed to insert roles");

    // Step 2: Insert permissions (no dependencies)
    const permissionsSuccess = await insertData("permissions", seed.permissions, "permissions");
    if (!permissionsSuccess) throw new Error("Failed to insert permissions");

    // Step 3: Insert role_permissions (depends on roles and permissions)
    const rolePermissionsSuccess = await insertData("role_permissions", seed.role_permissions, "role permissions");
    if (!rolePermissionsSuccess) throw new Error("Failed to insert role permissions");

    // Step 4: Insert donors (no dependencies)
    const donorsSuccess = await insertData("donors", seed.donors, "donors");
    if (!donorsSuccess) throw new Error("Failed to insert donors");

    // Step 5: Insert donation_centers (no dependencies)
    const centersSuccess = await insertData("donation_centers", seed.donation_centers, "donation centers");
    if (!centersSuccess) throw new Error("Failed to insert donation centers");

    // Step 6: Insert staff (depends on roles)
    const staffSuccess = await insertData("staff", seed.staff, "staff members");
    if (!staffSuccess) throw new Error("Failed to insert staff");

    // Step 7: Insert availability_slots (depends on donation_centers)
    const slotsSuccess = await insertData("availability_slots", seed.availability_slots, "availability slots");
    if (!slotsSuccess) throw new Error("Failed to insert availability slots");

    // Step 8: Insert appointments (depends on donors, donation_centers, staff, availability_slots)
    const appointmentsSuccess = await insertData("appointments", seed.appointments, "appointments");
    if (!appointmentsSuccess) throw new Error("Failed to insert appointments");

    // Step 9: Insert audit_logs (optional, no dependencies)
    if (seed.audit_logs) {
      await insertData("audit_logs", seed.audit_logs, "audit logs");
    }

    console.log("\n🎉 Seed data imported successfully!");
    console.log("📊 Summary:");
    console.log(`   • ${seed.roles?.length || 0} roles`);
    console.log(`   • ${seed.permissions?.length || 0} permissions`);
    console.log(`   • ${seed.role_permissions?.length || 0} role permissions`);
    console.log(`   • ${seed.donors?.length || 0} donors`);
    console.log(`   • ${seed.donation_centers?.length || 0} donation centers`);
    console.log(`   • ${seed.staff?.length || 0} staff members`);
    console.log(`   • ${seed.availability_slots?.length || 0} availability slots`);
    console.log(`   • ${seed.appointments?.length || 0} appointments`);
    if (seed.audit_logs) {
      console.log(`   • ${seed.audit_logs.length} audit logs`);
    }

  } catch (error) {
    console.error("\n❌ Error importing seed data:", error.message);
    console.error("\n🔍 Troubleshooting tips:");
    console.error("   • Check that all required tables exist in your database");
    console.error("   • Verify foreign key relationships in your seed data");
    console.error("   • Ensure your Supabase service role key has sufficient permissions");
    console.error("   • Check for duplicate primary keys or unique constraint violations");
    process.exit(1);
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const clearExisting = args.includes('--clear') || args.includes('-c');

if (clearExisting) {
  console.log("⚠️  WARNING: This will clear all existing data before importing!");
  console.log("Press Ctrl+C to cancel, or wait 5 seconds to continue...\n");
  
  setTimeout(() => {
    insertInOrder(true);
  }, 5000);
} else {
  insertInOrder(false);
}