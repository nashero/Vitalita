@echo off
echo ========================================
echo   Vitalita Appointment Completion Setup
echo ========================================
echo.

echo This script will set up the automatic appointment completion trigger.
echo.

echo Before running this script, ensure:
echo 1. You have access to your Supabase database
echo 2. The donation_history table exists
echo 3. You have the necessary permissions
echo.

set /p confirm="Do you want to continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Setup cancelled.
    pause
    exit /b
)

echo.
echo Setting up appointment completion trigger...
echo.

echo RECOMMENDED: Use the complete setup script that fixes all RLS policy issues:
echo.
echo 1. Copy the content from: setup-appointment-completion-complete.sql
echo 2. Go to your Supabase dashboard
echo 3. Navigate to SQL Editor
echo 4. Paste the content and click "Run"
echo.

echo ALTERNATIVE: If you prefer manual setup:
echo 1. First run: fix-rls-policies.sql (to fix RLS issues)
echo 2. Then run: migrate-completed-appointments.sql (to create trigger)
echo.

echo After running the migration, test it with:
echo   node test-appointment-completion.js
echo.

echo ========================================
echo   Setup Instructions Complete
echo ========================================
echo.
echo NOTE: The complete setup script automatically fixes the common
echo "RLS policy violation" error that prevents the trigger from working.
echo.
pause
