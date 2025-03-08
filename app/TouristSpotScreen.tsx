import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams, usePathname } from "expo-router";
import axios from "axios";
import Constants from "expo-constants";

const API_BASE_URL: string = Constants.expoConfig?.extra?.API_BASE_URL || "";

const TouristSpotScreen = () => {
  const router = useRouter();
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const { city, spotName } = useLocalSearchParams(); // Get params from URL
  
  // handlers for back button and navigation button
  const handleBack = (city: string) => {
    router.push({
      pathname: "/home",
      params: { city: `{\"name\":\"${city}\",\"places\":[],\"foods\":[]}` },
    });
  };
  const handleNavigate = (spotName: string) => {
    router.push(`/GoogleMapScreen?placeName=${encodeURIComponent(spotName)}`);
  };
  
  // fetch spot
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/api/tourism`, {
        params: {
          city: city,
          spotName: spotName,
        },
      })
      .then((res) => {
        console.log(res.data);
        setSpot(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error Fetch Tourist Spot:", spotName);
        setLoading(false);
      });
  }, [city, spotName]);

  if (loading) {
    return (
      <ActivityIndicator size="large" color="blue" style={styles.loader} />
    );
  }

  // spot not found case
  if (!spot) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Tourist Spot Not Found, {city}, {spotName}
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            handleBack(city);
          }}
        >
          <Text style={styles.backText}>⬅</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => handleBack(city)}
      >
        <Image
          source={require("../assets/images/backicon.png")}
          style={styles.backButton}
        />
      </TouchableOpacity>

      {/* Image */}
      <Image source={{ uri: spot.image }} style={styles.image} />

      {/* Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{spot.name}</Text>
        <Text style={styles.description}>{spot.description}</Text>

        {/* Show Map Button */}
        <TouchableOpacity 
          style={styles.button}
          onPress={()=> handleNavigate(spot.name)}
        >
          <Text style={styles.buttonText}>Show Map ➜</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,  // Allows content to scroll
    paddingBottom: 20,  // Adds some space at the bottom
  },
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  backButton: { 
    position: "absolute", 
    top: 20, 
    left: 15, 
    zIndex: 10, 
    height: 40, 
    width: 40,
    borderRadius: 10
  },
  image: {
    width: "90%",
    height: 400,
    borderRadius: 30,
    top: 20,
    left: 20
  },
  detailsContainer: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#222", paddingTop: 40 },
  description: { fontSize: 16, color: "#555", marginVertical: 40 },
  button: {
    backgroundColor: "#2F80ED",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 18, color: "red" },
});

export default TouristSpotScreen;
