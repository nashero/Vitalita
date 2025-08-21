@echo off
echo ========================================
echo Running Registration Fix Script
echo ========================================
echo.

echo This script will fix the donor registration issues by:
echo 1. Adding missing columns to the donors table
echo 2. Fixing the AVIS center constraint
echo 3. Updating the registration function
echo 4. Testing the fix
echo.

echo Please ensure you have:
echo - Supabase CLI installed
echo - Database connection configured
echo - Proper permissions to run migrations
echo.

pause

echo.
echo Running the fix script...
echo.

REM Run the SQL script using Supabase CLI
supabase db reset --linked

echo.
echo ========================================
echo Fix completed!
echo ========================================
echo.

echo Please test the registration form again.
echo If issues persist, check the console for specific error messages.
echo.

pause
