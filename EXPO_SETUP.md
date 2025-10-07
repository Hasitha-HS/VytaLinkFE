# Expo Push Notifications Setup

## Fixing the Deprecation Warning

The warning `calling getExpoPushTokenAsync without specifying a projectId is deprecated` occurs because Expo now requires a project ID for push notifications.

## Solution

### 1. Get Your Expo Project ID

You need to get your Expo project ID. You can do this by:

1. **If you have an existing Expo account:**
   - Go to [expo.dev](https://expo.dev)
   - Create a new project or use an existing one
   - Copy the project ID from the project settings

2. **If you don't have an Expo account:**
   - Sign up at [expo.dev](https://expo.dev)
   - Create a new project
   - Copy the project ID

### 2. Update app.config.js

Replace `"your-project-id-here"` in `app.config.js` with your actual project ID:

```javascript
extra: {
  eas: {
    projectId: "your-actual-project-id-here"
  }
}
```

### 3. Alternative: Use Environment Variable

You can also set the project ID as an environment variable:

1. Create a `.env` file in your project root:
```
EXPO_PROJECT_ID=your-actual-project-id-here
```

2. Install dotenv if not already installed:
```bash
npm install dotenv
```

### 4. Restart the Development Server

After updating the configuration, restart your Expo development server:

```bash
npm start
```

## What This Fixes

- ✅ Eliminates the deprecation warning
- ✅ Enables proper push notification functionality
- ✅ Prepares your app for production deployment
- ✅ Follows Expo's current best practices

## Note

The app will still work without a project ID, but you'll see the deprecation warning and push notifications may not work properly in production.
