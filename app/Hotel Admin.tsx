import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import io from 'socket.io-client';
import Icon from 'react-native-vector-icons/Ionicons'; // For icons

let socket;

function HotelAdmin() {
    const { username, hotel_id } = useLocalSearchParams<{ username: string; hotel_id: string }>();

    // Define types
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

    // State Variables
    const [hotelDetails, setHotelDetails] = useState<HotelDetails | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [reservations, setReservations] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeScreen, setActiveScreen] = useState<string>("Hotel Details");
    const [expandedTab, setExpandedTab] = useState<string | null>(null); // Track expanded menu
    const [isSidebarOpen, setIsSidebarOpen] = useState(Dimensions.get('window').width > 768); // Show sidebar only on large screens
    const [expandedRoom, setExpandedRoom] = useState<Room | null>(null);

    const windowWidth = Dimensions.get('window').width;

    useEffect(() => {
        // Connect to Socket.IO server
        socket = io('http://localhost:3000');

        socket.on('connect', () => console.log('Connected to Socket.IO server'));
        socket.on('disconnect', () => console.log('Disconnected from Socket.IO server'));

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const fetchHotelData = async () => {
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

        fetchHotelData();
    }, [hotel_id]);

    if (loading) {
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.loadingText}>Loading hotel and room details...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        );
    }

    // Render content based on the selected screen
    const renderContent = () => {
        switch (activeScreen) {
            case "Hotel Details":
                return hotelDetails && (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Hotel Information</Text>
                        <Text style={styles.text}>Name: {hotelDetails.hotel_name}</Text>
                        <Text style={styles.text}>Location: {hotelDetails.complete_address}</Text>
                        <Text style={styles.text}>City: {hotelDetails.city}</Text>
                        <Text style={styles.text}>Class: {hotelDetails.hotel_class}</Text>
                        <Text style={styles.text}>Functional: {hotelDetails.functional ? 'Yes' : 'No'}</Text>
                    </View>
                );

            case "Room Information":
                return (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Room Information</Text>
                        <FlatList
                            data={rooms}
                            keyExtractor={(item) => item.room_number.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.roomBox}
                                    onPress={() => setExpandedRoom(expandedRoom?.room_number === item.room_number ? null : item)}
                                >
                                    <Text style={styles.roomText}>Room {item.room_number}</Text>
                                    <Text style={styles.roomStatus}>Status: {item.available ? 'Available' : 'Occupied'}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        {expandedRoom && (
                            <View style={styles.roomDetail}>
                                <Text style={styles.roomDetailText}>Room Type: {expandedRoom.room_type}</Text>
                                <Text style={styles.roomDetailText}>Rent: ${expandedRoom.rent}</Text>
                                <Text style={styles.roomDetailText}>Available: {expandedRoom.available ? 'Yes' : 'No'}</Text>
                                <Text style={styles.roomDetailText}>Bed Size: {expandedRoom.bed_size}</Text>
                            </View>
                        )}
                    </View>
                );

            case "Ongoing Reservations":
            case "Reservation History":
            case "Future Reservations":
                return (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>{activeScreen}</Text>
                        {reservations.length > 0 ? (
                            reservations.map((res) => (
                                <View key={res.id} style={styles.room}>
                                    <Text style={styles.text}>Guest: {res.guestName}</Text>
                                    <Text style={styles.text}>Room: {res.roomNumber}</Text>
                                    <Text style={styles.text}>Check-in: {res.checkInDate}</Text>
                                    <Text style={styles.text}>Check-out: {res.checkOutDate}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.text}>No reservations available.</Text>
                        )}
                    </View>
                );

            case "Account Settings":
                return <Text style={styles.text}>Account settings go here...</Text>;

            default:
                return null;
        }
    };

    // Function to handle the sidebar close on smaller screens when a tab is selected
    const handleTabSelect = (subItem: string) => {
        setActiveScreen(subItem);
        if (windowWidth <= 768) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Hamburger Menu Button (only for small screens) */}
            {windowWidth <= 768 && (
                <TouchableOpacity style={styles.hamburger} onPress={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <Icon name={isSidebarOpen ? "" : "menu"} size={30} color="black" />
                </TouchableOpacity>
            )}

            {/* Sidebar */}
            <View style={[styles.sidebar, windowWidth > 768 && { position: 'relative', width: '20%' }, isSidebarOpen && { left: 0 }, !isSidebarOpen && { left: -250 }]}>
                {/* Close Button (only for small screens) */}
                {windowWidth <= 768 && (
                    <TouchableOpacity style={styles.closeButton} onPress={() => setIsSidebarOpen(false)}>
                        <Icon name="arrow-back" size={25} color="black" />
                    </TouchableOpacity>
                )}

                {[{ title: "Dashboard", subItems: ["Hotel Details"] },
                { title: "Room", subItems: ["Room Information", "Edit Room Info"] },
                { title: "Reservations", subItems: ["Ongoing Reservations", "Reservation History", "Future Reservations"] },
                { title: "Account Settings", subItems: ["Edit Account", "Logout"] },
                ].map((menu) => (
                    <View key={menu.title}>
                        <TouchableOpacity
                            style={styles.menuButton}
                            onPress={() => setExpandedTab(expandedTab === menu.title ? null : menu.title)}
                        >
                            <Text style={styles.menuText}>{menu.title}</Text>
                            <Icon name={expandedTab === menu.title ? "chevron-up" : "chevron-down"} size={20} color="black" />
                        </TouchableOpacity>
                        {expandedTab === menu.title &&
                            menu.subItems.map((subItem) => (
                                <TouchableOpacity key={subItem} style={styles.menuButton} onPress={() => handleTabSelect(subItem)}>
                                    <Text style={styles.subMenuText}>{subItem}</Text>
                                </TouchableOpacity>
                            ))}
                    </View>
                ))}
            </View>

            {/* Main Content */}
            <ScrollView
                style={[styles.content, windowWidth > 768 ? { flex: 1, paddingLeft: 20 } : { flex: 1, paddingLeft: 20 }]}
                contentContainerStyle={windowWidth <= 768 ? { flex: 1, alignItems: 'center' } : {}}
            >
                <Text style={styles.header}>Hotel Admin Panel</Text>
                <Text style={styles.subHeader}>Welcome, {username}</Text>
                {renderContent()}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, flexDirection: 'row', backgroundColor: '#f4f7fc' },
    centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    hamburger: { position: 'absolute', top: 10, left: 10, zIndex: 2 },
    sidebar: { backgroundColor: '#f0f0f0', padding: 20, position: 'absolute', top: 0, bottom: 0, left: -250, zIndex: 1, transition: 'left 0.3s' },
    closeButton: { alignSelf: 'flex-end', marginBottom: 20 },
    menuButton: { padding: 15, backgroundColor: 'white', marginBottom: 10, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sectionHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    loadingText: { fontSize: 16, margin: 10 },
    errorText: { color: 'red', fontSize: 16, margin: 10 },
    section: { marginBottom: 20, padding: 10, backgroundColor: 'white', borderRadius: 5 },
    menuText: { fontSize: 16, color: 'black' },
    subMenuText: { fontSize: 14, color: 'black', marginLeft: 20 },
    text: { fontSize: 16, margin: 10 },
    subHeader: { fontSize: 18, fontWeight: 'bold', margin: 10 },
    room: { marginBottom: 10, padding: 10, backgroundColor: '#e0e0e0', borderRadius: 5 },
    header: { fontSize: 24, fontWeight: 'bold', margin: 10 },
    content: { flex: 1, paddingLeft: 60, paddingRight: 20, paddingTop: 20 },
    roomBox: { width: '100%', padding: 15, backgroundColor: '#e0e0e0', borderRadius: 5, marginBottom: 10, justifyContent: 'center', alignItems: 'center' },
    roomText: { fontSize: 16, color: 'black' },
    roomStatus: { fontSize: 14, color: 'gray' },
    roomDetail: { marginTop: 20, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 5 },
    roomDetailText: { fontSize: 16, marginBottom: 5 },
});

export default HotelAdmin;
