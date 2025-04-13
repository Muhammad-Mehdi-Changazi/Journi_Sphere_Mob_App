import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  Alert,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import ProtectedRoute from "./components/protectedroute";
import Footer from "./components/Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://10.130.218.95:3000";

// Car type colors
const carTypeColors = {
  SUV: "#FFA07A",
  Sedan: "#87CEFA",
  Hatchback: "#A020F0",
  Compact: "#FFD700",
  Luxury: "#DDA0DD",
  Sports: "#FF6347",
  Minivan: "#20B2AA",
  Convertible: "#FF69B4",
  default: "#A8CCF0",
};

const CarRentalDetailsPage = () => {
  const router = useRouter();
  const { rentalId } = useLocalSearchParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [cityName, setCityName] = useState("");
  const [error, setError] = useState(null);

  // Modal state for car booking
  const [selectedCar, setSelectedCar] = useState(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);

  // Load email and last city from AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("email");
        const lastCity = await AsyncStorage.getItem("lastCity");
        if (storedEmail) setEmail(storedEmail);
        if (lastCity) setCityName(lastCity);
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    
    loadUserData();
  }, []);

  // Fetch car rental company details
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!rentalId) {
        setError("No rental company ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/car-rental-companies/${rentalId}`);
        setCompany(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching company details:", error);
        setError("Failed to load company details");
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [rentalId]);

  // Handle booking a car
  const handleBookCar = (car) => {
    setSelectedCar(car);
    Alert.alert(
      "Booking Confirmation",
      `Would you like to book the ${car.model} (${car.type}) for PKR ${car.rent_per_day} per day?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Book Now",
          onPress: () => processBooking(car)
        }
      ]
    );
  };

  // Process the booking
  const processBooking = async (car) => {
    try {
      // Here you would make an API call to book the car
      // For now we'll just show a success message
      Alert.alert(
        "Booking Successful",
        `You have booked the ${car.model} (${car.registration_number}) successfully!`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error booking car:", error);
      Alert.alert("Error", "Failed to book the car. Please try again.");
    }
  };

  // Handle back button
  const handleBack = () => {
    router.back();
  };

  // Handle profile navigation
  const handleProfile = () => {
    router.push({
      pathname: "/Profile",
      params: { email, city: cityName },
    });
  };

  // Render car availability badge
  const renderAvailabilityBadge = (available) => (
    <View style={[styles.availabilityBadge, { backgroundColor: available ? '#4CAF50' : '#F44336' }]}>
      <Text style={styles.availabilityText}>{available ? 'Available' : 'Unavailable'}</Text>
    </View>
  );

  // Get color based on car type
  const getTypeColor = (type) => {
    return carTypeColors[type] || carTypeColors.default;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A8CCF0" />
        <Text>Loading company details...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.companyInfoCard}>
          <Text style={styles.companyName}>{company?.name}</Text>
          <Text style={styles.companyAddress}>
            {company?.location?.address}, {company?.location?.city}
          </Text>
          
          {company?.contact_phone && (
            <Text style={styles.contactInfo}>
              <FontAwesome name="phone" size={16} color="#666" /> {company.contact_phone}
            </Text>
          )}
          
          {company?.contact_email && (
            <Text style={styles.contactInfo}>
              <FontAwesome name="envelope" size={16} color="#666" /> {company.contact_email}
            </Text>
          )}
          
        </View>

        <View style={styles.carsHeader}>
            <Text style={styles.carsTitle}>
                Available Cars ({company?.cars?.filter(car => car.available).length || 0}/{company?.cars?.length || 0})
            </Text>
        </View>

        <FlatList
          data={company?.cars}
          keyExtractor={(item) => item.registration_number}
          renderItem={({ item }) => (
            <View style={styles.carCard}>
              <View style={styles.carInfoContainer}>
                <View style={styles.carBasicInfo}>
                  <Text style={styles.carModel}>{item.model}</Text>
                  <View 
                    style={[styles.carTypeBadge, { backgroundColor: getTypeColor(item.type) }]}
                  >
                    <Text style={styles.carTypeText}>{item.type}</Text>
                  </View>
                  {renderAvailabilityBadge(item.available)}
                </View>
                
                <View style={styles.carDetailsContainer}>
                  <Text style={styles.carRegNumber}>
                    Reg #: {item.registration_number}
                  </Text>
                  <Text style={styles.rentPerDay}>
                    PKR {item.rent_per_day} / day
                  </Text>
                </View>
                
                {item.available && (
                  <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => handleBookCar(item)}
                    disabled={!item.available}
                  >
                    <Text style={styles.bookButtonText}>Book Now</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyListContainer}>
              <Text style={styles.emptyListText}>No cars available at this location</Text>
            </View>
          )}
        />
      </SafeAreaView>
      
      <Footer
        handleProfile={handleProfile}
        handleBack={handleBack}
        cityName={cityName}
        email={email}
        currentTab={1}  // Set to whichever tab is appropriate
      />
    </ProtectedRoute>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#f9f9f9",
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#176FF2',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    flex: 1,
  },
  companyInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'semibold',
    marginBottom: 8,
    color: '#176FF2',
    justifyContent: 'center',
    textAlign: 'center',
    backgroundColor: 'transparent', // Remove background color
  },
  companyAddress: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    marginTop: 8,
  },
  contactInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  carsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  carsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    marginRight: 4,
    color: '#176FF2',
  },
  carCard: {
    backgroundColor: '#fffeee',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  carInfoContainer: {
    flex: 1,
  },
  carBasicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  carModel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  carTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginHorizontal: 6,
  },
  carTypeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  availabilityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  carDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  carRegNumber: {
    fontSize: 14,
    color: '#666',
  },
  rentPerDay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  bookButton: {
    backgroundColor: '#176FF2',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyListContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default CarRentalDetailsPage;