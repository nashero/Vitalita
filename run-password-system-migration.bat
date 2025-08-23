@echo off
echo Running Vitalita Password System Migration...
echo.

REM Check if Supabase CLI is installed
supabase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Supabase CLI is not installed or not in PATH
    echo Please install Supabase CLI first: https://supabase.com/docs/guides/cli
    pause
    exit /b 1
)

echo Supabase CLI found. Starting migration...
echo.

REM Run the migration
echo Applying password system migration...
supabase db push

if %errorlevel% equ 0 (
    echo.
    echo Migration completed successfully!
    echo.
    echo The donors table now includes:
    echo - Password management fields
    echo - Session management fields  
    echo - Device tracking capabilities
    echo - Enhanced security functions
    echo.
    echo You can now use password-based authentication for donors.
) else (
    echo.
    echo Migration failed with error code %errorlevel%
    echo Please check the error messages above.
)

echo.
pause
