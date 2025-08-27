@echo off
echo Running migration to fix past date availability...
echo.

REM Check if psql is available
where psql >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: psql command not found. Please ensure PostgreSQL is installed and in your PATH.
    echo.
    echo You can also run this migration manually by:
    echo 1. Opening your Supabase dashboard
    echo 2. Going to the SQL Editor
    echo 3. Copying and pasting the contents of fix-past-date-availability.sql
    echo 4. Running the SQL
    echo.
    pause
    exit /b 1
)

echo Running SQL migration...
echo.

REM You'll need to update these values with your actual Supabase connection details
echo Please update the batch file with your Supabase connection details:
echo - Host: Your Supabase database host
echo - Port: 5432 (default)
echo - Database: postgres
echo - Username: postgres
echo - Password: Your database password
echo.

REM Example command (uncomment and update with your details):
REM psql -h YOUR_SUPABASE_HOST -p 5432 -d postgres -U postgres -f fix-past-date-availability.sql

echo.
echo Migration file created: fix-past-date-availability.sql
echo.
echo To run this migration:
echo 1. Update the psql command above with your Supabase connection details
echo 2. Uncomment the psql command line
echo 3. Run this batch file again
echo.
echo Or run it manually in your Supabase SQL Editor
echo.
pause
