import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, Ionicons, AntDesign, Feather, FontAwesome } from '@expo/vector-icons';
// import MaterialIcon from './MaterialIcon'; // Removed - not compatible with React Native

// Custom Icon component that handles different icon libraries
const Icon = ({ 
  name, 
  size = 24, 
  color = '#000', 
  type = 'MaterialIcons',
  fallbackText = '?',
  ...props 
}) => {
  const iconProps = {
    name,
    size,
    color,
    ...props
  };

  // Fallback component for when icons don't load
  const FallbackIcon = () => (
    <View style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color + '20',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Text style={{
        color: color,
        fontSize: size * 0.6,
        fontWeight: 'bold',
      }}>
        {fallbackText}
      </Text>
    </View>
  );

  try {
    switch (type) {
      case 'MaterialUI':
        // Material UI not compatible with React Native, fallback to MaterialIcons
        return <MaterialIcons {...iconProps} />;
      case 'MaterialIcons':
        return <MaterialIcons {...iconProps} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons {...iconProps} />;
      case 'Ionicons':
        return <Ionicons {...iconProps} />;
      case 'AntDesign':
        return <AntDesign {...iconProps} />;
      case 'Feather':
        return <Feather {...iconProps} />;
      case 'FontAwesome':
        return <FontAwesome {...iconProps} />;
      default:
        // Default to MaterialIcons instead of MaterialIcon
        return <MaterialIcons {...iconProps} />;
    }
  } catch (error) {
    console.warn(`Icon ${name} (${type}) failed to load:`, error);
    return <FallbackIcon />;
  }
};

export default Icon;
