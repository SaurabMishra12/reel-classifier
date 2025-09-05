# Reel Classifier APK Builder - PowerShell Version
Write-Host "===================================" -ForegroundColor Green
Write-Host "   Reel Classifier APK Builder" -ForegroundColor Green  
Write-Host "===================================" -ForegroundColor Green
Write-Host ""

# Set project directory
$projectDir = "C:\Projects Files\app\reel-classifier"

Write-Host "Navigating to project directory..." -ForegroundColor Yellow
Set-Location $projectDir

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right place
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found!" -ForegroundColor Red
    Write-Host "Make sure you're in the right directory." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

if (-not (Test-Path "app.json")) {
    Write-Host "ERROR: app.json not found!" -ForegroundColor Red
    Write-Host "This doesn't appear to be an Expo project." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Found Expo project files." -ForegroundColor Green
Write-Host ""

Write-Host "Checking EAS CLI..." -ForegroundColor Yellow
try {
    $whoami = npx eas whoami 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "EAS CLI not working"
    }
    Write-Host "Logged in as: $whoami" -ForegroundColor Green
} catch {
    Write-Host "ERROR: EAS CLI not working or not logged in." -ForegroundColor Red
    Write-Host "Please run: npx eas login" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Starting build process..." -ForegroundColor Yellow
Write-Host "This may take several minutes..." -ForegroundColor Yellow
Write-Host ""

# Try the build
try {
    & npx eas build --platform android --profile preview --non-interactive --wait
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "===================================" -ForegroundColor Green
        Write-Host "     BUILD SUCCESSFUL!" -ForegroundColor Green
        Write-Host "===================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your APK should be ready for download." -ForegroundColor Green
        Write-Host "Check the build URL provided above." -ForegroundColor Green
    } else {
        throw "Build failed"
    }
} catch {
    Write-Host ""
    Write-Host "===================================" -ForegroundColor Red
    Write-Host "      BUILD FAILED!" -ForegroundColor Red
    Write-Host "===================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error messages above." -ForegroundColor Yellow
    Write-Host "You may need to:" -ForegroundColor Yellow
    Write-Host "1. Install Java JDK and Android SDK" -ForegroundColor Yellow
    Write-Host "2. Fix any configuration issues" -ForegroundColor Yellow
    Write-Host "3. Try using Expo Go for testing instead" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternative: Install Expo Go from Play Store" -ForegroundColor Cyan
    Write-Host "and run: npx expo start" -ForegroundColor Cyan
}

Write-Host ""
Read-Host "Press Enter to exit"
