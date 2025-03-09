import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import ProtectedRoute from "./components/protectedroute";
import axios from "axios";
import RNPickerSelect from "react-native-picker-select";
import { styles, pickerSelectStyles } from "./styles/homestyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Footer from "./components/Footer";
import Constants from "expo-constants";
import * as Location from "expo-location";


const API_BASE_URL: string = Constants.expoConfig?.extra?.API_BASE_URL || "";

const cities = [
  { label: "Islamabad", value: "Islamabad" },
  { label: "Karachi", value: "Karachi" },
  { label: "Lahore", value: "Lahore" },
  { label: "Quetta", value: "Quetta" },
];

export default function HomeScreen() {
  // Retrieve city info from URL parameters.
  const { city } = useLocalSearchParams();
  const cityData = city
    ? JSON.parse(city as string)
    : { name: "", places: [], foods: [] };

  const router = useRouter();

  // Tourist routing handler
  const handleViewSpot = (city: string, spotName: string) => {
    router.push({
      pathname: "/TouristSpotScreen",
      params: { city, spotName },
    });
  };

  // Screen dimensions to conditionally adjust layout on small screens.
  const screenWidth = Dimensions.get("window").width;
  const { height } = Dimensions.get("window");

  const isSmallScreen = screenWidth < 375;
  const isTallScreen = height > 800;

  // State for content, search, and tabs.
  const [touristSpots, setTouristSpots] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [temperature, setTemperature] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [overlayWidth, setOverlayWidth] = useState(50); // Moved to top level

  // DROP DOWN MENU
  const [selectedCity, setSelectedCity] = useState(cityData.name);
  const [carRentals, setCarRentals] = useState<any[]>([]);
  const [carRentalsLoading, setCarRentalsLoading] = useState(false);
  // New state to hold city coordinates
  const [cityCoords, setCityCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

   // New state for restaurants
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [restaurantLoading, setRestaurantLoading] = useState(false);

  // Active tab: "touristSpots", "hotels", "food", or "carRentals"
  const [activeTab, setActiveTab] = useState("touristSpots");

  const WEATHER_API = "IrcewJS0mpnHD8YvYx0F21aMGnqdlwLx";

  const GOOGLE_API_KEY = "AIzaSyDx_TwV8vhwbKTTWn0tV2BVRDGIipfwzlc";
  const hasFetchedWeather = useRef(false);

  // Load email from AsyncStorage
  const loadEmail = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem("email");
      if (storedEmail) setEmail(storedEmail);
    } catch (error) {
      console.error("Error loading email:", error);
    }
  };

  const fetchCarRentals = async (cityName: string) => {
      setCarRentalsLoading(true);
      try {
        let coords = cityCoords;
        // If city coordinates are not set, retrieve them using the Geocoding API
        if (!coords) {
          const geocodeResponse = await axios.get(
            "https://maps.googleapis.com/maps/api/geocode/json",
            {
              params: {
                address: cityName,
                key: GOOGLE_API_KEY,
              },
            }
          );
          if (
            geocodeResponse.data.status === "OK" &&
            geocodeResponse.data.results.length > 0
          ) {
            coords = geocodeResponse.data.results[0].geometry.location;
            setCityCoords(coords);
          }
        }
        // Perform the Places Text Search for car rentals
        const response = await axios.get(
          "https://maps.googleapis.com/maps/api/place/textsearch/json",
          {
            params: {
              query: `car rentals in ${cityName}`,
              location: `${coords?.lat},${coords?.lng}`,
              radius: 10000, // radius in meters
              key: GOOGLE_API_KEY,
            },
          }
        );
        if (response.data.status === "OK" && response.data.results.length > 0) {
          setCarRentals(response.data.results);
        } else {
          setCarRentals([]);
        }
        setCarRentalsLoading(false);
      } catch (error) {
        console.error("Error fetching car rentals:", error);
        setCarRentalsLoading(false);
      }
    };


