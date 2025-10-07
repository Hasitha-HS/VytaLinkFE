import React, { useState, useContext } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, Snackbar } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../utils/Colors';
import { toMessageString } from '../utils/Helpers';

const RegisterScreen = ({ navigation }) => {
  const { register, isLoading } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bloodBankId: null
  });
  const [error, setError] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      return 'Please fill in all required fields';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (!formData.email.includes('@')) {
      return 'Please enter a valid email address';
    }
    if (formData.username.length < 3) {
      return 'Username must be at least 3 characters long';
    }
    return null;
  };

  const handleRegister = async () => {
    setError('');
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setSnackbarMessage(validationError);
      setSnackbarVisible(true);
      return;
    }

    const res = await register(formData);
    console.log('Registration response:', res);
    if (!res.success) {
      const msg = toMessageString(res.message) || 'Registration failed';
      console.log('Registration failed:', msg);
      setError(msg);
      setSnackbarMessage(msg);
      setSnackbarVisible(true);
    } else {
      if (res.user) {
        // Auto-login successful - user is already logged in
        console.log('Registration successful with auto-login, showing snackbar');
        setSnackbarMessage('Registration successful! Welcome to VytaLink!');
        setSnackbarVisible(true);
        // No need to navigate - user is already logged in and will see main app
      } else {
        // Registration successful but need to sign in manually
        console.log('Registration successful, need manual login, showing snackbar');
        setSnackbarMessage(res.message || 'Registration successful! Please sign in.');
        setSnackbarVisible(true);
        // Navigate back to login after successful registration
        setTimeout(() => {
          navigation.navigate('Auth', { 
            username: formData.username,
            message: res.message || 'Registration successful! Please sign in with your username and password.'
          });
        }, 3000);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>Create Account</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              You'll be registered as a regular user. You can upgrade to a donor later.
            </Text>
            
            
            <TextInput
              label="Username *"
              value={formData.username}
              onChangeText={(value) => handleInputChange('username', value)}
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Email *"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            
            <TextInput
              label="Password *"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Confirm Password *"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              secureTextEntry
              style={styles.input}
              mode="outlined"
            />
            
            {error ? <Text style={styles.error}>{error}</Text> : null}
            
            <Button 
              mode="contained" 
              onPress={handleRegister} 
              loading={isLoading} 
              disabled={!formData.username || !formData.email || !formData.password || !formData.confirmPassword}
              style={styles.registerButton}
            >
              Create Account
            </Button>
            
            <Button 
              mode="text" 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              Already have an account? Sign In
            </Button>
          </Card.Content>
        </Card>
      </View>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => {
          console.log('Register snackbar dismissed');
          setSnackbarVisible(false);
        }}
        duration={3000}
        style={{ backgroundColor: Colors.gray[800] }}
        onShow={() => console.log('Register snackbar shown:', snackbarMessage)}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    minHeight: '100%',
  },
  card: {
    paddingVertical: 8,
  },
  title: {
    marginBottom: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 24,
    textAlign: 'center',
    color: Colors.gray[600],
  },
  input: {
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginRight: 8,
  },
  error: {
    color: Colors.error,
    marginBottom: 12,
    textAlign: 'center',
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  backButton: {
    marginTop: 8,
  },
});

export default RegisterScreen;
