import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import ProtectedRoute from './components/protectedroute';
import axios from 'axios';
import styles from './styles/homestyles'; // Import your styles

export default function HomeScreen() {
  const router = useRouter();
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch cities when the page loads
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
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 3) {
      setSearchLoading(true);
      try {
        // Call your backend API for the search functionality
        const response = await axios.get(`http://localhost:3000/api/search`, {
          params: { query },  // Pass the query to the backend
        });
  
        // Check if there are results and set them
        if (response.data.status === 'OK' && response.data.results.length > 0) {
          console.log('Search Results:', response.data);
          setSearchResults(response.data.results);  // Set search results from backend
        } else {
          console.log("No results found for the query:", query);
          setSearchResults([]);  // If no results, set empty array
        }
  
        setSearchLoading(false);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setSearchLoading(false);
      }
    }
  };
  
  return (
    <ProtectedRoute>
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search for hotels, places, or restaurants"
            value={searchQuery}
            onChangeText={handleSearch}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchLoading && <ActivityIndicator size="small" color="#007bff" style={styles.searchLoader} />}
        </View>

        <Text style={styles.header}>Explore Popular Cities</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <ScrollView contentContainerStyle={styles.citiesScrollView}>
            {searchQuery ? (
              // Display search results if there's a search query
              searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <View key={index} style={styles.cityCard}>
                    <Image
                      source={{ uri: result.icon }} // Google Places API provides an 'icon' field
                      style={styles.cityImage}
                    />
                    <View style={styles.cityInfo}>
                      <Text style={styles.cityName}>{result.name}</Text>
                      <Text style={styles.cityDescription}>{result.formatted_address}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.cityDescription}>No results found for "{searchQuery}"</Text>
              )
            ) : (
              // Display cities if no search query
              cities.map((city, index) => (
                <View key={index} style={styles.cityCard}>
                  <Image
                    source={{ uri: city.photoUrl }} // Ensure your API includes a `photoUrl` for each city
                    style={styles.cityImage}
                  />
                  <View style={styles.cityInfo}>
                    <Text style={styles.cityName}>{city.name}</Text>
                    <Text style={styles.cityDescription}>
                      {city.description || 'Discover amazing places and experiences!'}
                    </Text>
                    <TouchableOpacity
                      style={styles.exploreButton}
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
                      <Text style={styles.exploreButtonText}>Explore</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </ProtectedRoute>
  );
}
