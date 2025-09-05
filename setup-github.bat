@echo off
echo ===================================
echo    GitHub Repository Setup
echo ===================================
echo.
echo This script will help you connect your project to GitHub
echo for automated APK builds.
echo.
echo Prerequisites:
echo 1. GitHub account (sign up at https://github.com if needed)
echo 2. Create a new repository called "reel-classifier"
echo 3. Get the repository URL from GitHub
echo.
echo After creating the repository on GitHub, you'll get a URL like:
echo https://github.com/YOUR-USERNAME/reel-classifier.git
echo.
set /p username="Enter your GitHub username: "
if "%username%"=="" (
    echo Error: Username cannot be empty
    pause
    exit /b 1
)

set repo_url=https://github.com/%username%/reel-classifier.git

echo.
echo Setting up remote repository...
git remote add origin %repo_url%

if %ERRORLEVEL% neq 0 (
    echo.
    echo Note: If you get an error about remote already existing, run:
    echo git remote set-url origin %repo_url%
    echo.
    git remote set-url origin %repo_url%
)

echo.
echo Setting default branch to main...
git branch -M main

echo.
echo Pushing to GitHub...
echo This will upload your code and trigger the first APK build!
git push -u origin main

if %ERRORLEVEL% eq 0 (
    echo.
    echo ===================================
    echo       SUCCESS!
    echo ===================================
    echo.
    echo Your code has been pushed to GitHub!
    echo.
    echo Next steps:
    echo 1. Go to: https://github.com/%username%/reel-classifier
    echo 2. Click on "Actions" tab
    echo 3. Watch your APK being built automatically!
    echo 4. Download the APK from the "Artifacts" section when done
    echo.
    echo The build usually takes 5-10 minutes.
) else (
    echo.
    echo ===================================
    echo       SETUP INSTRUCTIONS
    echo ===================================
    echo.
    echo If the push failed, make sure you:
    echo 1. Created the repository on GitHub first
    echo 2. Have the correct repository name: reel-classifier
    echo 3. Have push permissions to the repository
    echo.
    echo Manual setup:
    echo 1. Go to https://github.com/new
    echo 2. Create repository: reel-classifier
    echo 3. Run this script again
)

echo.
pause
