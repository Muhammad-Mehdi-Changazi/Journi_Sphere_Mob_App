import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Dimensions,
  Alert,
  Image,
  FlatList,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import ProtectedRoute from "./components/protectedroute";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "./styles/profilestyles";
import Footer from "./components/Footer";
import { ScrollView } from "react-native";
import Constants from "expo-constants";
import Reviews from './Reviews';

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL ?? '';

interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  placeName: string
}

const STAR_ICON = "★";

const renderStars = (rating: number, setRating?: (value: number) => void) => {
  return (
    <View style={styles.ratingContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => setRating && setRating(star)}>
          <Text style={star <= rating ? styles.starFilled : styles.starEmpty}>{STAR_ICON}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("updateProfile");
  const [reviews, setReviews] = useState<Review[]>([]);
  const { email, city } = useLocalSearchParams(); // Get params from URL

  // API URL – replace with your IP for local testing, or use production URL
  const API_BASE_URL = "http://34.226.13.20:3000";

  // Load user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem("username");
        const storedEmail = await AsyncStorage.getItem("email");
        const response = await axios.get(`${API_BASE_URL}/api/user/?email=${storedEmail}`);
        setUserData(response.data);
        setConfirmPassword(userData.password);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
    fetchReviews();
  }, []);

// load Reviews
  useEffect(() => {
    if (activeTab !== "reviews" || !userData?.email) return;
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/api/Reviews/?email=${userData.email}`)
      .then((response) => {
        if (response.data) {
          setReviews(response.data);
        } else {
          setReviews([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching reviews:", error);
        setReviews([]);
        setLoading(false);
      });
  }, [activeTab, userData.email]);
  
  // load Car rentals
  useEffect(() => {
    if (activeTab !== "rentals" || !userData?.email) return;
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/api/user-car-rentals/?email=${userData.email}`)
      .then((response) => {
        if (response.data) {
          setRentals(response.data);
        } else {
          setRentals([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching rentals:", error);
        setRentals([]);
        setLoading(false);
      });
  }, [activeTab, userData.email]);
  
  // load Reservations
  useEffect(() => {
    if (activeTab !== "reservations" || !userData?.email) return;
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/api/reservations-by-email/?email=${userData.email}`)
      .then((response) => {
        if (response.data) {
          setReservations(response.data);
        } else {
          setReservations([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching reservations:", error);
        setReservations([]);
        setLoading(false);
      });
  }, [activeTab, userData.email]);
  
  // handler for homepage routing
  const handleBack = (city: string) => {
    console.log()
    router.push({
      pathname: "/home",
      params: { city: `{\"name\":\"${city}\",\"places\":[],\"foods\":[]}` },
    });
  };
  // Handle updating the profile.
  const handleUpdateProfile = async () => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/user/?email=${userData.email}`,
        userData
      );
      console.log(response.data);
      Alert.alert("Success", "Profile updated successfully!");
      // Assuming the backend returns the updated profile data in response.data.updatedProfile
      const updatedProfile = response.data.updatedProfile;
      // Update the state.
      setUserData(updatedProfile);
      // Update AsyncStorage with new values.
      await AsyncStorage.setItem("username", updatedProfile.username);
      await AsyncStorage.setItem("email", updatedProfile.email);
      await AsyncStorage.setItem("password", updatedProfile.password);
    } catch (error: unknown) {
      let errorMessage = "Profile update failed!";
      if (axios.isAxiosError(error)) {
        errorMessage =
          (error.response && error.response.data) || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Error updating profile:", errorMessage);
      Alert.alert("Error", errorMessage);
    }
  };

  // Render content based on the active tab.
  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#A8CCF0" />;
    }
    if (activeTab === "updateProfile") {
      return (
        <View style={{ padding: 20, marginTop:30 }}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={userData.username}
            onChangeText={(text) =>
              setUserData((prev) => ({ ...prev, username: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={userData.email}
            onChangeText={(text) =>
              setUserData((prev) => ({ ...prev, email: text }))
            }
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={userData.password}
            onChangeText={(text) =>
              setUserData((prev) => ({ ...prev, password: text }))
            }
            secureTextEntry
          />
          <TouchableOpacity
            style={styles.button3}

            onPress={handleUpdateProfile}
          >
            <Text style={styles.buttonText}>Update Profile</Text>
          </TouchableOpacity>
        </View>
      );
    } else if (activeTab === "reservations") {
      return (
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <Text>Reservations coming soon!!!</Text>
        </View>
      );
    } else if (activeTab === "reviews") {
      return (
        <View style={styles.reviews_container}>
        <ProtectedRoute>
          <View style={{ marginTop: 15, padding: 5, marginBottom: 10 }}>
            <Text style= {styles.sectionTitle_review}>Your experiences:</Text>
          </View>
            <FlatList showsVerticalScrollIndicator={false}
              data={reviews}
              keyExtractor={(review) => review.id}
              renderItem={({ item }) => (
                <View style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.userName}>{item.placeName}</Text>
                  </View>
                  {renderStars(item.rating)}
                  <Text style={styles.comment}>{item.comment}</Text>
                </View>
              )}
            />
        </ProtectedRoute>
        </View>
      );
    } else if (activeTab === "favourites") {
      return (
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <Text>Favourites coming soon!!!</Text>
        </View>
      );
    }
  };

return (
  <ProtectedRoute>
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Hi <Text style={styles.sectionTitle2}>{userData.username}!</Text></Text>
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => router.push('/')}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
        {/* Tiny "My Trips" button */}
        <TouchableOpacity
          style={styles.myTripsButton}
          onPress={() => router.push("/mytrips")}
        >
          <Text style={styles.myTripsButtonText}>My Trips</Text>
        </TouchableOpacity>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScrollView}>
        <TouchableOpacity
          style={activeTab === "updateProfile" ? styles.activeTab : styles.inactiveTab}
          onPress={() => setActiveTab("updateProfile")}
        >
          <Text style={activeTab === "updateProfile" ? styles.activeTabText : styles.inactiveTabText}>
            Update Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={activeTab === "reservations" ? styles.activeTab : styles.inactiveTab}
          onPress={() => setActiveTab("reservations")}
        >
          <Text style={activeTab === "reservations" ? styles.activeTabText : styles.inactiveTabText}>
            Reservations
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={activeTab === "reviews" ? styles.activeTab : styles.inactiveTab}
          onPress={() => setActiveTab("reviews")}
        >
          <Text style={activeTab === "reviews" ? styles.activeTabText : styles.inactiveTabText}>
            Reviews
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={activeTab === "favourites" ? styles.activeTab : styles.inactiveTab}
          onPress={() => setActiveTab("favourites")}
        >
          <Text style={activeTab === "favourites" ? styles.activeTabText : styles.inactiveTabText}>
            Favourites
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {renderContent()}
      
    </View>
    
    <Footer
      handleProfile={()=>{
        console.log("Already on Profile")
      }}
      handleBack={handleBack}
      cityName={city as string}
      email={email as string}
      currentTab={2}
    />
  </ProtectedRoute>

);}
