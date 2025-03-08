// app/TripItineraryScreen.tsx
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  StyleSheet,
} from "react-native";
import itineraryStyles from "./styles/itineraryStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function TripItineraryScreen() {
  const params = useLocalSearchParams();
  const [itinerary, setItinerary] = useState("");
  const [loading, setLoading] = useState(false);

  // State for modal to save itinerary
  const [modalVisible, setModalVisible] = useState(false);
  const [itineraryName, setItineraryName] = useState("");

  // Function to fetch/generate itinerary from Gemini API
  const fetchItinerary = async () => {
    setLoading(true);
    const prompt = `
      Create a detailed trip itinerary from ${params.from} to ${params.to}
      from ${params.startDate} to ${params.endDate}.
      Modes of transport include ${params.transport}.

      The itinerary should be structured day by day and should only include:
      - Morning, afternoon, and evening plans
      - Accommodation recommendations (given at end of each day)
      - Meal recommendations (if relevant)
      - Places to visit with estimated times

      STRICT INSTRUCTIONS:
      - Do NOT add any extra text, summaries, disclaimers, or travel advice.
      - Do NOT include any introductions or closing statements.
      - Do NOT include "This itinerary allows you to..." or similar sentences.
      - Only output the itinerary with proper day-wise structuring.
      - If trip is beyond 7 days. Just answer: "AI Trip Planning feature is currently limited to 7 days."

      Format the itinerary clearly with "Day X:" for each day.
    `;
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBkgLBRXEfnqb0IFKf7On2tY3bpK-DEc_g",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.error.message}`);
      }

      const responseData = await response.json();
      if (
        responseData.candidates &&
        responseData.candidates.length > 0 &&
        responseData.candidates[0].content &&
        responseData.candidates[0].content.parts
      ) {
        setItinerary(responseData.candidates[0].content.parts[0].text);
      } else {
        throw new Error("No valid response returned from Gemini API.");
      }
    } catch (error) {
      console.error("Error fetching itinerary:", error.message);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // On component mount, fetch the itinerary
  useEffect(() => {
    fetchItinerary();
  }, [params.from, params.to, params.startDate, params.endDate, params.transport]);

  // Handler for "Regenerate Plan" button
  const handleRegenerate = () => {
    fetchItinerary();
  };

  // Handler for "Save Itinerary" button: open modal to ask for a name
  const handleSaveItinerary = () => {
    setModalVisible(true);
  };

  // Handler when user confirms saving itinerary
  const handleConfirmSave = async () => {
    // Retrieve the unique username from AsyncStorage
    const username = await AsyncStorage.getItem("username");
    if (!username) {
      Alert.alert("Error", "User not found. Please log in again.");
      return;
    }
    try {
      const response = await axios.post("http://34.226.13.20:3000/itinerary/save", {
        username, // Using username as unique identifier
        name: itineraryName,
        content: itinerary,
      });
      if (response.status === 201) {
        Alert.alert("Success", `Itinerary saved as "${response.data.itinerary.name}"!`);
        setModalVisible(false);
        setItineraryName("");
      } else {
        throw new Error("Failed to save itinerary");
      }
    } catch (error) {
      console.error("Error saving itinerary:", error.message);
      Alert.alert("Error", error.message);
    }
  };

  // Render formatted itinerary by removing asterisks and applying heuristics
  const renderFormattedItinerary = () => {
    const cleanedItinerary = itinerary.replace(/\*/g, "");
    const lines = cleanedItinerary.split("\n");
    return lines.map((line, index) => {
      const cleanedLine = line.trim();
      if (/^Day\s*\d+/i.test(cleanedLine)) {
        return (
          <Text key={index} style={itineraryStyles.dayTitle}>
            {cleanedLine}
          </Text>
        );
      } else if (/(morning|afternoon|evening)/i.test(cleanedLine)) {
        return (
          <Text key={index} style={itineraryStyles.sectionTitle}>
            {cleanedLine}
          </Text>
        );
      } else if (cleanedLine.toLowerCase().includes("accommodation:")) {
        return (
          <Text key={index} style={itineraryStyles.accommodation}>
            {cleanedLine}
          </Text>
        );
      } else {
        return (
          <Text key={index} style={itineraryStyles.text}>
            {cleanedLine}
          </Text>
        );
      }
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={itineraryStyles.container}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <Text style={itineraryStyles.title}>Your Itinerary</Text>
        {loading ? <ActivityIndicator size="large" /> : renderFormattedItinerary()}
      </ScrollView>

      {/* Fixed footer with buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={handleRegenerate}>
          <Text style={styles.footerButtonText}>Regenerate Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={handleSaveItinerary}>
          <Text style={styles.footerButtonText}>Save Itinerary</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for saving itinerary */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.modalContent}>
            <Text style={modalStyles.modalHeader}>Save Itinerary</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="Enter itinerary name"
              value={itineraryName}
              onChangeText={setItineraryName}
            />
            <View style={modalStyles.buttonsContainer}>
              <TouchableOpacity style={modalStyles.modalButton} onPress={handleConfirmSave}>
                <Text style={modalStyles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modalStyles.modalButton} onPress={() => setModalVisible(false)}>
                <Text style={modalStyles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 10,
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 5,
    alignItems: "center",
  },
  footerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

const modalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalHeader: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
