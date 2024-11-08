import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../app/types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  // List of cities with names and places to pass as parameters
  const cities = [
    { name: 'Lahore', places: ['Badshahi Mosque', 'Shalimar Gardens'] },
    { name: 'Islamabad', places: ['Faisal Mosque', 'Daman-e-Koh'] },
    { name: 'Karachi', places: ['Mazar-e-Quaid', 'Clifton Beach'] },
    { name: 'Skardu', places: ['Sheosar Lake', 'Skardu Fort'] },
    { name: 'Hunza', places: ['Attabad Lake', 'Rakaposhi View Point'] },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Popular Cities</Text>
      <View style={styles.citiesContainer}>
        {cities.map((city, index) => (
          <TouchableOpacity
            key={index}
            style={styles.cityButton}
            onPress={() => {
              // Navigate to CityScreen with city parameters
              navigation.navigate('CityScreen', {
                city: {
                  name: city.name,  // Use 'name' instead of 'cityName' if that’s what the type expects
                  places: city.places,
                },
              });
            }}
          >
            <Text style={styles.cityText}>{city.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

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
  citiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
  },
  cityButton: {
    width: '40%',
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#eee',
    alignItems: 'center',
    borderRadius: 8,
  },
  cityText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
