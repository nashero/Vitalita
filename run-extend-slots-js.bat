@echo off
echo Running Availability Slots Extension Script (Node.js version)...
echo.

REM Check if Node.js is available
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js not found. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo Error: .env file not found. Please create one with your Supabase credentials.
    echo Required variables:
    echo   VITE_SUPABASE_URL=your_supabase_url
    echo   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    pause
    exit /b 1
)

echo Running Node.js script to extend availability slots...
echo.

REM Run the Node.js script
node extend-slots.js

if %errorlevel% equ 0 (
    echo.
    echo Script completed successfully.
) else (
    echo.
    echo Error: Script failed. Please check the output above.
)

echo.
pause
