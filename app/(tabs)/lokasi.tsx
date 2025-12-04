import { useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Linking,
  Alert,
  Text,
  Image,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';

import { getDatabase, ref, onValue, remove, update } from 'firebase/database';
import { db } from '@/constants/firebaseConfig';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { ThemedView } from '@/components/themed-view';

// TypeScript interfaces
interface LocationItem {
  id: string;
  name: string;
  coordinates: string;
  accuracy?: string;
  category?: string;
  detail?: string;
  date?: string;
  time?: string;
  price?: string;
  isFree?: boolean;
  emoji?: string;
  color?: string;
  favorite?: boolean;
  registered?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_ITEM_WIDTH = SCREEN_WIDTH - 80;

export default function LokasiScreen() {
  const router = useRouter();

  const [allData, setAllData] = useState<LocationItem[]>([]);
  const [filteredData, setFilteredData] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [categories, setCategories] = useState(['Semua']);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const handlePress = (coordinates: string) => {
    if (!coordinates || typeof coordinates !== 'string' || coordinates.split(',').length !== 2) {
      Alert.alert("Error", "Koordinat tidak valid.");
      return;
    }
    const [latitude, longitude] = coordinates.split(',').map((i) => i.trim());
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url).catch(err => {
      console.error("Failed to open URL:", err);
      Alert.alert("Error", "Tidak bisa membuka Google Maps.");
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Hapus Lokasi",
      "Apakah Anda yakin ingin menghapus lokasi ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              const pointRef = ref(db, `points/${id}`);
              await remove(pointRef);
              Alert.alert("Sukses", "Lokasi berhasil dihapus.");
            } catch (error) {
              console.error("Error deleting location:", error);
              Alert.alert("Error", "Gagal menghapus lokasi.");
            }
          },
        },
      ]
    );
  };

  // 📌 FETCH DATA REALTIME
  useEffect(() => {
    const pointsRef = ref(db, 'points/');

    const unsubscribe = onValue(
      pointsRef,
      (snapshot) => {
        const data = snapshot.val();

        if (data) {
          const pointsArray: LocationItem[] = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));

          setAllData(pointsArray);

          // Extract unique categories
          const uniqueCategories = ['Semua', ...new Set(pointsArray.map(item => item.category || 'Lainnya'))];
          setCategories(uniqueCategories);

          filterData(pointsArray, selectedCategory, searchQuery);
        } else {
          setFilteredData([]);
          setAllData([]);
          setCategories(['Semua']);
        }

        setLoading(false);
      },
      (error) => {
        console.error(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter data based on category and search
  const filterData = (data: LocationItem[], category: string, search: string) => {
    let filtered = data;

    // Filter by category
    if (category !== 'Semua') {
      filtered = filtered.filter(item => (item.category || 'Lainnya') === category);
    }

    // Filter by search query
    if (search.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.detail && item.detail.toLowerCase().includes(search.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(search.toLowerCase()))
      );
    }

    setFilteredData(filtered);
  };

  useEffect(() => {
    filterData(allData, selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery, allData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleEdit = (item: LocationItem) => {
    router.push({
      pathname: "/formeditlocation",
      params: {
        id: item.id,
        name: item.name,
        coordinates: item.coordinates,
        accuracy: item.accuracy || "",
        category: item.category || "",
        detail: item.detail || "",
        date: item.date || "",
        time: item.time || "",
        price: item.price || "",
        isFree: String(item.isFree || false),
        emoji: item.emoji || "📍",
        color: item.color || "#EC4899",
      },
    });
  };

  const toggleFavorite = async (id: string, currentValue?: boolean) => {
    try {
      const pointRef = ref(db, `points/${id}`);
      await update(pointRef, { favorite: !currentValue });
    } catch (error) {
      console.error("Error updating favorite status:", error);
      Alert.alert("Error", "Gagal memperbarui status favorit.");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color="#EC4899" />
      </ThemedView>
    );
  }

  const totalLocations = allData.length;

  // Group data by category for section rendering
  const groupedData: Record<string, LocationItem[]> = filteredData.reduce((acc, item) => {
    const cat = item.category || 'Lainnya';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, LocationItem[]>);

  const sections = Object.keys(groupedData).map(cat => ({
    category: cat,
    data: groupedData[cat],
  }));

  const renderItem = (item: LocationItem) => (
    <View style={styles.itemWrapper} key={item.id}>
      <TouchableOpacity 
        onPress={() => handlePress(item.coordinates)} 
        activeOpacity={0.8}
        style={styles.itemCard}
      >
        <View style={[styles.itemIcon, { backgroundColor: item.color || '#EC4899' }]}>
          <Text style={styles.itemEmoji}>{item.emoji || '📍'}</Text>
        </View>

        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>

            <View style={styles.iconRow}>
              {/* DETAIL EXPAND */}
              {item.detail && (
                <TouchableOpacity
                  onPress={() => toggleExpand(item.id)}
                  style={styles.actionButton}
                >
                  <FontAwesome5
                    name={expandedItem === item.id ? "chevron-up" : "chevron-down"}
                    size={14}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              )}

              {/* EDIT */}
              <TouchableOpacity 
                onPress={() => handleEdit(item)} 
                style={styles.actionButton}
              >
                <FontAwesome5 name="pencil-alt" size={14} color="#F97316" />
              </TouchableOpacity>

              {/* DELETE */}
              <TouchableOpacity 
                onPress={() => handleDelete(item.id)} 
                style={styles.actionButton}
              >
                <FontAwesome5 name="trash" size={14} color="#EF4444" />
              </TouchableOpacity>

              {/* FAVORITE */}
              <TouchableOpacity
                onPress={() => toggleFavorite(item.id, item.favorite)}
                style={styles.actionButton}
              >
                <FontAwesome5
                  name="star"
                  size={16}
                  color={item.favorite ? "#FACC15" : "#D1D5DB"}
                  solid={item.favorite}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* REGISTER BUTTON - FULL WIDTH */}
          {!item.registered && (
            <TouchableOpacity 
              style={styles.registerEventButton}
              onPress={() => {
                router.push({
                  pathname: "/eventregistration",
                  params: {
                    id: item.id,
                    name: item.name,
                    category: item.category || '',
                    date: item.date || '',
                    time: item.time || '',
                    price: item.price || '0',
                    isFree: String(item.isFree || false),
                    coordinates: item.coordinates || '',
                  },
                });
              }}
            >
              <FontAwesome5 name="user-plus" size={14} color="#FFF" />
              <Text style={styles.registerEventText}>Daftar Event</Text>
            </TouchableOpacity>
          )}

          {/* REGISTERED BADGE */}
          {item.registered && (
            <View style={styles.registeredStatusBadge}>
              <FontAwesome5 name="check-circle" size={12} color="#10B981" />
              <Text style={styles.registeredStatusText}>✅ Sudah Terdaftar</Text>
            </View>
          )}

          {/* Category Badge */}
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
          )}

          {/* Date & Time */}
          {(item.date || item.time) && (
            <View style={styles.dateTimeRow}>
              {item.date && (
                <View style={styles.dateTimeBadge}>
                  <FontAwesome5 name="calendar" size={10} color="#EC4899" />
                  <Text style={styles.dateTimeText}>{item.date}</Text>
                </View>
              )}
              {item.time && (
                <View style={styles.dateTimeBadge}>
                  <FontAwesome5 name="clock" size={10} color="#EC4899" />
                  <Text style={styles.dateTimeText}>{item.time}</Text>
                </View>
              )}
            </View>
          )}

          {/* Price Badge */}
          {item.isFree !== undefined && (
            <View style={styles.priceBadge}>
              {item.isFree ? (
                <Text style={styles.priceTextFree}>🎉 GRATIS</Text>
              ) : (
                <Text style={styles.priceTextPaid}>💰 Rp {item.price || '0'}</Text>
              )}
            </View>
          )}

          <Text style={styles.coordsText} numberOfLines={1}>{item.coordinates}</Text>

          {item.accuracy && (
            <View style={styles.metaRow}>
              <FontAwesome5 name="bullseye" size={10} color="#EC4899" style={styles.metaIcon} />
              <Text style={styles.metaValue}>{item.accuracy}</Text>
            </View>
          )}

          {/* Detail Kegiatan - Expandable */}
          {item.detail && expandedItem === item.id && (
            <View style={styles.detailContainer}>
              <View style={styles.detailHeader}>
                <FontAwesome5 name="clipboard-list" size={12} color="#EC4899" />
                <Text style={styles.detailLabel}>Detail Kegiatan</Text>
              </View>
              <Text style={styles.detailText}>{item.detail}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );

  // Carousel images array
  const carouselImages = [
    require('../../assets/images/carousel1.jpg'),
    require('../../assets/images/carousel2.jpg'),
    require('../../assets/images/carousel3.jpg'),
    require('../../assets/images/carousel4.jpg'),
  ];

  return (
    <View style={styles.container}>
      {/* Header - Fixed */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>🗓</Text>
            </View>
            <Text style={styles.headerTitle}>Events</Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalLocations}</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <FontAwesome5 name="search" size={14} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari lokasi, kategori, detail..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <FontAwesome5 name="times-circle" size={14} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((cat, index) => (
            <TouchableOpacity
              key={`${cat}-${index}`}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat && styles.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Content - Scrollable */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#EC4899']}
            tintColor="#EC4899"
          />
        }
      >
        {/* 🎀 CAROUSEL GAMBAR PEMANIS + DESKRIPSI */}
        <View style={styles.pemanisWrapper}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.carouselContainer}
            snapToInterval={CAROUSEL_ITEM_WIDTH + 12}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContentContainer}
          >
            {carouselImages.map((image, index) => (
              <View key={index} style={styles.carouselItem}>
                <Image
                  source={image}
                  style={styles.carouselImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>
          
          <Text style={styles.pemanisTitle}>Bagikan Momenmu 💗</Text>
          <Text style={styles.pemanisDesc}>
            Catat setiap momen berharga di tempat-tempat yang berkesan ✨
          </Text>
        </View>

        {/* LIST CONTENT */}
        {sections.length > 0 ? (
          sections.map((section) => ( 
            <View key={section.category} style={styles.sectionContainer}>
              {/* Section Header */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.category}</Text>
                <View style={styles.sectionLine} />
                <Text style={styles.sectionCount}>{section.data.length}</Text>
              </View>

              {/* Section Items */}
              {section.data.map((item) => renderItem(item))}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Tidak ada hasil yang ditemukan' : 'Belum ada lokasi tersimpan'}
            </Text>
            {searchQuery && (
              <TouchableOpacity 
                style={styles.resetButton} 
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.resetButtonText}>Reset Pencarian</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

// -------------------- STYLE --------------------
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9FAFB',
  },

  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },

  // HEADER - FIXED
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },

  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 16,
  },

  titleContainer: { 
    flexDirection: 'row', 
    alignItems: 'center',
    flex: 1,
  },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FDF2F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  iconText: { fontSize: 22 },
  
  headerTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#111827',
    letterSpacing: -0.5,
  },

  badge: { 
    backgroundColor: '#FDF2F8', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20,
    minWidth: 40,
    alignItems: 'center',
  },
  
  badgeText: { 
    color: '#EC4899', 
    fontSize: 14, 
    fontWeight: '700',
  },

  // SEARCH BAR
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  
  searchIcon: { marginRight: 10 },
  
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    padding: 0,
  },

  clearButton: {
    padding: 4,
  },

  // CATEGORY FILTER
  categoryScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  
  categoryContent: {
    paddingRight: 20,
    gap: 8,
  },
  
  categoryChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  
  categoryChipActive: {
    backgroundColor: '#EC4899',
    borderColor: '#EC4899',
  },
  
  categoryChipText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },
  
  categoryChipTextActive: {
    color: '#FFFFFF',
  },

  // SCROLLABLE CONTENT
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 20,
  },

  // PEMANIS
  pemanisWrapper: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  
  // CAROUSEL
  carouselContainer: {
    marginBottom: 12,
    marginHorizontal: -4,
  },

  carouselContentContainer: {
    paddingHorizontal: 4,
  },

  carouselItem: {
    width: CAROUSEL_ITEM_WIDTH,
    marginHorizontal: 6,
  },

  carouselImage: {
    width: "100%",
    height: 160,
    borderRadius: 14,
  },
  
  pemanisTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#EC4899",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  
  pemanisDesc: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 19,
  },

  // SECTION
  sectionContainer: {
    marginBottom: 20,
  },

  sectionHeader: {
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EC4899',
    marginRight: 10,
  },
  
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#FDE7F3',
    marginRight: 10,
  },

  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EC4899',
    backgroundColor: '#FDF2F8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  // ITEM CARD
  itemWrapper: { 
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  itemIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  itemEmoji: { fontSize: 26 },
  
  itemContent: { 
    flex: 1,
    paddingTop: 2,
  },

  itemHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  itemName: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#111827',
    flex: 1,
    marginRight: 8,
    letterSpacing: -0.2,
  },

  iconRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 6,
  },

  actionButton: { 
    padding: 6,
    borderRadius: 8,
  },

  // CATEGORY BADGE
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FDF2F8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 6,
  },
  
  categoryBadgeText: {
    color: '#EC4899',
    fontSize: 11,
    fontWeight: '600',
  },

  // DATE TIME
  dateTimeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },

  dateTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },

  dateTimeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
  },

  // PRICE
  priceBadge: {
    alignSelf: 'flex-start',
    marginBottom: 6,
  },

  priceTextFree: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  priceTextPaid: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  // REGISTER EVENT BUTTON
  registerEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EC4899',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  registerEventText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },

  registeredStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1FAE5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
  },

  registeredStatusText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '700',
  },

  coordsText: { 
    color: '#6B7280', 
    fontSize: 12,
    marginBottom: 6,
  },

  metaRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  
  metaIcon: {
    marginRight: 6,
  },

  metaValue: { 
    fontSize: 11, 
    color: '#6B7280',
    fontWeight: '500',
  },

  // DETAIL KEGIATAN
  detailContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#EC4899',
  },
  
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EC4899',
    marginLeft: 6,
  },
  
  detailText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 19,
  },

  // EMPTY STATE
  emptyContainer: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  
  emptyEmoji: { 
    fontSize: 64, 
    marginBottom: 16,
  },
  
  emptyText: { 
    fontSize: 15, 
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },

  resetButton: {
    marginTop: 16,
    backgroundColor: '#EC4899',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },

  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  bottomSpacing: {
    height: 100,
  },
});