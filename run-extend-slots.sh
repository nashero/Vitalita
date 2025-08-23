#!/bin/bash

echo "Running Availability Slots Extension Script..."
echo

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "Error: psql command not found. Please install PostgreSQL client tools."
    echo "You can download them from: https://www.postgresql.org/download/"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found. Please create one with your Supabase credentials."
    echo "Required variables:"
    echo "  VITE_SUPABASE_URL=your_supabase_url"
    echo "  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check if required variables are set
if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "Error: VITE_SUPABASE_URL not found in .env file"
    exit 1
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "Error: VITE_SUPABASE_ANON_KEY not found in .env file"
    exit 1
fi

echo "Supabase URL: $VITE_SUPABASE_URL"
echo

# Extract host and database from URL
HOST=$(echo $VITE_SUPABASE_URL | sed 's|https://||' | sed 's|\.supabase\.co.*||')
DB="postgres"

echo "Host: $HOST"
echo "Database: $DB"
echo

echo "Running SQL script to extend availability slots..."
echo

# Run the SQL script
psql "postgresql://postgres:$VITE_SUPABASE_ANON_KEY@$HOST.supabase.co:5432/$DB" -f extend-availability-slots.sql

if [ $? -eq 0 ]; then
    echo
    echo "Success! Availability slots have been extended."
    echo "You should now see availability for dates beyond September 2, 2025."
else
    echo
    echo "Error: Failed to run the SQL script."
    echo "Please check your database connection and try again."
fi

echo
read -p "Press Enter to continue..."
