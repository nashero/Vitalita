#!/bin/bash

echo "========================================"
echo "Fixing Donation History RLS Policies"
echo "========================================"
echo ""
echo "This script will fix the RLS policies that are preventing"
echo "the appointment completion trigger from working properly."
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "ERROR: psql command not found!"
    echo "Please ensure PostgreSQL is installed and psql is in your PATH"
    echo ""
    exit 1
fi

echo "Running RLS fix for donation_history table..."
echo ""

# Run the SQL script
psql -h localhost -U postgres -d vitalita -f "fix-donation-history-rls.sql"

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "✅ RLS policies fixed successfully!"
    echo "========================================"
    echo ""
    echo "The appointment completion trigger should now work properly."
    echo "You can test it by changing an appointment status to 'COMPLETED'."
    echo ""
else
    echo ""
    echo "========================================"
    echo "❌ Failed to fix RLS policies"
    echo "========================================"
    echo ""
    echo "Please check the error messages above and try again."
    echo ""
fi

read -p "Press Enter to continue..."
