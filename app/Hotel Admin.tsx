import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Button } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';

export default function HotelAdmin() {
    const { username } = useLocalSearchParams<{ username: string }>();
    const [hotelDetails, setHotelDetails] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('rooms');
    const [editedRoom, setEditedRoom] = useState(null);
    const [reservationRequests, setReservationRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHotelDetails = async () => {
            try {
                if (!username) {
                    throw new Error('Username is missing.');
                }

                // Fetch hotel details from the backend
                const response = await axios.get(`http://localhost:3000/api/hotels/admin/${username}`);
                setHotelDetails(response.data.hotel);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.error || err.message);
                setLoading(false);
            }
        };

        const fetchReservationRequests = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/reservations/requests/${username}`);
                setReservationRequests(response.data.requests);
            } catch (err) {
                console.error('Failed to fetch reservation requests', err);
            }
        };

        fetchHotelDetails();
        fetchReservationRequests();
    }, [username]);

    useEffect(() => {
        if (hotelDetails) {
            console.log(hotelDetails.rooms); // Check if rooms data is available
        }
    }, [hotelDetails]);

    const handleEditRoom = async (roomId) => {
        try {
            const response = await axios.put(`http://localhost:3000/api/rooms/${roomId}`, editedRoom);
            setHotelDetails(prevDetails => ({
                ...prevDetails,
                rooms: prevDetails.rooms.map(room =>
                    room._id === roomId ? response.data.room : room
                ),
            }));
            setEditedRoom(null); // Clear the form
        } catch (err) {
            console.error('Error updating room details', err);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
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
            <Text style={styles.header}>Welcome, {username}!</Text>

            {/* Tab Navigation */}
            <View style={styles.tabs}>
                <TouchableOpacity onPress={() => setActiveTab('rooms')} style={styles.tab}>
                    <Text style={activeTab === 'rooms' ? styles.activeTabText : styles.tabText}>Rooms</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('requests')} style={styles.tab}>
                    <Text style={activeTab === 'requests' ? styles.activeTabText : styles.tabText}>Reservation Requests</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('edit')} style={styles.tab}>
                    <Text style={activeTab === 'edit' ? styles.activeTabText : styles.tabText}>Edit Room Info</Text>
                </TouchableOpacity>
            </View>

            {/* Hotel Information */}
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Hotel Information</Text>
                <Text style={styles.text}>Hotel Name: <Text style={styles.bold}>{hotelDetails.hotel_name}</Text></Text>
                <Text style={styles.text}>Location: {`${hotelDetails.location.address}, ${hotelDetails.location.city}, ${hotelDetails.location.country}`}</Text>
                <Text style={styles.text}>Description: {hotelDetails.description}</Text>
            </View>

            {/* Rooms Tab */}
            {activeTab === 'rooms' && (
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Room Information</Text>
                    {hotelDetails.rooms?.length > 0 ? (
                        hotelDetails.rooms.map((room, index) => (
                            <View key={index} style={styles.roomCard}>
                                <Text style={styles.roomHeader}>Room {room.room_number}</Text>
                                <Text style={styles.text}>Type: {room.room_type}</Text>
                                <Text style={styles.text}>Capacity: {room.capacity}</Text>
                                <Text style={styles.text}>Price: ${room.price}</Text>
                                <Text style={[styles.text, room.available ? styles.available : styles.notAvailable]}>
                                    Status: {room.available ? 'Available' : 'Not Available'}
                                </Text>
                                <Text style={styles.text}>Duplicates: {room.duplicates}</Text>
                                <Text style={styles.text}>Booked: {room.num_booked}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.text}>No rooms available</Text>
                    )}
                </View>
            )}

            {/* Reservation Requests Tab */}
            {activeTab === 'requests' && (
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Reservation Requests</Text>
                    {reservationRequests.length > 0 ? (
                        reservationRequests.map((request, index) => (
                            <View key={index} style={styles.requestCard}>
                                <Text style={styles.text}>User: {request.user}</Text>
                                <Text style={styles.text}>Room: {request.room}</Text>
                                <Text style={styles.text}>Date: {request.date}</Text>
                                <Text style={styles.text}>Status: {request.status}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.text}>No reservation requests</Text>
                    )}
                </View>
            )}

            {/* Edit Room Info Tab */}
            {activeTab === 'edit' && (
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Edit Room Information</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Room Number"
                        value={editedRoom?.room_number || ''}
                        onChangeText={(text) => setEditedRoom({ ...editedRoom, room_number: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Capacity"
                        keyboardType="number-pad"
                        value={editedRoom?.capacity || ''}
                        onChangeText={(text) => setEditedRoom({ ...editedRoom, capacity: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Price"
                        keyboardType="number-pad"
                        value={editedRoom?.price || ''}
                        onChangeText={(text) => setEditedRoom({ ...editedRoom, price: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Status"
                        value={editedRoom?.status || ''}
                        onChangeText={(text) => setEditedRoom({ ...editedRoom, status: text })}
                    />
                    <Button title="Update Room" onPress={() => handleEditRoom(editedRoom?._id)} />
                </View>
            )}

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f4f4f4',
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    tabs: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        backgroundColor: '#ddd',
        marginRight: 5,
    },
    activeTabText: {
        fontWeight: 'bold',
        color: '#007bff',
    },
    tabText: {
        color: '#333',
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    text: {
        fontSize: 14,
        color: '#555',
        marginBottom: 6,
    },
    bold: {
        fontWeight: 'bold',
    },
    available: {
        color: 'green',
    },
    notAvailable: {
        color: 'red',
    },
    roomCard: {
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    roomHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    requestCard: {
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    loadingText: {
        fontSize: 18,
        color: '#666',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
    },
});
