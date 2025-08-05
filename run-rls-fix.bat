@echo off
echo Running RLS policy fix migration...
echo.

REM Check if supabase CLI is installed
supabase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Supabase CLI is not installed or not in PATH
    echo Please install Supabase CLI first: https://supabase.com/docs/guides/cli
    pause
    exit /b 1
)

REM Run the migration
echo Applying migration: 20250630200200_fix_rls_policies.sql
supabase db push

if %errorlevel% equ 0 (
    echo.
    echo Migration applied successfully!
    echo The RLS policies have been updated to work with the custom authentication system.
    echo.
    echo You can now test the Donation History feature.
) else (
    echo.
    echo Error: Migration failed
    echo Please check the error messages above.
)

pause 