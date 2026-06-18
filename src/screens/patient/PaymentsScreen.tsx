import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

const DUMMY_PAYMENTS = [
  { id: 'INV-2026-001', test: 'Full Body Checkup', date: '12 Jun 2026', amount: '₹1,999', method: 'UPI', status: 'Success' },
  { id: 'INV-2026-002', test: 'Vitamin D Test', date: '08 Jun 2026', amount: '₹850', method: 'Card', status: 'Success' },
  { id: 'INV-2026-003', test: 'Kidney Function Test', date: '25 May 2026', amount: '₹1,200', method: 'Net Banking', status: 'Success' },
];

export default function PaymentsScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment History</Text>
      </View>

      <FlatList
        data={DUMMY_PAYMENTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.paymentCard}>
            <View style={styles.cardMain}>
              <View style={styles.methodIconBox}>
                <MaterialCommunityIcons 
                  name={item.method === 'UPI' ? 'rhombus-split' : 'credit-card-outline'} 
                  size={24} 
                  color={COLORS.primary} 
                />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.testTitle}>{item.test}</Text>
                <Text style={styles.paymentDate}>{item.date} • {item.method}</Text>
              </View>
              <View style={styles.amountBox}>
                <Text style={styles.amountText}>{item.amount}</Text>
                <View style={styles.statusRow}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.invNo}>{item.id}</Text>
              <TouchableOpacity style={styles.downloadBtn}>
                <Feather name="download" size={14} color={COLORS.primary} />
                <Text style={styles.downloadText}>Invoice</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
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
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  cardMain: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  methodIconBox: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: '#F0FDFA',
    alignItems: 'center', justifyContent: 'center',
  },
  paymentInfo: { flex: 1, marginLeft: SPACING.md },
  testTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  paymentDate: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  amountBox: { alignItems: 'flex-end' },
  amountText: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  statusText: { fontSize: 10, fontWeight: '600', color: '#10B981' },
  cardFooter: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: '#F8FAFC' 
  },
  invNo: { fontSize: 11, color: COLORS.textMuted },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  downloadText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
});
