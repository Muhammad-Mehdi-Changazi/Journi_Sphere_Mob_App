// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from './contexts/authcontext'; // Adjust the import path if necessary

export default function RootLayout() {
  return (
    <AuthProvider> {/* Wrap your entire app with AuthProvider */}
      <Stack /> {/* This renders the appropriate route/page */}
    </AuthProvider>
  );
}
