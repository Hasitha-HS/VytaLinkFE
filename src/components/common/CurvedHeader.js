import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../utils/Colors';

const CurvedHeader = ({ title, onBackPress, showBackButton = true }) => {
  return (
    <View style={styles.container}>
      {/* Curved background with edge curves */}
      <View style={styles.curvedBackground} />
      
      {/* Content */}
      <View style={styles.content}>
        {showBackButton && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onBackPress}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="chevron-back" 
              size={24} 
              color={Colors.white} 
            />
          </TouchableOpacity>
        )}
        
        <Text style={styles.title} variant="headlineSmall">
          {title}
        </Text>
        
        {/* Spacer for balance */}
        <View style={styles.spacer} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 100,
    position: 'relative',
    overflow: 'hidden',
  },
  curvedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    opacity: 0.9, // Make it transparent
    borderBottomLeftRadius: 8, // Curve bottom left edge
    borderBottomRightRadius: 8, // Curve bottom right edge
    borderTopLeftRadius: 8, // Curve top left edge
    borderTopRightRadius: 8, // Curve top right edge
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40, // Account for status bar
    paddingBottom: 10, // Add bottom padding
    zIndex: 1,
    height: '100%', // Take full height
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    height: 40, // Fixed height for back button
    width: 40, // Fixed width for back button
    justifyContent: 'center', // Center icon vertically
    alignItems: 'center', // Center icon horizontally
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    height: 48, // Fixed height: 80% of 60px available space
    textAlignVertical: 'center', // Center vertically
    lineHeight: 24, // Ensure proper line height
    justifyContent: 'center', // Center content
    alignItems: 'center', // Center content
  },
  spacer: {
    width: 40, // Same width as back button for balance
    height: 40, // Same height as back button for balance
  },
});

export default CurvedHeader;
