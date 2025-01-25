import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ProtectedRoute from './components/protectedroute';
import axios from 'axios';

// Update fetchRecommendations to call your server API
const fetchRecommendations = async (cityName: string) => {
  try {
    const response = await axios.get(`https://manzil-sprint1-production.up.railway.app/recommendations?city=${cityName}`);
    return {
      places: response.data.hotels,  // Hotels as places
      foods: response.data.restaurants // Restaurants as foods
    };
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return { places: [], foods: [] };  // Return empty arrays if there's an error
  }
};

export default function CityScreen() {
  const router = useRouter();
  const { city } = useLocalSearchParams<{ city: string }>();

  const [places, setPlaces] = useState<any[]>([]); // Adjusted to store place objects
  const [foods, setFoods] = useState<any[]>([]); // Adjusted to store food objects
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    // Set screen size state
    const updateScreenSize = () => {
      const screenWidth = Dimensions.get('window').width;
      setIsSmallScreen(screenWidth < 768); // Adjust this threshold based on your needs
    };

    // Listen for screen size changes
    Dimensions.addEventListener('change', updateScreenSize);

    // Initial check for screen size
    updateScreenSize();

    // Fetch city recommendations
    if (city) {
      const parsedCity = JSON.parse(city);
      const cityName = parsedCity.name;

      console.log("City Name:", cityName);  // Log city name for debugging

      // Fetch recommendations based on the city
      fetchRecommendations(cityName).then((data) => {
        console.log('Fetched Data:', data);  // Log the fetched data for debugging
        setPlaces(data.places || []); // Ensure places data is set correctly
        setFoods(data.foods || []);   // Ensure foods data is set correctly
        setLoading(false);
      }).catch((error) => {
        console.error("Error fetching data:", error);
        setError('Failed to load recommendations');
        setLoading(false);
      });
    }

    // Clean up listener on component unmount
    return () => {
      Dimensions.removeEventListener('change', updateScreenSize);
    };
  }, [city]);

  const handleNavigate = (placeName: string) => {
    router.push(`/Google Map?placeName=${encodeURIComponent(placeName)}`); // Navigate to GoogleMap screen
  };

  const handleCheckReviews = (placeName: string) => {
    router.push(`/Reviews?placeName=${encodeURIComponent(placeName)}`); // Navigate to Reviews page
  };

  const handleMakeReservation = (placeName: string) => {
    router.push(`/ReservationScreen?placeName=${encodeURIComponent(placeName)}`); // Navigate to ReservationScreen
  };

  // Function to render the hotel item
  const renderHotelItem = (place: any) => {
    const photoReference = place.photos && place.photos[0]?.photo_reference;
    const photoUrl = photoReference ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=YOUR_GOOGLE_API_KEY` : 'https://via.placeholder.com/150';

    return (
      <View style={styles.card} key={place.place_id}>
        <Image
          source={{ uri: photoUrl }}
          style={styles.placeImage}
        />
        <Text style={styles.placeName}>{place.name}</Text>

        <View style={[styles.buttonsContainer, isSmallScreen && styles.buttonsContainerVertical]}>
          <TouchableOpacity style={styles.button} onPress={() => handleNavigate(place.name)}>
            <Text style={styles.buttonText}>Navigate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleCheckReviews(place.name)}>
            <Text style={styles.buttonText}>Check Reviews</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleMakeReservation(place.name)}>
            <Text style={styles.buttonText}>Make Reservation</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Function to render the food item
  const renderFoodItem = (food: any) => {
    const photoReference = food.photos && food.photos[0]?.photo_reference;
    const photoUrl = photoReference ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=YOUR_GOOGLE_API_KEY` : 'https://via.placeholder.com/150';

    return (
      <View style={styles.card} key={food.place_id}>
        <Image
          source={{ uri: photoUrl }}
          style={styles.placeImage}
        />
        <Text style={styles.placeName}>{food.name}</Text>

        <View style={[styles.buttonsContainer, isSmallScreen && styles.buttonsContainerVertical]}>
          <TouchableOpacity style={styles.button} onPress={() => handleNavigate(food.name)}>
            <Text style={styles.buttonText}>Navigate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleCheckReviews(food.name)}>
            <Text style={styles.buttonText}>Check Reviews</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <ProtectedRoute>
      <ScrollView style={styles.container}>
        <Text style={styles.cityName}>City: {JSON.parse(city).name}</Text>

        <View style={[styles.columnsContainer, isSmallScreen && styles.columnsContainerVertical]}>
          {/* Tourist Sites Column (Hotels) */}
            {/* links for testing. will be removed later*/}
            {/* <a href="http://localhost:8081/Hotel">API: All Hotels</a>
            <a href="http://localhost:8081/hotels/Pearl_Continental_Karachi">API: Pearl Continental Karachi</a> */}

          <View style={styles.column}>
            <Text style={styles.columnTitle}>Hotels</Text>
            {places.length === 0 ? (
              <Text>No hotels available in this city.</Text>
            ) : (
              places.map((place) => renderHotelItem(place))
            )}
          </View>

          {/* Food Options Column (Restaurants) */}
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Restaurants</Text>
            {foods.length === 0 ? (
              <Text>No restaurants available in this city.</Text>
            ) : (
              foods.map((foodItem) => renderFoodItem(foodItem))
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
  columnsContainerVertical: {
    flexDirection: 'column',  // Stacks columns vertically on smaller screens
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
  buttonsContainerVertical: {
    flexDirection: 'column',  // Align buttons vertically on smaller screens
    alignItems: 'center',     // Center buttons horizontally
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 5,  // Add spacing between buttons in vertical layout
    width: 200, // Set a fixed width for the button
    height: 45, // Set a fixed height for the button
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    fontSize: 18,
    marginTop: 20,
  },
});