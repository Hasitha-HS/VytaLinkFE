import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { Colors } from '../../utils/Colors';

const LoadingSpinner = ({ label = 'Loading...', size = 'large' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator animating color={Colors.primary} size={size} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 8,
    color: Colors.gray[600],
  },
});

export default LoadingSpinner;


