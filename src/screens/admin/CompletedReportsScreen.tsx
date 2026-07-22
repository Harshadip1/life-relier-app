import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../../utils/constants';

const T = {
  primary:  '#0D9488',
  bg:       '#F8FAFC',
  card:     '#FFFFFF',
  text:     '#0F172A',
  sub:      '#64748B',
  muted:    '#94A3B8',
  border:   '#E2E8F0',
  success:  '#10B981',
  danger:   '#EF4444',
};

const FILTERS = ['Today', 'This Week', 'This Month', 'All'];

interface PatientRow {
  PID:          number;
  PatRegID:     number;
  PatientName:  string;
  MainTestName: string;
  Patregdate:   string;
  Status:       string;
  BarcodeID:    string;
  TestCharges:  number;
  PaidAmount:   number;
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
  } catch { return iso; }
}

function getFromDate(filter: string): string {
  const d = new Date();
  if (filter === 'Today')     { return d.toISOString().split('T')[0]; }
  if (filter === 'This Week') { d.setDate(d.getDate() - 7);  return d.toISOString().split('T')[0]; }
  if (filter === 'This Month'){ d.setDate(1); return d.toISOString().split('T')[0]; }
  return '2024-01-01';
}

export default function CompletedReportsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [search,     setSearch]     = useState('');
  const [filter,     setFilter]     = useState('Today');
  const [records,    setRecords]    = useState<PatientRow[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`${API_BASE_URL}/api/TestStatus/GetPatientTestStatus`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          BranchId: 1, FromDate: getFromDate(filter), ToDate: today,
          PatRegID: '', PatientName: '', DoctorName: '', TestName: '',
          MobileNo: '', Barcode: '', CenterCode: '', SubDepartment: '',
          Status: 'All',
        }),
      });
      const data = await res.json();
      const rows: PatientRow[] = Array.isArray(data) ? data
        : Array.isArray(data?.value) ? data.value : [];
      setRecords(rows);
    } catch { setRecords([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, [filter]);

  useFocusEffect(useCallback(() => { fetchReports(); }, [fetchReports]));

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    return r.PatientName.toLowerCase().includes(q) ||
           String(r.PatRegID).includes(q) ||
           r.BarcodeID.includes(q) ||
           r.MainTestName.toLowerCase().includes(q);
  });

  // Deduplicate by PatRegID for summary counts
  const uniquePIDs = new Set(records.map(r => r.PID));

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 0) }]}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Reports</Text>
          <Text style={styles.headerSub}>Patient test records</Text>
        </View>
        <TouchableOpacity style={styles.filterIconBtn} onPress={() => fetchReports(true)}>
          <Feather name="refresh-cw" size={20} color={T.text} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={T.muted} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patient, barcode, test..."
            placeholderTextColor={T.muted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={16} color={T.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Date Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <SummaryMini value={String(uniquePIDs.size)}  label="Patients"  color={T.primary}  bg="#F0FDFA" />
        <SummaryMini value={String(records.length)}   label="Tests"     color="#0369A1"    bg="#F0F9FF" />
        <SummaryMini
          value={`₹${records.reduce((s, r) => s + r.PaidAmount, 0).toLocaleString('en-IN')}`}
          label="Collected"
          color="#15803D"
          bg="#F0FDF4"
        />
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.centre}>
          <ActivityIndicator size="large" color={T.primary} />
          <Text style={styles.centreTxt}>Loading…</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchReports(true)} colors={[T.primary]} />
          }
        >
          <Text style={styles.resultCount}>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</Text>

          {filtered.length === 0 ? (
            <View style={styles.centre}>
              <MaterialCommunityIcons name="file-document-outline" size={52} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No records found</Text>
            </View>
          ) : (
            filtered.map((r, idx) => (
              <View key={`${r.PatRegID}-${r.BarcodeID}-${idx}`} style={styles.reportCard}>
                <View style={styles.cardTop}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>{r.PatientName.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.patientName}>{r.PatientName}</Text>
                    <Text style={styles.patientId}>
                      PT{String(r.PatRegID).padStart(6,'0')}  •  {formatDate(r.Patregdate)}
                    </Text>
                    <View style={styles.cardMeta}>
                      <Feather name="activity" size={11} color={T.muted} />
                      <Text style={styles.cardMetaText}> {r.MainTestName}</Text>
                      <Feather name="hash" size={11} color={T.muted} style={{ marginLeft: 8 }} />
                      <Text style={styles.cardMetaText}> {r.BarcodeID}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: '#F0FDF4' }]}>
                    <Text style={[styles.statusText, { color: T.success }]}>₹{r.PaidAmount.toFixed(0)}</Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <ActionBtn icon="eye"      label="View"  />
                  <ActionBtn icon="download" label="PDF"   />
                  <ActionBtn icon="printer"  label="Print" />
                  <ActionBtn icon="mail"     label="Send"  />
                </View>
              </View>
            ))
          )}
          <View style={{ height: 110 }} />
        </ScrollView>
      )}
    </View>
  );
}

