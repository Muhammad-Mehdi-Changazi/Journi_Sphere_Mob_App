import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Import NativeStackNavigationProp
import { RootStackParamList } from './types'; // Import your type definition

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'index'>; // Specify the navigation type for the 'index' screen

export default function Index() {
  const navigation = useNavigation<NavigationProp>(); // Apply the navigation type

  const handleLogin = () => {
    navigation.navigate('LoginScreen');
  };

  const handleSignup = () => {
    navigation.navigate('SignupScreen');
  };

  return (
    <View style={styles.container}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
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
    color: '#777',
  },
});
