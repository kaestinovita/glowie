// @ts-nocheck
import React, { useState, useLayoutEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert,
  Linking 
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { getDatabase, ref, update, push } from 'firebase/database';
import { db } from '@/constants/firebaseConfig';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function EventRegistrationForm() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();

  // Hide header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Event data dari params
  const eventData = {
    id: params.id || '',
    name: params.name || '',
    category: params.category || '',
    date: params.date || '',
    time: params.time || '',
    coordinates: params.coordinates || '',
    price: params.price || '0',
    isFree: params.isFree === 'true',
  };

  // Form state
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    instagram: '',
    notes: '',
  });

  const [selectedMethod, setSelectedMethod] = useState('whatsapp'); // whatsapp or direct

  // Validation
  const validateForm = () => {
    if (!form.fullName.trim()) {
      Alert.alert('Error', 'Nama lengkap wajib diisi');
      return false;
    }
    if (!form.phone.trim()) {
      Alert.alert('Error', 'Nomor WhatsApp wajib diisi');
      return false;
    }
    if (form.phone.length < 10) {
      Alert.alert('Error', 'Nomor WhatsApp tidak valid');
      return false;
    }
    return true;
  };

  // Handle Direct Registration
  const handleDirectRegistration = async () => {
    if (!validateForm()) return;

    try {
      // Update event status
      const pointRef = ref(db, `points/${eventData.id}`);
      await update(pointRef, { 
        registered: true,
        lastUpdated: new Date().toISOString(),
      });

      // Save registration data
      const registrationsRef = ref(db, `registrations/${eventData.id}`);
      await push(registrationsRef, {
        ...form,
        eventName: eventData.name,
        registeredAt: new Date().toISOString(),
      });

      Alert.alert(
        'Berhasil! 🎉',
        `Kamu berhasil terdaftar di event "${eventData.name}"`,
        [
          { 
            text: 'OK', 
            onPress: () => router.back(),
          }
        ]
      );
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Gagal mendaftar. Silakan coba lagi.');
    }
  };

  // Handle WhatsApp Registration
  const handleWhatsAppRegistration = async () => {
    if (!validateForm()) return;

    const message = `🎉 *PENDAFTARAN EVENT*

📍 *Event:* ${eventData.name}
📂 *Kategori:* ${eventData.category || '-'}
📅 *Tanggal:* ${eventData.date || 'TBA'}
⏰ *Waktu:* ${eventData.time || 'TBA'}
💰 *Biaya:* ${eventData.isFree ? 'GRATIS' : `Rp ${eventData.price}`}

👤 *DATA PESERTA*
Nama: ${form.fullName}
Email: ${form.email || '-'}
WhatsApp: ${form.phone}
Instagram: ${form.instagram || '-'}

${form.notes ? `📝 Catatan: ${form.notes}` : ''}

Terima kasih! 🙏`;

    const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;

    try {
      // Update status to registered
      const pointRef = ref(db, `points/${eventData.id}`);
      await update(pointRef, { 
        registered: true,
        lastUpdated: new Date().toISOString(),
      });

      // Save to registrations
      const registrationsRef = ref(db, `registrations/${eventData.id}`);
      await push(registrationsRef, {
        ...form,
        eventName: eventData.name,
        method: 'whatsapp',
        registeredAt: new Date().toISOString(),
      });

      // Open WhatsApp
      await Linking.openURL(whatsappUrl);
      
      Alert.alert(
        'Berhasil! 🎉',
        'Kamu akan diarahkan ke WhatsApp untuk konfirmasi pendaftaran',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('WhatsApp error:', error);
      Alert.alert('Error', 'Gagal membuka WhatsApp. Pastikan aplikasi terinstall.');
    }
  };

  // Handle Submit
  const handleSubmit = () => {
    if (selectedMethod === 'whatsapp') {
      handleWhatsAppRegistration();
    } else {
      handleDirectRegistration();
    }
  };

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#EC4899" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daftar Event</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* EVENT INFO CARD */}
        <View style={styles.eventInfoCard}>
          <View style={styles.eventInfoHeader}>
            <View style={styles.eventIconCircle}>
              <Text style={styles.eventIcon}>🎉</Text>
            </View>
            <View style={styles.eventInfoContent}>
              <Text style={styles.eventInfoTitle}>{eventData.name}</Text>
              {eventData.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{eventData.category}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Event Details */}
          <View style={styles.eventDetails}>
            {eventData.date && (
              <View style={styles.detailRow}>
                <FontAwesome5 name="calendar" size={14} color="#6B7280" />
                <Text style={styles.detailText}>{eventData.date}</Text>
              </View>
            )}
            {eventData.time && (
              <View style={styles.detailRow}>
                <FontAwesome5 name="clock" size={14} color="#6B7280" />
                <Text style={styles.detailText}>{eventData.time}</Text>
              </View>
            )}
            {eventData.price && (
              <View style={styles.detailRow}>
                <FontAwesome5 name="tag" size={14} color="#6B7280" />
                <Text style={styles.detailText}>
                  {eventData.isFree ? 'GRATIS 🎉' : `Rp ${eventData.price}`}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* REGISTRATION METHOD */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Metode Pendaftaran</Text>
          
          <TouchableOpacity
            style={[
              styles.methodCard,
              selectedMethod === 'whatsapp' && styles.methodCardActive,
            ]}
            onPress={() => setSelectedMethod('whatsapp')}
            activeOpacity={0.7}
          >
            <View style={styles.methodIconContainer}>
              <FontAwesome5 
                name="whatsapp" 
                size={24} 
                color={selectedMethod === 'whatsapp' ? '#25D366' : '#9CA3AF'} 
              />
            </View>
            <View style={styles.methodContent}>
              <Text style={[
                styles.methodTitle,
                selectedMethod === 'whatsapp' && styles.methodTitleActive,
              ]}>
                Via WhatsApp
              </Text>
              <Text style={styles.methodDesc}>
                Daftar langsung via chat WhatsApp dengan admin
              </Text>
            </View>
            {selectedMethod === 'whatsapp' && (
              <FontAwesome5 name="check-circle" size={20} color="#EC4899" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.methodCard,
              selectedMethod === 'direct' && styles.methodCardActive,
            ]}
            onPress={() => setSelectedMethod('direct')}
            activeOpacity={0.7}
          >
            <View style={styles.methodIconContainer}>
              <FontAwesome5 
                name="check-circle" 
                size={24} 
                color={selectedMethod === 'direct' ? '#10B981' : '#9CA3AF'} 
              />
            </View>
            <View style={styles.methodContent}>
              <Text style={[
                styles.methodTitle,
                selectedMethod === 'direct' && styles.methodTitleActive,
              ]}>
                Daftar Langsung
              </Text>
              <Text style={styles.methodDesc}>
                Tandai sebagai terdaftar tanpa konfirmasi admin
              </Text>
            </View>
            {selectedMethod === 'direct' && (
              <FontAwesome5 name="check-circle" size={20} color="#EC4899" />
            )}
          </TouchableOpacity>
        </View>

        {/* FORM SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Data Pendaftar</Text>

          {/* NAMA LENGKAP */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Nama Lengkap <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <FontAwesome5 name="user" size={16} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Masukkan nama lengkap"
                placeholderTextColor="#9CA3AF"
                value={form.fullName}
                onChangeText={(text) => setForm({ ...form, fullName: text })}
              />
            </View>
          </View>

          {/* EMAIL */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <FontAwesome5 name="envelope" size={16} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="email@example.com"
                placeholderTextColor="#9CA3AF"
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* NOMOR WHATSAPP */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Nomor WhatsApp <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <FontAwesome5 name="phone" size={16} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="08123456789"
                placeholderTextColor="#9CA3AF"
                value={form.phone}
                onChangeText={(text) => setForm({ ...form, phone: text })}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* INSTAGRAM */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Instagram</Text>
            <View style={styles.inputContainer}>
              <FontAwesome5 name="instagram" size={16} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="@username"
                placeholderTextColor="#9CA3AF"
                value={form.instagram}
                onChangeText={(text) => setForm({ ...form, instagram: text })}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* CATATAN */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Catatan (Opsional)</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tambahkan catatan atau pertanyaan..."
                placeholderTextColor="#9CA3AF"
                value={form.notes}
                onChangeText={(text) => setForm({ ...form, notes: text })}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        {/* INFO BOX */}
        <View style={styles.infoBox}>
          <FontAwesome5 name="info-circle" size={16} color="#3B82F6" />
          <Text style={styles.infoText}>
            {selectedMethod === 'whatsapp' 
              ? 'Setelah submit, kamu akan diarahkan ke WhatsApp untuk konfirmasi pendaftaran dengan admin.'
              : 'Data pendaftaran akan tersimpan dan status event akan berubah menjadi "Terdaftar".'}
          </Text>
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <FontAwesome5 
            name={selectedMethod === 'whatsapp' ? 'whatsapp' : 'check-circle'} 
            size={18} 
            color="#FFF" 
          />
          <Text style={styles.submitButtonText}>
            {selectedMethod === 'whatsapp' ? 'Daftar via WhatsApp' : 'Daftar Sekarang'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FDF2F8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },

  // SCROLL VIEW
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
  },

  // EVENT INFO CARD
  eventInfoCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  eventInfoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  eventIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FDF2F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  eventIcon: {
    fontSize: 28,
  },

  eventInfoContent: {
    flex: 1,
  },

  eventInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.3,
  },

  categoryBadge: {
    backgroundColor: '#FDF2F8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },

  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EC4899',
  },

  eventDetails: {
    gap: 10,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  detailText: {
    fontSize: 14,
    color: '#6B7280',
  },

  // SECTION
  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },

  // METHOD CARD
  methodCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },

  methodCardActive: {
    borderColor: '#EC4899',
    backgroundColor: '#FDF2F8',
  },

  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  methodContent: {
    flex: 1,
  },

  methodTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 4,
  },

  methodTitleActive: {
    color: '#111827',
  },

  methodDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },

  // FORM INPUT
  inputGroup: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },

  required: {
    color: '#EF4444',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 14,
  },

  textAreaContainer: {
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingVertical: 0,
  },

  // INFO BOX
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#DBEAFE',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },

  // SUBMIT BUTTON
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EC4899',
    padding: 18,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },

  bottomSpacing: {
    height: 40,
  },
});