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

To view the app in development mode, the APK was built using Expo's **Development Client**.

```bash
npx eas build --profile development --platform android
```

No **need to execute the build command** , the APK is built and available for download.

Here’s how to proceed:

1. Download the APK from this link to view and test the app in development mode:  
   [Download APK](https://expo.dev/accounts/maroua_sedoud/projects/ydoo_mobile/builds/73dc898a-09c7-4b37-9a9b-4a3639483c1c)

2. Open terminal and navigate to the mobile project folder:
   ```bash
   cd ydoo_mobile
   ```
3. Install the dependencies:
   ```bash
   npm i
   ```
4. Start Expo:
   ```bash
   npx expo start
   ```
5. Press the “s” key on the keyboard.
6. Open the downloaded APK, then enter the displayed `exp://192.168.x.x:8081` in the input field.

![Screenshot 2025-04-08 234657](https://github.com/user-attachments/assets/5d096f70-2dcc-4d34-b854-f985ed56beb1)

> **Note:** The app looks better in bright mode.
