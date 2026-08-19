import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../utils/constants';
import { getAllAppointments } from '../../services/doctorScheduleService';

interface BookingItem {
  id: string;
  testName: string;
  date: string;
  status: string;
  center: string;
}

function slotKeyToDisplay(slot: string): string {
  if (!slot) return slot;
  if (/AM|PM/i.test(slot)) return slot;
  const [hStr, mStr] = slot.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h % 12 || 12;
  return `${String(h12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ampm}`;
}

export default function MyBookingsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [apptB1, apptB4] = await Promise.all([
        getAllAppointments(1).catch(() => []),
        getAllAppointments(4).catch(() => []),
      ]);
      const allAppts = [...apptB1, ...apptB4];
      
      const mapped = allAppts
        .filter(r => (user.phone && r.Mobile === user.phone) || (user.name && r.Name === user.name))
        .map(r => ({
          id: String(r.AppointmentId),
          testName: r.DoctorName || `Dr ID: ${r.DrId}`,
          date: `${r.AppointmentDate ? new Date(r.AppointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'} at ${slotKeyToDisplay(r.Slot || '')}`,
          status: r.Status || (r.IsActive ? 'Active' : 'Done'),
          center: r.Address || 'Clinic',
        }));

      // Sort by descending appointment ID (newest bookings first)
      mapped.sort((a, b) => Number(b.id) - Number(a.id));

      setBookings(mapped);
    } catch (e) {
      console.log('Error fetching bookings:', e);
    } finally {
      setLoading(false);
    }
  };

  const renderBooking = ({ item }: { item: BookingItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="stethoscope" size={20} color={COLORS.primary} />
        </View>
        <View style={styles.testInfo}>
          <Text style={styles.testName}>{item.testName}</Text>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.footerRow}>
        <Feather name="map-pin" size={14} color={COLORS.textSecondary} />
        <Text style={styles.centerText}>{item.center}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="calendar-remove" size={64} color="#E2E8F0" />
          <Text style={styles.emptyText}>No appointments booked</Text>
          <TouchableOpacity style={styles.bookBtn} onPress={() => navigation.navigate('BookAppointment')}>
            <Text style={styles.bookBtnText}>Book Appointment</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBooking}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary, marginTop: 12, marginBottom: 20 },
  bookBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  bookBtnText: { color: '#FFFFFF', fontWeight: '600' },
  listContent: { padding: 16 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: '#F0FDFA',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  testInfo: { flex: 1 },
  testName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  dateText: { fontSize: 12, color: COLORS.textSecondary },
  statusBadge: { backgroundColor: '#F0FDFA', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  footerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  centerText: { fontSize: 13, color: COLORS.textSecondary, marginLeft: 6 },
});
