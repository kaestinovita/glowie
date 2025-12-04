import * as Location from 'expo-location';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { Alert, StyleSheet, Text, TextInput, View, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from 'expo-router';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const App = () => {
    const router = useRouter();
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const { 
        id: rawId, 
        name: rawName, 
        coordinates: rawCoords, 
        accuracy: rawAccuracy,
        category: rawCategory,
        detail: rawDetail,
        date: rawDate,
        time: rawTime,
        price: rawPrice,
        isFree: rawIsFree,
        emoji: rawEmoji,
        color: rawColor,
    } = params;

    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const initialName = Array.isArray(rawName) ? rawName[0] : rawName;
    const initialCoordinates = Array.isArray(rawCoords) ? rawCoords[0] : rawCoords;
    const initialAccuracy = Array.isArray(rawAccuracy) ? rawAccuracy[0] : rawAccuracy;
    const initialCategory = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory;
    const initialDetail = Array.isArray(rawDetail) ? rawDetail[0] : rawDetail;
    const initialDate = Array.isArray(rawDate) ? rawDate[0] : rawDate;
    const initialTime = Array.isArray(rawTime) ? rawTime[0] : rawTime;
    const initialPrice = Array.isArray(rawPrice) ? rawPrice[0] : rawPrice;
    const initialIsFree = Array.isArray(rawIsFree) ? rawIsFree[0] : rawIsFree;
    const initialEmoji = Array.isArray(rawEmoji) ? rawEmoji[0] : rawEmoji;
    const initialColor = Array.isArray(rawColor) ? rawColor[0] : rawColor;

    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [accuracy, setAccuracy] = useState('');
    const [category, setCategory] = useState('');
    const [detail, setDetail] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [price, setPrice] = useState('');
    const [isFree, setIsFree] = useState(true);
    const [emoji, setEmoji] = useState('📍');
    const [color, setColor] = useState('#EC4899');

    // Hide header
    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    useEffect(() => {
        if (initialName) setName(String(initialName));
        if (initialCoordinates) setLocation(String(initialCoordinates));
        if (initialAccuracy) setAccuracy(String(initialAccuracy));
        if (initialCategory) setCategory(String(initialCategory));
        if (initialDetail) setDetail(String(initialDetail));
        if (initialDate) setDate(String(initialDate));
        if (initialTime) setTime(String(initialTime));
        if (initialPrice) setPrice(String(initialPrice));
        if (initialIsFree !== undefined) {
            const isFreeValue = String(initialIsFree).toLowerCase() === 'true';
            setIsFree(isFreeValue);
        }
        if (initialEmoji) setEmoji(String(initialEmoji));
        if (initialColor) setColor(String(initialColor));
    }, [initialName, initialCoordinates, initialAccuracy, initialCategory, initialDetail, initialDate, initialTime, initialPrice, initialIsFree, initialEmoji, initialColor]);

    // Get current location
    const getCoordinates = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Izin diperlukan untuk mengakses lokasi');
            return;
        }

        let loc = await Location.getCurrentPositionAsync({});
        const coords = loc.coords.latitude + ',' + loc.coords.longitude;
        setLocation(coords);

        const acc = loc.coords.accuracy;
        setAccuracy(acc.toFixed(2) + ' m');

        Alert.alert("Berhasil", "Lokasi berhasil diambil!");
    };

    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyCmzVT47V9C-Aiu3kawYrLAMBLHLIgsnyg",
        authDomain: "reactnative-2025-6fced.firebaseapp.com",
        databaseURL: "https://reactnative-2025-6fced-default-rtdb.firebaseio.com",
        projectId: "reactnative-2025-6fced",
        storageBucket: "reactnative-2025-6fced.firebasestorage.app",
        messagingSenderId: "951504180513",
        appId: "1:951504180513:web:4fade7e3e831c7efa29a60"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    const handleSave = () => {
        if (!id) {
            Alert.alert("Error", "No ID found to update.");
            return;
        }
        const locationRef = ref(db, 'points/' + id);
        set(locationRef, {
            name: name,
            coordinates: location,
            accuracy: accuracy,
            category: category,
            detail: detail,
            date: date,
            time: time,
            price: isFree ? "0" : price,
            isFree: isFree,
            emoji: emoji,
            color: color,
        }).then(() => {
            Alert.alert("Success", "Data updated successfully.", [
                { text: 'OK', onPress: () => router.back() }
            ]);
        }).catch((e) => {
            console.error("Error updating document: ", e);
            Alert.alert("Error", "Failed to update data.");
        });
    };

    return (
        <View style={styles.container}>
            
            {/* CUSTOM HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <FontAwesome5 name="arrow-left" size={20} color="#EC4899" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Event</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* FORM */}
            <ScrollView 
                style={styles.form}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.formContent}
            >

                {/* SECTION: INFO DASAR */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📝 Informasi Dasar</Text>

                    {/* NAMA EVENT */}
                    <Text style={styles.label}>Nama Event <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder='Isikan nama event'
                        placeholderTextColor="#9CA3AF"
                        value={name}
                        onChangeText={setName}
                    />

                    {/* KATEGORI */}
                    <Text style={styles.label}>Kategori <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Contoh: Workshop, Bazaar, Seminar"
                        placeholderTextColor="#9CA3AF"
                        value={category}
                        onChangeText={setCategory}
                    />

                    {/* DETAIL KEGIATAN */}
                    <Text style={styles.label}>Detail Kegiatan</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Ceritakan tentang event ini..."
                        placeholderTextColor="#9CA3AF"
                        value={detail}
                        onChangeText={setDetail}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                {/* SECTION: WAKTU */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📅 Waktu & Tanggal</Text>

                    <View style={styles.row}>
                        {/* TANGGAL */}
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Tanggal <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="2025-01-15"
                                placeholderTextColor="#9CA3AF"
                                value={date}
                                onChangeText={setDate}
                            />
                        </View>

                        {/* WAKTU */}
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Waktu <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="09:00"
                                placeholderTextColor="#9CA3AF"
                                value={time}
                                onChangeText={setTime}
                            />
                        </View>
                    </View>
                </View>

                {/* SECTION: LOKASI */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📍 Lokasi Event</Text>

                    {/* KOORDINAT */}
                    <Text style={styles.label}>Koordinat</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="-7.797068, 110.370529"
                        placeholderTextColor="#9CA3AF"
                        value={location}
                        onChangeText={setLocation}
                    />

                    {/* BUTTON GET LOCATION */}
                    <TouchableOpacity style={styles.locationButton} onPress={getCoordinates}>
                        <FontAwesome5 name="map-marker-alt" size={18} color="#EC4899" />
                        <Text style={styles.locationText}>Ambil Lokasi Saat Ini</Text>
                    </TouchableOpacity>

                    {/* AKURASI */}
                    {accuracy && (
                        <View style={styles.accuracyBadge}>
                            <FontAwesome5 name="bullseye" size={12} color="#10B981" />
                            <Text style={styles.accuracyText}>Akurasi: {accuracy}</Text>
                        </View>
                    )}
                </View>

                {/* SECTION: HARGA */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💰 Biaya</Text>

                    {/* FREE/PAID TOGGLE */}
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[styles.toggleButton, isFree && styles.toggleButtonActive]}
                            onPress={() => {
                                setIsFree(true);
                                setPrice('');
                            }}
                        >
                            <Text style={[styles.toggleText, isFree && styles.toggleTextActive]}>
                                Gratis
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleButton, !isFree && styles.toggleButtonActive]}
                            onPress={() => setIsFree(false)}
                        >
                            <Text style={[styles.toggleText, !isFree && styles.toggleTextActive]}>
                                Berbayar
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* HARGA INPUT (jika berbayar) */}
                    {!isFree && (
                        <>
                            <Text style={styles.label}>Harga Tiket</Text>
                            <View style={styles.priceInputContainer}>
                                <Text style={styles.currencyPrefix}>Rp</Text>
                                <TextInput
                                    style={styles.priceInput}
                                    placeholder="50000"
                                    placeholderTextColor="#9CA3AF"
                                    value={price}
                                    onChangeText={setPrice}
                                    keyboardType="numeric"
                                />
                            </View>
                        </>
                    )}
                </View>

                {/* SECTION: CUSTOMIZATION */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🎨 Kustomisasi</Text>

                    <View style={styles.row}>
                        {/* EMOJI */}
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Icon</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="📍"
                                value={emoji}
                                onChangeText={setEmoji}
                            />
                        </View>

                        {/* COLOR */}
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Warna</Text>
                            <View style={styles.colorPreview}>
                                <View style={[styles.colorCircle, { backgroundColor: color }]} />
                                <TextInput
                                    style={styles.colorInput}
                                    placeholder="#EC4899"
                                    value={color}
                                    onChangeText={setColor}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* SAVE BUTTON */}
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <FontAwesome5 name="check-circle" size={18} color="#FFF" />
                    <Text style={styles.saveText}>Update Event</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: "#F9FAFB",
    },

    // HEADER
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: "#FFF",
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4,
    },

    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#FDF2F8",
        justifyContent: "center",
        alignItems: "center",
    },

    headerTitle: { 
        fontSize: 18, 
        fontWeight: "700",
        color: "#111827",
        letterSpacing: -0.3,
    },

    // FORM
    form: { 
        flex: 1,
    },

    formContent: {
        padding: 20,
    },

    section: {
        backgroundColor: "#FFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 16,
    },

    label: { 
        marginTop: 12, 
        marginBottom: 8, 
        fontWeight: "600",
        color: "#374151",
        fontSize: 14,
    },

    required: {
        color: "#EF4444",
    },

    input: {
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        fontSize: 14,
        color: "#111827",
    },

    textArea: {
        height: 100,
        paddingTop: 14,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },

    halfInput: {
        flex: 1,
    },

    // LOCATION BUTTON
    locationButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderColor: "#EC4899",
        borderWidth: 2,
        padding: 14,
        borderRadius: 12,
        marginTop: 12,
        backgroundColor: "#FDF2F8",
    },

    locationText: { 
        fontWeight: "600", 
        color: "#EC4899",
        marginLeft: 8,
        fontSize: 14,
    },

    accuracyBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ECFDF5",
        padding: 8,
        borderRadius: 8,
        marginTop: 8,
        alignSelf: "flex-start",
    },

    accuracyText: {
        fontSize: 12,
        color: "#10B981",
        fontWeight: "600",
        marginLeft: 6,
    },

    // PRICE
    toggleContainer: {
        flexDirection: "row",
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
        padding: 4,
        marginBottom: 12,
    },

    toggleButton: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
    },

    toggleButtonActive: {
        backgroundColor: "#EC4899",
    },

    toggleText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6B7280",
    },

    toggleTextActive: {
        color: "#FFF",
    },

    priceInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingLeft: 14,
    },

    currencyPrefix: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6B7280",
        marginRight: 8,
    },

    priceInput: {
        flex: 1,
        padding: 14,
        fontSize: 14,
        color: "#111827",
    },

    // COLOR
    colorPreview: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingLeft: 12,
    },

    colorCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },

    colorInput: {
        flex: 1,
        padding: 14,
        fontSize: 14,
        color: "#111827",
    },

    // SAVE BUTTON
    saveButton: {
        marginTop: 8,
        backgroundColor: "#EC4899",
        padding: 16,
        borderRadius: 14,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
        shadowColor: "#EC4899",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },

    saveText: { 
        color: "#FFF", 
        fontWeight: "700",
        fontSize: 16,
    },
});

export default App;