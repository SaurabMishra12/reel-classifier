# Use a Docker container with Android SDK pre-installed
FROM reactnativecommunity/react-native-android:latest

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY app.json ./
COPY babel.config.js ./

# Install dependencies
RUN npm install

# Install Expo CLI
RUN npm install -g @expo/cli

# Copy source code
COPY . .

# Prebuild Android project
RUN npx expo prebuild --platform android --clear

# Build APK
WORKDIR /app/android
RUN ./gradlew assembleRelease

# Copy APK to output directory
RUN mkdir -p /output && cp app/build/outputs/apk/release/app-release.apk /output/

# Set output directory as volume
VOLUME ["/output"]

CMD ["echo", "APK built successfully! Check /output/app-release.apk"]
