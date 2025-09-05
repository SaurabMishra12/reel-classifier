#!/bin/bash

# Expo Web Build Instructions
echo "==================================="
echo "    Expo Web Build Guide"
echo "==================================="
echo ""

echo "Since EAS CLI hit concurrency limits, use the web interface:"
echo ""
echo "1. Go to: https://expo.dev"
echo "2. Sign in with account: saurabm"
echo "3. Navigate to project: real-reel" 
echo "4. Click on 'Builds' in the left sidebar"
echo "5. Click 'Create a build'"
echo "6. Select Platform: Android"
echo "7. Select Build type: APK"
echo "8. Select Profile: preview"
echo "9. Click 'Build'"
echo ""
echo "The APK will be built in the cloud and you'll get a download link!"
echo ""
echo "Alternative method:"
echo "1. Wait for concurrency limit to reset (usually a few minutes)"
echo "2. Run: npx eas build --platform android --profile preview"
echo ""

# Create a simple batch file for Windows users
cat > build-online.bat << 'EOF'
@echo off
echo ===================================
echo    Build APK Online Guide
echo ===================================
echo.
echo Go to: https://expo.dev
echo Sign in as: saurabm
echo Navigate to: real-reel project
echo Click: Builds -^> Create a build
echo Select: Android APK, preview profile
echo.
echo Your APK will be ready for download!
echo.
pause
EOF

echo "Created build-online.bat for easy reference"
