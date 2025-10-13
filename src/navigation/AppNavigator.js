import React, { useContext } from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { Text, ActivityIndicator } from 'react-native-paper';
import Icon from '../components/common/Icon';
import { getIcon } from '../utils/Icons';
import { getTextIcon } from '../utils/TextIcons';
import { Ionicons } from '@expo/vector-icons';
// import MaterialIcon from '../components/common/MaterialIcon'; // Removed - not compatible with React Native

import { AuthContext } from '../context/AuthContext';
import HomeScreen from '../screens/HomeScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
// import SimpleIconTest from '../components/common/SimpleIconTest';
import AuthScreen from '../screens/AuthScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DonorRegistrationScreen from '../screens/DonorRegistrationScreen';
import DonationHistoryScreen from '../screens/DonationHistoryScreen';
import EmergencyAlertCreationScreen from '../screens/EmergencyAlertCreationScreen';
import EmergencyAlertDetailsScreen from '../screens/EmergencyAlertDetailsScreen';
import DonorManagementScreen from '../screens/DonorManagementScreen';
import DonorDetailsScreen from '../screens/DonorDetailsScreen';
import DonorEditScreen from '../screens/DonorEditScreen';
import ThankYouScreen from '../screens/ThankYouScreen';
import CampManagementScreen from '../screens/CampManagementScreen';
import CampCreationScreen from '../screens/CampCreationScreen';
import CampReviewScreen from '../screens/CampReviewScreen';
import CampDetailsScreen from '../screens/CampDetailsScreen';
import AdminCampReviewScreen from '../screens/AdminCampReviewScreen';
import DonationEntryScreen from '../screens/DonationEntryScreen';
import NewsManagementScreen from '../screens/NewsManagementScreen';
import NewsCreationScreen from '../screens/NewsCreationScreen';
import NewsDetailScreen from '../screens/NewsDetailScreen';
import { Colors } from '../utils/Colors';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Helper function for consistent header options
const getHeaderOptions = (title) => ({
  title,
  headerStyle: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 8, // Curve bottom left edge
    borderBottomRightRadius: 8, // Curve bottom right edge
  },
  headerTintColor: Colors.white,
  headerTitleStyle: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerTitleAlign: 'center',
  headerBackTitleVisible: false,
  headerBackImage: () => (
    <Ionicons name="chevron-back" size={24} color={Colors.white} />
  ),
});

