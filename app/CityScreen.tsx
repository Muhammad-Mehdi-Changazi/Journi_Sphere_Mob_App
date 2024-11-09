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

    // Ensure that city.places and city.food are defined and are arrays
    const places = city.places || [];
    const food = city.foods || [];

    const handleNavigate = (placeName: string) => {
        console.log(placeName)
        navigation.navigate('GoogleMap', {placeName}); // Navigate to GoogleMap screen
    };

    const handleCheckReviews = (placeName: string) => {
        console.log(placeName); // Debugging: Check if placeName is logged
        navigation.navigate('Reviews', {placeName}); // Navigate to Reviews page
    };


    const renderItem = (placeName: string, type: 'places' | 'foods') => (
        <View style={styles.card} key={placeName}> {/* Added key prop here */}
            <Image
                source={{ uri: 'https://via.placeholder.com/150' }} // Placeholder image
                style={styles.placeImage}
            />
            <Text style={styles.placeName}>{placeName}</Text>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleNavigate(placeName)} // Navigate to Google Maps
                >
                    <Text style={styles.buttonText}>Navigate</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleCheckReviews(placeName)} // Navigate to Reviews page
                >
                    <Text style={styles.buttonText}>Check Reviews</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.cityName}>{`City: ${city.name}`}</Text>

            <View style={styles.columnsContainer}>
                {/* Tourist Sites Column */}
                <View style={styles.column}>
                    <Text style={styles.columnTitle}>Tourist Sites</Text>
                    {places.length === 0 ? (
                        <Text>No places available in this city.</Text>
                    ) : (
                        places.map((place) => renderItem(place, 'places'))
                    )}
                </View>

                {/* Food Options Column */}
                <View style={styles.column}>
                    <Text style={styles.columnTitle}>Food Options</Text>
                    {food.length === 0 ? (
                        <Text>No food options available in this city.</Text>
                    ) : (
                        food.map((foodItem) => renderItem(foodItem, 'foods'))
                    )}
                </View>
            </View>
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
});
