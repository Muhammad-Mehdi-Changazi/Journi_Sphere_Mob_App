import React from "react";
import { FlatList, View, Text, TouchableOpacity } from "react-native";
import { styles } from "../../styles/homestyles";

interface HotelsListProps {
  hotels: any[];
  isSmallScreen: boolean;
  onNavigate: (hotelName: string) => void;
  onCheckReviews: (hotelName: string) => void;
  onMakeReservation: (placeID: string) => void;
}

export default function HotelsList({ hotels, isSmallScreen, onNavigate, onCheckReviews, onMakeReservation }: HotelsListProps) {
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.hotelPlaceName}>{item.hotel_name}</Text>
      <Text style={styles.hotelDetails}>{item.complete_address}</Text>
      <Text style={styles.hotelDetails}>{item.hotel_class} Hotel</Text>
      <View style={[styles.buttonsContainer, isSmallScreen && { flexDirection: "column", alignItems: "stretch" }]}>
        <TouchableOpacity style={[styles.button, isSmallScreen && { width: "100%", marginBottom: 8 }]} onPress={() => onNavigate(item.hotel_name)}>
          <Text style={styles.buttonText}>Navigate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, isSmallScreen && { width: "100%", marginBottom: 8 }]} onPress={() => onCheckReviews(item.hotel_name)}>
          <Text style={styles.buttonText}>Check Reviews</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, isSmallScreen && { width: "100%" }]} onPress={() => onMakeReservation(item._id)}>
          <Text style={styles.buttonText}>Make Reservation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={hotels}
      keyExtractor={(item) => (item._id ? item._id.toString() : item.hotel_name)}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
    />
  );
}
