// app/CityScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ProtectedRoute from './components/protectedroute'

export default function CityScreen() {
  const router = useRouter();
  const { city } = useLocalSearchParams<{ city: string }>();

  if (!city) {
    return <Text>City information is missing.</Text>;
  }

  // Parse city information from the string
  const parsedCity = JSON.parse(city);
  const places = parsedCity.places || [];
  const food = parsedCity.foods || [];

  const handleNavigate = (placeName: string) => {
    console.log(placeName);
    router.push(`/GoogleMap?placeName=${encodeURIComponent(placeName)}`); // Navigate to GoogleMap screen
  };

  const handleCheckReviews = (placeName: string) => {
    console.log(placeName);
    router.push(`/Reviews?placeName=${encodeURIComponent(placeName)}`); // Navigate to Reviews page
  };

  const renderItem = (placeName: string, type: 'places' | 'foods') => (
    <View style={styles.card} key={placeName}>
      <Image
        source={{ uri: 'https://via.placeholder.com/150' }} // Placeholder image
        style={styles.placeImage}
      />
      <Text style={styles.placeName}>{placeName}</Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={() => handleNavigate(placeName)}>
          <Text style={styles.buttonText}>Navigate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handleCheckReviews(placeName)}>
          <Text style={styles.buttonText}>Check Reviews</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ProtectedRoute>
    <ScrollView style={styles.container}>
      <Text style={styles.cityName}>{`City: ${parsedCity.name}`}</Text>

      <View style={styles.columnsContainer}>
        {/* Tourist Sites Column */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Tourist Sites</Text>
          {places.length === 0 ? (
            <Text>No places available in this city.</Text>
          ) : (
            places.map((place: string) => renderItem(place, 'places'))
          )}
        </View>

        {/* Food Options Column */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Food Options</Text>
          {food.length === 0 ? (
            <Text>No food options available in this city.</Text>
          ) : (
            food.map((foodItem: string) => renderItem(foodItem, 'foods'))
          )}
        </View>
      </View>
    </ScrollView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  cityName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  columnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    marginHorizontal: 8,
  },
  columnTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  placeName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
