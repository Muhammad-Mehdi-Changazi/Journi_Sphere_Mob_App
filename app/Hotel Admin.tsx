import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import io from 'socket.io-client';

let socket;

export default function HotelAdmin() {
    const { username, hotel_id } = useLocalSearchParams<{ username: string, hotel_id: string }>();

    const [hotelDetails, setHotelDetails] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('details');  // Default to Hotel Details
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        socket = io('http://localhost:3000');

        socket.on('connect', () => console.log('Connected to Socket.IO server'));
        socket.on('disconnect', () => console.log('Disconnected from Socket.IO server'));

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const fetchHotelDetails = async () => {
            try {
                if (!hotel_id) throw new Error('Hotel ID is missing.');
                console.log('Fetching hotel details for hotel ID:', hotel_id);
                
                const response = await axios.get(`http://localhost:3000/api/hotels/${hotel_id}`);
                setHotelDetails(response.data.hotel);
                console.log('Hotel details:', response.data.hotel);
                setLoading(false); // Data has been fetched, set loading to false
            } catch (err) {
                setError(err.response?.data?.error || err.message);
                setLoading(false); // Stop loading even if there is an error
            }
        };

        fetchHotelDetails();
        console.log("hotelDetails:", hotelDetails);
    }, [hotel_id]);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.loadingText}>Loading hotel details...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* <Header /> */}
            <Text style={styles.header}></Text>

            {/* Tab Navigation */}
            <View style={styles.tabs}>
                <TouchableOpacity onPress={() => setActiveTab('details')} style={[styles.tab, activeTab === 'details' && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>Hotel Details</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('rooms')} style={[styles.tab, activeTab === 'rooms' && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === 'rooms' && styles.activeTabText]}>Rooms</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('requests')} style={[styles.tab, activeTab === 'requests' && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>Reservations</Text>
                </TouchableOpacity>
            </View>

            {/* Hotel Details Tab */}
            {activeTab === 'details' && hotelDetails && (
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Hotel Information</Text>
                    <Text style={styles.text}>
                        Hotel Name: <Text style={styles.bold}>{hotelDetails.hotel_name}</Text>
                    </Text>
                    <Text style={styles.text}>
                        Location: {`${hotelDetails.complete_address}, ${hotelDetails.city}`}
                    </Text>
                    <Text style={styles.text}>
                        Longitude: {hotelDetails.longitude}
                    </Text>
                    <Text style={styles.text}>
                        Latitude: {hotelDetails.latitude}
                    </Text>
                    <Text style={styles.text}>
                        Room Types: {hotelDetails.room_types.join(', ')}
                    </Text>
                    <Text style={styles.text}>
                        Number of Rooms: {hotelDetails.number_of_rooms}
                    </Text>
                    <Text style={styles.text}>
                        Hotel Class: {hotelDetails.hotel_class}
                    </Text>
                    <Text style={styles.text}>
                        Functional: {hotelDetails.functional ? 'Yes' : 'No'}
                    </Text>
                    <Text style={styles.text}>
                        Mess Included: {hotelDetails.mess_included ? 'Yes' : 'No'}
                    </Text>
                </View>
            )}

            {/* Rooms Tab - Placeholder */}
            {activeTab === 'rooms' && (
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Rooms</Text>
                    <Text style={styles.text}>Rooms info will be displayed here.</Text>
                </View>
            )}

            {/* Reservation Requests Tab - Placeholder */}
            {activeTab === 'requests' && (
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Reservation Requests</Text>
                    <Text style={styles.text}>Reservation requests will be displayed here.</Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f7fc', padding: 15 },
    header: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 20 },
    tabs: { flexDirection: 'row', marginBottom: 15, justifyContent: 'center' },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: '#EAEFF1', marginHorizontal: 5, borderRadius: 8 },
    activeTab: { backgroundColor: '#007bff' },
    activeTabText: { color: 'white', fontWeight: 'bold' },
    text: { fontSize: 16, color: '#555', marginBottom: 8 },
    section: { marginBottom: 25 },
    sectionHeader: { fontSize: 22, fontWeight: '600', color: '#333', marginBottom: 12 },
    roomCard: { backgroundColor: '#fff', padding: 15, marginBottom: 18, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, elevation: 5 },
    loadingText: { fontSize: 18, color: '#666', textAlign: 'center', marginTop: 30 },
    errorText: { fontSize: 18, color: 'red', textAlign: 'center', marginTop: 30 },
});
