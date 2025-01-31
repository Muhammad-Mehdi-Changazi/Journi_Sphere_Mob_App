import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import io from 'socket.io-client';

let socket;

export default function HotelAdmin() {
    const { username, hotel_id } = useLocalSearchParams<{ username: string; hotel_id: string }>();
    interface HotelDetails {
        hotel_name: string;
        complete_address: string;
        city: string;
        hotel_class: string;
        functional: boolean;
    }

    interface Room {
        room_type: string;
        room_number: number;
        rent: number;
        available: boolean;
        bed_size: string;
    }

    const [hotelDetails, setHotelDetails] = useState<HotelDetails | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Connect to Socket.IO server
        socket = io('http://localhost:3000');

        socket.on('connect', () => {
            console.log('Connected to Socket.IO server');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from Socket.IO server');
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const fetchHotelDetails = async () => {
            try {
                const hotelResponse = await axios.get(`http://localhost:3000/hotels/${hotel_id}`);
                setHotelDetails(hotelResponse.data.hotel);

                const roomsResponse = await axios.get(`http://localhost:3000/${hotel_id}/rooms`);
                setRooms(roomsResponse.data.rooms);

                setLoading(false);
            } catch (err) {
                setError('Error fetching data');
                setLoading(false);
            }
        };

        fetchHotelDetails();
    }, [hotel_id]);

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading hotel and room details...</Text>
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
            <Text style={styles.header}>Hotel Admin Panel</Text>
            <Text style={styles.subHeader}>Welcome, {username}</Text>

            {/* Hotel Information */}
            {hotelDetails && (
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Hotel Information</Text>
                    <Text style={styles.text}>Name: {hotelDetails.hotel_name}</Text>
                    <Text style={styles.text}>Location: {hotelDetails.complete_address}</Text>
                    <Text style={styles.text}>City: {hotelDetails.city}</Text>
                    <Text style={styles.text}>Class: {hotelDetails.hotel_class}</Text>
                    <Text style={styles.text}>Functional: {hotelDetails.functional ? 'Yes' : 'No'}</Text>
                </View>
            )}

            {/* Room Information */}
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Room Information</Text>
                {rooms.length > 0 ? (
                    rooms.map((room) => (
                        <View key={room.room_number} style={styles.room}>
                            <Text style={styles.text}>Room Type: {room.room_type}</Text>
                            <Text style={styles.text}>Room Number: {room.room_number}</Text>
                            <Text style={styles.text}>Rent: ${room.rent}</Text>
                            <Text style={styles.text}>Available: {room.available ? 'Yes' : 'No'}</Text>
                            <Text style={styles.text}>Bed Size: {room.bed_size}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.text}>No rooms available for this hotel.</Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#f4f7fc',
    },
    loadingText: {
        fontSize: 18,
        color: '#555',
        textAlign: 'center',
        marginTop: 20,
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subHeader: {
        fontSize: 18,
        color: '#555',
        marginBottom: 15,
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    text: {
        fontSize: 16,
        marginBottom: 6,
    },
    section: {
        marginBottom: 20,
    },
    room: {
        marginBottom: 15,
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
});
