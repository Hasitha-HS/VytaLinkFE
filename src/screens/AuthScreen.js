import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { Text, TextInput, Button, Card, Snackbar } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../utils/Colors';
import { toMessageString } from '../utils/Helpers';

const { width, height } = Dimensions.get('window');

const AuthScreen = ({ navigation, route }) => {
  const { login, isLoading } = useContext(AuthContext);
  const [username, setUsername] = useState(route?.params?.phoneNumber || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState(route?.params?.message || '');

  useEffect(() => {
    // Show success message if coming from registration
    if (route?.params?.message) {
      setSnackbarVisible(true);
    }
  }, [route?.params?.message]);

  const handleLogin = async () => {
    setError('');
    const res = await login(username, password);
    console.log('Login response:', res);
    if (!res.success) {
      const msg = toMessageString(res.message) || 'Login failed';
      console.log('Login failed:', msg);
      setError(msg);
      setSnackbarMessage(msg);
      setSnackbarVisible(true);
    } else {
      // Login successful
      console.log('Login successful, showing snackbar');
      setSnackbarMessage('Login successful! Welcome back!');
      setSnackbarVisible(true);
    }
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://i.imgur.com/nM3hPcA.png' }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="headlineSmall" style={styles.title}>Welcome to VytaLink</Text>
              <Text variant="bodyMedium" style={styles.subtitle}>Sign in to continue</Text>
              <TextInput
                label="Username"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
                mode="outlined"
                theme={{
                  colors: {
                    primary: Colors.primary,
                    surface: Colors.white,
                    onSurface: Colors.text.primary,
                  }
                }}
              />
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                mode="outlined"
                theme={{
                  colors: {
                    primary: Colors.primary,
                    surface: Colors.white,
                    onSurface: Colors.text.primary,
                  }
                }}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button 
                mode="contained" 
                onPress={handleLogin} 
                loading={isLoading} 
                disabled={!username || !password}
                style={styles.signInButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.signInButtonLabel}
              >
                Sign In
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => navigation.navigate('Register')} 
                style={styles.registerButton}
                disabled={isLoading}
                contentStyle={styles.buttonContent}
                labelStyle={styles.registerButtonLabel}
              >
                Register / Sign Up
              </Button>
            </Card.Content>
          </Card>
        </View>
      </View>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => {
          console.log('Snackbar dismissed');
          setSnackbarVisible(false);
        }}
        duration={3000}
        style={{ backgroundColor: Colors.gray[800] }}
        onShow={() => console.log('Snackbar shown:', snackbarMessage)}
      >
        {snackbarMessage}
      </Snackbar>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(169, 77, 77, 0.2)', // Warm muted red overlay with transparency
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  title: {
    marginBottom: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.text.primary,
  },
  subtitle: {
    marginBottom: 24,
    textAlign: 'center',
    color: Colors.text.secondary,
    opacity: 0.8,
  },
  input: {
    marginBottom: 16,
    backgroundColor: Colors.white,
  },
  error: {
    color: Colors.error,
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
  },
  signInButton: {
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  signInButtonLabel: {
    color: Colors.white,
    fontWeight: '600',
  },
  registerButton: {
    borderRadius: 8,
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  registerButtonLabel: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default AuthScreen;


