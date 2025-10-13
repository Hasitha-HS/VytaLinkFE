import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import { AlertProvider } from './src/context/AlertContext';
import { UserProvider } from './src/context/UserContext';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/utils/Colors';
import { loadFonts } from './src/utils/FontLoader';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    console.log('🚀 App component mounted!');
    const loadAppFonts = async () => {
      try {
        console.log('🎨 Loading fonts...');
        // Add timeout to font loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Font loading timeout')), 2000)
        );
        
        await Promise.race([loadFonts(), timeoutPromise]);
        console.log('✅ Fonts loaded successfully');
        setFontsLoaded(true);
      } catch (error) {
        console.error('⚠️ Font loading error:', error);
        setFontsLoaded(true); // Continue anyway
      }
    };

    loadAppFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Loading fonts...</Text>
      </View>
    );
  }

  try {
    console.log('🎯 Rendering main app...');
    return (
      <PaperProvider theme={theme}>
        <AuthProvider>
          <UserProvider>
            <AlertProvider>
              <NavigationContainer>
                <StatusBar style="light" backgroundColor="#6366f1" />
                <AppNavigator />
              </NavigationContainer>
            </AlertProvider>
          </UserProvider>
        </AuthProvider>
      </PaperProvider>
    );
  } catch (error) {
    console.error('💥 App error:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
        <Text style={{ fontSize: 18, color: 'red' }}>App Error: {error.message}</Text>
        <Text style={{ fontSize: 14, color: '#666', marginTop: 10 }}>Check console for details</Text>
      </View>
    );
  }
}


