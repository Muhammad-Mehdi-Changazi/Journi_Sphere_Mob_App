import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Button, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export default function HotelAdmin() {
    const { placeName } = useLocalSearchParams<{ placeName: string }>();
    const [hotelDetails, setHotelDetails] = useState<{ rooms: any[] } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [roomType, setRoomType] = useState('');
    const [errors, setErrors] = useState({ name: '', email: '', phone: '' });
    const [reservationRequests, setReservationRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHotelDetails = async () => {
            try {
                if (!placeName) {
                    throw new Error('placeName is missing.');
                }

                // Fetch hotel details from the backend
                const response = await axios.get(`http://localhost:3000/api/hotels/admin/${placeName}`);
                setHotelDetails(response.data.hotel);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.error || err.message);
                setLoading(false);
            }
        };


        fetchHotelDetails();

    }, [placeName]);

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

    const validateFields = () => {
        const newErrors = { name: '', email: '', phone: '' };
        if (!name) newErrors.name = 'Name is required.';
        if (!email) newErrors.email = 'Email is required.';
        if (!phone) newErrors.phone = 'Phone number is required.';
        setErrors(newErrors);

        return !Object.values(newErrors).some((error) => error !== '');
    };

    // Room images
    const roomImages = {
        'Single Bed': require('./../assets/images/SingleBed.jpeg'),
        'Double Bed': require('./../assets/images/DoubleBed.jpeg'),
        'King Suite': require('../assets/images/KingSuite.jpeg'),
        'Queen Suite': require('../assets/images/QueenSuite.jpeg'),
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
                    {hotelDetails && hotelDetails.description ? (
                        <Text style={styles.hotelDescription}>{hotelDetails.description}</Text>
                    ) : null}

                    {/* Form for Reservation */}
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
                        {hotelDetails?.rooms?.map((room, index) => {
                            const roomTypeMapping = {
                                'Deluxe Twin': 'Double Bed',
                                'Pearl King': 'King Suite',
                                'Standard Queen': 'Queen Suite',
                            };

                            const displayRoomType = roomTypeMapping[room.room_type] || room.room_type;

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.roomTypeCard, roomType === displayRoomType && styles.selectedCard]}
                                    onPress={() => setRoomType(displayRoomType)}
                                >
                                    <Image source={roomImages[displayRoomType]} style={styles.roomImage} />
                                    <Text style={styles.roomTypeText}>{displayRoomType}</Text>
                                    <Text style={styles.roomPriceText}>Price: {room.price} PKR</Text>
                                    <Text style={styles.roomAvailabilityText}>
                                        Available: {room.available ? 'Yes' : 'No'}
                                    </Text>
                                    <Text style={styles.roomAvailabilityText}>
                                        Available Rooms: {room.duplicates - room.num_booked}
                                    </Text>
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
        elevation: 2,
    },
    selectedCard: {
        borderColor: '#007bff',
        backgroundColor: '#e7f3ff',
    },
    roomImage: {
        width: 100,
        height: 100,
        marginBottom: 10,
        borderRadius: 8,
    },
    roomTypeText: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
    },
    roomPriceText: {
        fontSize: 14,
        color: '#777',
    },
    roomAvailabilityText: {
        fontSize: 12,
        color: '#555',
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
    },
});
