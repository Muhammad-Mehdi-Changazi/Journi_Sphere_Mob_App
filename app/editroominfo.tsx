import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import axios from 'axios';

interface Room {
    _id: string;
    room_type: string;
    room_number: number;
    rent: number;
    available: boolean;
    bed_size: string;
}

const EditRoomInfo = ({ hotel_id }: { hotel_id: string }) => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [updatedRoom, setUpdatedRoom] = useState<Partial<Room>>({});

    // Fetch all rooms from backend
    useEffect(() => {
        console.log("Hotel ID:", hotel_id);
        const fetchRooms = async () => {
            try {
                const response = await axios.get(`http://34.226.13.20:3000/${hotel_id}/rooms`);
                setRooms(response.data.rooms);
            } catch (error) {
                console.error("Error fetching rooms:", error);
            }
        };

        fetchRooms();
    }, [hotel_id]);

    // Handle edit button click
    const handleEdit = (room: Room) => {
        setSelectedRoom(room);
        setUpdatedRoom(room); // Pre-fill with existing room data
        setModalVisible(true);
    };

    // Handle update API request
    const handleUpdateRoom = async () => {
        if (!selectedRoom) return;
        try {
            const response = await axios.put(`http://34.226.13.20:3000/editroominfo/${selectedRoom._id}`, updatedRoom);
            console.log("Room updated successfully:", response.data);

            // Update the room list
            setRooms(rooms.map(room => (room._id === selectedRoom._id ? { ...room, ...updatedRoom } : room)));

            setModalVisible(false);
            setSelectedRoom(null);
        } catch (error) {
            console.error("Error updating room:", error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Edit Room Information</Text>

            {/* Room List */}
            <FlatList
                data={rooms}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.roomItem} onPress={() => handleEdit(item)}>
                        <Text style={styles.roomText}>Room {item.room_number} - {item.room_type}</Text>
                        <Text style={styles.roomText}>Rent: ${item.rent} | {item.available ? 'Available' : 'Occupied'}</Text>
                    </TouchableOpacity>
                )}
            />

            {/* Edit Room Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Edit Room</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Room Type"
                            value={updatedRoom.room_type}
                            onChangeText={(text) => setUpdatedRoom({ ...updatedRoom, room_type: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Rent"
                            keyboardType="numeric"
                            value={updatedRoom.rent?.toString()}
                            onChangeText={(text) => setUpdatedRoom({ ...updatedRoom, rent: parseFloat(text) })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Bed Size"
                            value={updatedRoom.bed_size}
                            onChangeText={(text) => setUpdatedRoom({ ...updatedRoom, bed_size: text })}
                        />

                        <TouchableOpacity
                            style={[styles.availabilityButton, updatedRoom.available ? styles.available : styles.unavailable]}
                            onPress={() => setUpdatedRoom({ ...updatedRoom, available: !updatedRoom.available })}
                        >
                            <Text style={styles.buttonText}>{updatedRoom.available ? "Available" : "Occupied"}</Text>
                        </TouchableOpacity>

                        {/* Update & Close Buttons */}
                        <View style={styles.buttonRow}>
                            <Button title="Update" onPress={handleUpdateRoom} />
                            <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f4f7fc' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    roomItem: { padding: 15, backgroundColor: 'white', marginBottom: 10, borderRadius: 10 },
    roomText: { fontSize: 16 },

    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContainer: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%', alignItems: 'center' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },

    input: { width: '100%', padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 10 },
    availabilityButton: { padding: 10, borderRadius: 5, marginBottom: 10 },
    available: { backgroundColor: 'green' },
    unavailable: { backgroundColor: 'red' },
    buttonText: { color: 'white', fontSize: 16, textAlign: 'center' },

    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
});

export default EditRoomInfo;
