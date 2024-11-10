// app/index.tsx
import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Platform, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/LoginScreen'); // Navigate to LoginScreen
  };

  const handleSignup = () => {
    router.push('/SignupScreen'); // Navigate to SignupScreen
  };

  return (
    <ImageBackground
      source={require('../assets/images/BackGroundImageHomeScreen.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.headerText}>Welcome to Manzil!</Text>
        <Text style={styles.subtitle}>
          The best place to plan your trips and discover new destinations.
        </Text>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.footerText}>
          {Platform.select({
            ios: 'Press cmd + d to open developer tools',
            android: 'Press cmd + m to open developer tools',
          })}
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#ccc',
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  footerText: {
    marginTop: 30,
    fontSize: 14,
    color: '#ccc',
  },
});
