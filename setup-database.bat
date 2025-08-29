@echo off
echo ===================================================
echo Digital Internship & Placement Portal - Database Setup
echo ===================================================
echo.
echo This script will help you set up the MySQL database for your project.
echo.
echo Prerequisites:
echo 1. MySQL Server installed on your computer
echo 2. MySQL command line client accessible from PATH
echo.
echo If you don't have MySQL installed, please download and install it from:
echo https://dev.mysql.com/downloads/installer/
echo.
pause

echo.
echo Checking if MySQL is installed...
mysql --version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo MySQL is not installed or not in your PATH.
  echo Please install MySQL and try again.
  pause
  exit /b 1
)

echo MySQL is installed!
echo.
echo Please enter your MySQL credentials:
set /p DB_USER=MySQL Username (default: root): 
if "%DB_USER%"=="" set DB_USER=root

set /p DB_PASSWORD=MySQL Password (leave empty if none): 

echo.
echo Creating database and tables...
echo.

mysql -u %DB_USER% %DB_PASSWORD:-=% -e "CREATE DATABASE IF NOT EXISTS internship_portal;"
if %ERRORLEVEL% NEQ 0 (
  echo Failed to create database. Please check your credentials.
  pause
  exit /b 1
)

echo Database created successfully!
echo.
echo Importing schema...

mysql -u %DB_USER% %DB_PASSWORD:-=% internship_portal < backend\config\database.sql
if %ERRORLEVEL% NEQ 0 (
  echo Failed to import schema. Please check the SQL file.
  pause
  exit /b 1
)

echo.
echo Schema imported successfully!
echo.
echo Updating .env file with database credentials...

powershell -Command "(Get-Content backend\.env) -replace 'DB_USER=.*', 'DB_USER=%DB_USER%' | Set-Content backend\.env"
powershell -Command "(Get-Content backend\.env) -replace 'DB_PASSWORD=.*', 'DB_PASSWORD=%DB_PASSWORD%' | Set-Content backend\.env"
powershell -Command "(Get-Content backend\.env) -replace 'DB_HOST=.*', 'DB_HOST=localhost' | Set-Content backend\.env"
powershell -Command "(Get-Content backend\.env) -replace 'DB_NAME=.*', 'DB_NAME=internship_portal' | Set-Content backend\.env"

echo.
echo Database setup complete!
echo.
echo You can now start your application:
echo 1. cd backend && npm start
echo 2. cd frontend && npm start
echo.
pause
