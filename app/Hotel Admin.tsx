import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Button } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import io from 'socket.io-client';

let socket;

export default function HotelAdmin() {
    const { username } = useLocalSearchParams<{ username: string }>();
    const [hotelDetails, setHotelDetails] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('rooms');
    const [editedRoom, setEditedRoom] = useState(null);
    const [reservationRequests, setReservationRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        socket = io('https://manzil-sprint1-production.up.railway.app'); // Connect to Socket.IO server

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
                if (!username) {
                    throw new Error('Username is missing.');
                }

                const response = await axios.get(`https://manzil-sprint1-production.up.railway.app/api/hotels/${username}`);
                setHotelDetails(response.data.hotel);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.error || err.message);
                setLoading(false);
            }
        };

        const fetchReservationRequests = async () => {
            try {
                if (!hotelDetails?.hotel_name) {
                    throw new Error('Hotel name is missing');
                }

                const response = await axios.get(`https://manzil-sprint1-production.up.railway.app/api/reservations/requests`, {
                    params: { hotelName: hotelDetails.hotel_name }
                });

                setReservationRequests(response.data.requests);
            } catch (err) {
                console.error('Failed to fetch reservation requests', err);
            }
        };

        fetchHotelDetails();

        // Fetch reservation requests after hotel details are fetched
        if (hotelDetails?.hotel_name) {
            fetchReservationRequests();
        }

        // Listen for real-time reservation updates
        socket.on('reservation-updated', (reservation) => {
            try {
                setReservationRequests((prevRequests) => [...prevRequests, reservation]);
            } catch (err) {
                console.error('Error handling reservation update', err);
            }
        });

        return () => {
            socket.off('reservation-updated');
        };
    }, [username, hotelDetails]);

    const handleEditRoom = async (roomId) => {
        try {
            const response = await axios.put(`https://manzil-sprint1-production.up.railway.app/api/rooms/${roomId}`, editedRoom);
            setHotelDetails((prevDetails) => ({
                ...prevDetails,
                rooms: prevDetails.rooms.map((room) =>
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
                <TouchableOpacity onPress={() => setActiveTab('rooms')} style={[styles.tab, activeTab === 'rooms' && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === 'rooms' && styles.activeTabText]}>Rooms</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('requests')} style={[styles.tab, activeTab === 'requests' && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>Reservation Requests</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('edit')} style={[styles.tab, activeTab === 'edit' && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === 'edit' && styles.activeTabText]}>Edit Room Info</Text>
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
                    <Text style={styles.sectionHeader}>Rooms</Text>
                    {hotelDetails.rooms && hotelDetails.rooms.length > 0 ? (
    hotelDetails.rooms.map((room, index) => (
        <View key={room._id || index} style={styles.roomCard}>
            <Text style={styles.roomHeader}>Room Type: {room.room_type}</Text>
            <Text style={styles.text}>Price: PKR {room.price}</Text>
            <Text style={styles.text}>Available: {room.available ? 'Yes' : 'No'}</Text>
            <Text style={styles.text}>Duplicates: {room.duplicates}</Text>
            <Text style={styles.text}>Number Booked: {room.num_booked}</Text>
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
                        reservationRequests.map((reservation, index) => (
                            <View key={index} style={styles.requestCard}>
                                <Text style={styles.text}>Name: {reservation.name}</Text>
                                <Text style={styles.text}>Email: {reservation.email}</Text>
                                <Text style={styles.text}>Phone: {reservation.phone}</Text>
                                <Text style={styles.text}>Room Type: {reservation.roomType}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.text}>No reservation requests</Text>
                    )}
                </View>
            )}
            {activeTab === 'edit' && (
    <View style={styles.section}>
        <Text style={styles.sectionHeader}>Edit Room Info</Text>
        {hotelDetails.rooms && hotelDetails.rooms.length > 0 ? (
            hotelDetails.rooms.map((room, index) => (
                <TouchableOpacity
                    key={room._id || index}
                    style={styles.roomCard}
                    onPress={() => setEditedRoom(room)}
                >
                    <Text style={styles.roomHeader}>Room Type: {room.room_type}</Text>
                    <Text style={styles.text}>Price: PKR {room.price}</Text>
                    <Text style={styles.text}>Available: {room.available ? 'Yes' : 'No'}</Text>
                    <Text style={styles.text}>Duplicates: {room.duplicates}</Text>
                </TouchableOpacity>
            ))
        ) : (
            <Text style={styles.text}>No rooms available</Text>
        )}
        {editedRoom && (
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Editing Room: {editedRoom.room_type}</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Price"
                    keyboardType="numeric"
                    value={String(editedRoom.price)}
                    onChangeText={(value) =>
                        setEditedRoom({ ...editedRoom, price: parseFloat(value) })
                    }
                />
                <TextInput
                    style={styles.input}
                    placeholder="Duplicates"
                    keyboardType="numeric"
                    value={String(editedRoom.duplicates)}
                    onChangeText={(value) =>
                        setEditedRoom({ ...editedRoom, duplicates: parseInt(value, 10) })
                    }
                />
                <TouchableOpacity
                    style={[styles.tab, { backgroundColor: editedRoom.available ? 'green' : 'red' }]}
                    onPress={() =>
                        setEditedRoom((prev) => ({ ...prev, available: !prev.available }))
                    }
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                        Available: {editedRoom.available ? 'Yes' : 'No'}
                    </Text>
                </TouchableOpacity>
                <Button
                    title="Save Changes"
                    onPress={() => handleEditRoom(editedRoom._id)}
                />
            </View>
        )}
    </View>
)}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f7fc',
        padding: 15,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    tabs: {
        flexDirection: 'row',
        marginBottom: 15,
        justifyContent: 'center',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#EAEFF1',
        marginHorizontal: 5,
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#007bff',
    },
    activeTabText: {
        color: 'white',
        fontWeight: 'bold',
    },
    tabText: {
        color: '#333',
    },
    section: {
        marginBottom: 25,
    },
    sectionHeader: {
        fontSize: 22,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    text: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
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
        padding: 15,
        marginBottom: 18,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    roomHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    requestCard: {
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 18,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,
    },
    input: {
        height: 45,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingLeft: 12,
        marginBottom: 12,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    loadingText: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginTop: 30,
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
        marginTop: 30,
    },
});
