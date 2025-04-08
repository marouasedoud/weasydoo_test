# Execution in Local Environment Instructions

### Clone the Project

Clone the project (on the desktop directory is preferable):

```bash
git clone https://github.com/marouasedoud/weasydoo_test.git
```

## Next.js App:

1. Open terminal.
2. Navigate to the project folder:
   ```bash
   cd ydoo_web
   ```
3. Install the dependencies:
   ```bash
   npm i
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Visit the following URL in your browser:  
   [http://localhost:3000](http://localhost:3000)

## React Native Expo App:

1. To view in development mode, install the app on Android using the APK built with the following command (dev client):

   ```bash
   npx eas build --profile development --platform android
   ```

2. Download the APK from this link:  
   [Download APK](https://expo.dev/accounts/maroua_sedoud/projects/ydoo_mobile/builds/73dc898a-09c7-4b37-9a9b-4a3639483c1c)

3. Open terminal and navigate to the mobile project folder:
   ```bash
   cd ydoo_mobile
   ```
4. Install the dependencies:
   ```bash
   npm i
   ```
5. Start Expo:
   ```bash
   npx expo start
   ```
6. Press the “s” key on the keyboard to open the project in the emulator.
7. Open the downloaded APK, then enter the displayed `exp://192.168.x.x:8081` in the input field.

> **Note:** The app looks better in bright mode.
