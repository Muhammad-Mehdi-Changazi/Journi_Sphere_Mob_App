export type RootStackParamList = {
  index: undefined;
  LoginScreen: undefined;
  SignupScreen: undefined;
  home: undefined;
  CityScreen: { city: { name: string; places: string[]; foods: string[]; } };
  GoogleMap: { placeName: string };  // Type for Google Map screen
  Reviews: { placeName: string };   // Type for Reviews screen
  
};
