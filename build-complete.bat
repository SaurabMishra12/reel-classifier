@echo off
setlocal

echo ===================================
echo    Reel Classifier APK Builder
echo ===================================
echo.

REM Set the project directory
set PROJECT_DIR=C:\Projects Files\app\reel-classifier

echo Navigating to project directory...
cd /d "%PROJECT_DIR%"

echo Current directory: %CD%
echo.

REM Check if we're in the right place
if not exist package.json (
    echo ERROR: package.json not found!
    echo Make sure you're in the right directory.
    pause
    exit /b 1
)

if not exist app.json (
    echo ERROR: app.json not found!
    echo This doesn't appear to be an Expo project.
    pause
    exit /b 1
)

echo Found Expo project files.
echo.

echo Checking EAS CLI...
call npx eas whoami
if %ERRORLEVEL% neq 0 (
    echo ERROR: EAS CLI not working or not logged in.
    echo Please run: npx eas login
    pause
    exit /b 1
)

echo.
echo Starting build process...
echo This may take several minutes...
echo.

REM Try the build with proper error handling
call npx eas build --platform android --profile preview --non-interactive --wait

if %ERRORLEVEL% equ 0 (
    echo.
    echo ===================================
    echo     BUILD SUCCESSFUL!
    echo ===================================
    echo.
    echo Your APK should be ready for download.
    echo Check the build URL provided above.
) else (
    echo.
    echo ===================================
    echo      BUILD FAILED!
    echo ===================================
    echo.
    echo Please check the error messages above.
    echo You may need to:
    echo 1. Install Java JDK and Android SDK
    echo 2. Fix any configuration issues
    echo 3. Try using Expo Go for testing instead
    echo.
    echo Alternative: Install Expo Go from Play Store
    echo and run: npx expo start
)

echo.
pause
