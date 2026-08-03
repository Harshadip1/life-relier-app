import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Alert, Modal, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../utils/constants';

const T = {
  primary:   '#0D9488',
  tealDark:  '#0F766E',
  tealBg:    '#F0FDFA',
  tealBorder:'#CCFBF1',
  bg:        '#FFFFFF',
  screenBg:  '#F8FAFC',
  text:      '#0F172A',
  sub:       '#64748B',
  muted:     '#94A3B8',
  border:    '#F1F5F9',
  green:     '#10B981',
  warning:   '#F59E0B',
  danger:    '#EF4444',
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 'Good Morning 🌅';
  if (h >= 12 && h < 17) return 'Good Afternoon ☀️';
  if (h >= 17 && h < 21) return 'Good Evening 🌆';
  return 'Good Night 🌙';
}

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

function statusColor(s: string) {
  switch (s) {
    case 'Registered':       return { color: T.warning, bg: '#FFFBEB' };
    case 'Sample Collected': return { color: '#3B82F6', bg: '#EFF6FF' };
    case 'Processing':       return { color: '#F97316', bg: '#FFF7ED' };
    case 'Report Ready':     return { color: T.green,   bg: '#ECFDF5' };
    case 'Delivered':        return { color: '#6366F1', bg: '#EEF2FF' };
    default:                 return { color: T.muted,   bg: '#F1F5F9' };
  }
}

interface PatientRow {
  PID: number; PatRegID: number; PatientName: string;
  Patphoneno: string; Status: string; Patregdate: string;
  TestCharges: number; PaidAmount: number;
  Drname: string; tests: string[];
}

