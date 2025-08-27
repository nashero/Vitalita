#!/bin/bash

echo "Running migration to fix past date availability..."
echo

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "Error: psql command not found. Please ensure PostgreSQL is installed and in your PATH."
    echo
    echo "You can also run this migration manually by:"
    echo "1. Opening your Supabase dashboard"
    echo "2. Going to the SQL Editor"
    echo "3. Copying and pasting the contents of fix-past-date-availability.sql"
    echo "4. Running the SQL"
    echo
    exit 1
fi

echo "Running SQL migration..."
echo

# You'll need to update these values with your actual Supabase connection details
echo "Please update the script with your Supabase connection details:"
echo "- Host: Your Supabase database host"
echo "- Port: 5432 (default)"
echo "- Database: postgres"
echo "- Username: postgres"
echo "- Password: Your database password"
echo

# Example command (uncomment and update with your details):
# psql -h YOUR_SUPABASE_HOST -p 5432 -d postgres -U postgres -f fix-past-date-availability.sql

echo
echo "Migration file created: fix-past-date-availability.sql"
echo
echo "To run this migration:"
echo "1. Update the psql command above with your Supabase connection details"
echo "2. Uncomment the psql command line"
echo "3. Run this script again"
echo
echo "Or run it manually in your Supabase SQL Editor"
echo
