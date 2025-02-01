import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { AuthProvider } from './contexts/authcontext';  // Adjust the import path if necessary
import Header from './components/Header';  // Import the Header component
import { MenuProvider } from 'react-native-popup-menu';  // Import MenuProvider

export default function RootLayout() {
  return (
    <MenuProvider>  {/* Provides popup menu support */}
      <AuthProvider>  {/* Authentication Context Provider */}
        <View style={styles.container}>
          {/* <Header />  Custom Header Component */}
          <Stack screenOptions={{ headerShown: false }} />  {/* Expo Router Stack */}
        </View>
      </AuthProvider>
    </MenuProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
