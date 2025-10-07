import * as Font from 'expo-font';

// Font loading for Expo managed workflow
export const loadFonts = async () => {
  try {
    console.log('Loading fonts...');
    
    // Load fonts with correct paths found in node_modules
    await Font.loadAsync({
      'MaterialDesignIcons': require('@react-native-vector-icons/material-design-icons/fonts/MaterialDesignIcons.ttf'),
      'MaterialIcons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf'),
      'Ionicons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
    });
    
    console.log('All fonts loaded successfully');
    return true;
  } catch (error) {
    console.warn('Error loading fonts:', error);
    
    // Try loading fonts individually with fallbacks
    try {
      console.log('Attempting to load fonts individually...');
      
      const fontMap = {};
      
      // Try MaterialDesignIcons
      try {
        fontMap['MaterialDesignIcons'] = require('@react-native-vector-icons/material-design-icons/fonts/MaterialDesignIcons.ttf');
        console.log('MaterialDesignIcons path found');
      } catch (e) {
        console.log('MaterialDesignIcons not found in @react-native-vector-icons');
      }
      
      // Try MaterialIcons
      try {
        fontMap['MaterialIcons'] = require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf');
        console.log('MaterialIcons path found');
      } catch (e) {
        console.log('MaterialIcons not found');
      }
      
      // Try Ionicons
      try {
        fontMap['Ionicons'] = require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf');
        console.log('Ionicons path found');
      } catch (e) {
        console.log('Ionicons not found');
      }
      
      if (Object.keys(fontMap).length > 0) {
        await Font.loadAsync(fontMap);
        console.log('Fonts loaded successfully:', Object.keys(fontMap));
      } else {
        console.log('No fonts could be loaded - using system fonts');
      }
      
      return true;
    } catch (altError) {
      console.warn('Individual font loading failed:', altError);
      console.log('Continuing without explicit font loading - using system fonts');
      return true; // Continue anyway
    }
  }
};

export default loadFonts;
