// import React, { useState, useEffect } from 'react';
// import { View, Text, TouchableOpacity, ActivityIndicator, Image, ScrollView, TextInput } from 'react-native';
// import { useRouter } from 'expo-router';
// import ProtectedRoute from './components/protectedroute';
// import axios from 'axios';
// import styles from './styles/homestyles'; // Import your styles

// export default function HomeScreen() {
//   const router = useRouter();
//   const [cities, setCities] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState<any[]>([]);
//   const [searchLoading, setSearchLoading] = useState(false);

//   // Fetch cities when the page loads
//   useEffect(() => {
//     const fetchCities = async () => {
//       try {
//         const response = await axios.get('http://localhost:3000/api/cities'); // Replace with your API endpoint
//         setCities(response.data);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching cities:', error);
//         setLoading(false);
//       }
//     };
//     fetchCities();
//   }, []);

//   const handleSearch = async (query: string) => {
//     setSearchQuery(query);
//     if (query.length >= 3) {
//       setSearchLoading(true);
//       try {
//         const response = await axios.get('http://localhost:3000/api/search', {
//           params: { query },
//         });

//         if (response.data.status === 'OK' && response.data.results.length > 0) {
//           setSearchResults(response.data.results);
//           resetSearch();
//         } else {
//           setSearchResults([]);
//           resetSearch();
//         }
//         setSearchLoading(false);
//       } catch (error) {
//         console.error('Error fetching search results:', error);
//         setSearchLoading(false);
//       }
//     }
//   };

//   const resetSearch = () => {
//     setSearchQuery('');
//     setSearchResults([]);
//   };

//   return (
//     <ProtectedRoute>
//       <View style={styles.container}>
//         {/* Search Bar */}
//         <View style={styles.searchContainer}>
//           <TextInput
//             style={styles.searchBar}
//             placeholder="Search for hotels, places, or restaurants"
//             value={searchQuery}
//             onChangeText={handleSearch}
//             autoCorrect={false}
//             autoCapitalize="none"
//           />
//           {searchLoading && <ActivityIndicator size="small" color="#007bff" style={styles.searchLoader} />}
//         </View>

//         <Text style={styles.header}>Explore Popular Cities</Text>

//         {loading ? (
//           <ActivityIndicator size="large" color="#0000ff" />
//         ) : (
//           <ScrollView contentContainerStyle={styles.citiesScrollView}>
//             {searchQuery ? (
//               searchResults.length > 0 ? (
//                 searchResults.map((result, index) => (
//                   <View key={index} style={styles.cityCard}>
//                     <Image
//                       source={{ uri: result.icon }}
//                       style={styles.cityImage}
//                     />
//                     <View style={styles.cityInfo}>
//                       <Text style={styles.cityName}>{result.name}</Text>
//                       <Text style={styles.cityDescription}>{result.formatted_address}</Text>

//                       {/* Navigate buttons */}
//                       <View style={styles.searchResultButtonsContainer}>
//                         <TouchableOpacity
//                           style={styles.searchResultButton}
//                           onPress={() => {
//                             router.push({
//                               pathname: '/Google Map',
//                               params: { placeName: result.name },
//                             });
//                           }}
//                         >
//                           <Text style={styles.searchResultButtonText}>Navigate</Text>
//                         </TouchableOpacity>

//                         <TouchableOpacity
//                           style={styles.searchResultButton}
//                           onPress={() => {
//                             router.push({
//                               pathname: '/Reviews',
//                               params: { placeName: result.name },
//                             });
//                           }}
//                         >
//                           <Text style={styles.searchResultButtonText}>Check Reviews</Text>
//                         </TouchableOpacity>
//                       </View>
//                     </View>
//                   </View>
//                 ))
//               ) : (
//                 <Text style={styles.cityDescription}>No results found for "{searchQuery}"</Text>
//               )
//             ) : (
//               cities.map((city, index) => (
//                 <View key={index} style={styles.cityCard}>
//                   <Image
//                     source={{ uri: city.photoUrl }}
//                     style={styles.cityImage}
//                   />
//                   <View style={styles.cityInfo}>
//                     <Text style={styles.cityName}>{city.name}</Text>
//                     <Text style={styles.cityDescription}>
//                       {city.description || 'Discover amazing places and experiences!'}
//                     </Text>
//                     <TouchableOpacity
//                       style={styles.exploreButton}
//                       onPress={() => {
//                         router.push({
//                           pathname: '/City Screen',
//                           params: {
//                             city: JSON.stringify({
//                               name: city.name,
//                               places: city.places,
//                               foods: city.food,
//                             }),
//                           },
//                         });
//                       }}
//                     >
//                       <Text style={styles.exploreButtonText}>Explore</Text>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               ))
//             )}
//           </ScrollView>
//         )}
//       </View>
//     </ProtectedRoute>
//   );
// }


