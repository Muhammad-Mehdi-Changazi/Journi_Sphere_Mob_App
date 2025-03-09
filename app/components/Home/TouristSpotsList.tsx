import React from "react";
import { View, FlatList, TouchableOpacity, Image, Text, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { styles } from "../../styles/homestyles";

interface TouristSpotsListProps {
  touristSpots: any[];
  cityData: { name: string; places: any[]; foods: any[] };
  isTallScreen: boolean;
}

export default function TouristSpotsList({ touristSpots, cityData, isTallScreen }: TouristSpotsListProps) {
  const router = useRouter();
  const screenHeight = Dimensions.get("window").height;

  const handleViewSpot = (spotName: string) => {
    router.push({
      pathname: "/TouristSpotScreen",
      params: { city: cityData.name, spotName },
    });
  };

  const handleNavigate = (spotName: string) => {
    router.push(`/GoogleMapScreen?placeName=${encodeURIComponent(spotName)}`);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.placeUnderlay, isTallScreen && { marginBottom: 15 + 0.25 * screenHeight }]}>
      <TouchableOpacity style={styles.placeCard2} onPress={() => handleViewSpot(item.name)}>
        <Image source={{ uri: item.image }} style={styles.placeImage} />
        <View style={[styles.placeOverlay2, { width: 90 }]}>
          <Text style={styles.placeName2}>{item.name}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button2, isTallScreen && { marginTop: screenHeight * 0.01, height: 25 }]} onPress={() => handleNavigate(item.name)}>
        <Text style={styles.buttonText}>Navigation</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={touristSpots.touristSpots}
      horizontal
      keyExtractor={(item) => (item._id ? item._id.toString() : item.name)}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
    />
  );
}
