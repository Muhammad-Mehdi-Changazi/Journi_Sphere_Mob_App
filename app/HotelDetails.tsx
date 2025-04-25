import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  SafeAreaView
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome, FontAwesome5, Ionicons } from "@expo/vector-icons";
import axios from "axios";
import Footer from "./components/Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const API_BASE_URL = "http://10.130.218.95:3000";

export default function HotelDetails() {
  const { hotelId, hotelName } = useLocalSearchParams();

  const router = useRouter(); 

  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    loadUserData();
    fetchHotelDetails();
  }, [hotelId]);

  const loadUserData = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem("email");
      const storedCity = await AsyncStorage.getItem("lastCity");
      if (storedEmail) setEmail(storedEmail);
      if (storedCity) setCity(storedCity);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const fetchHotelDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/hotels/${hotelId}`);
      setHotel(response.data);
    } catch (error) {
      console.error("Error fetching hotel details:", error);
    } finally {
      setLoading(false);
    }
  };

// Update the handleNavigate and handleCheckReviews functions:
const handleNavigate = () => {
  const nameToUse = hotelName || (hotel ? hotel.hotel_name : '');
  const address = hotel?.complete_address || '';
  
  if (nameToUse || address) {
    const fullAddress = `${nameToUse} ${address}`;
    router.push(`/GoogleMapScreen?placeName=${encodeURIComponent(fullAddress)}`);
  }
};

    const handleCheckReviews = () => {
    const nameToUse = hotelName || (hotel ? hotel.hotel_name : '');
    if (nameToUse) {
        router.push(`/Reviews?placeName=${encodeURIComponent(nameToUse)}`);
    }
    };

  const handleMakeReservation = (placeID: string) => {
    router.push(`/ReservationScreen?placeID=${encodeURIComponent(placeID)}`);
  };

  const handleBack = () => {
    router.back();
  };

  const handleProfile = () => {
    if (email && city) {
      router.push({
        pathname: "/Profile",
        params: { email, city },
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A8CCF0" />
      </View>
    );
  }

  if (!hotel) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Sorry, we couldn't find this hotel. Please try again.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#007BFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hotel Details</Text>
          <View style={{width: 24}} />
        </View>
        
        {/* Hero Image */}
        
        <Image
        source={{ uri: hotel?.url || 'https://via.placeholder.com/400x300?text=Hotel+Image' }}
        style={styles.heroImage}
        resizeMode="cover"
        />
        
        {/* Hotel Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.hotelName}>{hotel?.hotel_name || hotelName}</Text>

        <View style={styles.classBadge}>
        <Text style={styles.classBadgeText}>{hotel?.hotel_class} Star</Text>
        </View>
                
          <View style={styles.locationContainer}>
            <FontAwesome name="map-marker" size={16} color="#555" />
            <Text style={styles.locationText}>{hotel.complete_address}</Text>
          </View>
          
          <View style={styles.divider} />
          
          {/* Hotel Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <FontAwesome5 name="door-open" size={18} color="#007BFF" />
              <Text style={styles.detailText}>
                {hotel.number_of_rooms} Rooms Available
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <FontAwesome5 
                name={hotel.mess_included ? "utensils" : "times"} 
                size={18} 
                color={hotel.mess_included ? "#007BFF" : "#FF6B6B"} 
              />
              <Text style={styles.detailText}>
                {hotel.mess_included ? "Mess Included" : "No Mess Service"}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <FontAwesome5 
                name={hotel.functional ? "check-circle" : "times-circle"} 
                size={18} 
                color={hotel.functional ? "#28a745" : "#FF6B6B"} 
              />
              <Text style={styles.detailText}>
                {hotel.functional ? "Fully Operational" : "Limited Service"}
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          {/* Description */}
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            {"Experience a comfortable stay at this wonderful hotel located in the heart of " + hotel.city + ". The hotel offers modern amenities and exceptional service to ensure your stay is memorable."}
          </Text>
          
          {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
            style={[styles.actionButton, styles.navigateButton]} 
            onPress={handleNavigate}
        >
            <FontAwesome name="map-marker" size={18} color="#FFF" />
            <Text style={styles.actionButtonText}>Navigate</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
            style={[styles.actionButton, styles.reserveButton]} 
            onPress={() => handleMakeReservation(hotel._id)}
        >
            <FontAwesome5 name="calendar-check" size={18} color="#FFF" />
            <Text style={styles.actionButtonText}>Reserve</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
            style={[styles.actionButton, styles.reviewsButton]} 
            onPress={handleCheckReviews}
        >
            <FontAwesome name="star" size={18} color="#FFF" />
            <Text style={styles.actionButtonText}>Reviews</Text>
        </TouchableOpacity>
        </View>
        </View>
        
        {/* Extra space at bottom for footer */}
        <View style={styles.footerSpace} />
      </ScrollView>
      
      <Footer
        handleProfile={handleProfile}
        handleBack={handleBack}
        cityName={city}
        email={email}
        currentTab={1}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 90,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  backButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  heroImage: {
    width: "100%",
    height: 250,
  },
  infoContainer: {
    padding: 20,
  },
  hotelName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  classBadge: {
    backgroundColor: "#FFEAA7",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  classBadgeText: {
    color: "#D35400",
    fontWeight: "600",
    fontSize: 14,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  locationText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 6,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 15,
  },
  detailsContainer: {
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailText: {
    fontSize: 15,
    color: "#555",
    marginLeft: 12,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 30,
    flex: 1,
    marginHorizontal: 5,
  },
  navigateButton: {
    backgroundColor: "#007BFF",
  },
  reserveButton: {
    backgroundColor: "#28a745",
  },
  reviewsButton: {
    backgroundColor: "#F39C12",
  },
  actionButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 14,
  },
  footerSpace: {
    height: 20,
  },
});