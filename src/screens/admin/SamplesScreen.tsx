import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Platform, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../../utils/constants';

const THEME = {
  primary: '#0F766E', bg: '#FFFFFF', screenBg: '#FAFAFA',
  textPrimary: '#0F172A', textSecondary: '#64748B', border: '#E2E8F0',
};

interface SampleRow {
  PID: number; PatRegID: number; PatientName: string;
  Patphoneno: string; BarcodeID: string; MainTestName: string;
  Status: string; SampleAcceptDate: string | null;
  IspheboAccept: number; Patregdate: string; TestCharges: number;
  Drname: string; CenterName: string; Isemergency: boolean;
  tests: string[];
}

function fmtTime(iso: string | null) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }); }
  catch { return iso; }
}

async function fetchSamples(): Promise<SampleRow[]> {
  const today = new Date().toISOString().split('T')[0];
  const res = await fetch(`${API_BASE_URL}/api/TestStatus/GetPatientTestStatus`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      BranchId: 1, FromDate: today, ToDate: today,
      PatRegID: '', PatientName: '', DoctorName: '', TestName: '',
      MobileNo: '', Barcode: '', CenterCode: '', SubDepartment: '', Status: 'All',
    }),
  });
  const data = await res.json();
  const rows: any[] = Array.isArray(data) ? data : (data?.value ?? []);
  // Group by PID
  const map = new Map<number, SampleRow>();
  for (const r of rows) {
    if (map.has(r.PID)) {
      map.get(r.PID)!.tests.push(r.MainTestName);
    } else {
      map.set(r.PID, { ...r, tests: [r.MainTestName] });
    }
  }
  return Array.from(map.values());
}

