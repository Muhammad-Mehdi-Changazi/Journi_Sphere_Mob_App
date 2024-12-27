import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export default function ReservationScreen() {
    const { placeName } = useLocalSearchParams<{ placeName: string }>();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [roomType, setRoomType] = useState('Single Bed');
    const [errors, setErrors] = useState({ name: '', email: '', phone: '' });

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

                <Text style={styles.label}>Choose a Room Type:</Text>
                <View style={styles.roomTypeContainer}>
                    {[
                        'Single Bed',
                        'Double Bed',
                        'King Suite',
                        'Queen Suite',
                    ].map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.roomTypeCard,
                                roomType === type && styles.selectedCard,
                            ]}
                            onPress={() => setRoomType(type)}
                        >
                            <Image
                                source={roomImages[type]} // Use the path to each room's image
                                style={styles.roomImage}
                            />
                            <Text style={styles.roomTypeText}>{type}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.button} onPress={handleReservation}>
                    <Text style={styles.buttonText}>Confirm Reservation</Text>
                </TouchableOpacity>
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    icon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    errorText: {
        fontSize: 14,
        color: '#d9534f',
        marginBottom: 8,
    },
    label: {
        fontSize: 18,
        fontWeight: '600',
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
        padding: 10,
        marginBottom: 10,
    },
    selectedCard: {
        borderColor: '#007BFF',
        backgroundColor: '#e8f4ff',
    },
    roomImage: {
        width: '100%',
        height: 80,
        borderRadius: 5,
        marginBottom: 8,
    },
    roomTypeText: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        color: '#333',
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
});
