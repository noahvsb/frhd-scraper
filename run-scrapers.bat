@echo off
setlocal enableextensions
title Scraper Setup
cd /d "%~dp0"

echo ==============================
echo   Scraper Setup ^& Launcher
echo ==============================
echo.

REM --- Check if bun is installed ---
where bun >nul 2>nul
if %errorlevel% neq 0 (
    echo Bun not found. Installing bun.sh ...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "irm bun.sh/install.ps1 | iex"

    REM Make bun usable in this session without needing to reopen cmd
    set "PATH=%USERPROFILE%\.bun\bin;%PATH%"

    if not exist "%USERPROFILE%\.bun\bin\bun.exe" (
        echo.
        echo Failed to install Bun. Please install manually from https://bun.sh
        pause
        exit /b 1
    )
) else (
    echo Bun is already installed.
)

REM Double-check bun is now reachable
where bun >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo Bun was installed but isn't available in this window yet.
    echo Please close this window and double-click the script again.
    pause
    exit /b 1
)

echo.
echo Installing dependencies with "bun i" ...
call bun i
if %errorlevel% neq 0 (
    echo.
    echo "bun i" failed. Check the errors above.
    pause
    exit /b 1
)

echo.
echo Dependencies installed. Launching scrapers in separate windows...
echo.

start "Track Scraper" cmd /k "cd /d %~dp0 && bun scrape track"
start "Leaderboard Scraper" cmd /k "cd /d %~dp0 && bun scrape leaderboard"

echo Both scrapers have been launched. You can close this window.
timeout /t 3 >nul
exit /b 0