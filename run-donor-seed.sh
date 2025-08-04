#!/bin/bash

echo "========================================"
echo "    Vitalita Donor Seed Script Runner"
echo "========================================"
echo

echo "Checking environment variables..."

if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "ERROR: VITE_SUPABASE_URL environment variable is not set"
    echo "Please set your Supabase URL in your environment variables"
    echo "export VITE_SUPABASE_URL=your_supabase_url"
    exit 1
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "ERROR: VITE_SUPABASE_ANON_KEY environment variable is not set"
    echo "Please set your Supabase anon key in your environment variables"
    echo "export VITE_SUPABASE_ANON_KEY=your_supabase_anon_key"
    exit 1
fi

echo "Environment variables found ✓"
echo

echo "Checking if Node.js is installed..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js found ✓"
echo

echo "Running donor seed script..."
node donor-seed-script.js

if [ $? -eq 0 ]; then
    echo
    echo "========================================"
    echo "    Seed script completed successfully!"
    echo "========================================"
    echo
    echo "Donor login information:"
    echo "- First Name: Alessandro"
    echo "- Last Name: Moretti"
    echo "- Date of Birth: 1988-06-12"
    echo "- AVIS Donor Center: AVIS Casalmaggiore"
    echo "- Email: alessandro.moretti@example.com"
    echo
    echo "You can now use these credentials to log in as the donor."
else
    echo
    echo "========================================"
    echo "    Seed script failed!"
    echo "========================================"
    echo "Please check the error messages above."
    exit 1
fi

echo 