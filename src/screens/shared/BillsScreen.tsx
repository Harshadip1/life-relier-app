import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../../utils/constants';

const T = {
  primary: '#0D9488', bg: '#FFFFFF', screenBg: '#F8FAFC',
  text: '#0F172A', sub: '#64748B', muted: '#94A3B8', border: '#E2E8F0',
  green: '#10B981',
};

interface BillRow {
  PatRegID: number; PatientName: string; Patphoneno: string;
  TestCharges: number; PaidAmount: number; DiscountAmount: number;
  OutstandingAmount: number; Patregdate: string; tests: string[];
}

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

export default function BillsScreen() {
  const insets = useSafeAreaInsets();
  const [records, setRecords]     = useState<BillRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]       = useState('');

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`${API_BASE_URL}/api/TestStatus/GetPatientTestStatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          BranchId: 1, FromDate: '2024-01-01', ToDate: today,
          PatRegID: '', PatientName: '', DoctorName: '', TestName: '',
          MobileNo: '', Barcode: '', CenterCode: '', SubDepartment: '', Status: 'All',
        }),
      });
      const data = await res.json();
      const rows: any[] = Array.isArray(data) ? data : (data?.value ?? []);
      const map = new Map<number, BillRow>();
      for (const r of rows) {
        if (map.has(r.PatRegID)) { map.get(r.PatRegID)!.tests.push(r.MainTestName); }
        else map.set(r.PatRegID, {
          PatRegID: r.PatRegID, PatientName: r.PatientName ?? r.Patname ?? '—',
          Patphoneno: r.Patphoneno ?? '—',
          TestCharges: r.TestCharges ?? 0, PaidAmount: r.PaidAmount ?? 0,
          DiscountAmount: r.DiscountAmount ?? 0, OutstandingAmount: r.OutstandingAmount ?? 0,
          Patregdate: r.Patregdate ?? '', tests: [r.MainTestName],
        });
      }
      setRecords(Array.from(map.values()));
    } catch { setRecords([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    return r.PatientName.toLowerCase().includes(q) || r.Patphoneno.includes(q) ||
           String(r.PatRegID).includes(q);
  });

  const totalCollected = records.reduce((s, r) => s + (r.PaidAmount ?? 0), 0);
  const totalDue       = records.reduce((s, r) => s + (r.OutstandingAmount ?? 0), 0);

  return (
    <View style={[st.root, { paddingTop: Math.max(insets.top, 0) }]}>
      <View style={st.header}>
        <Text style={st.title}>Bills</Text>
        <Text style={st.sub}>{records.length} records</Text>
      </View>

      <View style={st.summaryRow}>
        <View style={[st.summaryCard, { backgroundColor: '#ECFDF5' }]}>
          <Text style={[st.summaryVal, { color: T.green }]}>₹{totalCollected.toLocaleString('en-IN')}</Text>
          <Text style={[st.summaryLbl, { color: T.green }]}>Collected</Text>
        </View>
        <View style={[st.summaryCard, { backgroundColor: '#FEF2F2' }]}>
          <Text style={[st.summaryVal, { color: '#EF4444' }]}>₹{totalDue.toLocaleString('en-IN')}</Text>
          <Text style={[st.summaryLbl, { color: '#EF4444' }]}>Outstanding</Text>
        </View>
      </View>

      <View style={st.searchBar}>
        <Feather name="search" size={15} color={T.muted} style={{ marginRight: 8 }} />
        <TextInput style={st.searchInput} placeholder="Search patient, ID, mobile..."
          placeholderTextColor={T.muted} value={search} onChangeText={setSearch} />
        {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><Feather name="x" size={14} color={T.muted} /></TouchableOpacity>}
      </View>

      {loading ? (
        <View style={st.centre}><ActivityIndicator size="large" color={T.primary} /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => `${item.PatRegID}-${i}`}
          contentContainerStyle={st.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[T.primary]} />}
          ListEmptyComponent={<View style={st.centre}><MaterialCommunityIcons name="receipt" size={48} color={T.muted} /><Text style={st.centreText}>No bills found</Text></View>}
          renderItem={({ item }) => (
            <View style={st.card}>
              <View style={st.cardTop}>
                <View style={st.avatar}><Text style={st.avatarText}>{item.PatientName.charAt(0).toUpperCase()}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={st.name}>{item.PatientName}</Text>
                  <Text style={st.pid}>PT{String(item.PatRegID).padStart(6,'0')}  •  {fmtDate(item.Patregdate)}</Text>
                  <Text style={st.tests} numberOfLines={1}>{item.tests.join(' · ')}</Text>
                </View>
              </View>
              <View style={st.billingRow}>
                <View style={st.billingItem}><Text style={st.billingLabel}>Charges</Text><Text style={st.billingValue}>₹{(item.TestCharges ?? 0).toFixed(0)}</Text></View>
                <View style={st.billingItem}><Text style={st.billingLabel}>Paid</Text><Text style={[st.billingValue, { color: T.green }]}>₹{(item.PaidAmount ?? 0).toFixed(0)}</Text></View>
                {(item.DiscountAmount ?? 0) > 0 && <View style={st.billingItem}><Text style={st.billingLabel}>Discount</Text><Text style={[st.billingValue, { color: '#F59E0B' }]}>₹{(item.DiscountAmount ?? 0).toFixed(0)}</Text></View>}
                {(item.OutstandingAmount ?? 0) > 0 && <View style={st.billingItem}><Text style={st.billingLabel}>Due</Text><Text style={[st.billingValue, { color: '#EF4444' }]}>₹{(item.OutstandingAmount ?? 0).toFixed(0)}</Text></View>}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const st = StyleSheet.create({
  root:        { flex: 1, backgroundColor: T.screenBg },
  header:      { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 10, backgroundColor: T.bg, borderBottomWidth: 1, borderBottomColor: T.border },
  title:       { fontSize: 20, fontWeight: '800', color: T.text },
  sub:         { fontSize: 12, color: T.sub, marginTop: 2 },
  summaryRow:  { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  summaryCard: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  summaryVal:  { fontSize: 18, fontWeight: '800' },
  summaryLbl:  { fontSize: 11, marginTop: 2 },
  searchBar:   { flexDirection: 'row', alignItems: 'center', marginHorizontal: 14, marginBottom: 8, backgroundColor: T.bg, borderWidth: 1, borderColor: T.border, borderRadius: 10, paddingHorizontal: 12, height: 42 },
  searchInput: { flex: 1, fontSize: 13, color: T.text },
  list:        { paddingHorizontal: 14, paddingBottom: 80 },
  centre:      { alignItems: 'center', paddingTop: 40 },
  centreText:  { fontSize: 14, color: T.sub, marginTop: 8 },
  card:        { backgroundColor: T.bg, borderRadius: 12, borderWidth: 1, borderColor: T.border, marginBottom: 10, overflow: 'hidden' },
  cardTop:     { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  avatar:      { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F0FDFA', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText:  { fontSize: 15, fontWeight: '800', color: T.primary },
  name:        { fontSize: 14, fontWeight: '700', color: T.text, marginBottom: 1 },
  pid:         { fontSize: 11, color: T.sub, marginBottom: 2 },
  tests:       { fontSize: 11, color: T.muted },
  billingRow:  { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 12 },
  billingItem: { flex: 1 },
  billingLabel:{ fontSize: 10, color: T.muted, fontWeight: '500', marginBottom: 1 },
  billingValue:{ fontSize: 13, fontWeight: '700', color: T.text },
});
