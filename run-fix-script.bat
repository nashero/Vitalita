@echo off
echo Running Appointment Completion Error Fix Script...
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

REM Run the fix script
echo Starting fix script...
node run-fix-script-simple.js

echo.
echo Script completed. Check the output above for any errors.
pause
