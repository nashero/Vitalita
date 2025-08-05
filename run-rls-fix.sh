#!/bin/bash

echo "Running RLS policy fix migration..."
echo

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: Supabase CLI is not installed or not in PATH"
    echo "Please install Supabase CLI first: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Run the migration
echo "Applying migration: 20250630200200_fix_rls_policies.sql"
supabase db push

if [ $? -eq 0 ]; then
    echo
    echo "Migration applied successfully!"
    echo "The RLS policies have been updated to work with the custom authentication system."
    echo
    echo "You can now test the Donation History feature."
else
    echo
    echo "Error: Migration failed"
    echo "Please check the error messages above."
    exit 1
fi 