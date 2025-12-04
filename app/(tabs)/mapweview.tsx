import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { StyleSheet, View, TouchableOpacity, Text, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { db } from '@/constants/firebaseConfig';

const webmap = require('../../assets/html/map.html');

// INTERFACE UNTUK LOCATION DATA
interface LocationData {
  id: string;
  name: string;
  coordinates: string;
  category?: string;
  color?: string;
  emoji?: string;
  detail?: string;
  date?: string;
  time?: string;
  price?: string;
  isFree?: boolean;
  [key: string]: any;
}

interface MarkerData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  color: string;
  emoji: string;
  detail: string;
  date: string;
  time: string;
  price: string;
  isFree: boolean;
}

// COLOR MAPPING PER KATEGORI
const getCategoryColor = (category?: string): string => {
  const colorMap: { [key: string]: string } = {
    'Workshop': '#10B981',
    'Bazaar': '#F59E0B',
    'Seminar': '#3B82F6',
    'Konser': '#EC4899',
    'Olahraga': '#EF4444',
    'Makanan': '#F97316',
    'Wisata': '#8B5CF6',
    'Pendidikan': '#06B6D4',
    'Lainnya': '#6B7280',
  };
  return colorMap[category || 'Lainnya'] || '#EC4899';
};

export default function App() {
  const [showMenu, setShowMenu] = useState(false);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const webViewRef = useRef<WebView>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // FETCH LOCATIONS FROM FIREBASE
  useEffect(() => {
    const pointsRef = ref(db, 'points/');
    
    const unsubscribe = onValue(pointsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const pointsArray: LocationData[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setLocations(pointsArray);
      } else {
        setLocations([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // SEND LOCATIONS TO WEBVIEW WHEN DATA CHANGES
  useEffect(() => {
    if (locations.length > 0 && webViewRef.current) {
      updateMapMarkers();
    }
  }, [locations]);

  const updateMapMarkers = () => {
    if (!webViewRef.current) return;

    // Format data untuk dikirim ke map
    const markers: MarkerData[] = locations.map(loc => {
      const coords = (loc.coordinates || '0,0').split(',');
      const lat = parseFloat(coords[0]?.trim() || '0');
      const lng = parseFloat(coords[1]?.trim() || '0');
      
      return {
        id: loc.id,
        name: loc.name || 'Unknown',
        lat: lat,
        lng: lng,
        category: loc.category || 'Lainnya',
        color: loc.color || getCategoryColor(loc.category),
        emoji: loc.emoji || '📍',
        detail: loc.detail || '',
        date: loc.date || '',
        time: loc.time || '',
        price: loc.price || '0',
        isFree: loc.isFree || false,
      };
    });

    // JavaScript code to inject into WebView
    const jsCode = `
      (function() {
        try {
          if (typeof window.updateMarkers === 'function') {
            window.updateMarkers(${JSON.stringify(markers)});
          } else {
            window.pendingMarkers = ${JSON.stringify(markers)};
          }
        } catch(e) {
          console.error('Error updating markers:', e);
        }
      })();
      true;
    `;

    webViewRef.current.injectJavaScript(jsCode);
  };

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: showMenu ? 1 : 0,
        useNativeDriver: true,
        friction: 5,
      }),
      Animated.timing(rotateAnim, {
        toValue: showMenu ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [showMenu]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const handleRefresh = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
      setTimeout(() => {
        updateMapMarkers();
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🗺️</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Peta Lokasi</Text>
            <Text style={styles.headerSubtitle}>{locations.length} lokasi tersimpan</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <FontAwesome5 name="sync-alt" size={16} color="#EC4899" />
        </TouchableOpacity>
      </View>

      {/* WEBVIEW MAP */}
      <WebView
        ref={webViewRef}
        style={styles.webview}
        source={webmap}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onLoadEnd={() => {
          setTimeout(() => {
            updateMapMarkers();
          }, 500);
        }}
        onMessage={(event) => {
          console.log('Message from WebView:', event.nativeEvent.data);
        }}
      />

      {/* FLOATING ACTION MENU */}
      {showMenu && (
        <>
          {/* Overlay */}
          <TouchableOpacity 
            style={styles.overlay} 
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
          />

          {/* Menu Items */}
          <Animated.View 
            style={[
              styles.fabMenuItem,
              styles.fabItem1,
              {
                transform: [{ scale: scaleAnim }],
                opacity: scaleAnim,
              }
            ]}
          >
            <TouchableOpacity
              style={[styles.fabMenu, { backgroundColor: '#10B981' }]}
              onPress={() => {
                setShowMenu(false);
                router.push('/forminputlocation');
              }}
            >
              <FontAwesome5 name="map-marker-alt" size={20} color="white" />
            </TouchableOpacity>
            <Text style={styles.fabLabel}>Tambah Lokasi</Text>
          </Animated.View>

          <Animated.View 
            style={[
              styles.fabMenuItem,
              styles.fabItem2,
              {
                transform: [{ scale: scaleAnim }],
                opacity: scaleAnim,
              }
            ]}
          >
            <TouchableOpacity
              style={[styles.fabMenu, { backgroundColor: '#F59E0B' }]}
              onPress={() => {
                setShowMenu(false);
                router.push('/lokasi');
              }}
            >
              <FontAwesome5 name="list" size={20} color="white" />
            </TouchableOpacity>
            <Text style={styles.fabLabel}>Lihat Semua</Text>
          </Animated.View>

          <Animated.View 
            style={[
              styles.fabMenuItem,
              styles.fabItem3,
              {
                transform: [{ scale: scaleAnim }],
                opacity: scaleAnim,
              }
            ]}
          >
            <TouchableOpacity
              style={[styles.fabMenu, { backgroundColor: '#EF4444' }]}
              onPress={() => {
                setShowMenu(false);
                router.push('/lokasi');
              }}
            >
              <FontAwesome5 name="heart" size={20} color="white" solid />
            </TouchableOpacity>
            <Text style={styles.fabLabel}>Favorit</Text>
          </Animated.View>
        </>
      )}

      {/* MAIN FAB BUTTON */}
      <Animated.View style={[styles.fabContainer, { transform: [{ rotate: rotation }] }]}>
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => setShowMenu(!showMenu)}
          activeOpacity={0.8}
        >
          <FontAwesome5 name="plus" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* BOTTOM INFO CARD */}
      <View style={styles.bottomCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <FontAwesome5 name="map-pin" size={16} color="#EC4899" />
            <Text style={styles.infoText}>Tap marker untuk detail</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  // HEADER
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: Constants.statusBarHeight + 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },

  headerContent: {
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

  iconText: {
    fontSize: 22,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },

  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FDF2F8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // WEBVIEW
  webview: {
    flex: 1,
  },

  // OVERLAY
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  // FAB MENU
  fabMenuItem: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  fabItem1: {
    bottom: 180,
  },

  fabItem2: {
    bottom: 260,
  },

  fabItem3: {
    bottom: 340,
  },

  fabMenu: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },

  fabLabel: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 10,
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  // MAIN FAB
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 100,
  },

  fab: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EC4899',
    borderRadius: 30,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },

  // BOTTOM INFO CARD
  bottomCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 90,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  infoText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    marginLeft: 8,
  },
});