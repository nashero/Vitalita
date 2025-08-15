#!/bin/bash

echo "========================================"
echo "Blood Donation Status System Migration"
echo "========================================"
echo

echo "🚀 Starting migration..."
echo

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first."
    echo "Visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo "✅ Supabase CLI found"
echo

# Check if we're in a supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not in a Supabase project directory."
    echo "Please run this script from your project root."
    exit 1
fi

echo "✅ Supabase project detected"
echo

# Run the migration
echo "🔄 Running migration: 20250630200600_add_status_lookup_tables.sql"
supabase db push

if [ $? -eq 0 ]; then
    echo
    echo "✅ Migration completed successfully!"
    echo
    echo "🧪 Testing the new status system..."
    node test-status-system.js
else
    echo
    echo "❌ Migration failed. Please check the error messages above."
fi

echo
echo "Press Enter to exit..."
read 