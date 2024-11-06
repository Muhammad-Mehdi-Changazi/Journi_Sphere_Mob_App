import { Stack } from "expo-router";
import { RootStackParamList } from "./types"; // Import the type

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="LoginScreen" />
      <Stack.Screen name="SignupScreen" />
      <Stack.Screen name="home" />

    </Stack>
  );
}
