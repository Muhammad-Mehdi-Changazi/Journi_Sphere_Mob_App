import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router'; // Use expo-router imports
import ProtectedRoute from './components/protectedroute';

interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
}


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
      const response = await axios.get(`https://test-production-5b7f.up.railway.app/Reviews?placeName=${placeName}`);
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
      await axios.post('http://localhost:3000/Reviews', {
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
          <View style={styles.review}>
            <Text style={styles.user}>{item.user}</Text>
            <Text>Rating: {item.rating}</Text>
            <Text>{item.comment}</Text>
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
  },
  review: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  user: {
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 8,
    marginBottom: 8,
    borderRadius: 5,
  },
});