function SummaryMini({ value, label, color, bg }: any) {
  return (
    <View style={[styles.summaryMini, { backgroundColor: bg }]}>
      <Text style={[styles.summaryMiniVal, { color }]}>{value}</Text>
      <Text style={[styles.summaryMiniLabel, { color }]}>{label}</Text>
    </View>
  );
}

function ActionBtn({ icon, label }: any) {
  return (
    <TouchableOpacity style={styles.actionBtn}>
      <Feather name={icon} size={14} color={T.primary} />
      <Text style={styles.actionBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8, backgroundColor: T.card, borderBottomWidth: 1, borderBottomColor: T.border },
  headerTitle: { fontSize: 22, fontWeight: '800', color: T.text },
  headerSub:   { fontSize: 12, color: T.sub, marginTop: 2 },
  filterIconBtn: { padding: 6 },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: T.card },
  searchBar:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 14, height: 44 },
  searchInput:{ flex: 1, fontSize: 14, color: T.text },
  filterRow:  { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: T.card, borderBottomWidth: 1, borderBottomColor: T.border },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: T.border, backgroundColor: T.bg },
  filterChipActive: { backgroundColor: T.primary, borderColor: T.primary },
  filterChipText: { fontSize: 12, fontWeight: '600', color: T.sub },
  filterChipTextActive: { color: '#FFF' },
  summaryRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: T.card, borderBottomWidth: 1, borderBottomColor: T.border },
  summaryMini: { flex: 1, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  summaryMiniVal:   { fontSize: 18, fontWeight: '900' },
  summaryMiniLabel: { fontSize: 10, fontWeight: '600', marginTop: 1 },
  scroll:      { padding: 16 },
  resultCount: { fontSize: 12, color: T.muted, fontWeight: '600', marginBottom: 14 },
  centre:      { alignItems: 'center', paddingVertical: 48 },
  centreTxt:   { marginTop: 10, fontSize: 14, color: T.sub },
  emptyTitle:  { fontSize: 15, fontWeight: '700', color: '#334155', marginTop: 12 },
  reportCard:  { backgroundColor: T.card, borderRadius: 14, borderWidth: 1, borderColor: T.border, marginBottom: 14, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
  cardTop:     { flexDirection: 'row', alignItems: 'flex-start', padding: 14 },
  avatarBox:   { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0FDFA', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText:  { fontSize: 16, fontWeight: '700', color: T.primary },
  patientName: { fontSize: 14, fontWeight: '700', color: T.text, marginBottom: 2 },
  patientId:   { fontSize: 11, color: T.sub, marginBottom: 4 },
  cardMeta:    { flexDirection: 'row', alignItems: 'center' },
  cardMetaText:{ fontSize: 10, color: T.muted },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  statusText:  { fontSize: 12, fontWeight: '700' },
  cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: T.border },
  actionBtn:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 11, gap: 5, borderRightWidth: 1, borderRightColor: T.border },
  actionBtnText:{ fontSize: 12, fontWeight: '600', color: T.primary },
});
