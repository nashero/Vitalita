@echo off
echo Running Complete Appointment Completion Error Fix Script...
echo This will fix both status and donation type constraint violations.
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo Warning: .env file not found
    echo Please ensure you have a .env file with your Supabase credentials
    echo.
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

REM Run the complete fix script
echo Starting complete fix script...
node run-fix-script-complete.js

echo.
echo Script completed. Check the output above for any errors.
echo.
echo Next steps:
echo 1. Run the SQL script in your Supabase dashboard
echo 2. Test by updating an appointment status to "COMPLETED"
pause