export default function RefDoctorHomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const [patients,   setPatients]   = useState<PatientRow[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState('');
  const [selected,   setSelected]   = useState<PatientRow | null>(null);

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
            PID:          r.PID,
            PatRegID:     r.PatRegID,
            PatientName:  r.PatientName ?? r.Patname ?? '—',
            Patphoneno:   r.Patphoneno  ?? '—',
            Status:       r.Status      ?? 'Registered',
            Patregdate:   r.Patregdate  ?? '',
            TestCharges:  r.TestCharges ?? 0,
            PaidAmount:   r.PaidAmount  ?? 0,
            Drname:       r.Drname      ?? '—',
            tests:        [r.MainTestName],
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

  const totalPatients  = patients.length;
  const reportReady    = patients.filter(p => p.Status === 'Report Ready').length;
  const pendingCount   = patients.filter(p => p.Status === 'Registered').length;
  const totalRevenue   = patients.reduce((s, p) => s + (p.PaidAmount ?? 0), 0);

  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 0) }]}>

      {/* ── Header Band (same as admin) ── */}
      <View style={s.headerBand}>
        <View style={{ flex: 1 }}>
          <Text style={s.greeting}>{getGreeting()}</Text>
          <Text style={s.userName}>{user?.name || 'Doctor'}</Text>
          <View style={s.labRow}>
            <MaterialCommunityIcons name="check-decagram" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={s.labName}>  Referring Doctor Dashboard</Text>
          </View>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.headerIconBtn} onPress={() => load(true)}>
            <Feather name="refresh-cw" size={18} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={s.headerIconBtn} onPress={() => logout()}>
            <Feather name="log-out" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Stats Grid ── */}
      <View style={s.statsGrid}>
        <StatCard value={String(totalPatients)} label="My Patients"    icon="account-multiple-outline" color={T.tealDark} bg={T.tealBg}   border={T.tealBorder} />
        <StatCard value={String(reportReady)}   label="Reports Ready"  icon="file-check-outline"       color="#15803D"    bg="#F0FDF4"    border="#BBF7D0" />
        <StatCard value={String(pendingCount)}  label="Pending"        icon="clock-outline"            color="#D97706"    bg="#FFFBEB"    border="#FDE68A" />
        <StatCard value={`₹${(totalRevenue/1000).toFixed(0)}k`} label="Revenue" icon="cash-multiple"  color="#7C3AED"    bg="#F5F3FF"    border="#DDD6FE" />
      </View>

      {/* ── Search ── */}
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

      {/* ── Patient List ── */}
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
              <TouchableOpacity style={s.card} onPress={() => setSelected(item)} activeOpacity={0.8}>
                {/* Card top */}
                <View style={s.cardTop}>
                  <View style={s.avatar}>
                    <Text style={s.avatarText}>{item.PatientName.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.name}>{item.PatientName}</Text>
                    <Text style={s.pid}>
                      PID: <Text style={{ color: T.primary }}>PT{String(item.PatRegID).padStart(6,'0')}</Text>
                    </Text>
                    <View style={s.metaRow}>
                      <Feather name="phone" size={11} color={T.muted} />
                      <Text style={s.metaText}>{item.Patphoneno}</Text>
                      <Feather name="calendar" size={11} color={T.muted} style={{ marginLeft: 8 }} />
                      <Text style={s.metaText}>{fmtDate(item.Patregdate)}</Text>
                    </View>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
                    <View style={[s.statusDot, { backgroundColor: sc.color }]} />
                    <Text style={[s.statusText, { color: sc.color }]}>{item.Status}</Text>
                  </View>
                </View>

                {/* Tests */}
                {item.tests.length > 0 && (
                  <View style={s.testsRow}>
                    <Feather name="activity" size={13} color={T.sub} style={{ marginRight: 6 }} />
                    <Text style={s.testsText} numberOfLines={1}>{item.tests.join(' · ')}</Text>
                  </View>
                )}

                {/* Billing */}
                <View style={s.billingRow}>
                  <View style={s.billingItem}>
                    <Text style={s.billingLabel}>Charges</Text>
                    <Text style={s.billingValue}>₹{(item.TestCharges ?? 0).toFixed(0)}</Text>
                  </View>
                  <View style={s.billingItem}>
                    <Text style={s.billingLabel}>Paid</Text>
                    <Text style={[s.billingValue, { color: T.green }]}>₹{(item.PaidAmount ?? 0).toFixed(0)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Detail Sheet */}
      {selected && (
        <Modal visible transparent animationType="slide">
          <View style={s.overlay}>
            <View style={s.sheet}>
              <View style={s.drag} />
              <TouchableOpacity style={s.closeBtn} onPress={() => setSelected(null)}>
                <Feather name="x" size={22} color={T.sub} />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={[s.avatar, { width: 50, height: 50, borderRadius: 25 }]}>
                  <Text style={[s.avatarText, { fontSize: 20 }]}>{selected.PatientName.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text style={{ fontSize: 17, fontWeight: '800', color: T.text }}>{selected.PatientName}</Text>
                  <Text style={{ fontSize: 12, color: T.primary, fontWeight: '600', marginTop: 2 }}>
                    PT{String(selected.PatRegID).padStart(6,'0')}
                  </Text>
                </View>
              </View>
              {[
                ['Status',   selected.Status],
                ['Mobile',   selected.Patphoneno],
                ['Reg Date', fmtDate(selected.Patregdate)],
                ['Tests',    selected.tests.join(', ')],
                ['Charges',  `₹${(selected.TestCharges ?? 0).toFixed(2)}`],
                ['Paid',     `₹${(selected.PaidAmount   ?? 0).toFixed(2)}`],
              ].map(([label, value]) => (
                <View key={label} style={s.detailRow}>
                  <Text style={s.detailLabel}>{label}</Text>
                  <Text style={s.detailValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function StatCard({ value, label, icon, color, bg, border }: any) {
  return (
    <View style={[s.statCard, { backgroundColor: bg, borderColor: border }]}>
      <View style={[s.statIconBox, { backgroundColor: '#FFF' }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: T.screenBg },

  // Header band
  headerBand:  { backgroundColor: T.primary, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  greeting:    { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  userName:    { fontSize: 22, fontWeight: '800', color: '#FFF', marginTop: 2 },
  labRow:      { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  labName:     { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  headerIconBtn:{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },

  // Stats
  statsGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 16, paddingBottom: 0 },
  statCard:    { width: '47.5%', borderRadius: 14, borderWidth: 1, padding: 14, alignItems: 'flex-start' },
  statIconBox: { width: 38, height: 38, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
  statValue:   { fontSize: 22, fontWeight: '800' },
  statLabel:   { fontSize: 11, color: T.sub, fontWeight: '500', marginTop: 2 },

  // Search
  searchBar:   { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 14, marginBottom: 6, backgroundColor: T.bg, borderWidth: 1, borderColor: T.border, borderRadius: 12, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, fontSize: 14, color: T.text },

  // List
  list:        { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 100 },
  centre:      { alignItems: 'center', paddingTop: 60 },
  centreText:  { fontSize: 14, color: T.sub, marginTop: 10 },

  // Card
  card:        { backgroundColor: T.bg, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
  cardTop:     { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: T.border },
  avatar:      { width: 44, height: 44, borderRadius: 22, backgroundColor: T.tealBg, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText:  { fontSize: 18, fontWeight: '800', color: T.tealDark },
  name:        { fontSize: 14, fontWeight: '700', color: T.text, marginBottom: 2 },
  pid:         { fontSize: 12, color: T.sub, marginBottom: 3 },
  metaRow:     { flexDirection: 'row', alignItems: 'center' },
  metaText:    { fontSize: 11, color: T.muted, marginLeft: 3 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusDot:   { width: 7, height: 7, borderRadius: 4, marginRight: 5 },
  statusText:  { fontSize: 10, fontWeight: '700' },
  testsRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: T.border },
  testsText:   { flex: 1, fontSize: 12, color: T.sub },
  billingRow:  { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, gap: 24 },
  billingItem: {},
  billingLabel:{ fontSize: 10, color: T.muted, fontWeight: '500', marginBottom: 2 },
  billingValue:{ fontSize: 14, fontWeight: '700', color: T.text },

  // Sheet
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet:       { backgroundColor: T.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, maxHeight: '85%' },
  drag:        { width: 36, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  closeBtn:    { position: 'absolute', top: 18, right: 18, zIndex: 1 },
  detailRow:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  detailLabel: { width: 72, fontSize: 12, color: T.sub, fontWeight: '600' },
  detailValue: { flex: 1, fontSize: 13, color: T.text, fontWeight: '600' },
});
