import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router'; // Use expo-router imports
import ProtectedRoute from './components/protectedroute';

interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  userProfileImage: string; // Adding profile image for the user
}

const STAR_ICON = "★"; // Star icon for rating

// Function to display star rating
const renderStars = (rating: number) => {
  const stars = Array(5).fill(STAR_ICON).map((star, index) =>
    index < rating ? <Text key={index} style={styles.starFilled}>{star}</Text> : <Text key={index} style={styles.starEmpty}>{star}</Text>
  );
  return <View style={styles.ratingContainer}>{stars}</View>;
};

export default function Reviews() {
  const router = useRouter(); // Use expo-router's useRouter for navigation
  const { placeName } = useLocalSearchParams<{ placeName: string }>(); // Use useLocalSearchParams for URL params

  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
    loadUsername();
  }, []);

  // Fetch reviews from the backend
  const fetchReviews = async () => {
    try {
      const response = await axios.get(`https://manzil-sprint1-production.up.railway.app/Reviews?placeName=${placeName}`);
        setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  // Load the username from AsyncStorage
  const loadUsername = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
        console.log('Loaded username:', storedUsername);
      }
    } catch (error) {
      console.error('Error loading username:', error);
    }
  };

  // Submit a new review
  const submitReview = async () => {
    if (!newReview || rating <= 0 || !username) return;

    const token = await AsyncStorage.getItem('authToken');

    if (!token) {
      console.error('User not authenticated');
      return;
    }

    try {
      // Send the review to the backend
      await axios.post(`https://manzil-sprint1-production.up.railway.app/Reviews`, {
        placeName,
        user: username,
        rating,
        comment: newReview,
      });

      setNewReview('');
      setRating(0);
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <Text style={styles.header}>Reviews for {placeName}</Text>
        <FlatList
          data={reviews}
          keyExtractor={(review) => review.id}
          renderItem={({ item }) => (
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Image
                  source={{ uri: item.userProfileImage || 'https://via.placeholder.com/40' }}
                  style={styles.profileImage}
                />
                <Text style={styles.userName}>{item.user}</Text>
              </View>
              {renderStars(item.rating)}
              <Text style={styles.comment}>{item.comment}</Text>
            </View>
          )}
        />
        <Text style={styles.subHeader}>Add a Review</Text>
        <TextInput
          placeholder="Write your review"
          value={newReview}
          onChangeText={setNewReview}
          style={styles.input}
        />
        <TextInput
          placeholder="Rating (1-5)"
          value={rating.toString()}
          onChangeText={(text) => setRating(Number(text))}
          keyboardType="numeric"
          style={styles.input}
        />
        <Button title="Submit" onPress={submitReview} />
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  reviewCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  starFilled: {
    color: '#FFD700',
    fontSize: 18,
  },
  starEmpty: {
    color: '#D3D3D3',
    fontSize: 18,
  },
  comment: {
    fontSize: 14,
    color: '#666',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 8,
    marginBottom: 8,
    borderRadius: 5,
  },
});