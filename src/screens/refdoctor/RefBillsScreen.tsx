import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { fetchRefPatients, PatientRow } from './RefPatientsScreen';

const T = {
  primary: '#0D9488', tealDark: '#0F766E', tealBg: '#F0FDFA',
  bg: '#FFFFFF', screenBg: '#F8FAFC', text: '#0F172A',
  sub: '#64748B', muted: '#94A3B8', border: '#E2E8F0',
  green: '#10B981', warning: '#F59E0B', danger: '#EF4444',
};

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
}

export default function RefBillsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [rows,       setRows]       = useState<PatientRow[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try { setRows(await fetchRefPatients(user?.name ?? '')); }
    catch (e: any) { Alert.alert('Error', e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const totalRevenue  = rows.reduce((s, r) => s + (r.TestCharges ?? 0), 0);
  const totalPaid     = rows.reduce((s, r) => s + (r.PaidAmount  ?? 0), 0);
  const totalDue      = rows.reduce((s, r) => s + (r.OutstandingAmount ?? 0), 0);

  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 10) }]}>
      <View style={s.header}>
        <Text style={s.title}>Bills</Text>
        <Text style={s.count}>{rows.length} records</Text>
      </View>

      {/* Summary */}
      <View style={s.summaryGrid}>
        <View style={[s.summaryCard, { backgroundColor: T.tealBg, borderColor: '#CCFBF1' }]}>
          <Text style={[s.summaryVal, { color: T.tealDark }]}>₹{(totalRevenue/1000).toFixed(1)}k</Text>
          <Text style={s.summaryLbl}>Total Charges</Text>
        </View>
        <View style={[s.summaryCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
          <Text style={[s.summaryVal, { color: T.green }]}>₹{(totalPaid/1000).toFixed(1)}k</Text>
          <Text style={s.summaryLbl}>Total Paid</Text>
        </View>
        <View style={[s.summaryCard, { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' }]}>
          <Text style={[s.summaryVal, { color: T.danger }]}>₹{totalDue.toFixed(0)}</Text>
          <Text style={s.summaryLbl}>Outstanding</Text>
        </View>
      </View>

      {loading ? (
        <View style={s.centre}><ActivityIndicator size="large" color={T.primary} /><Text style={s.centreText}>Loading…</Text></View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item, i) => `${item.PID}-${i}`}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[T.primary]} />}
          ListEmptyComponent={<View style={s.centre}><MaterialCommunityIcons name="receipt" size={48} color={T.muted} /><Text style={s.centreText}>No bills found</Text></View>}
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.cardRow}>
                <View style={s.iconBox}>
                  <MaterialCommunityIcons name="receipt" size={20} color={T.tealDark} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{item.PatientName}</Text>
                  <Text style={s.sub2}>PT{String(item.PatRegID).padStart(6,'0')}  •  {fmtDate(item.Patregdate)}</Text>
                  <Text style={s.tests} numberOfLines={1}>{item.tests.join(' · ')}</Text>
                </View>
              </View>
              <View style={s.billRow}>
                <View style={s.billItem}>
                  <Text style={s.billLabel}>Charges</Text>
                  <Text style={s.billValue}>₹{(item.TestCharges ?? 0).toFixed(0)}</Text>
                </View>
                <View style={s.billItem}>
                  <Text style={s.billLabel}>Paid</Text>
                  <Text style={[s.billValue, { color: T.green }]}>₹{(item.PaidAmount ?? 0).toFixed(0)}</Text>
                </View>
                {(item.DiscountAmount ?? 0) > 0 && (
                  <View style={s.billItem}>
                    <Text style={s.billLabel}>Discount</Text>
                    <Text style={[s.billValue, { color: T.warning }]}>₹{(item.DiscountAmount ?? 0).toFixed(0)}</Text>
                  </View>
                )}
                <View style={s.billItem}>
                  <Text style={s.billLabel}>Due</Text>
                  <Text style={[s.billValue, { color: (item.OutstandingAmount ?? 0) > 0 ? T.danger : T.muted }]}>
                    ₹{(item.OutstandingAmount ?? 0).toFixed(0)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: T.screenBg },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 },
  title:       { fontSize: 18, fontWeight: '800', color: T.text },
  count:       { fontSize: 13, color: T.sub, fontWeight: '600' },
  summaryGrid: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 10 },
  summaryCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: 'center' },
  summaryVal:  { fontSize: 18, fontWeight: '800' },
  summaryLbl:  { fontSize: 10, color: T.sub, marginTop: 2 },
  list:        { paddingHorizontal: 16, paddingBottom: 80 },
  centre:      { alignItems: 'center', paddingTop: 50 },
  centreText:  { fontSize: 14, color: T.sub, marginTop: 8 },
  card:        { backgroundColor: T.bg, borderRadius: 12, borderWidth: 1, borderColor: T.border, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
  cardRow:     { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  iconBox:     { width: 38, height: 38, borderRadius: 10, backgroundColor: T.tealBg, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  name:        { fontSize: 14, fontWeight: '700', color: T.text, marginBottom: 1 },
  sub2:        { fontSize: 11, color: T.sub, marginBottom: 2 },
  tests:       { fontSize: 11, color: T.muted },
  billRow:     { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 20 },
  billItem:    {},
  billLabel:   { fontSize: 10, color: T.muted, fontWeight: '500' },
  billValue:   { fontSize: 13, fontWeight: '700', color: T.text },
});
