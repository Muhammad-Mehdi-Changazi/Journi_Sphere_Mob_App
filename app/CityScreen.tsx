import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../app/types';

type CityScreenRouteProp = RouteProp<RootStackParamList, 'CityScreen'>;

type CityScreenProps = {
    route: CityScreenRouteProp;
};

const CityScreen = ({ route }: CityScreenProps) => {
    const { city } = route.params; // Destructuring to get the city object
    const { cityName, places } = city; // Extracting cityName and places from the city object

    // Log the params to the console
    useEffect(() => {
        console.log('CityScreen Params:', route.params);
    }, [route.params]);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>{cityName}</Text>
            <View>
                {places.map((place, index) => (
                    <Text key={index} style={styles.placeText}>
                        {place}
                    </Text>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    placeText: {
        fontSize: 18,
        marginVertical: 5,
    },
});

export default CityScreen;
