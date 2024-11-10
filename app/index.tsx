// app/index.tsx
import React from 'react';
import { Text, View, TouchableOpacity, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import styles from './styles/index'; // Import styles from styles.ts

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
        <Text style={styles.headerText}>MANZIL</Text>
        <Text style={styles.subtitle}>Plan your Trip the Right Way</Text>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}
