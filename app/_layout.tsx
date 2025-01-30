import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { AuthProvider } from './contexts/authcontext'; // Adjust the import path if necessary
import Header from './components/Header';  // Import the Header component
import { MenuProvider } from 'react-native-popup-menu'; // Import MenuProvider

export default function RootLayout() {
  return (
    <MenuProvider>
      {/* Wrap everything inside MenuProvider */}
      <AuthProvider>
        {/* Wrap your entire app with AuthProvider */}
        <View style={styles.container}>
          {/* Render the custom header */}
          <Header />
          {/* The Stack will render the pages, and we want to ensure the custom header stays on top */}
          <Stack
            screenOptions={{
              headerShown: false, // Disable default header globally
            }}
          />
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
