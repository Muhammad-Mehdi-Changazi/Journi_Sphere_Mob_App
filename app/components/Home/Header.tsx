// app/components/Header.tsx
import React from "react";
import { View, Text } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { styles, pickerSelectStyles } from "../../styles/homestyles";

interface HeaderProps {
  cityData: { name: string; places: any[]; foods: any[] };
  selectedCity: string;
  onCityChange: (value: string) => void;
  temperature: string | null;
}

export default function Header({ cityData, selectedCity, onCityChange, temperature }: HeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Explore</Text>
      <Text style={styles.cityName}>{cityData.name}</Text>
      <RNPickerSelect
        onValueChange={onCityChange}
        items={[
          { label: "Islamabad", value: "Islamabad" },
          { label: "Karachi", value: "Karachi" },
          { label: "Lahore", value: "Lahore" },
          { label: "Quetta", value: "Quetta" },
        ]}
        value={selectedCity}
        style={pickerSelectStyles}
      />
      <View style={styles.temperature}>
        <Text style={styles.temperature}>{temperature ? `~ ${temperature}` : "Loading..."}</Text>
      </View>
    </View>
  );
}
