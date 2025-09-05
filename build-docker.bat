@echo off
echo ===================================
echo    Docker APK Build
echo ===================================
echo.
echo This method uses Docker to build your APK locally
echo.
echo Prerequisites:
echo 1. Install Docker Desktop from: https://docker.com/products/docker-desktop
echo 2. Make sure Docker is running
echo.
echo Build Steps:
echo 1. docker build -t reel-classifier-build .
echo 2. docker run -v "%CD%\output:/output" reel-classifier-build
echo 3. Your APK will be in the "output" folder
echo.
echo Starting Docker build...
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop first
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Docker is not running
    echo Please start Docker Desktop
    pause
    exit /b 1
)

echo Docker is ready. Building APK...
echo This may take 15-30 minutes for the first build...
echo.

REM Create output directory
if not exist "output" mkdir output

REM Build Docker image
docker build -t reel-classifier-build .

REM Run container and build APK
docker run -v "%CD%\output:/output" reel-classifier-build

echo.
echo Build complete! Check the "output" folder for your APK.
echo.
pause
