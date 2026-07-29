import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../utils/constants';

const T = {
  primary:  '#7C3AED',   // Purple for ref doctor
  bg:       '#FFFFFF',
  screenBg: '#F5F3FF',
  text:     '#0F172A',
  sub:      '#64748B',
  muted:    '#94A3B8',
  border:   '#E2E8F0',
  green:    '#10B981',
};

interface PatientRow {
  PID: number; PatRegID: number; PatientName: string;
  Patphoneno: string; Status: string; Patregdate: string;
  MainTestName: string; TestCharges: number; PaidAmount: number;
  Drname: string; tests: string[];
}

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

function statusColor(s: string) {
  switch (s) {
    case 'Registered':       return { color: '#F59E0B', bg: '#FFFBEB' };
    case 'Sample Collected': return { color: '#3B82F6', bg: '#EFF6FF' };
    case 'Processing':       return { color: '#F97316', bg: '#FFF7ED' };
    case 'Report Ready':     return { color: '#10B981', bg: '#ECFDF5' };
    default:                 return { color: '#94A3B8', bg: '#F1F5F9' };
  }
}

export default function RefDoctorHomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const [patients,   setPatients]   = useState<PatientRow[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState('');

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`${API_BASE_URL}/api/TestStatus/GetPatientTestStatus`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          BranchId: 1, FromDate: '2024-01-01', ToDate: today,
          PatRegID: '', PatientName: '', DoctorName: user?.name ?? '',
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
            PatientName: r.PatientName ?? r.Patname ?? '—',
            Patphoneno: r.Patphoneno ?? '—',
            Status: r.Status ?? 'Registered',
            Patregdate: r.Patregdate ?? '',
            MainTestName: r.MainTestName,
            TestCharges: r.TestCharges ?? 0,
            PaidAmount:  r.PaidAmount  ?? 0,
            Drname: r.Drname ?? '—',
            tests: [r.MainTestName],
          });
        }
      }
      setPatients(Array.from(map.values()));
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load patients.');
    } finally { setLoading(false); setRefreshing(false); }
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    return p.PatientName.toLowerCase().includes(q) || p.Patphoneno.includes(q);
  });

  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 0) }]}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.title}>My Patients</Text>
          <Text style={s.sub}>Referred by {user?.name || 'You'}</Text>
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={() => logout()}>
          <Feather name="log-out" size={18} color={T.primary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchBar}>
        <Feather name="search" size={16} color={T.muted} style={{ marginRight: 8 }} />
        <TextInput style={s.searchInput} placeholder="Search by name or mobile..."
          placeholderTextColor={T.muted} value={search} onChangeText={setSearch} />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Feather name="x" size={15} color={T.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Summary */}
      <View style={s.summaryRow}>
        <View style={s.summaryChip}>
          <Text style={s.summaryVal}>{patients.length}</Text>
          <Text style={s.summaryLbl}>Total</Text>
        </View>
        <View style={s.summaryChip}>
          <Text style={[s.summaryVal, { color: '#10B981' }]}>
            {patients.filter(p => p.Status === 'Report Ready').length}
          </Text>
          <Text style={s.summaryLbl}>Ready</Text>
        </View>
        <View style={s.summaryChip}>
          <Text style={[s.summaryVal, { color: '#F59E0B' }]}>
            {patients.filter(p => p.Status === 'Registered').length}
          </Text>
          <Text style={s.summaryLbl}>Pending</Text>
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View style={s.centre}>
          <ActivityIndicator size="large" color={T.primary} />
          <Text style={s.centreText}>Loading patients…</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => `${item.PID}-${i}`}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[T.primary]} />}
          ListEmptyComponent={
            <View style={s.centre}>
              <MaterialCommunityIcons name="account-search-outline" size={52} color={T.muted} />
              <Text style={s.centreText}>No patients found</Text>
            </View>
          }
          renderItem={({ item }) => {
            const sc = statusColor(item.Status);
            return (
              <View style={s.card}>
                <View style={s.cardTop}>
                  <View style={s.avatar}>
                    <Text style={s.avatarText}>{item.PatientName.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.name}>{item.PatientName}</Text>
                    <Text style={s.pid}>PT{String(item.PatRegID).padStart(6,'0')}  •  {fmtDate(item.Patregdate)}</Text>
                    <View style={s.metaRow}>
                      <Feather name="phone" size={11} color={T.muted} />
                      <Text style={s.metaText}>{item.Patphoneno}</Text>
                    </View>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
                    <View style={[s.statusDot, { backgroundColor: sc.color }]} />
                    <Text style={[s.statusText, { color: sc.color }]}>{item.Status}</Text>
                  </View>
                </View>
                {item.tests.length > 0 && (
                  <View style={s.testsRow}>
                    <MaterialCommunityIcons name="flask-outline" size={13} color={T.sub} style={{ marginRight: 6 }} />
                    <Text style={s.testsText} numberOfLines={1}>{item.tests.join(' · ')}</Text>
                  </View>
                )}
                <View style={s.billingRow}>
                  <Text style={s.billingLabel}>Charges</Text>
                  <Text style={s.billingValue}>₹{(item.TestCharges ?? 0).toFixed(0)}</Text>
                  <Text style={[s.billingLabel, { marginLeft: 16 }]}>Paid</Text>
                  <Text style={[s.billingValue, { color: T.green }]}>₹{(item.PaidAmount ?? 0).toFixed(0)}</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: T.screenBg },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 18, paddingBottom: 12, backgroundColor: T.bg, borderBottomWidth: 1, borderBottomColor: T.border },
  headerLeft: { flex: 1 },
  title:      { fontSize: 20, fontWeight: '800', color: T.text },
  sub:        { fontSize: 12, color: T.sub, marginTop: 2 },
  logoutBtn:  { padding: 8, borderRadius: 8, backgroundColor: '#F5F3FF' },
  searchBar:  { flexDirection: 'row', alignItems: 'center', margin: 14, backgroundColor: T.bg, borderWidth: 1, borderColor: T.border, borderRadius: 12, paddingHorizontal: 12, height: 44 },
  searchInput:{ flex: 1, fontSize: 14, color: T.text },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 14, marginBottom: 8, gap: 10 },
  summaryChip:{ flex: 1, backgroundColor: T.bg, borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: T.border },
  summaryVal: { fontSize: 20, fontWeight: '800', color: T.primary },
  summaryLbl: { fontSize: 11, color: T.sub, marginTop: 2 },
  list:       { paddingHorizontal: 14, paddingBottom: 100 },
  centre:     { alignItems: 'center', paddingTop: 60 },
  centreText: { fontSize: 14, color: T.sub, marginTop: 10 },
  card:       { backgroundColor: T.bg, borderRadius: 12, borderWidth: 1, borderColor: T.border, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
  cardTop:    { flexDirection: 'row', alignItems: 'flex-start', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  avatar:     { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { fontSize: 16, fontWeight: '800', color: T.primary },
  name:       { fontSize: 14, fontWeight: '700', color: T.text, marginBottom: 2 },
  pid:        { fontSize: 11, color: T.sub, marginBottom: 3 },
  metaRow:    { flexDirection: 'row', alignItems: 'center' },
  metaText:   { fontSize: 11, color: T.muted, marginLeft: 3 },
  statusBadge:{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10 },
  statusDot:  { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statusText: { fontSize: 10, fontWeight: '700' },
  testsRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  testsText:  { flex: 1, fontSize: 12, color: T.sub },
  billingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 },
  billingLabel:{ fontSize: 11, color: T.muted },
  billingValue:{ fontSize: 13, fontWeight: '700', color: T.text, marginLeft: 4 },
});
