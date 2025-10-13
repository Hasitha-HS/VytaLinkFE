import { MD3LightTheme } from 'react-native-paper';

export const Colors = {
  // Primary colors - Warm Red Theme
  primary: '#a94d4d',        // Warm muted red - Main brand color
  primaryDark: '#8a3f3f',    // Darker muted red - For hover/pressed states
  primaryLight: '#c26666',   // Lighter muted red - For accents
  secondary: '#d97706',      // Amber-600 - Warm complementary color
  
  // Blood type colors - Warm red theme complementary colors
  bloodTypes: {
    'O_POSITIVE': '#a94d4d',     // Warm muted red - Primary theme color
    'O_NEGATIVE': '#8a3f3f',     // Darker muted red - Primary dark
    'A_POSITIVE': '#059669',     // Emerald-600 - Complementary green
    'A_NEGATIVE': '#047857',     // Emerald-700 - Darker green
    'B_POSITIVE': '#d97706',     // Amber-600 - Secondary theme color
    'B_NEGATIVE': '#b45309',     // Amber-700 - Darker amber
    'AB_POSITIVE': '#7c3aed',    // Violet-600 - Purple accent
    'AB_NEGATIVE': '#6d28d9'     // Violet-700 - Darker purple
  },
  
  // Urgency colors - Warm red theme complementary colors
  urgency: {
    'CRITICAL': '#a94d4d',     // Warm muted red - Primary theme for critical
    'HIGH': '#d97706',         // Amber-600 - Secondary theme for high
    'MEDIUM': '#059669',       // Emerald-600 - Green for medium
    'LOW': '#7c3aed'           // Violet-600 - Purple for low
  },
  
  // Status colors - Warm red theme complementary colors
  success: '#059669',         // Emerald-600 - Green for success
  warning: '#d97706',         // Amber-600 - Secondary theme for warning
  error: '#a94d4d',           // Warm muted red - Primary theme for error
  info: '#7c3aed',            // Violet-600 - Purple for info
  
  // Additional colors - Clean background with dark text
  background: '#f9fafb',      // Gray-50 - Clean light background
  text: {
    primary: '#111827',       // Gray-900 - Dark text for readability
    secondary: '#6b7280',     // Gray-500 - Medium gray for secondary text
    disabled: '#9ca3af'       // Gray-400 - Light gray for disabled text
  },
  
  // Neutral colors - Standard grays for text and UI
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',      // Gray-50 - Very light gray
    100: '#f3f4f6',     // Gray-100 - Light gray
    200: '#e5e7eb',     // Gray-200 - Light gray
    300: '#d1d5db',     // Gray-300 - Medium light gray
    400: '#9ca3af',     // Gray-400 - Medium gray
    500: '#6b7280',     // Gray-500 - Standard gray
    600: '#4b5563',     // Gray-600 - Dark gray
    700: '#374151',     // Gray-700 - Darker gray
    800: '#1f2937',     // Gray-800 - Very dark gray
    900: '#111827'      // Gray-900 - Darkest gray
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
    primary: Colors.primary,                    // Warm muted red - Main brand color
    primaryContainer: Colors.primary + '20',    // Warm muted red with 20% opacity
    secondary: Colors.secondary,                // Amber-600 - Warm complementary
    surface: Colors.white,                      // Pure white
    surfaceVariant: Colors.gray[50],            // Gray-50 - Clean light gray
    background: Colors.background,              // Gray-50 - Clean light background
    error: Colors.error,                        // Warm muted red - Primary theme
    onSurface: Colors.text.primary,             // Dark gray for text
    onBackground: Colors.text.primary,          // Dark gray for text
    onPrimary: Colors.white,                    // White text on red buttons
    onSecondary: Colors.white,                  // White text on amber buttons
    onPrimaryContainer: Colors.text.primary,    // Dark text on light containers
    onSecondaryContainer: Colors.text.primary,  // Dark text on light containers
  },
};


