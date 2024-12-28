import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function HotelAdmin() {
    // Fetch the 'username' parameter from the URL query string
    const { username } = useLocalSearchParams<{ username: string }>();

    useEffect(() => {
        if (username) {
            console.log('Welcome Hotel Admin:', username);
        } else {
            console.log('No username found.');
        }
    }, [username]);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Welcome, {username}!</Text>
            <Text style={styles.text}>You are now logged in as Hotel Admin.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f4f4f4',
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    text: {
        fontSize: 16,
        color: '#555',
    },
});