useEffect(() => {
  if (activeTab === "carRentals" && cityData?.name) {
    fetchCarRentals(cityData.name);
  }
}, [activeTab, cityData.name]);

  // Fetch tourist spots if the active tab is "touristSpots"
  useEffect(() => {
  if (activeTab !== "touristSpots") return;
  setLoading(true);
  loadEmail();

  const fetchTouristSpots = async () => {
    try {
      // Get city's coordinates via Google Geocoding API
      const geocodeResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address: cityData.name,
            key: GOOGLE_API_KEY,
          },
        }
      );
      if (
        geocodeResponse.data.status !== "OK" ||
        geocodeResponse.data.results.length === 0
      ) {
        throw new Error("City not found");
      }
      const { lat, lng } = geocodeResponse.data.results[0].geometry.location;

      // Fetch nearby tourist attractions using Places API with type "tourist_attraction"
      const placesResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
        {
          params: {
            location: `${lat},${lng}`,
            radius: 10000, // 10km radius
            type: "tourist_attraction",
            key: GOOGLE_API_KEY,
          },
        }
      );
      if (placesResponse.data.status !== "OK") {
        throw new Error("Error fetching tourist attractions");
      }

      // Map the API results to match your schema (name, description, image)
      const spots = placesResponse.data.results.map((spot) => ({
        name: spot.name,
        description: spot.vicinity || "No description available",
        image:
          spot.photos && spot.photos[0]
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${spot.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
            : "https://via.placeholder.com/400", // fallback image
            rating: spot.rating,
      }));

      // Structure the state similar to before, if your rendering code expects touristSpots.touristSpots
      setTouristSpots({ touristSpots: spots });
    } catch (error) {
      console.error("Error fetching tourist spots:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchTouristSpots();
}, [activeTab, cityData.name]);
  // Fetch hotels if the active tab is "hotels" and a city is selected
  useEffect(() => {
    if (activeTab !== "hotels" || !cityData?.name) return;
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/hotels/city/${cityData.name}`)
      .then((response) => {
        if (response.data && response.data.hotels) {
          setHotels(response.data.hotels);
        } else {
          setHotels([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching hotels:", error);
        setHotels([]);
        setLoading(false);
      });
  }, [activeTab, cityData.name]);

    // Fetch restaurants when the "food" tab is active
  useEffect(() => {
    if (activeTab !== "food") return;

    const fetchRestaurants = async () => {
      setRestaurantLoading(true);
      try {
        // Request location permissions
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          alert("Permission to access location was denied.");
          return;
        }

        // Get user's current location
        let userLocation = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = userLocation.coords;

        // Fetch nearby restaurants using Google Places API
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=restaurant&key=${GOOGLE_API_KEY}`
        );
        setRestaurants(response.data.results);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setRestaurantLoading(false);
      }
    };

    fetchRestaurants();
  }, [activeTab]);

  // Fetch weather (only once)
  useEffect(() => {
    if (!cityData?.name || hasFetchedWeather.current) return;
    hasFetchedWeather.current = true;
    axios
      .get(
        `http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${WEATHER_API}&q=${cityData.name}`
      )
      .then((locationResponse) => {
        if (!locationResponse.data.length)
          throw new Error("Location not found");
        const locationKey = locationResponse.data[0].Key;
        return axios.get(
          `http://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${WEATHER_API}`
        );
      })
      .then((weatherResponse) => {
        const tempCelsius = weatherResponse.data[0].Temperature.Metric.Value;
        setTemperature(`${tempCelsius}°C`);
      })
      .catch((error) => {
        console.error("Error fetching weather:", error);
        setTemperature("N/A");
      });
  }, []);

  // Handle profile navigation
  const handleProfile = (email: string, city: string) => {
    router.push({
      pathname: "/Profile",
      params: { email, city },
    });
  };

  // Handle search using Google Places Text Search API
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 3) {
      setSearchLoading(true);
      try {
        let coords = cityCoords;
        // If city coordinates are not set, retrieve them using the Geocoding API
        if (!coords) {
          const geocodeResponse = await axios.get(
            "https://maps.googleapis.com/maps/api/geocode/json",
            {
              params: {
                address: cityData.name,
                key: GOOGLE_API_KEY,
              },
            }
          );
          if (
            geocodeResponse.data.status === "OK" &&
            geocodeResponse.data.results.length > 0
          ) {
            coords = geocodeResponse.data.results[0].geometry.location;
            setCityCoords(coords);
          }
        }
        // Perform the Places Text Search restricted by location and a radius
        const response = await axios.get(
          "https://maps.googleapis.com/maps/api/place/textsearch/json",
          {
            params: {
              query: query,
              location: `${coords?.lat},${coords?.lng}`,
              radius: 10000, // radius in meters
              key: GOOGLE_API_KEY,
            },
          }
        );
        if (response.data.status === "OK" && response.data.results.length > 0) {
          setSearchResults(response.data.results);
        } else {
          setSearchResults([]);
        }
        setSearchLoading(false);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setSearchLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Hotel card button handlers
  const handleNavigate = (hotelName: string) => {
    router.push(`/GoogleMapScreen?placeName=${encodeURIComponent(hotelName)}`);
  };
  const handleCheckReviews = (hotelName: string) => {
    console.log("Checking reviews for", hotelName);
    router.push(`/Reviews?placeName=${encodeURIComponent(hotelName)}`);
  };
  const handleMakeReservation = (placeID: string) => {
    router.push(`/ReservationScreen?placeID=${encodeURIComponent(placeID)}`);
  };

  const handleNavigateFoods = ({ name, vicinity }: { name: string; vicinity: string }) => {
    const newname = name + " " + vicinity;
  router.push(`/GoogleMapScreen?placeName=${encodeURIComponent(newname)}`);
};

  // Handle city change in the dropdown
  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    const newCityData = JSON.stringify({ name: value, places: [], foods: [] });
    router.replace({
      pathname: "/home",
      params: { city: newCityData },
    });
  };

  // Render content based on the active tab
  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#A8CCF0" />;
    }
    if (activeTab === "touristSpots") {
      return (
        <View>
          <FlatList
            data={touristSpots.touristSpots}
            horizontal
            keyExtractor={(item) =>
              item._id ? item._id.toString() : item.name
            }
            renderItem={({ item }) => (
              <View
                style={[
                  styles.placeUnderlay,
                  isTallScreen && { marginBottom: 15 + height * 0.25 },
                ]}
              >
                <TouchableOpacity
                  style={styles.placeCard2}
                  onPress={() => handleViewSpot(cityData.name, item.name)}
                >
                  <Image source={{ uri: item.image }} style={styles.placeImage} />
                  <View style={[styles.placeOverlay2, { width: overlayWidth + 40 }]}>
                    <Text
                      style={styles.placeName2}
                      onLayout={(event) => {
                        const textWidth = event.nativeEvent.layout.width;
                        setOverlayWidth(textWidth);
                      }}
                    >
                      {item.name}
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.button2,
                    isTallScreen && { marginTop: height * 0.01, height: 25 },
                  ]}
                  onPress={() => handleNavigate(item.name)}
                >
                  <Text style={styles.buttonText}>Navigation</Text>
                </TouchableOpacity>
              </View>
            )}
            showsHorizontalScrollIndicator={false}
          />
          
        </View>
      );
    } else if (activeTab === "hotels") {
      return (
        <FlatList
          data={hotels}
          keyExtractor={(item) =>
            item._id ? item._id.toString() : item.hotel_name
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.hotelPlaceName}>{item.hotel_name}</Text>
              <Text style={styles.hotelDetails}>{item.complete_address}</Text>
              <Text style={styles.hotelDetails2 }>{item.hotel_class} Hotel</Text>
              <View
                style={[
                  styles.buttonsContainer,
                  isSmallScreen && {
                    flexDirection: "column",
                    alignItems: "stretch",
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.button,
                    isSmallScreen && { width: "100%", marginBottom: 8 },
                  ]}
                  onPress={() => handleNavigate(item.hotel_name)}
                >
                  <Text style={styles.buttonText}>Navigate</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    isSmallScreen && { width: "100%", marginBottom: 8 },
                  ]}
                  onPress={() => handleCheckReviews(item.hotel_name)}
                >
                  <Text style={styles.buttonText}>Reviews</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, isSmallScreen && { width: "100%" }]}
                  onPress={() => handleMakeReservation(item._id)}
                >
                  <Text style={styles.buttonText}>Reserve</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      );
    } 
    else if (activeTab === "food") {
      return (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <View style={styles.cityCard}>
              {item.photos && (
                <Image
                  source={{
                    uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`,
                  }}
                  style={styles.cityImage}
                />
              )}
              <Text style={styles.cityName3}>{item.name}</Text>
              <Text style={styles.cityDescription}>{item.vicinity}</Text>
              <Text>⭐ {item.rating || "No rating available"}</Text>
              <Text>📞 {item.formatted_phone_number || "No phone available"}</Text>
              {/* Add "Navigate" and "Reviews" buttons */}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleNavigateFoods({ name: item.name, vicinity: item.vicinity })}
                >
                  <Text style={styles.buttonText}>Navigate</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleCheckReviews(item.name)}
                >
                  <Text style={styles.buttonText}>Reviews</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <Text style={styles.cityDescription}>No restaurants found.</Text>
          )}
        />
      );
    }
    else if (activeTab === "carRentals") {
      if (carRentalsLoading) {
        return <ActivityIndicator size="large" color="#A8CCF0" />;
      }
      return (
        <FlatList
          data={carRentals}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.hotelPlaceName}>{item.name}</Text>
              <Text style={styles.hotelDetails}>{item.formatted_address}</Text>
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleNavigate(item.name)}
                >
                  <Text style={styles.buttonText}>Navigate</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleCheckReviews(item.name)}
                >
                  <Text style={styles.buttonText}>Reviews</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      );
    }
  };

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        {/* Drop down menu */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Explore</Text>
          <Text style={styles.cityName}>{cityData.name}</Text>
          <RNPickerSelect
          onValueChange={handleCityChange}
          items={cities}
          value={selectedCity}
          style={pickerSelectStyles}
          placeholder={{ label: 'Select a city...', value: null }} // Optional placeholder
        />
        </View>

        {/* Temperature Display */}
        <View style={styles.temperature}>
          <Text style={styles.temperature}>
            {temperature ? `~ ${temperature}` : "Loading..."}
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <FontAwesome
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchBar}
            placeholder="Find things here..."
            value={searchQuery}
            onChangeText={handleSearch}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchLoading && (
            <ActivityIndicator
              size="small"
              color="#A8CCF0"
              style={styles.searchLoader}
            />
          )}
        </View>

        {/* Render search results if query length is at least 3; otherwise render the tabs and popular content */}
        {searchQuery.length >= 3 ? (
          <FlatList
            data={searchResults}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.cityCard}>
                <Image
                  source={{
                    uri:
                      item.icon ||
                      (item.photos &&
                      item.photos[0] &&
                      item.photos[0].photo_reference
                        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
                        : ""),
                  }}
                  style={styles.cityImage}
                />
                <View style={styles.cityInfo}>
                  <Text style={styles.cityName}>{item.name}</Text>
                  <Text style={styles.cityDescription}>
                    {item.formatted_address}
                  </Text>
                  <View style={styles.searchResultButtonsContainer}>
                    <TouchableOpacity
                      style={styles.searchResultButton}
                      onPress={() =>
                        router.push(
                          `/GoogleMapScreen?placeName=${encodeURIComponent(item.name)}`
                        )
                      }
                    >
                      <Text style={styles.searchResultButtonText}>Navigate</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.searchResultButton}
                      onPress={() =>
                        router.push(
                          `/Reviews?placeName=${encodeURIComponent(item.name)}`
                        )
                      }
                    >
                      <Text style={styles.searchResultButtonText}>
                        Check Reviews
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={() => (
              <Text style={styles.cityDescription}>
                No results found for "{searchQuery}"
              </Text>
            )}
          />
        ) : (
          <>
            {/* Category Tabs */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={
                  activeTab === "touristSpots"
                    ? styles.activeTab
                    : styles.inactiveTab
                }
                onPress={() => setActiveTab("touristSpots")}
              >
                <Text
                  style={
                    activeTab === "touristSpots"
                      ? styles.activeTabText
                      : styles.inactiveTabText
                  }
                >
                  Tourist Spots
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={
                  activeTab === "hotels" ? styles.activeTab : styles.inactiveTab
                }
                onPress={() => setActiveTab("hotels")}
              >
                <Text
                  style={
                    activeTab === "hotels"
                      ? styles.activeTabText
                      : styles.inactiveTabText
                  }
                >
                  Hotels
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={
                  activeTab === "food" ? styles.activeTab : styles.inactiveTab
                }
                onPress={() => setActiveTab("food")}
              >
                <Text
                  style={
                    activeTab === "food"
                      ? styles.activeTabText
                      : styles.inactiveTabText
                  }
                >
                  Food
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={
                  activeTab === "carRentals"
                    ? styles.activeTab
                    : styles.inactiveTab
                }
                onPress={() => setActiveTab("carRentals")}
              >
                <Text
                  style={
                    activeTab === "carRentals"
                      ? styles.activeTabText
                      : styles.inactiveTabText
                  }
                >
                  Car Rentals
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionTitle}>Popular</Text>
            {/* Render content based on the selected tab */}
            {renderContent()}
          </>
        )}
      </View>
      <Footer
        handleProfile={handleProfile}
        handleBack={(cityName: string) => {
          console.log("Already on home.");
        }}
        cityName={cityData.name}
        email={email}
        currentTab={1}
      />
    </ProtectedRoute>
  );
}