import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import io from 'socket.io-client';

let socket;

export default function ReservationScreen() {
    const { placeName } = useLocalSearchParams<{ placeName: string }>();
    const [hotelDetails, setHotelDetails] = useState<{ rooms: any[] } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [roomType, setRoomType] = useState('');
    const [errors, setErrors] = useState({ name: '', email: '', phone: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        socket = io('https://manzil-sprint1-production.up.railway.app'); // Connect to the Socket.IO server

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
                if (!placeName) {
                    throw new Error('placeName is missing.');
                }

                const response = await axios.get(`https://manzil-sprint1-production.up.railway.app/api/hotels/${placeName}`);
                setHotelDetails(response.data.hotel);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.error || err.message);
                setLoading(false);
            }
        };

        fetchHotelDetails();
    }, [placeName]);

    const handleReservation = async () => {
        if (!validateFields()) return;

        const reservationDetails = {
            reservationDetails: {  // Wrap the reservation data under reservationDetails
                placeName,
                name,
                email,
                phone,
                roomType,
            },
        };
        console.log(reservationDetails);

        try {
            // Send reservation details to the backend
            const response = await axios.post('https://manzil-sprint1-production.up.railway.app/api/reservations', reservationDetails);
            
            console.log('Reservation Response:', response.data);

            // Emit the reservation details to the Socket.IO server
            socket.emit('new-reservation', reservationDetails);

            Alert.alert(
                'Reservation Successful',
                `Your reservation at ${placeName} for a ${roomType} has been confirmed.`
            );

            // Reset fields after reservation
            setName('');
            setEmail('');
            setPhone('');
            setRoomType('');
        } catch (error) {
            console.error('Error making reservation:', error);
            Alert.alert('Reservation Failed', 'An error occurred while making the reservation.');
        }
    };

    const validateFields = () => {
        const newErrors = { name: '', email: '', phone: '' };
        if (!name) newErrors.name = 'Name is required.';
        if (!email) newErrors.email = 'Email is required.';
        if (!phone) newErrors.phone = 'Phone number is required.';
        setErrors(newErrors);

        return !Object.values(newErrors).some((error) => error !== '');
    };

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
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <Text style={styles.header}>Reserve a Stay at {placeName}</Text>

                <View>
                    {hotelDetails && hotelDetails.description ? (
                        <Text style={styles.hotelDescription}>{hotelDetails.description}</Text>
                    ) : null}

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="person" size={24} color="#007bff" style={styles.icon} />
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
                        <MaterialIcons name="email" size={24} color="#007bff" style={styles.icon} />
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
                        <FontAwesome5 name="phone" size={24} color="#007bff" style={styles.icon} />
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

                    <Text style={styles.label}>Choose a Room Type:</Text>

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
                                </TouchableOpacity>
                            );
                        })}
                    </View>

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
        backgroundColor: '#f7f7f7',
    },
    header: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    hotelDescription: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        marginBottom: 20,
        paddingBottom: 8,
    },
    input: {
        flex: 1,
        padding: 14,
        fontSize: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
        color: '#333',
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        marginBottom: 10,
        textAlign: 'center',
    },
    roomTypeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    roomTypeCard: {
        width: '48%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 15,
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedCard: {
        borderColor: '#007bff',
        backgroundColor: '#e7f3ff',
    },
    roomImage: {
        width: 130,
        height: 100,
        borderRadius: 8,
        marginBottom: 10,
    },
    roomTypeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    roomPriceText: {
        fontSize: 14,
        color: '#555',
    },
    roomAvailabilityText: {
        fontSize: 12,
        color: '#777',
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 15,
        fontWeight: 'bold',
    },
    loadingText: {
        fontSize: 18,
        color: '#777',
        textAlign: 'center',
        marginTop: 20,
    },
});
