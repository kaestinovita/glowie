// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { getDatabase, ref, onValue, update } from "firebase/database";
import { db } from '@/constants/firebaseConfig';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function HomeScreen() {
  const router = useRouter();

  const [stats, setStats] = useState({
    total: 0,
    favorite: 0,
    registered: 0,
    upcoming: 0,
  });

  const [bookmarkedEvents, setBookmarkedEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);

  // --- FETCH DATA REALTIME ---
  useEffect(() => {
    const pointsRef = ref(db, "points/");

    const unsubscribe = onValue(pointsRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        const list = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));

        // Hitung statistik
        const totalEvents = list.length;
        const favoriteEvents = list.filter(item => item.favorite === true);
        const registeredEventsList = list.filter(item => item.registered === true);
        
        // Filter upcoming events (tanggal >= hari ini)
        const today = new Date().toISOString().split('T')[0];
        const upcomingEvents = list.filter(item => item.date >= today);

        setStats({
          total: totalEvents,
          favorite: favoriteEvents.length,
          registered: registeredEventsList.length,
          upcoming: upcomingEvents.length,
        });

        setBookmarkedEvents(favoriteEvents.slice(0, 3)); // Ambil 3 terakhir
        setRegisteredEvents(registeredEventsList.slice(0, 3));
      } else {
        setStats({ total: 0, favorite: 0, registered: 0, upcoming: 0 });
        setBookmarkedEvents([]);
        setRegisteredEvents([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle register event
  const handleRegister = (event) => {
    Alert.alert(
      "Daftar Event",
      `Apakah kamu yakin ingin mendaftar ke event "${event.name}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Daftar",
          onPress: async () => {
            try {
              const pointRef = ref(db, `points/${event.id}`);
              await update(pointRef, { registered: true });
              Alert.alert("Berhasil! 🎉", `Kamu sudah terdaftar di event "${event.name}"`);
            } catch (error) {
              Alert.alert("Error", "Gagal mendaftar event");
            }
          },
        },
      ]
    );
  };

  // Handle open registration link
  const handleOpenLink = (event) => {
    const message = `Halo! Saya ingin mendaftar event:\n\n📍 ${event.name}\n📅 ${event.date || 'TBA'}\n⏰ ${event.time || 'TBA'}\n📌 ${event.category || 'Event'}`;
    const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
    
    Alert.alert(
      "Pilih Cara Daftar",
      "Bagaimana kamu ingin mendaftar?",
      [
        {
          text: "WhatsApp",
          onPress: () => Linking.openURL(whatsappUrl),
        },
        {
          text: "Tandai Terdaftar",
          onPress: () => handleRegister(event),
        },
        { text: "Batal", style: "cancel" }
      ]
    );
  };

  // Render event card
  const renderEventCard = (event, showRegisterButton = false) => (
    <TouchableOpacity 
      key={event.id}
      style={styles.eventCard}
      onPress={() => router.push('/lokasi')}
      activeOpacity={0.8}
    >
      <View style={[styles.eventIcon, { backgroundColor: event.color || '#EC4899' }]}>
        <Text style={styles.eventEmoji}>{event.emoji || '📍'}</Text>
      </View>

      <View style={styles.eventContent}>
        <Text style={styles.eventName} numberOfLines={1}>{event.name}</Text>
        
        {event.category && (
          <View style={styles.eventCategoryBadge}>
            <Text style={styles.eventCategoryText}>{event.category}</Text>
          </View>
        )}

        {event.date && (
          <View style={styles.eventMetaRow}>
            <FontAwesome5 name="calendar" size={10} color="#6B7280" />
            <Text style={styles.eventMetaText}>{event.date}</Text>
            {event.time && (
              <>
                <Text style={styles.eventMetaDot}>•</Text>
                <FontAwesome5 name="clock" size={10} color="#6B7280" />
                <Text style={styles.eventMetaText}>{event.time}</Text>
              </>
            )}
          </View>
        )}

        {showRegisterButton && !event.registered && (
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={(e) => {
              e.stopPropagation();
              handleOpenLink(event);
            }}
          >
            <FontAwesome5 name="check-circle" size={12} color="#FFF" />
            <Text style={styles.registerButtonText}>Daftar Sekarang</Text>
          </TouchableOpacity>
        )}

        {event.registered && (
          <View style={styles.registeredBadge}>
            <FontAwesome5 name="check-circle" size={10} color="#10B981" />
            <Text style={styles.registeredText}>Sudah Terdaftar</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Halo, Kaesti! 👋</Text>
          <Text style={styles.subtitle}>Temukan event menarik hari ini</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <FontAwesome5 name="bell" size={20} color="#EC4899" />
          {stats.upcoming > 0 && (
            <View style={styles.notificationDot}>
              <Text style={styles.notificationText}>{stats.upcoming}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* PROFILE CARD */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarEmoji}>👩‍💻</Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Kaesti Novita Ramadhanti</Text>
          <Text style={styles.profileNim}>23/522289/SV/23651</Text>
          <View style={styles.profileClassBadge}>
            <FontAwesome5 name="graduation-cap" size={10} color="#EC4899" />
            <Text style={styles.profileClass}>Admin</Text>
          </View>
        </View>
      </View>

      {/* STATISTICS CARDS */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.statCardPink]}>
          <FontAwesome5 name="calendar-check" size={24} color="#EC4899" />
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Event</Text>
        </View>

        <View style={[styles.statCard, styles.statCardYellow]}>
          <FontAwesome5 name="star" size={24} color="#F59E0B" solid />
          <Text style={styles.statNumber}>{stats.favorite}</Text>
          <Text style={styles.statLabel}>Favorit</Text>
        </View>

        <View style={[styles.statCard, styles.statCardGreen]}>
          <FontAwesome5 name="check-circle" size={24} color="#10B981" />
          <Text style={styles.statNumber}>{stats.registered}</Text>
          <Text style={styles.statLabel}>Terdaftar</Text>
        </View>
      </View>

      {/* EVENT BOOKMARKS SECTION */}
      {bookmarkedEvents.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⭐ Event Favorit</Text>
            <TouchableOpacity onPress={() => router.push('/lokasi')}>
              <Text style={styles.seeAllText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          {bookmarkedEvents.map(event => renderEventCard(event, true))}
        </View>
      )}

      {/* REGISTERED EVENTS SECTION */}
      {registeredEvents.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✅ Event Terdaftar</Text>
            <TouchableOpacity onPress={() => router.push('/lokasi')}>
              <Text style={styles.seeAllText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          {registeredEvents.map(event => renderEventCard(event, false))}
        </View>
      )}

      {/* QUICK ACTIONS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Aksi Cepat</Text>
        
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/forminputlocation')}
        >
          <View style={styles.actionIconContainer}>
            <FontAwesome5 name="plus-circle" size={24} color="#EC4899" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Tambah Event Baru</Text>
            <Text style={styles.actionDesc}>Buat event baru untuk komunitas</Text>
          </View>
          <FontAwesome5 name="chevron-right" size={16} color="#D1D5DB" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/lokasi')}
        >
          <View style={styles.actionIconContainer}>
            <FontAwesome5 name="map-marked-alt" size={24} color="#F59E0B" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Jelajahi Event</Text>
            <Text style={styles.actionDesc}>Cari event menarik di sekitarmu</Text>
          </View>
          <FontAwesome5 name="chevron-right" size={16} color="#D1D5DB" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => {
            Alert.alert(
              "Hubungi Admin",
              "Pilih cara menghubungi:",
              [
                {
                  text: "WhatsApp",
                  onPress: () => Linking.openURL('https://wa.me/62895320071433'),
                },
                {
                  text: "Email",
                  onPress: () => Linking.openURL('mailto:novitaramadhanti12@gmail.com'),
                },
                { text: "Batal", style: "cancel" }
              ]
            );
          }}
        >
          <View style={styles.actionIconContainer}>
            <FontAwesome5 name="headset" size={24} color="#10B981" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Hubungi Admin</Text>
            <Text style={styles.actionDesc}>Butuh bantuan? Chat admin</Text>
          </View>
          <FontAwesome5 name="chevron-right" size={16} color="#D1D5DB" />
        </TouchableOpacity>
      </View>

      {/* EMPTY STATE */}
      {bookmarkedEvents.length === 0 && registeredEvents.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyTitle}>Belum Ada Event</Text>
          <Text style={styles.emptyDesc}>
            Mulai tambahkan event favorit dan daftar ke event yang menarik!
          </Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => router.push('/lokasi')}
          >
            <Text style={styles.emptyButtonText}>Jelajahi Event</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* LOGOUT BUTTON */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => {
          Alert.alert(
            "Keluar",
            "Apakah kamu yakin ingin keluar?",
            [
              { text: "Batal", style: "cancel" },
              { text: "Keluar", style: "destructive", onPress: () => Alert.alert("Logged out") }
            ]
          );
        }}
      >
        <FontAwesome5 name="sign-out-alt" size={18} color="#EF4444" />
        <Text style={styles.logoutText}>Keluar</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },

  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FDF2F8',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },

  notificationText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // PROFILE CARD
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FDF2F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  avatarEmoji: { fontSize: 32 },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.3,
  },

  profileNim: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },

  profileClassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF2F8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },

  profileClass: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EC4899',
  },

  // STATISTICS
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },

  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  statCardPink: {
    backgroundColor: '#FDF2F8',
  },

  statCardYellow: {
    backgroundColor: '#FEF3C7',
  },

  statCardGreen: {
    backgroundColor: '#D1FAE5',
  },

  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },

  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },

  // SECTION
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  seeAllText: {
    fontSize: 14,
    color: '#EC4899',
    fontWeight: '600',
  },

  // EVENT CARD
  eventCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  eventIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  eventEmoji: {
    fontSize: 24,
  },

  eventContent: {
    flex: 1,
  },

  eventName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },

  eventCategoryBadge: {
    backgroundColor: '#FDF2F8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },

  eventCategoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#EC4899',
  },

  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },

  eventMetaText: {
    fontSize: 11,
    color: '#6B7280',
  },

  eventMetaDot: {
    fontSize: 11,
    color: '#D1D5DB',
    marginHorizontal: 4,
  },

  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EC4899',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 6,
  },

  registerButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },

  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 6,
  },

  registeredText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '600',
  },

  // ACTION CARD
  actionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  actionContent: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },

  actionDesc: {
    fontSize: 12,
    color: '#6B7280',
  },

  // EMPTY STATE
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 40,
  },

  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },

  emptyDesc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },

  emptyButton: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },

  emptyButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // LOGOUT
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    gap: 10,
  },

  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },

  bottomSpacing: {
    height: 40,
  },
});