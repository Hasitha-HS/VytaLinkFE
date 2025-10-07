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
    const loadAppFonts = async () => {
      try {
        await loadFonts();
        setFontsLoaded(true);
      } catch (error) {
        console.error('Font loading error:', error);
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
    console.error('App error:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
        <Text style={{ fontSize: 18, color: 'red' }}>App Error: {error.message}</Text>
      </View>
    );
  }
}


