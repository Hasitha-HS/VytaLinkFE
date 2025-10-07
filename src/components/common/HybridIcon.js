import React from 'react';
import { View, Text } from 'react-native';
import Icon from './Icon';
import { getTextIcon } from '../utils/TextIcons';

// Hybrid icon component that tries vector icons first, falls back to text icons
const HybridIcon = ({ 
  name, 
  size = 24, 
  color = '#000', 
  type = 'MaterialIcons',
  useTextFallback = true,
  ...props 
}) => {
  // Try vector icon first
  try {
    return (
      <Icon 
        name={name} 
        size={size} 
        color={color} 
        type={type}
        {...props}
      />
    );
  } catch (error) {
    console.warn(`Vector icon ${name} failed, trying text fallback:`, error);
    
    // Fall back to text icon if enabled
    if (useTextFallback) {
      const textIcon = getTextIcon(name);
      return (
        <View style={{
          width: size,
          height: size,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: size * 0.8,
            color: color,
          }}>
            {textIcon}
          </Text>
        </View>
      );
    }
    
    // Final fallback - simple text
    return (
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
          ?
        </Text>
      </View>
    );
  }
};

export default HybridIcon;
