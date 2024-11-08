import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../app/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type CityScreenRouteProp = RouteProp<RootStackParamList, 'CityScreen'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CityScreen() {
    const route = useRoute<CityScreenRouteProp>();
    const navigation = useNavigation<NavigationProp>();

    const city = route.params?.city;

    if (!city) {
        return <Text>City information is missing.</Text>;
    }

    // Ensure that city.places is defined and is an array
    const places = city.places || [];

    const handleNavigate = (placeName: string) => {
        navigation.navigate('GoogleMap', { placeName }); // Navigate to GoogleMap screen
    };

    const handleCheckReviews = (placeName: string) => {
        navigation.navigate('Reviews', { placeName }); // Navigate to Reviews screen
    };


    return (
        <ScrollView style={styles.container}>
            <Text style={styles.cityName}>{`City: ${city.name}`}</Text>

            {places.length === 0 ? (
                <Text>No places available in this city.</Text>
            ) : (
                places.map((place, index) => (
                    <View key={index} style={styles.card}>
                        <Image
                            source={{ uri: 'https://via.placeholder.com/150' }} // Placeholder image
                            style={styles.placeImage}
                        />
                        <Text style={styles.placeName}>{place}</Text>

                        <View style={styles.buttonsContainer}>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => handleNavigate(place)} // Navigate to Google Maps
                            >
                                <Text style={styles.buttonText}>Navigate</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => handleCheckReviews(place)} // Navigate to Reviews page
                            >
                                <Text style={styles.buttonText}>Check Reviews</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            )}
        </ScrollView>
    );
}

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
});

