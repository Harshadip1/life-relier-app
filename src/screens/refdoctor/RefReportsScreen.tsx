/**
 * Test Reports Screen (Doctor View)
 * Shows test reports for patients assigned to the logged-in doctor when available.
 * Includes interactive Report Viewer Modal with test parameters & reference ranges.
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, Modal, ScrollView, Platform,
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

const TABS = ['All', 'Report Ready', 'Processing', 'Registered'];

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
}

function statusColor(s: string) {
  switch (s) {
    case 'Report Ready': return { color: T.green,   bg: '#ECFDF5' };
    case 'Processing':   return { color: '#F97316', bg: '#FFF7ED' };
    default:             return { color: T.warning,  bg: '#FFFBEB' };
  }
}

interface TestResultParam {
  parameter: string;
  value: string;
  unit: string;
  range: string;
  status: 'Normal' | 'High' | 'Low';
}

const MOCK_LAB_REPORTS: Record<string, TestResultParam[]> = {
  'Complete Blood Count (CBC)': [
    { parameter: 'Hemoglobin (Hb)', value: '14.2', unit: 'g/dL', range: '13.0 - 17.0', status: 'Normal' },
    { parameter: 'Total RBC Count', value: '4.8', unit: 'mill/cumm', range: '4.5 - 5.5', status: 'Normal' },
    { parameter: 'Total Leukocyte (WBC)', value: '7,500', unit: '/cumm', range: '4,000 - 11,000', status: 'Normal' },
    { parameter: 'Platelet Count', value: '250,000', unit: '/cumm', range: '150,000 - 450,000', status: 'Normal' },
    { parameter: 'Packed Cell Volume (PCV)', value: '43.5', unit: '%', range: '40 - 50', status: 'Normal' },
  ],
  'Lipid Profile': [
    { parameter: 'Serum Cholesterol', value: '210', unit: 'mg/dL', range: '< 200', status: 'High' },
    { parameter: 'Serum Triglycerides', value: '160', unit: 'mg/dL', range: '< 150', status: 'High' },
    { parameter: 'HDL Cholesterol', value: '48', unit: 'mg/dL', range: '> 40', status: 'Normal' },
    { parameter: 'LDL Cholesterol', value: '130', unit: 'mg/dL', range: '< 100', status: 'High' },
  ],
  'Thyroid Profile (T3, T4, TSH)': [
    { parameter: 'Total T3', value: '1.2', unit: 'ng/mL', range: '0.8 - 2.0', status: 'Normal' },
    { parameter: 'Total T4', value: '8.5', unit: 'mcg/dL', range: '5.1 - 14.1', status: 'Normal' },
    { parameter: 'TSH (Ultrasensitive)', value: '2.45', unit: 'uIU/mL', range: '0.4 - 4.2', status: 'Normal' },
  ],
  'HbA1c (Glycated Hemoglobin)': [
    { parameter: 'HbA1c', value: '6.2', unit: '%', range: '< 5.7 (Normal), 5.7-6.4 (Prediabetes)', status: 'High' },
    { parameter: 'Estimated Avg Glucose (eAG)', value: '131', unit: 'mg/dL', range: '< 117', status: 'High' },
  ],
};

export default function RefReportsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [rows,       setRows]       = useState<PatientRow[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab,  setActiveTab]  = useState('All');
  const [viewReport, setViewReport] = useState<PatientRow | null>(null);

  const doctorName = user?.name || 'Dr. Girish Patil';

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try { setRows(await fetchRefPatients(doctorName)); }
    catch (e: any) { Alert.alert('Error', e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, [doctorName]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = activeTab === 'All' ? rows : rows.filter(r => r.Status === activeTab);
  const readyCount = rows.filter(r => r.Status === 'Report Ready').length;

  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 10) }]}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Test Reports</Text>
          <Text style={s.subText}>Reports for patients assigned to you</Text>
        </View>
        <View style={s.readyBadge}>
          <Text style={s.readyTxt}>{readyCount} Ready</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={s.tabsWrap}>
        <FlatList
          data={TABS} horizontal showsHorizontalScrollIndicator={false}
          keyExtractor={t => t}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}
          style={{ height: 44 }}
          renderItem={({ item: tab }) => (
            <TouchableOpacity style={[s.tabBtn, activeTab === tab && s.tabBtnActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={s.centre}><ActivityIndicator size="large" color={T.primary} /><Text style={s.centreText}>Loading test reports…</Text></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => `${item.PID}-${i}`}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[T.primary]} />}
          ListEmptyComponent={
            <View style={s.centre}>
              <MaterialCommunityIcons name="file-document-outline" size={48} color={T.muted} />
              <Text style={s.centreText}>No reports found for assigned patients</Text>
            </View>
          }
          renderItem={({ item }) => {
            const sc = statusColor(item.Status);
            const dateParts = fmtDate(item.Patregdate).split(' ');
            return (
              <View style={s.card}>
                <View style={s.cardRow}>
                  <View style={s.dateBox}>
                    <Text style={s.dateM}>{dateParts[1] || 'AUG'}</Text>
                    <Text style={s.dateD}>{dateParts[0] || '03'}</Text>
                    <Text style={s.dateY}>{dateParts[2] || '2026'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.name}>{item.PatientName}</Text>
                    <Text style={s.pid}>PID: PT{String(item.PatRegID).padStart(6,'0')}</Text>
                    <Text style={s.tests} numberOfLines={1}>{item.tests.join(' · ') || 'Lab Test Report'}</Text>
                  </View>
                  <View style={[s.badge, { backgroundColor: sc.bg }]}>
                    <View style={[s.dot, { backgroundColor: sc.color }]} />
                    <Text style={[s.badgeTxt, { color: sc.color }]}>{item.Status}</Text>
                  </View>
                </View>
                {item.Status === 'Report Ready' ? (
                  <View style={s.actionsRow}>
                    <TouchableOpacity style={s.actionBtn} onPress={() => setViewReport(item)}>
                      <Feather name="eye" size={14} color={T.primary} />
                      <Text style={s.actionTxt}>View Report</Text>
                    </TouchableOpacity>
                    <View style={s.actionDivider} />
                    <TouchableOpacity style={s.actionBtn} onPress={() => Alert.alert('Downloaded', `Report for ${item.PatientName} downloaded successfully.`)}>
                      <Feather name="download" size={14} color={T.primary} />
                      <Text style={s.actionTxt}>Download PDF</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={s.pendingBar}>
                    <Feather name="clock" size={12} color={T.sub} />
                    <Text style={s.pendingTxt}>Report in progress at Life Relier Central Lab</Text>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}

      {/* Lab Report Viewer Modal */}
      {viewReport && (
        <Modal visible transparent animationType="slide">
          <View style={s.overlay}>
            <View style={s.modalSheet}>
              <View style={s.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={s.modalTitle}>Lab Test Report</Text>
                  <Text style={s.modalSub}>Patient: {viewReport.PatientName} (PT{String(viewReport.PatRegID).padStart(6,'0')})</Text>
                </View>
                <TouchableOpacity onPress={() => setViewReport(null)} style={s.closeIcon}>
                  <Feather name="x" size={20} color={T.sub} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                <View style={s.metaCard}>
                  <View style={s.metaItem}><Text style={s.metaLbl}>Patient</Text><Text style={s.metaVal}>{viewReport.PatientName}</Text></View>
                  <View style={s.metaItem}><Text style={s.metaLbl}>Age / Gender</Text><Text style={s.metaVal}>{viewReport.Age || 30} yrs / {viewReport.Gender || 'Male'}</Text></View>
                  <View style={s.metaItem}><Text style={s.metaLbl}>Ref. Doctor</Text><Text style={s.metaVal}>{viewReport.Drname}</Text></View>
                  <View style={s.metaItem}><Text style={s.metaLbl}>Report Date</Text><Text style={s.metaVal}>{fmtDate(viewReport.Patregdate)}</Text></View>
                </View>

                {viewReport.tests.map((testName, tIdx) => {
                  const params = MOCK_LAB_REPORTS[testName] || [
                    { parameter: 'Test Result Parameter 1', value: 'Normal', unit: '-', range: 'Normal', status: 'Normal' },
                    { parameter: 'Test Result Parameter 2', value: '4.5', unit: 'mg/dL', range: '3.5 - 5.5', status: 'Normal' },
                  ];
                  return (
                    <View key={tIdx} style={s.reportBlock}>
                      <View style={s.testTitleRow}>
                        <MaterialCommunityIcons name="flask" size={16} color={T.primary} />
                        <Text style={s.testTitleTxt}>{testName}</Text>
                      </View>

                      <View style={s.tableHeader}>
                        <Text style={[s.th, { flex: 2 }]}>Parameter</Text>
                        <Text style={[s.th, { flex: 1, textAlign: 'center' }]}>Result</Text>
                        <Text style={[s.th, { flex: 1.5, textAlign: 'right' }]}>Ref Range</Text>
                      </View>

                      {params.map((p, pIdx) => (
                        <View key={pIdx} style={s.tableRow}>
                          <Text style={[s.td, { flex: 2, fontWeight: '600' }]}>{p.parameter}</Text>
                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={[s.td, p.status === 'High' && { color: T.danger, fontWeight: '800' }]}>
                              {p.value} {p.unit !== '-' ? p.unit : ''}
                            </Text>
                            {p.status === 'High' && (
                              <View style={s.highFlag}><Text style={s.highFlagTxt}>HIGH</Text></View>
                            )}
                          </View>
                          <Text style={[s.td, { flex: 1.5, textAlign: 'right', color: T.sub }]}>{p.range}</Text>
                        </View>
                      ))}
                    </View>
                  );
                })}

                <View style={s.signatureBox}>
                  <Feather name="check-circle" size={16} color={T.green} />
                  <Text style={s.signatureTxt}>Verified & Electronically Signed by Pathologist</Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: T.screenBg },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
  title:      { fontSize: 18, fontWeight: '800', color: T.text },
  subText:    { fontSize: 11, color: T.sub, marginTop: 2 },
  readyBadge: { backgroundColor: '#ECFDF5', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  readyTxt:   { fontSize: 12, fontWeight: '700', color: T.green },
  tabsWrap:   { backgroundColor: T.bg, borderBottomWidth: 1, borderBottomColor: T.border },
  tabBtn:     { height: 32, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: T.border, backgroundColor: T.bg, justifyContent: 'center' },
  tabBtnActive: { backgroundColor: T.primary, borderColor: T.primary },
  tabText:    { fontSize: 12, color: T.sub, fontWeight: '500' },
  tabTextActive: { color: '#FFF', fontWeight: '700' },
  list:       { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 80 },
  centre:     { alignItems: 'center', paddingTop: 50 },
  centreText: { fontSize: 14, color: T.sub, marginTop: 8 },
  card:       { backgroundColor: T.bg, borderRadius: 12, borderWidth: 1, borderColor: T.border, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
  cardRow:    { flexDirection: 'row', alignItems: 'center', padding: 12 },
  dateBox:    { width: 48, height: 56, backgroundColor: T.tealBg, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: '#CCFBF1' },
  dateM:      { fontSize: 9, fontWeight: '700', color: T.tealDark, textTransform: 'uppercase' },
  dateD:      { fontSize: 18, fontWeight: '800', color: T.tealDark, marginVertical: -1 },
  dateY:      { fontSize: 9, fontWeight: '600', color: T.tealDark },
  name:       { fontSize: 14, fontWeight: '700', color: T.text, marginBottom: 1 },
  pid:        { fontSize: 11, color: T.sub, marginBottom: 2 },
  tests:      { fontSize: 11, color: T.muted },
  badge:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-start' },
  dot:        { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  badgeTxt:   { fontSize: 9, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  actionBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10 },
  actionTxt:  { fontSize: 12, fontWeight: '600', color: T.primary },
  actionDivider: { width: 1, height: 18, backgroundColor: T.border, alignSelf: 'center' },
  pendingBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#F8FAFC' },
  pendingTxt: { fontSize: 11, color: T.sub },
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: T.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 18, maxHeight: '90%' },
  modalHeader:{ flexDirection: 'row', alignItems: 'center', marginBottom: 14, borderBottomWidth: 1, borderBottomColor: T.border, paddingBottom: 10 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: T.text },
  modalSub:   { fontSize: 12, color: T.sub, marginTop: 2 },
  closeIcon:  { padding: 4 },
  metaCard:   { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: T.tealBg, borderRadius: 10, padding: 10, marginBottom: 14, borderWidth: 1, borderColor: '#CCFBF1' },
  metaItem:   { width: '50%', marginBottom: 6 },
  metaLbl:    { fontSize: 10, color: T.sub },
  metaVal:    { fontSize: 12, fontWeight: '700', color: T.text },
  reportBlock:{ backgroundColor: '#FFF', borderWidth: 1, borderColor: T.border, borderRadius: 10, padding: 12, marginBottom: 12 },
  testTitleRow:{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  testTitleTxt:{ fontSize: 13, fontWeight: '800', color: T.text },
  tableHeader:{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: T.border, paddingBottom: 6, marginBottom: 6 },
  th:         { fontSize: 11, fontWeight: '700', color: T.sub },
  tableRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  td:         { fontSize: 12, color: T.text },
  highFlag:   { backgroundColor: '#FEF2F2', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4, marginTop: 2 },
  highFlagTxt:{ fontSize: 8, fontWeight: '800', color: T.danger },
  signatureBox:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#ECFDF5', padding: 10, borderRadius: 8, marginTop: 10 },
  signatureTxt:{ fontSize: 11, fontWeight: '700', color: T.green },
});
