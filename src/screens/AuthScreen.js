import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Card, Snackbar } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../utils/Colors';
import { toMessageString } from '../utils/Helpers';

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
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>Sign In</Text>
          <TextInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button mode="contained" onPress={handleLogin} loading={isLoading} disabled={!username || !password}>
            Sign In
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('Register')} 
            style={styles.registerButton}
            disabled={isLoading}
          >
            Register / Sign Up
          </Button>
        </Card.Content>
      </Card>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    paddingVertical: 8,
  },
  title: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 12,
  },
  error: {
    color: Colors.error,
    marginBottom: 12,
  },
  registerButton: {
    marginTop: 12,
  },
});

export default AuthScreen;


