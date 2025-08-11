@echo off
echo ========================================
echo Blood Donation Status System Migration
echo ========================================
echo.

echo 🚀 Starting migration...
echo.

REM Check if supabase CLI is installed
supabase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Supabase CLI not found. Please install it first.
    echo Visit: https://supabase.com/docs/guides/cli
    pause
    exit /b 1
)

echo ✅ Supabase CLI found
echo.

REM Check if we're in a supabase project
if not exist "supabase\config.toml" (
    echo ❌ Not in a Supabase project directory.
    echo Please run this script from your project root.
    pause
    exit /b 1
)

echo ✅ Supabase project detected
echo.

REM Run the migration
echo 🔄 Running migration: 20250630200600_add_status_lookup_tables.sql
supabase db push

if %errorlevel% equ 0 (
    echo.
    echo ✅ Migration completed successfully!
    echo.
    echo 🧪 Testing the new status system...
    node test-status-system.js
) else (
    echo.
    echo ❌ Migration failed. Please check the error messages above.
)

echo.
echo Press any key to exit...
pause >nul 