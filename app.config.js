export default {
  expo: {
    name: "VytaLink",
    slug: "vytalink",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.vytalink.app"
    },
    android: {
      package: "com.vytalink.app",
      adaptiveIcon: {
        backgroundColor: "#6366f1"
      }
    },
    web: {
      bundler: "metro"
    },
    plugins: [
      "expo-notifications"
    ],
    scheme: "vytalink",
    sdkVersion: "49.0.0",
    extra: {
      eas: {
        projectId: "2d4a5939-780d-47c8-a13a-66f9f5fec667"
      }
    }
  }
};
