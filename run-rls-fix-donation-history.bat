@echo off
echo ========================================
echo Fixing Donation History RLS Policies
echo ========================================
echo.
echo This script will fix the RLS policies that are preventing
echo the appointment completion trigger from working properly.
echo.

REM Check if psql is available
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: psql command not found!
    echo Please ensure PostgreSQL is installed and psql is in your PATH
    echo.
    pause
    exit /b 1
)

echo Running RLS fix for donation_history table...
echo.

REM Run the SQL script
psql -h localhost -U postgres -d vitalita -f "fix-donation-history-rls.sql"

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ RLS policies fixed successfully!
    echo ========================================
    echo.
    echo The appointment completion trigger should now work properly.
    echo You can test it by changing an appointment status to 'COMPLETED'.
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ Failed to fix RLS policies
    echo ========================================
    echo.
    echo Please check the error messages above and try again.
    echo.
)

pause
