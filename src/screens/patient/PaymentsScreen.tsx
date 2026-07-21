import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../utils/constants';

interface BillingRow {
  PID:               number;
  PatRegID:          number;
  PatientName:       string;
  MainTestName:      string;
  Patregdate:        string;
  TestCharges:       number;
  PaidAmount:        number;
  DiscountAmount:    number;
  OutstandingAmount: number;
  Status:            string;
  BarcodeID:         string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function PaymentsScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const [records,    setRecords]    = useState<BillingRow[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const fetchPayments = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`${API_BASE_URL}/api/TestStatus/GetPatientTestStatus`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          BranchId:      1,
          FromDate:      '2024-01-01',
          ToDate:        today,
          PatRegID:      '',
          PatientName:   user?.name ?? '',
          DoctorName:    '',
          TestName:      '',
          MobileNo:      user?.phone ?? '',
          Barcode:       '',
          CenterCode:    '',
          SubDepartment: '',
          Status:        'All',
        }),
      });
      const data = await res.json();
      const rows: BillingRow[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.value) ? data.value : [];
      setRecords(rows);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load payment history.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { fetchPayments(); }, [fetchPayments]));

  const renderItem = ({ item }: { item: BillingRow }) => (
    <View style={styles.paymentCard}>
      <View style={styles.cardMain}>
        <View style={styles.methodIconBox}>
          <MaterialCommunityIcons name="flask-outline" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.paymentInfo}>
          <Text style={styles.testTitle} numberOfLines={1}>{item.MainTestName}</Text>
          <Text style={styles.paymentDate}>
            {formatDate(item.Patregdate)}  •  {item.Status}
          </Text>
        </View>
        <View style={styles.amountBox}>
          <Text style={styles.amountText}>₹{item.PaidAmount.toFixed(0)}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: item.OutstandingAmount > 0 ? '#F59E0B' : '#10B981' }]} />
            <Text style={[styles.statusText, { color: item.OutstandingAmount > 0 ? '#F59E0B' : '#10B981' }]}>
              {item.OutstandingAmount > 0 ? 'Partial' : 'Paid'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.invNo}>
          PT{String(item.PatRegID).padStart(6, '0')}  •  Barcode: {item.BarcodeID}
        </Text>
        {item.OutstandingAmount > 0 && (
          <Text style={styles.dueText}>Due: ₹{item.OutstandingAmount.toFixed(0)}</Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment History</Text>
        <TouchableOpacity onPress={() => fetchPayments(true)} style={styles.refreshBtn}>
          <Feather name="refresh-cw" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centre}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.centreTxt}>Loading payments…</Text>
        </View>
      ) : error ? (
        <View style={styles.centre}>
          <MaterialCommunityIcons name="cloud-off-outline" size={52} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>Could not load data</Text>
          <Text style={styles.emptySub}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchPayments()}>
            <Feather name="refresh-cw" size={14} color={COLORS.primary} />
            <Text style={styles.retryTxt}> Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item, i) => `${item.PatRegID}-${item.BarcodeID}-${i}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchPayments(true)} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.centre}>
              <MaterialCommunityIcons name="receipt" size={52} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No payment records found</Text>
            </View>
          }
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#F9FAFB' },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn:    { padding: 4 },
  refreshBtn: { padding: 4 },
  headerTitle:{ fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  listContent:{ padding: SPACING.md },
  paymentCard:{ backgroundColor: '#fff', borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: '#F1F5F9' },
  cardMain:   { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  methodIconBox:{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#F0FDFA', alignItems: 'center', justifyContent: 'center' },
  paymentInfo:{ flex: 1, marginLeft: SPACING.md },
  testTitle:  { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  paymentDate:{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  amountBox:  { alignItems: 'flex-end' },
  amountText: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  statusRow:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusDot:  { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: '#F8FAFC' },
  invNo:      { fontSize: 11, color: COLORS.textMuted },
  dueText:    { fontSize: 11, fontWeight: '700', color: '#F59E0B' },
  centre:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  centreTxt:  { fontSize: 14, color: '#64748B', marginTop: 10 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#334155', marginTop: 12 },
  emptySub:   { fontSize: 12, color: '#94A3B8', marginTop: 4, textAlign: 'center', paddingHorizontal: 24 },
  retryBtn:   { flexDirection: 'row', alignItems: 'center', marginTop: 16, borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 7 },
  retryTxt:   { fontSize: 13, fontWeight: '700', color: COLORS.primary },
});
