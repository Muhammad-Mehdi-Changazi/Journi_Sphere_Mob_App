import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router'; // Use Expo Router
import ProtectedRoute from './components/protectedroute';
import axios from 'axios';
import styles from './styles/homestyles'; // Import the separate styles file

export default function HomeScreen() {
  const router = useRouter(); // Use the useRouter hook from Expo Router
  const [cities, setCities] = useState<any[]>([]); // State to store cities data
  const [loading, setLoading] = useState(true); // State for loading

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/cities'); // Replace with your API endpoint
        setCities(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cities:', error);
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <Text style={styles.header}>Popular Cities</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" /> // Loading indicator
        ) : (
          <View style={styles.citiesContainer}>
            {cities.map((city, index) => (
              <TouchableOpacity
                key={index}
                style={styles.cityButton}
                onPress={() => {
                  router.push({
                    pathname: '/CityScreen',
                    params: {
                      city: JSON.stringify({
                        name: city.name,
                        places: city.places,
                        foods: city.food,
                      }),
                    },
                  });
                }}
              >
                <Text style={styles.cityText}>{city.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ProtectedRoute>
  );
}
