@echo off
echo Running Donor ID Migration...
echo.

REM Check if supabase CLI is installed
supabase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Supabase CLI is not installed or not in PATH
    echo Please install Supabase CLI first: https://supabase.com/docs/guides/cli
    pause
    exit /b 1
)

echo Supabase CLI found. Starting migration...
echo.

REM Run the migration
supabase db push

if %errorlevel% equ 0 (
    echo.
    echo Migration completed successfully!
    echo.
    echo Next steps:
    echo 1. Test the new functionality with: node test-donor-id.js
    echo 2. Verify donor registration works correctly
    echo 3. Check that donor IDs are generated and propagated
    echo.
) else (
    echo.
    echo Migration failed with error code: %errorlevel%
    echo Please check the error messages above and try again.
    echo.
)

pause 