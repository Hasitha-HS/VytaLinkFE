import { MD3LightTheme } from 'react-native-paper';

export const Colors = {
  // Primary colors
  primary: '#6366f1',
  primaryDark: '#4338ca',
  secondary: '#ec4899',
  
  // Blood type colors
  bloodTypes: {
    'O_POSITIVE': '#ef4444',
    'O_NEGATIVE': '#dc2626',
    'A_POSITIVE': '#3b82f6',
    'A_NEGATIVE': '#1d4ed8',
    'B_POSITIVE': '#22c55e',
    'B_NEGATIVE': '#16a34a',
    'AB_POSITIVE': '#f97316',
    'AB_NEGATIVE': '#ea580c'
  },
  
  // Urgency colors
  urgency: {
    'CRITICAL': '#dc2626',
    'HIGH': '#ea580c',
    'MEDIUM': '#eab308',
    'LOW': '#16a34a'
  },
  
  // Status colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Additional colors
  background: '#f9fafb',
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    disabled: '#9ca3af'
  },
  
  // Neutral colors
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
};

export const getBloodTypeColor = (bloodType) => {
  return Colors.bloodTypes[bloodType] || Colors.gray[500];
};

export const getUrgencyColor = (urgency) => {
  return Colors.urgency[urgency] || Colors.gray[500];
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    primaryContainer: Colors.primary + '20',
    secondary: Colors.secondary,
    surface: Colors.white,
    surfaceVariant: Colors.gray[50],
    background: Colors.gray[50],
    error: Colors.error,
    onSurface: Colors.gray[900],
    onBackground: Colors.gray[900],
  },
};


