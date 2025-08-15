@echo off
echo ========================================
echo Running Final RLS Fix for Donation History
echo ========================================
echo.

echo Applying migration: 20250630200800_fix_donation_history_rls_final.sql
echo.

REM Check if supabase CLI is available
where supabase >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Supabase CLI not found. Please install it first.
    echo Visit: https://supabase.com/docs/reference/cli/install
    pause
    exit /b 1
)

REM Apply the migration
echo Applying migration...
supabase db push

if %errorlevel% equ 0 (
    echo.
    echo ✅ Migration applied successfully!
    echo.
    echo The donation_history RLS policies have been fixed.
    echo You should now be able to complete appointments without RLS errors.
    echo.
    echo Next steps:
    echo 1. Test the appointment completion functionality
    echo 2. Run: node test-appointment-completion.js
    echo 3. Monitor for any remaining issues
) else (
    echo.
    echo ❌ Migration failed with error code: %errorlevel%
    echo.
    echo Please check the error messages above and try again.
)

echo.
pause
