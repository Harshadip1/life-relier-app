import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Modal, Platform, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../utils/constants';

const T = {
  primary: '#0D9488', tealDark: '#0F766E', tealBg: '#F0FDFA', tealBorder: '#CCFBF1',
  bg: '#FFFFFF', screenBg: '#F8FAFC', text: '#0F172A', sub: '#64748B',
  muted: '#94A3B8', border: '#E2E8F0', green: '#10B981', warning: '#F59E0B',
};

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
}

function statusColor(s: string) {
  switch (s) {
    case 'Registered':       return { color: T.warning,  bg: '#FFFBEB' };
    case 'Sample Collected': return { color: '#3B82F6',  bg: '#EFF6FF' };
    case 'Processing':       return { color: '#F97316',  bg: '#FFF7ED' };
    case 'Report Ready':     return { color: T.green,    bg: '#ECFDF5' };
    default:                 return { color: T.muted,    bg: '#F1F5F9' };
  }
}

export interface PatientRow {
  PID: number; PatRegID: number; PatientName: string;
  Patphoneno: string; Status: string; Patregdate: string;
  TestCharges: number; PaidAmount: number; OutstandingAmount: number;
  DiscountAmount: number; Drname: string; tests: string[];
}

export async function fetchRefPatients(doctorName: string): Promise<PatientRow[]> {
  const today = new Date().toISOString().split('T')[0];
  const res = await fetch(`${API_BASE_URL}/api/TestStatus/GetPatientTestStatus`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      BranchId: 1, FromDate: '2024-01-01', ToDate: today,
      PatRegID: '', PatientName: '', DoctorName: doctorName,
      TestName: '', MobileNo: '', Barcode: '', CenterCode: '',
      SubDepartment: '', Status: 'All',
    }),
  });
  const data = await res.json();
  const rows: any[] = Array.isArray(data) ? data : (data?.value ?? []);
  const map = new Map<number, PatientRow>();
  for (const r of rows) {
    if (map.has(r.PID)) { map.get(r.PID)!.tests.push(r.MainTestName); }
    else {
      map.set(r.PID, {
        PID: r.PID, PatRegID: r.PatRegID,
        PatientName:      r.PatientName ?? r.Patname ?? '—',
        Patphoneno:       r.Patphoneno  ?? '—',
        Status:           r.Status      ?? 'Registered',
        Patregdate:       r.Patregdate  ?? '',
        TestCharges:      r.TestCharges      ?? 0,
        PaidAmount:       r.PaidAmount        ?? 0,
        OutstandingAmount:r.OutstandingAmount ?? 0,
        DiscountAmount:   r.DiscountAmount    ?? 0,
        Drname:           r.Drname      ?? '—',
        tests: [r.MainTestName],
      });
    }
  }
  return Array.from(map.values());
}