// Bottom Tab Navigator
const TabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Notifications') {
            iconName = 'notifications';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          console.log(`Tab icon for ${route.name}:`, { iconName, focused, color, size });

          // Use Ionicons directly (React Native compatible)
          try {
            const ionicName = focused ? iconName : `${iconName}-outline`;
            return <Ionicons name={ionicName} size={size} color={color} />;
          } catch (ionicError) {
            console.warn(`Ionicons failed for ${route.name}, using text fallback:`, ionicError);
            
            // Final fallback to text icon
            const textIcon = route.name === 'Home' ? '🏠' : 
                           route.name === 'Notifications' ? '🔔' : '👤';
            return (
              <View style={{
                width: size,
                height: size,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <RNText style={{
                  fontSize: size * 0.8,
                  color: color,
                }}>
                  {textIcon}
                </RNText>
              </View>
            );
          }
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray[500],
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.gray[200],
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: Colors.primary,
          borderBottomLeftRadius: 8, // Curve bottom left edge
          borderBottomRightRadius: 8, // Curve bottom right edge
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
          textAlign: 'center',
        },
        headerTitleAlign: 'center',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'VyTa Link',
          headerLeft: () => null,
        }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { user, isLoading } = useContext(AuthContext);

  console.log('AppNavigator rendering, isLoading:', isLoading, 'user:', user);

  if (isLoading) {
    console.log('Showing loading screen');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text variant="titleMedium" style={styles.loadingText}>
          Loading VytaLink...
        </Text>
      </View>
    );
  }

  console.log('Showing main navigation, user exists:', !!user);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
          textAlign: 'center',
        },
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
        headerBackImage: () => (
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        ),
      }}
    >
      {user ? (
        // User is signed in
        <>
          <Stack.Screen 
            name="MainTabs" 
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="DonorRegistration" 
            component={DonorRegistrationScreen}
            options={({ route }) => getHeaderOptions(
              route.params?.isUpdate ? 'Update Donor Details' : 'Register as Donor'
            )}
          />
          <Stack.Screen 
            name="DonationHistory" 
            component={DonationHistoryScreen}
            options={getHeaderOptions('Donation History')}
          />
          <Stack.Screen 
            name="EmergencyAlertCreation" 
            component={EmergencyAlertCreationScreen}
            options={getHeaderOptions('Create Emergency Alert')}
          />
          <Stack.Screen 
            name="EmergencyAlertDetails" 
            component={EmergencyAlertDetailsScreen}
            options={getHeaderOptions('Alert Details')}
          />
          <Stack.Screen 
            name="DonorManagement" 
            component={DonorManagementScreen}
            options={getHeaderOptions('Donors Management')}
          />
          <Stack.Screen 
            name="DonorDetails" 
            component={DonorDetailsScreen}
            options={getHeaderOptions('Donor Details')}
          />
          <Stack.Screen 
            name="DonorEdit" 
            component={DonorEditScreen}
            options={getHeaderOptions('Edit Donor')}
          />
          <Stack.Screen 
            name="ThankYou" 
            component={ThankYouScreen}
            options={{
              title: 'Registration Successful',
              headerStyle: {
                backgroundColor: Colors.success,
                borderBottomLeftRadius: 8, // Curve bottom left edge
                borderBottomRightRadius: 8, // Curve bottom right edge
              },
              headerTintColor: Colors.white,
              headerTitleStyle: {
                fontWeight: 'bold',
                textAlign: 'center',
              },
              headerTitleAlign: 'center',
              headerBackTitleVisible: false,
              headerBackImage: () => (
                <Ionicons name="chevron-back" size={24} color={Colors.white} />
              ),
            }}
          />
          <Stack.Screen 
            name="CampManagement" 
            component={CampManagementScreen}
            options={getHeaderOptions('Donation Camps')}
          />
          <Stack.Screen 
            name="CampCreation" 
            component={CampCreationScreen}
            options={getHeaderOptions('Create Camp')}
          />
          <Stack.Screen 
            name="CampReview" 
            component={CampReviewScreen}
            options={getHeaderOptions('Review Camp')}
          />
          <Stack.Screen 
            name="CampDetails" 
            component={CampDetailsScreen}
            options={getHeaderOptions('Camp Details')}
          />
          <Stack.Screen 
            name="AdminCampReview" 
            component={AdminCampReviewScreen}
            options={getHeaderOptions('Camp Request Review')}
          />
          <Stack.Screen 
            name="DonationEntry" 
            component={DonationEntryScreen}
            options={getHeaderOptions('Add Donation')}
          />
          <Stack.Screen 
            name="NewsManagement" 
            component={NewsManagementScreen}
            options={getHeaderOptions('News Management')}
          />
          <Stack.Screen 
            name="NewsCreation" 
            component={NewsCreationScreen}
            options={getHeaderOptions('Create News Article')}
          />
        <Stack.Screen 
          name="NewsDetail" 
          component={NewsDetailScreen}
          options={getHeaderOptions('News Article')}
        />
          {/* <Stack.Screen 
            name="IconTest" 
            component={SimpleIconTest}
            options={{ 
              title: 'Icon Test',
              headerStyle: {
                backgroundColor: Colors.primary,
              },
              headerTintColor: Colors.white,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          /> */}
          {/* Add other authenticated screens here */}
        </>
      ) : (
        // User is not signed in
        <>
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen}
            options={{ 
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={getHeaderOptions('Create Account')}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
  },
  loadingText: {
    marginTop: 16,
    color: Colors.gray[600],
  },
});

export default AppNavigator;


