@echo off
echo Running Availability Slots Extension Script...
echo.

REM Check if psql is available
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: psql command not found. Please install PostgreSQL client tools.
    echo You can download them from: https://www.postgresql.org/download/
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

REM Load environment variables
for /f "tokens=1,2 delims==" %%a in (.env) do (
    if "%%a"=="VITE_SUPABASE_URL" set SUPABASE_URL=%%b
    if "%%a"=="VITE_SUPABASE_ANON_KEY" set SUPABASE_ANON_KEY=%%b
)

REM Check if required variables are set
if "%SUPABASE_URL%"=="" (
    echo Error: VITE_SUPABASE_URL not found in .env file
    pause
    exit /b 1
)

if "%SUPABASE_ANON_KEY%"=="" (
    echo Error: VITE_SUPABASE_ANON_KEY not found in .env file
    pause
    exit /b 1
)

echo Supabase URL: %SUPABASE_URL%
echo.

REM Extract host and database from URL
for /f "tokens=3 delims=/" %%a in ("%SUPABASE_URL%") do set HOST=%%a
for /f "tokens=4 delims=/" %%a in ("%SUPABASE_URL%") do set DB=%%a

echo Host: %HOST%
echo Database: %DB%
echo.

echo Running SQL script to extend availability slots...
echo.

REM Run the SQL script
psql "postgresql://postgres:%SUPABASE_ANON_KEY%@%HOST%:5432/%DB%" -f extend-availability-slots.sql

if %errorlevel% equ 0 (
    echo.
    echo Success! Availability slots have been extended.
    echo You should now see availability for dates beyond September 2, 2025.
) else (
    echo.
    echo Error: Failed to run the SQL script.
    echo Please check your database connection and try again.
)

echo.
pause