export default function SamplesScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [samples, setSamples]     = useState<SampleRow[]>([]);
  const [loading, setLoading]     = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState<SampleRow | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try { setSamples(await fetchSamples()); }
    catch (e: any) { Alert.alert('Error', e.message || 'Failed to load samples.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = samples.filter(s => {
    const q = search.toLowerCase();
    return s.PatientName.toLowerCase().includes(q) ||
           s.BarcodeID.includes(q) ||
           String(s.PatRegID).includes(q);
  });

  const pending  = samples.filter(s => s.IspheboAccept === 0).length;
  const received = samples.filter(s => s.IspheboAccept === 2).length;
  const urgent   = samples.filter(s => s.Isemergency).length;

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 10) }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={THEME.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accession</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => load(true)}>
          <Feather name="refresh-cw" size={20} color={THEME.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={THEME.textSecondary} style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder="Search Patient, Barcode or ID"
          value={search} onChangeText={setSearch} />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Feather name="x" size={16} color={THEME.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centre}>
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text style={styles.centreText}>Loading samples…</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[THEME.primary]} />}
        >
          {/* Summary */}
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={[styles.summaryCard, { borderColor: '#DBEAFE', backgroundColor: '#EFF6FF' }]}>
              <View style={[styles.summaryIconBox, { backgroundColor: '#DBEAFE' }]}>
                <Feather name="activity" size={18} color="#1D4ED8" />
              </View>
              <View>
                <Text style={[styles.summaryValue, { color: '#1D4ED8' }]}>{pending}</Text>
                <Text style={styles.summaryLabel}>Pending</Text>
              </View>
            </View>
            <View style={[styles.summaryCard, { borderColor: '#DCFCE7', backgroundColor: '#F0FDF4' }]}>
              <View style={[styles.summaryIconBox, { backgroundColor: '#DCFCE7' }]}>
                <Feather name="check-circle" size={18} color="#15803D" />
              </View>
              <View>
                <Text style={[styles.summaryValue, { color: '#15803D' }]}>{received}</Text>
                <Text style={styles.summaryLabel}>Received</Text>
              </View>
            </View>
            <View style={[styles.summaryCard, { borderColor: '#FEE2E2', backgroundColor: '#FEF2F2' }]}>
              <View style={[styles.summaryIconBox, { backgroundColor: '#FEE2E2' }]}>
                <MaterialCommunityIcons name="alarm-light-outline" size={18} color="#EF4444" />
              </View>
              <View>
                <Text style={[styles.summaryValue, { color: '#EF4444' }]}>{urgent}</Text>
                <Text style={styles.summaryLabel}>Urgent</Text>
              </View>
            </View>
          </View>

          <View style={styles.queueHeaderRow}>
            <Text style={styles.sectionTitle}>Sample Queue ({filtered.length})</Text>
          </View>

          {filtered.length === 0 ? (
            <View style={styles.centre}>
              <MaterialCommunityIcons name="flask-empty-outline" size={48} color="#CBD5E1" />
              <Text style={styles.centreText}>No samples found for today</Text>
            </View>
          ) : (
            filtered.map(item => {
              const isReceived = item.IspheboAccept === 2;
              const color = isReceived ? '#3B82F6' : '#EAB308';
              const bg    = isReceived ? '#EFF6FF'  : '#FEF9C3';
              return (
                <TouchableOpacity
                  key={`${item.PID}-${item.BarcodeID}`}
                  style={[styles.sampleCard, selected?.PID === item.PID && { borderColor: THEME.primary, borderWidth: 1.5 }]}
                  onPress={() => setSelected(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.avatarBox}>
                      <Text style={styles.avatarText}>{item.PatientName.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.patientInfo}>
                      <Text style={styles.patientName}>{item.PatientName}</Text>
                      <Text style={styles.patientId}>
                        PT{String(item.PatRegID).padStart(6,'0')}
                        {item.Isemergency ? '  🚨 URGENT' : ''}
                      </Text>
                      <View style={styles.cardMetaRow}>
                        <Feather name="phone" size={12} color={THEME.textSecondary} />
                        <Text style={styles.metaText}>{item.Patphoneno || '—'}</Text>
                      </View>
                    </View>
                    <View style={styles.cardActionsRight}>
                      <View style={[styles.statusBadge, { backgroundColor: bg }]}>
                        <View style={[styles.statusDot, { backgroundColor: color }]} />
                        <Text style={[styles.statusText, { color }]}>
                          {isReceived ? 'Received' : 'Pending'}
                        </Text>
                      </View>
                      <Text style={[styles.metaText, { marginTop: 6, textAlign: 'right' }]}>
                        {fmtTime(item.SampleAcceptDate || item.Patregdate)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.idsRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.idLabel}>Barcode</Text>
                      <Text style={styles.idValue}>{item.BarcodeID}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.idLabel}>Doctor</Text>
                      <Text style={styles.idValue}>{item.Drname?.trim() || '—'}</Text>
                    </View>
                    <MaterialCommunityIcons name="barcode" size={28} color={THEME.textSecondary} />
                  </View>

                  <View style={styles.testsRow}>
                    <Text style={styles.testsLabel}>Tests ({item.tests.length}): </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {item.tests.map(t => (
                        <View key={t} style={styles.testChip}>
                          <Text style={styles.testChipText}>{t}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Action Modal */}
      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.dragHandle} />
            <Text style={styles.sheetTitle}>{selected?.PatientName}</Text>
            <Text style={[styles.metaText, { marginBottom: 16, textAlign: 'center' }]}>
              PT{String(selected?.PatRegID ?? '').padStart(6,'0')}  •  Barcode: {selected?.BarcodeID}
            </Text>
            <TouchableOpacity style={styles.acceptBtn} onPress={() => setSelected(null)}>
              <Feather name="check-circle" size={18} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.acceptBtnText}>Mark Accepted</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelected(null)}>
              <Text style={styles.cancelBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: THEME.screenBg },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  backBtn:     { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: THEME.textPrimary },
  iconBtn:     { padding: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.bg, marginHorizontal: 20, borderRadius: 12, paddingLeft: 14, paddingRight: 10, height: 48, borderWidth: 1, borderColor: THEME.border, marginBottom: 16 },
  searchIcon:  { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 13, color: THEME.textPrimary },
  scrollContent:{ paddingHorizontal: 20 },
  sectionTitle:{ fontSize: 16, fontWeight: '700', color: THEME.textPrimary, marginBottom: 12 },
  summaryGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  summaryCard: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
  summaryIconBox: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  summaryValue:{ fontSize: 18, fontWeight: '800' },
  summaryLabel:{ fontSize: 10, color: THEME.textSecondary, fontWeight: '500', marginTop: 2 },
  queueHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  centre:      { alignItems: 'center', paddingVertical: 40 },
  centreText:  { fontSize: 14, color: THEME.textSecondary, marginTop: 10 },
  sampleCard:  { backgroundColor: THEME.bg, borderRadius: 16, borderWidth: 1, borderColor: THEME.border, marginBottom: 16, padding: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6 },
  cardHeader:  { flexDirection: 'row', marginBottom: 12 },
  avatarBox:   { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0FDFA', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText:  { fontSize: 18, fontWeight: '700', color: THEME.primary },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 15, fontWeight: '700', color: THEME.textPrimary, marginBottom: 2 },
  patientId:   { fontSize: 12, color: THEME.textSecondary, fontWeight: '500', marginBottom: 6 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center' },
  metaText:    { fontSize: 11, color: THEME.textSecondary, marginLeft: 4 },
  cardActionsRight: { alignItems: 'flex-end' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusDot:   { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statusText:  { fontSize: 9, fontWeight: '700' },
  divider:     { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  idsRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  idLabel:     { fontSize: 11, color: THEME.textSecondary, marginBottom: 2 },
  idValue:     { fontSize: 13, fontWeight: '700', color: THEME.textPrimary },
  testsRow:    { flexDirection: 'row', alignItems: 'center' },
  testsLabel:  { fontSize: 12, color: THEME.textSecondary, fontWeight: '500', marginRight: 8 },
  testChip:    { backgroundColor: '#F0FDFA', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#CCFBF1', marginRight: 6 },
  testChipText:{ fontSize: 11, color: THEME.primary, fontWeight: '600' },
  modalOverlay:{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: THEME.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  dragHandle:  { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle:  { fontSize: 16, fontWeight: '700', color: THEME.textPrimary, marginBottom: 6, textAlign: 'center' },
  acceptBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.primary, height: 50, borderRadius: 12, marginBottom: 12 },
  acceptBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  cancelBtn:   { alignItems: 'center', paddingVertical: 10 },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: THEME.textSecondary },
});
