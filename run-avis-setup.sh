#!/bin/bash

echo "========================================"
echo "AVIS Centers and Slots Setup"
echo "========================================"
echo ""
echo "This script will set up the 7 AVIS donation centers"
echo "and generate availability slots for the next 6 months."
echo ""
echo "Requirements:"
echo "- Supabase CLI must be installed"
echo "- Database connection must be configured"
echo "- All migration scripts must be run first"
echo ""
echo "Press Enter to continue or Ctrl+C to cancel..."
read -r

echo ""
echo "Running AVIS setup script..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: Supabase CLI is not installed."
    echo "Please install it first: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Run the SQL script using Supabase CLI
# Replace with your actual database URL
supabase db reset --db-url="your-database-url-here"

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "The following has been created:"
echo "- 7 AVIS donation centers"
echo "- Availability slots for next 6 months"
echo "- Blood donation slots (60 min, 450ml)"
echo "- Plasma donation slots (60 min, 600-700ml)"
echo "- Operating hours: Monday-Saturday, 7 AM - 3 PM"
echo ""
echo "You can now use the calendar interface to book appointments."
echo ""
