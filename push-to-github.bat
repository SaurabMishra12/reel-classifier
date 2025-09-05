@echo off
echo ===================================
echo    Quick GitHub Push Script
echo ===================================
echo.
echo Run this AFTER creating the repository on GitHub!
echo.
echo Setting up remote for SaurabMishra12/reel-classifier...

git remote add origin https://github.com/SaurabMishra12/reel-classifier.git
git branch -M main
git push -u origin main

if %ERRORLEVEL% eq 0 (
    echo.
    echo ===================================
    echo       SUCCESS! 🎉
    echo ===================================
    echo.
    echo Your code is now on GitHub!
    echo.
    echo Next steps:
    echo 1. Go to: https://github.com/SaurabMishra12/reel-classifier
    echo 2. Click "Actions" tab
    echo 3. Watch the automatic APK build!
    echo 4. Download APK from "Releases" when complete
    echo.
    echo Build time: approximately 5-10 minutes
    echo.
    start https://github.com/SaurabMishra12/reel-classifier
) else (
    echo.
    echo ===================================
    echo       CREATE REPOSITORY FIRST
    echo ===================================
    echo.
    echo Please create the repository on GitHub:
    echo 1. Go to: https://github.com/new
    echo 2. Name: reel-classifier
    echo 3. Keep it Public
    echo 4. Don't add README/gitignore/license
    echo 5. Click "Create repository"
    echo 6. Run this script again
    echo.
    start https://github.com/new
)

echo.
pause
