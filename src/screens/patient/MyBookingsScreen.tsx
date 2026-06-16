import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

const DUMMY_BOOKINGS = [
  { id: 'BK-101', test: 'Complete Blood Count (CBC)', date: '15 Jun 2026', time: '09:00 AM', status: 'Pending', price: '₹499' },
  { id: 'BK-102', test: 'Diabetes Screening', date: '10 Jun 2026', time: '10:30 AM', status: 'Completed', price: '₹999' },
  { id: 'BK-103', test: 'Thyroid Profile', date: '01 Jun 2026', time: '08:15 AM', status: 'Completed', price: '₹750' },
];

export default function MyBookingsScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      <FlatList
        data={DUMMY_BOOKINGS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.bookingCard}>
            <View style={styles.cardHeader}>
              <View style={styles.idBadge}>
                <Text style={styles.idText}>{item.id}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'Completed' ? '#D1FAE5' : '#FEF3C7' }]}>
                <Text style={[styles.statusText, { color: item.status === 'Completed' ? '#10B981' : '#F59E0B' }]}>{item.status}</Text>
              </View>
            </View>

            <Text style={styles.testName}>{item.test}</Text>
            
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Feather name="calendar" size={14} color={COLORS.textMuted} />
                <Text style={styles.detailText}>{item.date}</Text>
              </View>
              <View style={styles.detailItem}>
                <Feather name="clock" size={14} color={COLORS.textMuted} />
                <Text style={styles.detailText}>{item.time}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.price}>{item.price}</Text>
              <TouchableOpacity style={styles.detailBtn}>
                <Text style={styles.detailBtnText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No bookings found</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { marginRight: SPACING.md },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  listContent: { padding: SPACING.md },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1, borderColor: '#F1F5F9',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  idBadge: { backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  idText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 10, fontWeight: '700' },
  testName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  detailsRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 13, color: COLORS.textSecondary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F8FAFC', paddingTop: SPACING.sm },
  price: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  detailBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: COLORS.primaryLight },
  detailBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  emptyText: { textAlign: 'center', marginTop: SPACING.xl, color: COLORS.textMuted },
});
