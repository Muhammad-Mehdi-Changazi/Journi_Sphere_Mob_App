import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';

interface Reservation {
    _id: string;
    customer_name: string;
    CNIC: string;
    phone_number: string;
    email: string;
    reservation_date: { from: string; to: string };
    reservationStatus: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
}

interface ReservationRequestsProps {
    status: string | string[];
    hotel_id: string; // Added hotel_id prop
}

export default function ReservationRequests({ status, hotel_id }: ReservationRequestsProps) {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReservations = async () => {
            console.log("hotel_id", hotel_id);
            try {
                const statusQuery = Array.isArray(status) ? status.join(",") : status;
                const response = await axios.get(`http://localhost:3000/GetReservations?status=${statusQuery}&hotel_id=${hotel_id}`);
                setReservations(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching reservations:", error);
                setError("Failed to fetch reservations.");
                setLoading(false);
            }
        };

        fetchReservations();
    }, [status, hotel_id]);

    const updateReservationStatus = async (id: string, newStatus: "CONFIRMED" | "CANCELLED") => {
        try {
            await axios.put(`http://localhost:3000/UpdateReservationsStatus/${id}/updateStatus`, { status: newStatus });
            setReservations(reservations.map(res => res._id === id ? { ...res, reservationStatus: newStatus } : res));
        } catch (error) {
            console.error("Error updating reservation:", error);
        }
    };

    if (loading) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color="blue" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>
                {status === "PENDING" && "Reservation Requests"}
                {status === "CONFIRMED" && "Ongoing Reservations"}
                {(Array.isArray(status) ? status.some(s => ["CANCELLED", "COMPLETED"].includes(s)) : ["CANCELLED", "COMPLETED"].includes(status)) && "Reservation History"}
            </Text>

            <FlatList
                data={reservations}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.text}><Text style={styles.bold}>Guest:</Text> {item.customer_name}</Text>
                        <Text style={styles.text}><Text style={styles.bold}>CNIC:</Text> {item.CNIC}</Text>
                        <Text style={styles.text}><Text style={styles.bold}>Phone:</Text> {item.phone_number}</Text>
                        <Text style={styles.text}><Text style={styles.bold}>Email:</Text> {item.email}</Text>
                        <Text style={styles.text}><Text style={styles.bold}>Check-in:</Text> {new Date(item.reservation_date.from).toDateString()}</Text>
                        <Text style={styles.text}><Text style={styles.bold}>Check-out:</Text> {new Date(item.reservation_date.to).toDateString()}</Text>
                        <Text style={[styles.status, { backgroundColor: getStatusColor(item.reservationStatus) }]}>
                            {item.reservationStatus}
                        </Text>

                        {status === "PENDING" && (
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={[styles.button, styles.approveButton]} onPress={() => updateReservationStatus(item._id, "CONFIRMED")}>
                                    <Text style={styles.buttonText}>Approve</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => updateReservationStatus(item._id, "CANCELLED")}>
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            />
        </View>
    );
}

// Function to set color based on reservation status
const getStatusColor = (status: string) => {
    switch (status) {
        case "PENDING": return "orange";
        case "CONFIRMED": return "green";
        case "CANCELLED": return "red";
        case "COMPLETED": return "blue";
        default: return "gray";
    }
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#f4f7fc" },
    centeredContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    headerText: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
    card: { backgroundColor: "#fff", padding: 15, borderRadius: 8, marginBottom: 15, elevation: 3 },
    text: { fontSize: 16, marginBottom: 5 },
    bold: { fontWeight: "bold" },
    status: { padding: 5, borderRadius: 5, textAlign: "center", fontWeight: "bold", color: "#fff", marginVertical: 5 },
    buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    button: { flex: 1, padding: 10, borderRadius: 5, alignItems: "center", marginHorizontal: 5 },
    approveButton: { backgroundColor: "green" },
    cancelButton: { backgroundColor: "red" },
    buttonText: { color: "white", fontWeight: "bold" },
    errorText: { fontSize: 18, color: "red" },
});
