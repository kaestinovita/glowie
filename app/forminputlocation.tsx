import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import * as Location from 'expo-location';
import { initializeApp } from "firebase/app";
import { getDatabase, push, ref } from "firebase/database";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function FormInputLocation() {
  const router = useRouter();
  const navigation = useNavigation();

  // Hide header menggunakan useLayoutEffect
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const [form, setForm] = useState({
    name: '',
    coordinates: '',
    accuracy: '',
    category: '',
    detail: '',
    date: '',
    time: '',
    price: '',
    isFree: true,
    emoji: '📍',
    color: '#EC4899',
  });

  // Firebase Config
  const firebaseConfig = {
    apiKey: "AIzaSyCmzVT47V9C-Aiu3kawYrLAMBLHLIgsnyg",
    authDomain: "reactnative-2025-6fced.firebaseapp.com",
    databaseURL: "https://reactnative-2025-6fced-default-rtdb.firebaseio.com",
    projectId: "reactnative-2025-6fced",
    storageBucket: "reactnative-2025-6fced.firebasestorage.app",
    messagingSenderId: "951504180513",
    appId: "1:951504180513:web:4fade7e3e831c7efa29a60"
  };

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  // GET CURRENT LOCATION
  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Izin diperlukan untuk mengakses lokasi");
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    setForm({
      ...form,
      coordinates: `${loc.coords.latitude}, ${loc.coords.longitude}`,
      accuracy: `${loc.coords.accuracy.toFixed(2)} m`,
    });

    Alert.alert("Berhasil", "Lokasi berhasil diambil!");
  };

  // SAVE DATA
  const handleSave = async () => {
    if (!form.name || !form.category || !form.date || !form.time) {
      Alert.alert("Error", "Harap lengkapi semua data wajib");
      return;
    }

    const eventsRef = ref(db, "points/");
    await push(eventsRef, {
      name: form.name,
      coordinates: form.coordinates,
      accuracy: form.accuracy,
      category: form.category,
      detail: form.detail,
      date: form.date,
      time: form.time,
      price: form.isFree ? "0" : form.price,
      isFree: form.isFree,
      emoji: form.emoji,
      color: form.color,
      createdAt: new Date().toISOString(),
      favorite: false,
      registered: false,
      attendees: [],
    });

    Alert.alert("Sukses", "Event berhasil ditambahkan! 🎉", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      
      {/* CUSTOM HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#EC4899" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Event Baru</Text>
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
            placeholder="Contoh: Workshop Bikin Tote Bag"
            placeholderTextColor="#9CA3AF"
            value={form.name}
            onChangeText={(t) => setForm({ ...form, name: t })}
          />

          {/* KATEGORI */}
          <Text style={styles.label}>Kategori <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Workshop, Bazaar, Seminar"
            placeholderTextColor="#9CA3AF"
            value={form.category}
            onChangeText={(t) => setForm({ ...form, category: t })}
          />

          {/* DETAIL KEGIATAN */}
          <Text style={styles.label}>Detail Kegiatan</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ceritakan tentang event ini..."
            placeholderTextColor="#9CA3AF"
            value={form.detail}
            onChangeText={(t) => setForm({ ...form, detail: t })}
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
                value={form.date}
                onChangeText={(t) => setForm({ ...form, date: t })}
              />
            </View>

            {/* WAKTU */}
            <View style={styles.halfInput}>
              <Text style={styles.label}>Waktu <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="09:00"
                placeholderTextColor="#9CA3AF"
                value={form.time}
                onChangeText={(t) => setForm({ ...form, time: t })}
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
            value={form.coordinates}
            onChangeText={(t) => setForm({ ...form, coordinates: t })}
          />

          {/* BUTTON GET LOCATION */}
          <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
            <FontAwesome5 name="map-marker-alt" size={18} color="#EC4899" />
            <Text style={styles.locationText}>Ambil Lokasi Saat Ini</Text>
          </TouchableOpacity>

          {/* AKURASI */}
          {form.accuracy && (
            <View style={styles.accuracyBadge}>
              <FontAwesome5 name="bullseye" size={12} color="#10B981" />
              <Text style={styles.accuracyText}>Akurasi: {form.accuracy}</Text>
            </View>
          )}
        </View>

        {/* SECTION: HARGA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Biaya</Text>

          {/* FREE/PAID TOGGLE */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, form.isFree && styles.toggleButtonActive]}
              onPress={() => setForm({ ...form, isFree: true, price: '' })}
            >
              <Text style={[styles.toggleText, form.isFree && styles.toggleTextActive]}>
                Gratis
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !form.isFree && styles.toggleButtonActive]}
              onPress={() => setForm({ ...form, isFree: false })}
            >
              <Text style={[styles.toggleText, !form.isFree && styles.toggleTextActive]}>
                Berbayar
              </Text>
            </TouchableOpacity>
          </View>

          {/* HARGA INPUT (jika berbayar) */}
          {!form.isFree && (
            <>
              <Text style={styles.label}>Harga Tiket</Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencyPrefix}>Rp</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="50000"
                  placeholderTextColor="#9CA3AF"
                  value={form.price}
                  onChangeText={(t) => setForm({ ...form, price: t })}
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
                value={form.emoji}
                onChangeText={(t) => setForm({ ...form, emoji: t })}
              />
            </View>

            {/* COLOR */}
            <View style={styles.halfInput}>
              <Text style={styles.label}>Warna</Text>
              <View style={styles.colorPreview}>
                <View style={[styles.colorCircle, { backgroundColor: form.color }]} />
                <TextInput
                  style={styles.colorInput}
                  placeholder="#EC4899"
                  value={form.color}
                  onChangeText={(t) => setForm({ ...form, color: t })}
                />
              </View>
            </View>
          </View>
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <FontAwesome5 name="check-circle" size={18} color="#FFF" />
          <Text style={styles.saveText}>Simpan Event</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// STYLES
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