import React, { useState, useEffect } from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, KeyboardAvoidingView,Platform,} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';

export default function ReservationScreen() {
    const { placeName } = useLocalSearchParams<{ placeName: string }>();
    const [hotelData, setHotelData] = useState<any>(null); 
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [roomType, setRoomType] = useState('Single Bed');
    const [errors, setErrors] = useState({ name: '', email: '', phone: '' });

    const [isHotelFound, setIsHotelFound] = useState(false); 

    useEffect(() => {
    const fetchHotelData = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/hotels/${placeName}`);  
            if (response.status === 200) {
                setHotelData(response.data); // Store hotel data in state
                setIsHotelFound(true); 
            }
        } catch (error) {
            setIsHotelFound(false); // Hotel not found
            console.log('Hotel not found:', error);
        }
    };

    if (placeName) {
        fetchHotelData();
    }
}, [placeName]);
    
    const validateFields = () => {
        const newErrors = { name: '', email: '', phone: '' };
        if (!name) newErrors.name = 'Name is required.';
        if (!email) newErrors.email = 'Email is required.';
        if (!phone) newErrors.phone = 'Phone number is required.';
        setErrors(newErrors);

        return !Object.values(newErrors).some((error) => error !== '');
    };

    const handleReservation = () => {
        if (!validateFields()) return;

        const reservationDetails = {
            placeName,
            name,
            email,
            phone,
            roomType,
        };

        console.log('Reservation Details:', reservationDetails);

        Alert.alert(
            'Reservation Successful',
            `Your reservation at ${placeName} for a ${roomType} has been confirmed.`
        );
    };

    // Room images
    const roomImages = {
        'Single Bed': require('./../assets/images/SingleBed.jpeg'),
        'Double Bed': require('./../assets/images/DoubleBed.jpeg'),
        'King Suite': require('../assets/images/KingSuite.jpeg'),
        'Queen Suite': require('../assets/images/QueenSuite.jpeg'),
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.header}>Reserve a Stay at {placeName}</Text>

                {/* Display Hotel Data if Found */}
                <View>
                    {isHotelFound && hotelData ? (
                        <>
                            <Text style={styles.hotelDescription}>{hotelData.description}</Text>
                        </>
                    ) : (
                        <Text style={styles.hotelDescription}>Searching for hotel details...</Text>
                    )}

                    {/* Form for Reservation (same even if hotel is found) */}
                    <View style={styles.inputContainer}>
                        <MaterialIcons name="person" size={20} color="#888" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Your Name"
                            value={name}
                            onChangeText={(text) => {
                                setName(text);
                                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                            }}
                        />
                    </View>
                    {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="email" size={20} color="#888" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Your Email"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                            }}
                        />
                    </View>
                    {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

                    <View style={styles.inputContainer}>
                        <FontAwesome5 name="phone" size={20} color="#888" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Your Phone Number"
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={(text) => {
                                setPhone(text);
                                if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                            }}
                        />
                    </View>
                    {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}

                    {/* Choose Room Type */}
                    <Text style={styles.label}>Choose a Room Type:</Text>

                    {/* Map through rooms from the hotel data */}
                    <View style={styles.roomTypeContainer}>
                        {hotelData.rooms.map((room: any, index: number) => {
                            
                            const roomTypeMapping: { [key: string]: string } = {
                                'Deluxe Twin': 'Double Bed',
                                'Pearl King': 'King Suite',
                                'Standard Queen': 'Queen Suite',
                            };

                            const displayRoomType = roomTypeMapping[room.room_type] || room.room_type; // Default to original if no mapping

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.roomTypeCard, roomType === displayRoomType && styles.selectedCard]}
                                    onPress={() => setRoomType(displayRoomType)} 
                                >
                                    <Image source={roomImages[displayRoomType]} style={styles.roomImage} />
                                    <Text style={styles.roomTypeText}>{displayRoomType}</Text>
                                    <Text style={styles.roomPriceText}>Price: {room.price} PKR</Text>
                                    <Text style={styles.roomAvailabilityText}>Available: {room.available ? 'Yes' : 'No'}</Text>
                                    <Text style={styles.roomAvailabilityText}>Available Rooms: {room.duplicates - room.num_booked}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Confirm Reservation Button */}
                    <TouchableOpacity style={styles.button} onPress={handleReservation}>
                        <Text style={styles.buttonText}>Confirm Reservation</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#f4f4f4',
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    hotelDescription: {
        fontSize: 16,
        color: '#555',
        marginBottom: 20,
        textAlign: 'center',
    },
    roomDetails: {
        marginBottom: 15,
    },
    roomTypeText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 5,
    },
    roomTypeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    roomTypeCard: {
        width: '48%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 15,
        elevation: 5, // Add some shadow for better visual depth
    },
    selectedCard: {
        borderColor: '#007BFF',
        backgroundColor: '#e8f4ff',
    },
    roomImage: {
        width: '100%',
        height: 80,
        borderRadius: 8,
        marginBottom: 10,
    },
    roomTypeText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 5,
    },
    roomPriceText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 5,
    },
    roomAvailabilityText: {
        fontSize: 14,
        color: '#888',
        marginBottom: 5,
    },

    button: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 20,
    },
    input: {
        flex: 1,
        padding: 10,
        fontSize: 16,
        color: '#333',
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        marginBottom: 10,
    },
    icon: {
        marginRight: 10,
    },
});