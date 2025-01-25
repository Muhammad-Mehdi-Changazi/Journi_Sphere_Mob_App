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
        const response = await axios.get('https://manzil-sprint1-production.up.railway.app/api/cities'); // Replace with your API endpoint
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
        const response = await axios.get('https://manzil-sprint1-production.up.railway.app/api/search', {
          params: { query },
        });

        if (response.data.status === 'OK' && response.data.results.length > 0) {
          setSearchResults(response.data.results);
        } else {
          setSearchResults([]);
        }
        setSearchLoading(false);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setSearchLoading(false);
      }
    }
  };

  const resetSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        {/* Back to Home Button */}
        <TouchableOpacity style={styles.backButton} onPress={resetSearch}>
          {/* <Icon name="arrow-back-outline" size={24} color="white" /> */}
        </TouchableOpacity>

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
              searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <View key={index} style={styles.cityCard}>
                    <Image
                      source={{ uri: result.icon }}
                      style={styles.cityImage}
                    />
                    <View style={styles.cityInfo}>
                      <Text style={styles.cityName}>{result.name}</Text>
                      <Text style={styles.cityDescription}>{result.formatted_address}</Text>

                      {/* Navigate buttons */}
                      <View style={styles.searchResultButtonsContainer}>
                        <TouchableOpacity
                          style={styles.searchResultButton}
                          onPress={() => {
                            router.push({
                              pathname: '/Google Map',
                              params: { placeName: result.name },
                            });
                          }}
                        >
                          <Text style={styles.searchResultButtonText}>Navigate</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.searchResultButton}
                          onPress={() => {
                            router.push({
                              pathname: '/Reviews',
                              params: { placeName: result.name },
                            });
                          }}
                        >
                          <Text style={styles.searchResultButtonText}>Check Reviews</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.cityDescription}>No results found for "{searchQuery}"</Text>
              )
            ) : (
              cities.map((city, index) => (
                <View key={index} style={styles.cityCard}>
                  <Image
                    source={{ uri: city.photoUrl }}
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
                          pathname: '/City Screen',
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
