import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, FlatList, Modal } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import io from 'socket.io-client';
import Icon from 'react-native-vector-icons/Ionicons'; // For icons
import { BarChart } from 'react-native-chart-kit';

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
    const [selectedTab, setSelectedTab] = useState<string>("Hotel Details"); // Track selected tab
    const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
    const totalRooms = rooms.length;
    const roomsOccupied = rooms.filter(room => !room.available).length;
    const roomsAvailable = totalRooms - roomsOccupied;  // or filter for 'available'
    // Dummy Data for Reservations
    const [ongoingReservations, setongoingReservations] = useState<number>(5);
    const [futureReservations, setFutureReservations] = useState<number>(15);
    const [historyReservations, setHistoryReservations] = useState<number>(10);
    const [modalVisible, setModalVisible] = useState(false); // For controlling modal visibility



    const handleRoomClick = (room) => {
        setExpandedRoom(room);
        setModalVisible(true); // Show the modal when a room is clicked
    };

    // Graph Data
    const graphData = {
        labels: ['Ongoing', 'Future', 'History'],  // Categories
        datasets: [
            {
                data: [ongoingReservations, futureReservations, historyReservations],  // Values
                color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`,  // Green color for bars
                strokeWidth: 2,
            },
        ],
    };

    const sidebarWidth = windowWidth > 768 && isSidebarOpen ? 250 : 0; // Sidebar width based on screen size and its state


    useEffect(() => {
            socket = io('http://34.226.13.20:3000'); // Connect to Socket.IO server

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
                const hotelResponse: { data: { hotel: HotelDetails } } = await axios.get(`http://localhost:3000/hotels/${hotel_id}`);
                    setHotelDetails(hotelResponse.data.hotel);

                const roomsResponse = await axios.get(`http://localhost:3000/${hotel_id}/rooms`);
                setRooms(roomsResponse.data.rooms);

                const response = await axios.get(`http://34.226.13.20:3000/api/hotels/${username}`);
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

                const response = await axios.get(`http://34.226.13.20:3000/api/reservations/requests`, {
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
            const response = await axios.put(`http://34.226.13.20:3000/api/rooms/${roomId}`, editedRoom);
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

    useEffect(() => {
        const onChange = () => setWindowWidth(Dimensions.get('window').width);
        Dimensions.addEventListener('change', onChange);

        return () => Dimensions.removeEventListener('change', onChange);
    }, []);

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
    // Render content based on the selected screen
    const renderContent = () => {
        switch (activeScreen) {
            case "Hotel Details":
                return hotelDetails && (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Hotel Statistics</Text>
                        <Text style={styles.text}>{hotelDetails.hotel_name}</Text>
                        <Text style={styles.text}>{hotelDetails.complete_address}</Text>

                        {/* Additional Stats */}
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Reservations Overview</Text>
                            <BarChart
                                data={graphData}
                                width={ Dimensions.get('window').width * 0.7 }  // Chart width, with some padding
                                height={220}
                                fromZero={true}
                                chartConfig={{
                                    backgroundColor: '#f0f0f0',
                                    backgroundGradientFrom: '#f0f0f0',
                                    backgroundGradientTo: '#f0f0f0',
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,  // Red text
                                    labelColor: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,  // Red labels
                                    style: {
                                        borderRadius: 16,
                                    },
                                    propsForDots: {
                                        r: '6',
                                        strokeWidth: '2',
                                        stroke: '#ff0000',
                                    },
                                }}
                                style={{
                                    marginVertical: 0,
                                    borderRadius: 16,
                                    marginTop: 10,
                                }}
                            />
                        </View>

                        <View style={styles.statsContainer}>
                            <View style={styles.statColumn}>
                                <Text style={styles.statText}>Total Rooms</Text>
                                <Text style={styles.statValue}>{rooms.length}</Text>
                            </View>
                            <View style={styles.statColumn}>
                                <Text style={styles.statText}>Rooms Occupied</Text>
                                <Text style={styles.statValue}>{roomsOccupied}</Text>
                            </View>
                            <View style={styles.statColumn}>
                                <Text style={styles.statText}>Rooms Available</Text>
                                <Text style={styles.statValue}>{roomsAvailable}</Text>
                            </View>
                            <View style={styles.statColumn}>
                                <Text style={styles.statText}>Payment Dues</Text>
                                <Text style={styles.statValue}>12</Text>
                            </View>
                            <View style={styles.statColumn}>
                                <Text style={styles.statText}>Room Ready</Text>
                                <Text style={styles.statValue}>3</Text>
                            </View>
                        </View>

                    </View>
                );


            case "Offers":
                return (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>{activeScreen}</Text>
                        <Text style={styles.text}>Coming soon...</Text>
                    </View>
                );
            case "Staff Info":
            case "Ongoing Reservations":
            case "Reservation History":
            case "Future Reservations":
            case "Edit Account":
            case "Logout":
                return (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>{activeScreen}</Text>
                        <Text style={styles.text}>Coming soon...</Text>
                    </View>
                );


            case "Edit Room Info":
            case "Room Information":
                return (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Room Information</Text>

                        {/* FlatList to display rooms in a grid of 3 columns */}
                        <FlatList
                            data={rooms}
                            keyExtractor={(item) => item.room_number.toString()}
                            numColumns={3} // Display 3 items per row
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.roomBox,
                                        !item.available && styles.roomUnavailable, // Apply red shade for unavailable rooms
                                    ]}
                                    onPress={() => handleRoomClick(item)} // Handle click to show details in modal
                                >
                                    <Text style={styles.roomText}>Room {item.room_number}</Text>
                                    <Text style={styles.roomStatus}>
                                        Status: {item.available ? 'Available' : 'Occupied'}
                                    </Text>
                                    <Text style={styles.roomStatus}>
                                        Type: {item.room_type}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />

                        {/* Modal for displaying room details */}
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={modalVisible}
                            onRequestClose={() => setModalVisible(false)}
                        >
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalContainer}>
                                    {expandedRoom && (
                                        <>
                                            <Text style={styles.modalTitle}>Room Details</Text>
                                            <Text style={styles.roomDetailText}>Room Type: {expandedRoom.room_type}</Text>
                                            <Text style={styles.roomDetailText}>Rent: {expandedRoom.rent}</Text>
                                            <Text style={styles.roomDetailText}>Available: {expandedRoom.available ? 'Yes' : 'No'}</Text>
                                            <Text style={styles.roomDetailText}>Bed Size: {expandedRoom.bed_size}</Text>
                                        </>
                                    )}
                                    <TouchableOpacity
                                        style={styles.closeButton}
                                        onPress={() => setModalVisible(false)} // Close the modal
                                    >
                                        <Text style={styles.closeButtonText}>Close</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    </View>
                );

            default:
                return null;
        }
    };

    // Function to handle the sidebar close on smaller screens when a tab is selected
    const handleTabSelect = (subItem: string) => {
        setActiveScreen(subItem);
        setSelectedTab(subItem); // Set selected tab color
        if (windowWidth <= 768) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <View style={styles.container}>

            {/* Notification Icon */}
            <View style={[styles.notificationContainer]}>
                <TouchableOpacity style={styles.notificationIcon}>
                    <Icon name="notifications" size={30} color="black" />
                </TouchableOpacity>
            </View>
            {/* Hamburger icon for small screens */}
            {windowWidth <= 768 && !isSidebarOpen && (
                <TouchableOpacity style={styles.hamburgerIcon} onPress={() => setIsSidebarOpen(true)}>
                    <Icon name="menu" size={30} color="black" />
                </TouchableOpacity>
            )}

            {/* Back Arrow to close sidebar */}
            {windowWidth <= 768 && isSidebarOpen && (
                <TouchableOpacity style={styles.arrowIcon} onPress={() => setIsSidebarOpen(false)}>
                    <Icon name="arrow-back" size={30} color="black" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('requests')} style={[styles.tab, activeTab === 'requests' && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>Reservation Requests</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('edit')} style={[styles.tab, activeTab === 'edit' && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === 'edit' && styles.activeTabText]}>Edit Room Info</Text>
                </TouchableOpacity>
            </View>

            {/* Sidebar */}
            <View style={[styles.sidebar, windowWidth > 768 && { position: 'relative', width: '20%' }, isSidebarOpen && { left: 0 }, !isSidebarOpen && { left: -250 }]}>
                {/* Admin Panel Text and Icon */}

                <View style={styles.sidebarHeader}>

                    <Icon style={{ alignSelf: "flex-start" }} name="person-circle" size={50} color="black" />
                    <Text style={styles.sidebarHeaderText}>Hotel Admin Panel</Text>
                </View>


                <TouchableOpacity
                    style={[styles.menuButton, selectedTab === "Hotel Details" && styles.selectedTab]}
                    onPress={() => handleTabSelect("Hotel Details")}
                >
                    <Text style={styles.menuText}>Dashboard</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.menuButton, selectedTab === "Offers" && styles.selectedTab]}
                    onPress={() => handleTabSelect("Offers")}
                >
                    <Text style={styles.menuText}>Offers</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.menuButton, selectedTab === "Staff Info" && styles.selectedTab]}
                    onPress={() => handleTabSelect("Staff Info")}
                >
                    <Text style={styles.menuText}>Staff Info</Text>
                </TouchableOpacity>


                {/* Sidebar Menu */}
                {[{ title: "Rooms", subItems: ["Room Information", "Edit Room Info"] }, { title: "Reservations", subItems: ["Ongoing Reservations", "Reservation History", "Future Reservations"] }, { title: "Account Settings", subItems: ["Edit Account", "Logout"] }].map((menu) => (
                    <View key={menu.title}>
                        <TouchableOpacity
                            style={[styles.menuButton, selectedTab === menu.title && styles.selectedTab]}
                            onPress={() => setExpandedTab(expandedTab === menu.title ? null : menu.title)}
                        >
                            <Text style={styles.menuText}>{menu.title}</Text>
                            <Icon name={expandedTab === menu.title ? "chevron-up" : "chevron-down"} size={20} color="black" />
                        </TouchableOpacity>
                        {expandedTab === menu.title &&
                            menu.subItems.map((subItem) => (
                                <TouchableOpacity
                                    key={subItem}
                                    style={[styles.menuButton, selectedTab === subItem && styles.selectedTab]}
                                    onPress={() => handleTabSelect(subItem)}
                                >
                                    <Text style={styles.subMenuText}>{subItem}</Text>
                                </TouchableOpacity>
                            ))}
                    </View>
                ))}
            </View>

            {/* Main Content */}
            <ScrollView style={[styles.content, windowWidth > 768 ? { flex: 1, paddingLeft: 20 } : { flex: 1, paddingLeft: 20 }]}>
                <Text style={styles.headerText}>Welcome, {username}</Text>
                {renderContent()}
            </ScrollView>
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
    section: {
        padding: 20,
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    roomBox: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        margin: 10,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        height: 120, // Set height to fit the boxes nicely
    },
    roomText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    roomStatus: {
        fontSize: 14,
        color: 'gray',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '40%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    roomDetailText: {
        fontSize: 16,
        marginVertical: 5,
    },
    closeButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#ff0000',
        borderRadius: 5,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, flexDirection: 'row', backgroundColor: '#f4f7fc' },
    notificationContainer: { position: 'absolute', top: 10, right: 10, zIndex: 2 },
    notificationIcon: { padding: 10 },
    sidebar: { backgroundColor: '#f0f0f0', padding: 10, paddingTop: 20, position: 'absolute', top: 0, bottom: 0, left: -250, zIndex: 1, transition: 'left 0.3s' },
    sidebarHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
    sidebarHeaderText: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
    menuButton: { padding: 12, backgroundColor: 'white', marginBottom: 10, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    menuText: { fontSize: 16, color: 'black', textAlign: 'center', paddingLeft: 15 },
    selectedTab: { backgroundColor: '#dcdcdc' },
    text: { fontSize: 16, margin: 5 },
    loadingText: { fontSize: 18 },
    errorText: { fontSize: 18, color: 'red' },
    subMenuText: { fontSize: 16, color: 'black', paddingLeft:15, textAlign: 'center' },
    // roomText: { fontSize: 18 },
    // roomStatus: { fontSize: 14, color: 'gray' },
    roomDetail: { marginTop: 10, padding: 10, backgroundColor: '#f9f9f9' },
    // section: { padding: 20, backgroundColor: 'white', borderRadius: 10, marginBottom: 20 },
    // roomDetailText: { fontSize: 16, marginBottom: 5 },
    headerText: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    hamburgerIcon: { position: 'absolute', top: 20, left: 10, zIndex: 2 },
    arrowIcon: { position: 'absolute', top: 20, left: 200, zIndex: 2 },
    content: { padding: 20, marginTop: 20 },
    // // roomBox: {
    //     padding: 15,
    //     backgroundColor: 'white',
    //     marginBottom: 10,
    //     borderRadius: 10,
    // },
    roomUnavailable: {
        backgroundColor: 'rgba(255, 0, 0, 0.2)', // Red opaque shade
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Allow columns to wrap to the next row if needed
        justifyContent: 'space-between', // Ensure even spacing between columns
        marginTop: 20,  // Optional margin for top space
    },
    statColumn: {
        flex: 1,  // This makes each column take equal space
        alignItems: 'center',  // Center items horizontally within each column
        margin: 5,  // Optional margin between columns
    },
    statText: {
        fontSize: 16,
        color: '#333',  // Color for the label
    },
    statValue: {
        fontSize: 18,
        paddingTop: 25,
        fontWeight: 'bold',
        color: '#f00',  // Color for the stat value (e.g., red)
    },
    chartContainer: {
        paddingTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});

export default HotelAdmin;

