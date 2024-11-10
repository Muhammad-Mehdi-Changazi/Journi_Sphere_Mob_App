// GoogleMapScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../app/types';

type GoogleMapScreenProps = {
    route: RouteProp<RootStackParamList, 'GoogleMap'>;
};

const GOOGLE_API_KEY = 'AIzaSyAUwcgoinASwKDHlKDuW9HvNodSkBz64YI';

const GoogleMapScreen: React.FC<GoogleMapScreenProps> = ({ route }) => {
    const { placeName } = route.params;
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [cityLocation, setCityLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCityCoordinates = async () => {
            try {
                const response = await axios.get(
                    `https://maps.googleapis.com/maps/api/geocode/json?address=${placeName}&key=${GOOGLE_API_KEY}`
                );
                const location = response.data.results[0].geometry.location;
                setCityLocation({
                    latitude: location.lat,
                    longitude: location.lng,
                });
            } catch (error) {
                Alert.alert("Error", "Failed to fetch city location.");
                setLoading(false);
            }
        };

        const fetchUserLocation = () => {
            Geolocation.getCurrentPosition(
                position => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                    setLoading(false);
                },
                error => {
                    Alert.alert("Error", "Failed to get current location.");
                    setLoading(false);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        };

        fetchCityCoordinates();
        fetchUserLocation();
    }, [placeName]);

    if (loading || !userLocation || !cityLocation) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text>Loading map...</Text>
            </View>
        );
    }

    return (
        <MapView
            style={styles.map}
            initialRegion={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
            }}
        >
            <Marker coordinate={userLocation} title="Your Location" />
            <Marker coordinate={cityLocation} title={placeName} />
            <Polyline coordinates={[userLocation, cityLocation]} strokeColor="#007bff" strokeWidth={3} />
        </MapView>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        flex: 1,
    },
});

export default GoogleMapScreen;
