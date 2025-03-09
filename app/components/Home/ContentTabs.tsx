// app/components/Home/ContentTabs.tsx
import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import TouristSpotsList from "./TouristSpotsList";
import HotelsList from "./HotelsList";
import FoodRecommendations from "./FoodRecommendations";
import CarRentals from "./CarRentals";
import { styles } from "../../styles/homestyles";

interface ContentTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  loading: boolean;
  touristSpots: any[];
  hotels: any[];
  isSmallScreen: boolean;
  isTallScreen: boolean;
  cityData: { name: string; places: any[]; foods: any[] };
  GOOGLE_API_KEY: string;
  onNavigate: (hotelName: string) => void;
  onCheckReviews: (hotelName: string) => void;
  onMakeReservation: (placeID: string) => void;
}

const tabs = [
  { key: "touristSpots", label: "Tourist Spots" },
  { key: "hotels", label: "Hotels" },
  { key: "food", label: "Food" },
  { key: "carRentals", label: "Car Rentals" },
];

export default function ContentTabs({
  activeTab,
  setActiveTab,
  loading,
  touristSpots,
  hotels,
  isSmallScreen,
  isTallScreen,
  cityData,
  GOOGLE_API_KEY,
  onNavigate,
  onCheckReviews,
  onMakeReservation,
}: ContentTabsProps) {
  const renderContent = () => {
    if (loading) {
      return <Text>Loading...</Text>;
    }
    switch (activeTab) {
      case "touristSpots":
        return <TouristSpotsList touristSpots={touristSpots} cityData={cityData} isTallScreen={isTallScreen} />;
      case "hotels":
        return (
          <HotelsList
            hotels={hotels}
            isSmallScreen={isSmallScreen}
            onNavigate={onNavigate}
            onCheckReviews={onCheckReviews}
            onMakeReservation={onMakeReservation}
          />
        );
      case "food":
        return <FoodRecommendations />;
      case "carRentals":
        return <CarRentals />;
      default:
        return null;
    }
  };

  return (
    <View>
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={activeTab === tab.key ? styles.activeTab : styles.inactiveTab}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={activeTab === tab.key ? styles.activeTabText : styles.inactiveTabText}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {renderContent()}
    </View>
  );
}
