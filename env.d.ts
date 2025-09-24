// Type hints for Expo public environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_GOOGLE_API_KEY?: string;
    EXPO_PUBLIC_ACCUWEATHER_API_KEY?: string;
    EXPO_PUBLIC_GEMINI_API_KEY?: string;
  }
}