import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import ProtectedRoute from './components/protectedroute';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';
import styles from './styles/homestyles';
import { useLocalSearchParams } from "expo-router";

export default function HomeScreen() {
  const { city } = useLocalSearchParams();
  const cityData = city ? JSON.parse(city as string) : { name: "", places: [], foods: [] };

  const router = useRouter();
  const [touristSpots, setTouristSpots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [temperature, setTemperature] = useState<string | null>(null);

  const WEATHER_API = 'IrcewJS0mpnHD8YvYx0F21aMGnqdlwLx';
  
  // Prevent multiple API calls for weather
  const hasFetchedWeather = useRef(false);

  // Fetch tourist spots
  useEffect(() => {
    const fetchTouristSpots = async () => {
      try {
        const response = await axios.get('http://34.226.13.20:3000/api/tourist-spots');
        setTouristSpots(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tourist spots:', error);
        setLoading(false);
      }
    };
    fetchTouristSpots();
  }, []);

  // Fetch weather only once when the component mounts
  useEffect(() => {
    if (!cityData?.name || hasFetchedWeather.current) return;
    hasFetchedWeather.current = true; // Prevents re-fetching

    const fetchWeather = async () => {
      try {
        // Step 1: Get Location Key
        const locationResponse = await axios.get(
          `http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${WEATHER_API}&q=${cityData.name}`
        );

        if (!locationResponse.data.length) throw new Error('Location not found');

        const locationKey = locationResponse.data[0].Key;

        // Step 2: Get Current Weather
        const weatherResponse = await axios.get(
          `http://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${WEATHER_API}`
        );

        const tempCelsius = weatherResponse.data[0].Temperature.Metric.Value;
        setTemperature(`${tempCelsius}°C`);
      } catch (error) {
        console.error('Error fetching weather:', error);
        setTemperature('N/A');
      }
    };

    fetchWeather();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 3) {
      setSearchLoading(true);
      try {
        const response = await axios.get('http://34.226.13.20:3000/api/search', {
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

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Explore</Text>
          <Text style={styles.cityName}>{cityData.name}</Text>
        </View>

        {/* Temperature Display */}
        <View style={styles.temperature}>
          <Text>{temperature ? `~ ${temperature}` : 'Loading...'}</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchBar}
            placeholder="Search fun things"
            value={searchQuery}
            onChangeText={handleSearch}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchLoading && <ActivityIndicator size="small" color="#A8CCF0" style={styles.searchLoader} />}
        </View>

        {/* Category Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={styles.activeTab}><Text style={styles.activeTabText}>Tourist Spots</Text></TouchableOpacity>
          <TouchableOpacity style={styles.inactiveTab}><Text style={styles.inactiveTabText}>Hotels</Text></TouchableOpacity>
          <TouchableOpacity style={styles.inactiveTab}><Text style={styles.inactiveTabText}>Food</Text></TouchableOpacity>
          <TouchableOpacity style={styles.inactiveTab}><Text style={styles.inactiveTabText}>Car Rentals</Text></TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Popular</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#A8CCF0" />
        ) : (
          <FlatList
            data={touristSpots}
            horizontal
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.placeCard}
                onPress={() => router.push({ pathname: '/details', params: { spot: JSON.stringify(item) } })}
              >
                <Image source={{ uri: item.image }} style={styles.placeImage} />
                <View style={styles.placeOverlay}>
                  <Text style={styles.placeName}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>
    </ProtectedRoute>
  );
}