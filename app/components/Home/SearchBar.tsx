// app/components/SearchBar.tsx
import React from "react";
import { View, TextInput, ActivityIndicator, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { styles } from "../../styles/homestyles";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  loading: boolean;
}

export default function SearchBar({ searchQuery, onSearchChange, loading }: SearchBarProps) {
  return (
    <View style={styles.searchContainer}>
      <FontAwesome name="search" size={20} color="#999" style={styles.searchIcon} />
      <TextInput
        style={styles.searchBar}
        placeholder="Find things here..."
        value={searchQuery}
        onChangeText={onSearchChange}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {loading && <ActivityIndicator size="small" color="#A8CCF0" style={styles.searchLoader} />}
    </View>
  );
}