export default function RefPatientsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [patients,   setPatients]   = useState<PatientRow[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState('');
  const [selected,   setSelected]   = useState<PatientRow | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try { setPatients(await fetchRefPatients(user?.name ?? '')); }
    catch (e: any) { Alert.alert('Error', e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    return p.PatientName.toLowerCase().includes(q) || p.Patphoneno.includes(q);
  });

  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 10) }]}>
      <View style={s.header}>
        <Text style={s.title}>My Patients</Text>
        <Text style={s.count}>{patients.length} total</Text>
      </View>
      <View style={s.searchBar}>
        <Feather name="search" size={15} color={T.muted} style={{ marginRight: 8 }} />
        <TextInput style={s.searchInput} placeholder="Search name or mobile..."
          placeholderTextColor={T.muted} value={search} onChangeText={setSearch} />
        {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><Feather name="x" size={14} color={T.muted} /></TouchableOpacity>}
      </View>
      {loading ? (
        <View style={s.centre}><ActivityIndicator size="large" color={T.primary} /><Text style={s.centreText}>Loading…</Text></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => `${item.PID}-${i}`}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[T.primary]} />}
          ListEmptyComponent={<View style={s.centre}><MaterialCommunityIcons name="account-search-outline" size={48} color={T.muted} /><Text style={s.centreText}>No patients found</Text></View>}
          renderItem={({ item }) => {
            const sc = statusColor(item.Status);
            return (
              <TouchableOpacity style={s.card} onPress={() => setSelected(item)} activeOpacity={0.8}>
                <View style={s.cardTop}>
                  <View style={s.avatar}><Text style={s.avatarTxt}>{item.PatientName.charAt(0).toUpperCase()}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.name}>{item.PatientName}</Text>
                    <Text style={s.pid}>PT{String(item.PatRegID).padStart(6,'0')}  •  {fmtDate(item.Patregdate)}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Feather name="phone" size={11} color={T.muted} /><Text style={s.meta}>{item.Patphoneno}</Text>
                    </View>
                  </View>
                  <View style={[s.badge, { backgroundColor: sc.bg }]}>
                    <View style={[s.dot, { backgroundColor: sc.color }]} />
                    <Text style={[s.badgeTxt, { color: sc.color }]}>{item.Status}</Text>
                  </View>
                </View>
                <View style={s.testsRow}>
                  <Feather name="activity" size={12} color={T.sub} style={{ marginRight: 5 }} />
                  <Text style={s.testsTxt} numberOfLines={1}>{item.tests.join(' · ')}</Text>
                </View>
                <View style={s.billingRow}>
                  <View style={s.bi}><Text style={s.bl}>Charges</Text><Text style={s.bv}>₹{(item.TestCharges ?? 0).toFixed(0)}</Text></View>
                  <View style={s.bi}><Text style={s.bl}>Paid</Text><Text style={[s.bv, { color: T.green }]}>₹{(item.PaidAmount ?? 0).toFixed(0)}</Text></View>
                  {(item.OutstandingAmount ?? 0) > 0 && (
                    <View style={s.bi}><Text style={s.bl}>Due</Text><Text style={[s.bv, { color: '#EF4444' }]}>₹{(item.OutstandingAmount ?? 0).toFixed(0)}</Text></View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {selected && (
        <Modal visible transparent animationType="slide">
          <View style={s.overlay}>
            <View style={s.sheet}>
              <View style={s.drag} />
              <TouchableOpacity style={s.closeBtn} onPress={() => setSelected(null)}><Feather name="x" size={20} color={T.sub} /></TouchableOpacity>
              <Text style={s.sheetName}>{selected.PatientName}</Text>
              <Text style={s.sheetPid}>PT{String(selected.PatRegID).padStart(6,'0')}</Text>
              {[
                ['Status',   selected.Status],
                ['Mobile',   selected.Patphoneno],
                ['Reg Date', fmtDate(selected.Patregdate)],
                ['Tests',    selected.tests.join(', ')],
                ['Charges',  `₹${(selected.TestCharges ?? 0).toFixed(2)}`],
                ['Paid',     `₹${(selected.PaidAmount ?? 0).toFixed(2)}`],
                ['Due',      `₹${(selected.OutstandingAmount ?? 0).toFixed(2)}`],
              ].map(([l, v]) => (
                <View key={l} style={s.dr}><Text style={s.dl}>{l}</Text><Text style={s.dv}>{v}</Text></View>
              ))}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: T.screenBg },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 },
  title:      { fontSize: 18, fontWeight: '800', color: T.text },
  count:      { fontSize: 13, color: T.sub, fontWeight: '600' },
  searchBar:  { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, backgroundColor: T.bg, borderWidth: 1, borderColor: T.border, borderRadius: 10, paddingHorizontal: 12, height: 42 },
  searchInput:{ flex: 1, fontSize: 13, color: T.text },
  list:       { paddingHorizontal: 16, paddingBottom: 80 },
  centre:     { alignItems: 'center', paddingTop: 50 },
  centreText: { fontSize: 14, color: T.sub, marginTop: 8 },
  card:       { backgroundColor: T.bg, borderRadius: 12, borderWidth: 1, borderColor: T.border, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
  cardTop:    { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  avatar:     { width: 40, height: 40, borderRadius: 20, backgroundColor: T.tealBg, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarTxt:  { fontSize: 16, fontWeight: '800', color: T.tealDark },
  name:       { fontSize: 14, fontWeight: '700', color: T.text, marginBottom: 1 },
  pid:        { fontSize: 11, color: T.sub, marginBottom: 2 },
  meta:       { fontSize: 11, color: T.muted, marginLeft: 3 },
  badge:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10 },
  dot:        { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  badgeTxt:   { fontSize: 9, fontWeight: '700' },
  testsRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  testsTxt:   { flex: 1, fontSize: 12, color: T.sub },
  billingRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 20 },
  bi:         {},
  bl:         { fontSize: 10, color: T.muted, fontWeight: '500' },
  bv:         { fontSize: 13, fontWeight: '700', color: T.text },
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: T.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  drag:       { width: 36, height: 4, backgroundColor: T.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  closeBtn:   { position: 'absolute', top: 16, right: 16, zIndex: 1 },
  sheetName:  { fontSize: 17, fontWeight: '800', color: T.text, marginBottom: 2 },
  sheetPid:   { fontSize: 12, color: T.primary, fontWeight: '600', marginBottom: 14 },
  dr:         { flexDirection: 'row', marginBottom: 8 },
  dl:         { width: 70, fontSize: 12, color: T.sub, fontWeight: '600' },
  dv:         { flex: 1, fontSize: 13, color: T.text, fontWeight: '600' },
});
