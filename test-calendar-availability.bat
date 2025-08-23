@echo off
echo Testing Calendar Availability...
echo.

REM Check if .env file exists
if not exist .env (
    echo Warning: .env file not found. Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set.
    echo.
)

REM Run the test
node test-calendar-availability.js

echo.
pause
