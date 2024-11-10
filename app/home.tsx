// app/HomeScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router'; // Use Expo Router
import ProtectedRoute from './components/protectedroute';
import styles from './styles/homestyles'; // Import the separate styles file

export default function HomeScreen() {
  const router = useRouter(); // Use the useRouter hook from Expo Router

  // List of cities with names and places to pass as parameters
  const cities = [
    {
      name: 'Lahore',
      places: ['Badshahi Mosque', 'Shalimar Gardens', 'Lahore Fort', 'Minar-e-Pakistan', 'Wagah Border', 'Anarkali Bazaar', 'Mall Road'],
      food: ['Phajja Siri Paye', 'Cuckoo\'s Den', 'Butt Karahi', 'Lahore Chatkhara', 'Yasir Broast', 'Food Street Fort Road', 'Bundu Khan'],
    },
    {
      name: 'Islamabad',
      places: ['Faisal Mosque', 'Daman-e-Koh', 'Pakistan Monument', 'Rawal Lake', 'Shah Allah Ditta Caves', 'Saidpur Village', 'Margalla Hills'],
      food: ['Monal Restaurant', 'Street 1 Cafe', 'Butt Karahi', 'Chaye Khana', 'Burning Brownie', 'Des Pardes', 'La Montana'],
    },
    {
      name: 'Karachi',
      places: ['Mazar-e-Quaid', 'Clifton Beach', 'Mohatta Palace', 'Frere Hall', 'Karachi Zoo', 'Churna Island', 'Manora Island'],
      food: ['Kolachi', 'Do Darya', 'Nihari Inn', 'Burns Road', 'BBQ Tonight', 'Meerath Kabab House', 'Boat Basin Food Street'],
    },
    {
      name: 'Skardu',
      places: ['Sheosar Lake', 'Skardu Fort', 'Satpara Lake', 'Shangrila Resort', 'Deosai National Park', 'Katpana Desert', 'Kachura Lake'],
      food: ['Mountain Lodge Restaurant', 'K2 Motel', 'Shangrila Resort Restaurant', 'Baltistan Restaurant', 'Satpara Inn', 'Yak Grill'],
    },
    {
      name: 'Hunza',
      places: ['Attabad Lake', 'Rakaposhi View Point', 'Altit Fort', 'Baltit Fort', 'Passu Cones', 'Borith Lake', 'Eagle\'s Nest'],
      food: ['Hunza Food Pavilion', 'Cafe De Hunza', 'Hidden Paradise Hunza', 'Eagle\'s Nest Hotel', 'Hunza Lounge'],
    },
    {
      name: 'Murree',
      places: ['Mall Road', 'Patriata Chair Lift', 'Pindi Point', 'Kashmir Point', 'Nathia Gali', 'Ayubia National Park'],
      food: ['Red Onion Murree', 'Usmania Restaurant', 'Lalazar Restaurant', 'Punjab Tikka House', 'Kashmir Point Tea Stall'],
    },
    {
      name: 'Peshawar',
      places: ['Qissa Khwani Bazaar', 'Bala Hisar Fort', 'Peshawar Museum', 'Sethi House', 'Islamia College'],
      food: ['Namak Mandi (Chapli Kabab)', 'Peshawar Tikka House', 'Chief Burger', 'Jalil Kabab House', 'Sheraz Restaurant'],
    },
    {
      name: 'Multan',
      places: ['Shrine of Bahauddin Zakariya', 'Tomb of Shah Rukn-e-Alam', 'Hussain Agahi Bazaar', 'Multan Fort', 'Ghanta Ghar'],
      food: ['Multani Sohan Halwa', 'Naan Chanay House', 'Al Shabir Saraye', 'Pizza Eat Multan', 'Usmania Restaurant'],
    },
    {
      name: 'Quetta',
      places: ['Hanna Lake', 'Quaid-e-Azam Residency', 'Ziarat Valley', 'Pir Ghaib Waterfalls', 'Hazar Ganji Chiltan National Park'],
      food: ['Shaikh Jee Sajji House', 'Lehri Sajji House', 'Usmania Tikka House', 'Lal Kabab', 'Pishin Stop (for Chapli Kababs)'],
    },
    {
      name: 'Swat',
      places: ['Malam Jabba', 'Kalam Valley', 'Swat Museum', 'Fizagat Park', 'Mingora', 'Bahrain', 'Shingrai Waterfall'],
      food: ['Green Valley Restaurant', 'Swat Serena Hotel Restaurant', 'Al Harmain', 'Zubair Sweets', 'Malam Jabba Resort Restaurant'],
    },
    {
      name: 'Naran',
      places: ['Saif-ul-Malook Lake', 'Lulusar Lake', 'Ansoo Lake', 'Babusar Top', 'Naran Bazaar'],
      food: ['Moon Restaurant', 'PTDC Motel Naran', 'Mountain Trekkers Hotel & Restaurant', 'Shangrila Restaurant Naran'],
    },
    {
      name: 'Gilgit',
      places: ['Naltar Valley', 'Phander Lake', 'Gilgit Bridge', 'Hushe Valley', 'Karimabad'],
      food: ['Rakaposhi View Point Cafe', 'Gilgit Serena Hotel', 'Karakoram Hotel', 'Silk Route Lodge Restaurant'],
    },
  ];

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <Text style={styles.header}>Popular Cities</Text>
        <View style={styles.citiesContainer}>
          {cities.map((city, index) => (
            <TouchableOpacity
              key={index}
              style={styles.cityButton}
              onPress={() => {
                router.push({
                  pathname: '/CityScreen',
                  params: {
                    city: JSON.stringify({
                      name: city.name,
                      places: city.places,
                      foods: city.food,
                    }),
                  },
                });
              }}
            >
              <Text style={styles.cityText}>{city.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ProtectedRoute>
  );
}


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: '#fff',
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   citiesContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-around',
//     width: '100%',
//   },
//   cityButton: {
//     width: '40%',
//     padding: 16,
//     marginVertical: 8,
//     backgroundColor: '#eee',
//     alignItems: 'center',
//     borderRadius: 8,
//   },
//   cityText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });
