import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Dimensions } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';

const { height } = Dimensions.get('window');
const MAP_HEIGHT = height * 0.65; // Map takes ~65% of screen height

const GOOGLE_API_KEY = 'AIzaSyDx_TwV8vhwbKTTWn0tV2BVRDGIipfwzlc';

type Coordinates = {
  latitude: number;
  longitude: number;
};

export default function GoogleMapScreen() {
  const { placeName } = useLocalSearchParams<{ placeName: string }>();
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [userAddress, setUserAddress] = useState<string>('Fetching location...');
  const [destinationLocation, setDestinationLocation] = useState<Coordinates | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinates[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission to access location was denied');
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const userCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setUserLocation(userCoords);

        // Reverse Geocoding - Get Address
        const geoReverseResponse = await axios.get(
          'https://maps.googleapis.com/maps/api/geocode/json',
          {
            params: {
              latlng: `${userCoords.latitude},${userCoords.longitude}`,
              key: GOOGLE_API_KEY,
            },
          }
        );

        if (geoReverseResponse.data.status === 'OK') {
          const address = geoReverseResponse.data.results[0].formatted_address;
          setUserAddress(address);
        } else {
          setUserAddress('Unknown Location');
        }

        // Geocode destination
        const geoResponse = await axios.get(
          'https://maps.googleapis.com/maps/api/geocode/json',
          { params: { address: placeName, key: GOOGLE_API_KEY } }
        );

        if (geoResponse.data.status !== 'OK') throw new Error('Location not found');

        const destCoords = geoResponse.data.results[0].geometry.location;
        const destination = { latitude: destCoords.lat, longitude: destCoords.lng };
        setDestinationLocation(destination);

        // Fetch directions
        const dirResponse = await axios.get(
          'https://maps.googleapis.com/maps/api/directions/json',
          {
            params: {
              origin: `${userCoords.latitude},${userCoords.longitude}`,
              destination: `${destination.latitude},${destination.longitude}`,
              key: GOOGLE_API_KEY,
              mode: 'driving',
            },
          }
        );

        if (dirResponse.data.status !== 'OK') throw new Error('Directions not available');

        const points = dirResponse.data.routes[0].overview_polyline.points;
        setRouteCoordinates(decodePolyline(points));
      } catch (err) {
        Alert.alert('Error', err.message || 'Something went wrong');
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [placeName]);

  const decodePolyline = (encoded: string) => {
    let index = 0;
    const len = encoded.length;
    const array = [];
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      array.push({
        latitude: lat * 1e-5,
        longitude: lng * 1e-5,
      });
    }
    return array;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading map...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map Section */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation!.latitude,
          longitude: userLocation!.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker coordinate={userLocation!} title="Your Location" pinColor="blue" />
        <Marker coordinate={destinationLocation!} title={placeName || 'Destination'} />
        {routeCoordinates.length > 0 && (
          <Polyline coordinates={routeCoordinates} strokeColor="#007bff" strokeWidth={4} />
        )}
      </MapView>

      {/* Bottom Container */}
      <View style={styles.bottomContainer}>
        <Text style={styles.destinationText}>{placeName}</Text>
        <Text style={styles.label}>Your Location</Text>
        <Text style={styles.locationText}>{userAddress}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: MAP_HEIGHT, 
  },
  bottomContainer: {
    height: '35%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -2 },
  },
  destinationText: {
    fontSize: 25,
    fontWeight: 'semibold',
    color: '#000',
    fontFamily: 'Abhaya Libre Medium',
  },
  label: {
    fontSize: 14,
    color: 'gray',
    marginTop: 75,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    marginTop: 2,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '10%',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    padding: 20,
  },
});

