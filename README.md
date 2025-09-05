# Reel Classifier

A React Native (Expo) application that integrates with the Android Share Menu to classify Instagram reels using the Gemini API.

## Features

- Appears in the Android Share Menu when sharing links from Instagram
- Captures shared Instagram reel URLs
- Allows manual entry or editing of reel caption text
- Classifies reels into predefined categories using Gemini API
- Clean, minimal UI

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- Expo CLI installed (`npm install -g expo-cli`)
- Android Studio (for Android development)
- Physical Android device or emulator

### Installation

1. Clone this repository or extract the project files

2. Navigate to the project directory:
   ```
   cd reel-classifier
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Add your Gemini API key:
   - Open `geminiApi.js`
   - Replace `'YOUR_GEMINI_API_KEY'` with your actual Gemini API key

### Running the App

To run the app on a physical Android device or emulator:

```
npx expo run:android
```

## How to Use

1. Install the app on your Android device
2. Open Instagram and find a reel you want to classify
3. Tap the share button and select "Reel Classifier" from the share menu
4. The app will open with the shared URL
5. Optionally, enter or edit the caption text
6. Tap "Classify Reel" to get the category prediction

## Project Structure

- `App.js` - Main application component with UI and share intent handling
- `geminiApi.js` - Contains the Gemini API integration for text classification
- `app.json` - Expo configuration including Android intent filters
- `package.json` - Project dependencies

## Categories

The app classifies reels into one of the following categories:
- Motivational
- Gym
- Communication
- Ideas
- Coding
- UI
- ML-AI
- Job
- Internships
- love
- sayari
- songs

## Troubleshooting

- If the app doesn't appear in the share menu, ensure you've built the app with `npx expo run:android` and not just using Expo Go
- If classification fails, check your Gemini API key and internet connection