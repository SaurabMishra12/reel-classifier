# Setup GitHub Repository for Automated APK Builds

## Step 1: Create GitHub Repository

1. Go to https://github.com
2. Click "New repository" (green button)
3. Repository name: `reel-classifier`
4. Description: `Instagram Reel Classifier App - Automatically categorizes Instagram reels using Gemini AI`
5. Keep it **Public** (for free GitHub Actions)
6. ✅ Do NOT initialize with README (we already have code)
7. Click "Create repository"

## Step 2: Connect Local Repository to GitHub

After creating the repository on GitHub, run these commands:

```bash
git remote add origin https://github.com/YOUR-USERNAME/reel-classifier.git
git branch -M main
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

## Step 3: Enable GitHub Actions

1. After pushing, go to your repository on GitHub
2. Click on "Actions" tab
3. GitHub will automatically detect the workflow file
4. The build should start automatically!

## Step 4: Download Your APK

1. Wait for the build to complete (usually 5-10 minutes)
2. Go to "Actions" tab in your repository
3. Click on the latest build
4. Scroll down to "Artifacts" section
5. Download `app-release.apk`
6. Install on your Android device!

## Alternative: Use GitHub CLI

If you have GitHub CLI installed:
```bash
gh repo create reel-classifier --public --source=. --remote=origin --push
```

## What Happens Next?

- Every time you push code to GitHub, it will automatically build a new APK
- The APK will be available in the "Releases" section
- No need for local Android SDK or Java installation
- Free builds using GitHub Actions!

## Need Help?

If you don't have a GitHub account:
1. Go to https://github.com
2. Click "Sign up"
3. Follow the registration process
4. Come back to these instructions
