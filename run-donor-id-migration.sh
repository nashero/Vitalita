#!/bin/bash

echo "Running Donor ID Migration..."
echo

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: Supabase CLI is not installed or not in PATH"
    echo "Please install Supabase CLI first: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo "Supabase CLI found. Starting migration..."
echo

# Run the migration
supabase db push

if [ $? -eq 0 ]; then
    echo
    echo "Migration completed successfully!"
    echo
    echo "Next steps:"
    echo "1. Test the new functionality with: node test-donor-id.js"
    echo "2. Verify donor registration works correctly"
    echo "3. Check that donor IDs are generated and propagated"
    echo
else
    echo
    echo "Migration failed with error code: $?"
    echo "Please check the error messages above and try again."
    echo
fi 