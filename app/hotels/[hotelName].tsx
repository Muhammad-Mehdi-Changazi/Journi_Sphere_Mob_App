import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';

interface Location {
  address: string;
  city: string;
  country: string;
}

interface Hotel {
  hotel_name: string;
  location: Location;
  description: string;
}

interface Room {
  room_type: string;
  description: string;
}

const Hotel: React.FC = () => {
  const { hotelName } = useLocalSearchParams<{ hotelName: string }>();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        console.log(hotelName);
        const hotelResponse = await axios.get(`http://localhost:3000/api/hotels/${hotelName}`);
        setHotel(hotelResponse.data);

        const roomsResponse = await axios.get(`http://localhost:3000/api/rooms/hotel/${hotelName}`);
        setRooms(roomsResponse.data);
      } catch (error) {
        console.error('Error fetching hotel or room data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotelData();
  }, [hotelName]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!hotel) {
    return <Text style={styles.errorText}>Hotel not found.</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.placeName}>{hotel.hotel_name}</Text>
        <Text>
          <Text style={styles.columnTitle}>Location:</Text> {hotel.location.address}, {hotel.location.city},{' '}
          {hotel.location.country}
        </Text>
        <Text style={{ marginTop: 8 }}>{hotel.description}</Text>
      </View>

      <Text style={styles.cityName}>Rooms</Text>
      {rooms.map((room, index) => (
        <View style={styles.card} key={index}>
          <Text style={styles.placeName}>{room.room_type}</Text>
          <Text>{room.description}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  cityName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  columnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    marginHorizontal: 8,
  },
  columnTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  placeName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    fontSize: 18,
    marginTop: 20,
  },
});

export default Hotel;
