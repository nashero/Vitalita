@echo off
echo ========================================
echo    Vitalita Donor Seed Script Runner
echo ========================================
echo.

echo Checking environment variables...
if "%VITE_SUPABASE_URL%"=="" (
    echo ERROR: VITE_SUPABASE_URL environment variable is not set
    echo Please set your Supabase URL in your environment variables
    pause
    exit /b 1
)

if "%VITE_SUPABASE_ANON_KEY%"=="" (
    echo ERROR: VITE_SUPABASE_ANON_KEY environment variable is not set
    echo Please set your Supabase anon key in your environment variables
    pause
    exit /b 1
)

echo Environment variables found ✓
echo.

echo Running donor seed script...
node donor-seed-script.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo    Seed script completed successfully!
    echo ========================================
    echo.
    echo Donor login information:
    echo - First Name: Alessandro
    echo - Last Name: Moretti
    echo - Date of Birth: 1988-06-12
    echo - AVIS Donor Center: AVIS Casalmaggiore
    echo - Email: alessandro.moretti@example.com
    echo.
    echo You can now use these credentials to log in as the donor.
) else (
    echo.
    echo ========================================
    echo    Seed script failed!
    echo ========================================
    echo Please check the error messages above.
)

echo.
pause 