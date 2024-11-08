// GoogleMapScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';

type GoogleMapScreenProps = {
    route: {
        params: {
            city: string;
        };
    };
};

const GOOGLE_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

const GoogleMapScreen: React.FC<GoogleMapScreenProps> = ({ route }) => {
    const { city } = route.params;
    const [userLocation, setUserLocation] = useState(null);
    const [cityLocation, setCityLocation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCityCoordinates = async () => {
            try {
                const response = await axios.get(
                    `https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${GOOGLE_API_KEY}`
                );
                const location = response.data.results[0].geometry.location;
                setCityLocation({
                    latitude: location.lat,
                    longitude: location.lng,
                });
            } catch (error) {
                Alert.alert("Error", "Failed to fetch city location.");
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
    }, [city]);

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
            <Marker coordinate={cityLocation} title={city} />

            {/* Draw a line (route) between user location and city location */}
            <Polyline
                coordinates={[userLocation, cityLocation]}
                strokeColor="#007bff"
                strokeWidth={3}
            />
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
