@echo off
cd /d "C:\Projects Files\app\reel-classifier"
echo Current directory: %CD%
echo.
echo Checking if we're in an Expo project...
if exist package.json (
    echo Found package.json
    if exist app.json (
        echo Found app.json - this is an Expo project
        echo.
        echo Trying alternative build method with Expo CLI...
        echo Installing latest Expo CLI...
        call npm install -g @expo/cli
        echo.
        echo Building with Expo CLI...
        call npx @expo/cli build:android --type app-bundle
    ) else (
        echo app.json not found
    )
) else (
    echo package.json not found
)
pause
