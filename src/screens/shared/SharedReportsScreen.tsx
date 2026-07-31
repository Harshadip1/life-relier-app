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
  green: '#10B981', warning: '#F59E0B',
};

interface ReportRow {
  PatRegID: number; PatientName: string; Patphoneno: string;
  MainTestName: string; Status: string; Patregdate: string;
  BarcodeID: string; tests: string[];
}

function statusMeta(s: string) {
  switch (s) {
    case 'Report Ready':     return { color: T.green,    bg: '#ECFDF5' };
    case 'Processing':       return { color: '#F97316',  bg: '#FFF7ED' };
    case 'Sample Collected': return { color: '#3B82F6',  bg: '#EFF6FF' };
    default:                 return { color: T.warning,  bg: '#FFFBEB' };
  }
}

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

const TABS = ['All', 'Report Ready', 'Processing', 'Registered'];

export default function SharedReportsScreen() {
  const insets = useSafeAreaInsets();
  const [records,    setRecords]    = useState<ReportRow[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState('');
  const [activeTab,  setActiveTab]  = useState('All');

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
      const map = new Map<string, ReportRow>();
      for (const r of rows) {
        const key = `${r.PatRegID}-${r.BarcodeID}`;
        if (!map.has(key)) map.set(key, {
          PatRegID: r.PatRegID, PatientName: r.PatientName ?? r.Patname ?? '—',
          Patphoneno: r.Patphoneno ?? '—', MainTestName: r.MainTestName,
          Status: r.Status ?? 'Registered', Patregdate: r.Patregdate ?? '',
          BarcodeID: r.BarcodeID ?? '—', tests: [r.MainTestName],
        });
        else map.get(key)!.tests.push(r.MainTestName);
      }
      setRecords(Array.from(map.values()));
    } catch { setRecords([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    const searchOk = r.PatientName.toLowerCase().includes(q) || r.BarcodeID.includes(q) || String(r.PatRegID).includes(q);
    const tabOk = activeTab === 'All' || r.Status === activeTab;
    return searchOk && tabOk;
  });

  return (
    <View style={[st.root, { paddingTop: Math.max(insets.top, 0) }]}>
      <View style={st.header}>
        <Text style={st.title}>Reports</Text>
        <Text style={st.sub}>{records.length} records</Text>
      </View>

      <View style={st.searchBar}>
        <Feather name="search" size={15} color={T.muted} style={{ marginRight: 8 }} />
        <TextInput style={st.searchInput} placeholder="Search patient, barcode..."
          placeholderTextColor={T.muted} value={search} onChangeText={setSearch} />
        {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><Feather name="x" size={14} color={T.muted} /></TouchableOpacity>}
      </View>

      <View style={st.tabsRow}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab} style={[st.tabBtn, activeTab === tab && st.tabBtnActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[st.tabText, activeTab === tab && st.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={st.centre}><ActivityIndicator size="large" color={T.primary} /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => `${item.PatRegID}-${item.BarcodeID}-${i}`}
          contentContainerStyle={st.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[T.primary]} />}
          ListEmptyComponent={<View style={st.centre}><MaterialCommunityIcons name="file-document-outline" size={48} color={T.muted} /><Text style={st.centreText}>No reports found</Text></View>}
          renderItem={({ item }) => {
            const sm = statusMeta(item.Status);
            return (
              <View style={st.card}>
                <View style={st.cardTop}>
                  <View style={st.avatar}><Text style={st.avatarText}>{item.PatientName.charAt(0).toUpperCase()}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={st.name}>{item.PatientName}</Text>
                    <Text style={st.pid}>PT{String(item.PatRegID).padStart(6,'0')}  •  {fmtDate(item.Patregdate)}</Text>
                    <Text style={st.tests} numberOfLines={1}>{item.tests.join(' · ')}</Text>
                  </View>
                  <View style={[st.statusBadge, { backgroundColor: sm.bg }]}>
                    <View style={[st.statusDot, { backgroundColor: sm.color }]} />
                    <Text style={[st.statusText, { color: sm.color }]}>{item.Status}</Text>
                  </View>
                </View>
                <View style={st.cardBottom}>
                  <Text style={st.barcodeText}>Barcode: {item.BarcodeID}</Text>
                  <TouchableOpacity style={st.pdfBtn}>
                    <Feather name="download" size={13} color={T.primary} />
                    <Text style={st.pdfBtnText}> PDF</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
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
  searchBar:   { flexDirection: 'row', alignItems: 'center', marginHorizontal: 14, marginTop: 10, marginBottom: 6, backgroundColor: T.bg, borderWidth: 1, borderColor: T.border, borderRadius: 10, paddingHorizontal: 12, height: 42 },
  searchInput: { flex: 1, fontSize: 13, color: T.text },
  tabsRow:     { flexDirection: 'row', paddingHorizontal: 14, gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  tabBtn:      { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: T.border, backgroundColor: T.bg },
  tabBtnActive:{ backgroundColor: T.primary, borderColor: T.primary },
  tabText:     { fontSize: 12, color: T.sub, fontWeight: '500' },
  tabTextActive:{ color: '#FFF', fontWeight: '700' },
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
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10 },
  statusDot:   { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statusText:  { fontSize: 10, fontWeight: '700' },
  cardBottom:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8 },
  barcodeText: { fontSize: 11, color: T.muted },
  pdfBtn:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDFA', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  pdfBtnText:  { fontSize: 12, fontWeight: '600', color: T.primary },
});
