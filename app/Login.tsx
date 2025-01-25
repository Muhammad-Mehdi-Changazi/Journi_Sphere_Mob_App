// app/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to decode the JWT token manually
function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  // LoginScreen.tsx
  const handleLogin = async () => {
    try {
      // Make a POST request to the backend login endpoint
      const response = await axios.post('https://manzil-sprint1-production.up.railway.app/login', {
        email,
        password,
      });

      const { token } = response.data;

      // Store the token in AsyncStorage
      await AsyncStorage.setItem('authToken', token);

      // Manually decode the token to extract role
      const decodedToken = decodeJwt(token);

      if (!decodedToken) {
        throw new Error('Failed to decode token');
      }

      const { username, role } = decodedToken;

      if (!username || !role) {
        throw new Error('Invalid token structure');
      }

      // Store username and role in AsyncStorage
      await AsyncStorage.setItem('username', username);
      await AsyncStorage.setItem('role', role);

      console.log('Login successful, token and username stored');

      // Navigate based on role
      if (role === 'Customer') {
        router.push({ pathname: '/home' });      
      } else if (role === 'Hotel Management Staff') {
        // Pass the username in the URL as a parameter
        router.push(`/Hotel Admin?username=${encodeURIComponent(username)}`);
      } else {
        throw new Error('Invalid role');
      }
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Login Failed', 'Invalid email or password');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Login</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f4f4f4',
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 15,
    fontSize: 16,
    width: '100%',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 10,
    alignItems: 'center',
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
