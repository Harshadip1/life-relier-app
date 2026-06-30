import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, Modal, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const THEME = {
  primary: '#0F766E',
  bg: '#FFFFFF',
  screenBg: '#FAFAFA',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  danger: '#EF4444',
  dangerBg: '#FEF2F2',
  warning: '#F59E0B',
  warningBg: '#FFFBEB',
  success: '#10B981',
  successBg: '#ECFDF5',
};

const DUMMY_REPORTS = [
  { id: '1', name: 'Rahul Sharma', pid: 'PT123456', sid: 'SMP125487', rid: 'RPT567890', age: '32', gender: 'Male', time: '11:30 AM', tests: ['CBC', 'Lipid Profile', 'HbA1c'], avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop' },
  { id: '2', name: 'Priya Patil', pid: 'PT123457', sid: 'SMP125488', rid: 'RPT567891', age: '28', gender: 'Female', time: '11:15 AM', tests: ['Thyroid Profile', 'Vitamin D'], avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop' },
];

export default function PendingReportsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  
  // ─── States ───
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Pending Approval');
  const [selectedReport, setSelectedReport] = useState<any>(null); // Switches to review view
  
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  const [remarks, setRemarks] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);

  const TABS = ['Pending Approval', 'Approved', 'Critical', 'Rejected'];

  const handleCloseModals = () => {
    setShowApproveModal(false);
    setShowRejectModal(false);
    setSelectedReport(null);
  };

  // ===========================================================================
  // VIEW 1: PENDING REPORTS LIST
  // ===========================================================================
  if (!selectedReport) {
    return (
      <View style={[styles.root, { paddingTop: Math.max(insets.top, 10) }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color={THEME.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pending Reports</Text>
          <TouchableOpacity style={styles.bellBtn}>
            <Feather name="bell" size={20} color={THEME.textPrimary} />
            <View style={styles.badge}><Text style={styles.badgeText}>3</Text></View>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color={THEME.textSecondary} style={styles.searchIcon} />
          <TextInput style={styles.searchInput} placeholder="Search by Patient Name, Patient ID or Report ID" value={search} onChangeText={setSearch} />
          <TouchableOpacity><Feather name="search" size={20} color={THEME.textSecondary} /></TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {TABS.map(tab => (
            <TouchableOpacity key={tab} style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.summaryGrid}>
            <View style={[styles.summaryCard, { borderColor: '#FEF3C7', backgroundColor: THEME.warningBg }]}>
              <MaterialCommunityIcons name="hourglass-empty" size={24} color={THEME.warning} />
              <Text style={[styles.summaryLabel, { color: THEME.warning }]}>Pending</Text>
              <Text style={[styles.summaryValue, { color: THEME.warning }]}>18</Text>
            </View>
            <View style={[styles.summaryCard, { borderColor: '#D1FAE5', backgroundColor: THEME.successBg }]}>
              <Feather name="check-circle" size={24} color={THEME.success} />
              <Text style={[styles.summaryLabel, { color: THEME.success }]}>Approved Today</Text>
              <Text style={[styles.summaryValue, { color: THEME.success }]}>42</Text>
            </View>
            <View style={[styles.summaryCard, { borderColor: '#FEE2E2', backgroundColor: THEME.dangerBg }]}>
              <Feather name="alert-triangle" size={24} color={THEME.danger} />
              <Text style={[styles.summaryLabel, { color: THEME.danger }]}>Critical Reports</Text>
              <Text style={[styles.summaryValue, { color: THEME.danger }]}>3</Text>
            </View>
          </View>

          {DUMMY_REPORTS.map(patient => (
            <View key={patient.id} style={styles.patientCard}>
              <View style={styles.cardHeader}>
                <Image source={{ uri: patient.avatar }} style={styles.avatar} />
                <View style={styles.patientInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.patientName}>{patient.name}</Text>
                    <Text style={styles.metaTextSm}>{patient.age} Yrs | {patient.gender}</Text>
                  </View>
                  <Text style={styles.patientId}>PID: <Text style={{ color: THEME.primary }}>{patient.pid}</Text></Text>
                </View>
              </View>
              
              <View style={styles.cardMetaRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.metaLabel}>Sample ID</Text>
                  <Text style={styles.metaValue}>{patient.sid}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.metaLabel}>Report ID</Text>
                  <Text style={styles.metaValue}>{patient.rid}</Text>
                </View>
              </View>

              <View style={styles.testsRow}>
                <Text style={styles.testsLabel}>Tests: </Text>
                {patient.tests.map(test => (
                  <View key={test} style={styles.testChip}><Text style={styles.testChipText}>{test}</Text></View>
                ))}
                <View style={[styles.statusBadge, { marginLeft: 'auto' }]}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Awaiting Approval</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.timeRow}>
                  <Feather name="clock" size={12} color={THEME.textSecondary} />
                  <Text style={styles.timeText}>Generated Today • {patient.time}</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.primaryBtn} onPress={() => setSelectedReport(patient)}>
                <Text style={styles.primaryBtnText}>Review Report</Text>
                <Feather name="chevron-right" size={18} color="#FFF" style={{ position: 'absolute', right: 16 }} />
              </TouchableOpacity>
            </View>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  }

  // ===========================================================================
  // VIEW 2: REPORT REVIEW FORM
  // ===========================================================================
  return (
    <KeyboardAvoidingView style={[styles.root, { paddingTop: Math.max(insets.top, 10) }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { backgroundColor: THEME.primary, paddingTop: 10, paddingBottom: 20, marginHorizontal: -20, paddingHorizontal: 20, marginTop: -Math.max(insets.top, 10) }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Math.max(insets.top, 10) }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedReport(null)}>
            <Feather name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: '#FFF' }]}>Report Review</Text>
          <TouchableOpacity style={styles.bellBtn}>
            <Feather name="bell" size={20} color="#FFF" />
            <View style={styles.badge}><Text style={styles.badgeText}>3</Text></View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContentForm, { marginTop: -20 }]}>
        
        {/* Patient Detail Card */}
        <View style={styles.patientCard}>
          <View style={styles.cardHeader}>
            <Image source={{ uri: selectedReport.avatar }} style={[styles.avatar, { width: 50, height: 50, borderRadius: 25 }]} />
            <View style={styles.patientInfo}>
              <Text style={[styles.patientName, { fontSize: 18 }]}>{selectedReport.name}</Text>
              <View style={{ flexDirection: 'row', gap: 20, marginTop: 4 }}>
                <View>
                  <Text style={styles.metaLabel}>PID</Text>
                  <Text style={styles.metaValueBlue}>{selectedReport.pid}</Text>
                </View>
                <View>
                  <Text style={styles.metaLabel}>Age / Gender</Text>
                  <Text style={styles.metaValue}>{selectedReport.age} Yrs / {selectedReport.gender}</Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.metaGrid}>
            <View style={{ flex: 1 }}>
              <Text style={styles.metaLabel}>Sample ID</Text>
              <Text style={styles.metaValue}>{selectedReport.sid}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.metaLabel}>Report ID</Text>
              <Text style={styles.metaValue}>{selectedReport.rid}</Text>
            </View>
          </View>
          <View style={[styles.metaGrid, { borderTopWidth: 0, paddingTop: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.metaLabel}>Collected On</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Feather name="calendar" size={12} color={THEME.textSecondary} style={{ marginRight: 4 }}/>
                <Text style={styles.metaValue}>15 May 2026, 09:30 AM</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.metaLabel}>Reported On</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Feather name="clock" size={12} color={THEME.textSecondary} style={{ marginRight: 4 }}/>
                <Text style={styles.metaValue}>Today, {selectedReport.time}</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Test Results</Text>

        {/* Results Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 2 }]}>Test</Text>
            <Text style={[styles.th, { flex: 1 }]}>Result</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>Reference Range</Text>
            <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Status</Text>
          </View>
          
          {/* Category 1 */}
          <Text style={styles.tableCategory}>Complete Blood Count (CBC)</Text>
          <TableRow test="Hemoglobin (Hb)" result="13.8 g/dL" range="13 - 17 g/dL" status="Normal" />
          <TableRow test="Total WBC Count" result="12,500 cells/µL" range="4,000 - 11,000" status="High" />
          <TableRow test="RBC Count" result="5.2 millions/µL" range="4.5 - 5.5" status="Normal" />
          <TableRow test="Hematocrit (HCT)" result="41.2 %" range="40 - 50 %" status="Normal" />
          <TableRow test="MCV" result="82.5 fL" range="80 - 100 fL" status="Normal" />
          <TableRow test="MCH" result="27.6 pg" range="27 - 32 pg" status="Normal" />
          <TableRow test="Platelet Count" result="2.4 Lakh/µL" range="1.5 - 4.5" status="Normal" />

          {/* Category 2 */}
          <Text style={styles.tableCategory}>Lipid Profile</Text>
          <TableRow test="Total Cholesterol" result="192 mg/dL" range="< 200" status="Normal" />
          <TableRow test="Triglycerides" result="256 mg/dL" range="< 150" status="High" />
          <TableRow test="HDL Cholesterol" result="42 mg/dL" range="> 40" status="Normal" />
          <TableRow test="LDL Cholesterol" result="120 mg/dL" range="< 130" status="Normal" />
        </View>

        {/* AI Beta Box */}
        <View style={styles.aiBox}>
          <View style={styles.aiIconBox}><MaterialCommunityIcons name="robot-outline" size={20} color="#3B82F6" /></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.aiTitle}>AI Review (Beta)</Text>
            <Text style={styles.aiText}>One abnormal value detected.</Text>
            <Text style={styles.aiText}>Recommend pathologist review before approval.</Text>
          </View>
          <Feather name="info" size={16} color={THEME.textSecondary} />
        </View>

        {/* Notes */}
        <Text style={[styles.inputTitle, { marginTop: 20, marginBottom: 8 }]}>Pathologist Remarks <Text style={styles.optional}>(Optional)</Text></Text>
        <View style={styles.notesBox}>
          <TextInput style={styles.notesInput} multiline placeholder="Add approval remarks..." value={remarks} onChangeText={setRemarks} textAlignVertical="top" maxLength={250} />
          <Text style={styles.charCount}>{remarks.length}/250</Text>
        </View>

        {/* Verification Checkboxes */}
        <Text style={[styles.inputTitle, { color: THEME.primary, marginTop: 20, marginBottom: 12 }]}>Approval Checklist</Text>
        <TouchableOpacity style={styles.checkboxRow} onPress={() => setCheck1(!check1)} activeOpacity={0.7}>
          <MaterialCommunityIcons name={check1 ? "checkbox-marked" : "checkbox-blank-outline"} size={22} color={check1 ? THEME.primary : THEME.textSecondary} />
          <Text style={styles.checkboxText}>Results Verified</Text>
          <Feather name="info" size={16} color={THEME.textSecondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.checkboxRow} onPress={() => setCheck2(!check2)} activeOpacity={0.7}>
          <MaterialCommunityIcons name={check2 ? "checkbox-marked" : "checkbox-blank-outline"} size={22} color={check2 ? THEME.primary : THEME.textSecondary} />
          <Text style={styles.checkboxText}>Reference Ranges Confirmed</Text>
          <Feather name="info" size={16} color={THEME.textSecondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.checkboxRow} onPress={() => setCheck3(!check3)} activeOpacity={0.7}>
          <MaterialCommunityIcons name={check3 ? "checkbox-marked" : "checkbox-blank-outline"} size={22} color={check3 ? THEME.primary : THEME.textSecondary} />
          <Text style={styles.checkboxText}>Report Ready for Release</Text>
          <Feather name="info" size={16} color={THEME.textSecondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {/* Actions */}
        <TouchableOpacity style={[styles.primaryBtn, { marginTop: 10 }]} onPress={() => setShowApproveModal(true)}>
          <Feather name="check-circle" size={18} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.primaryBtnText}>Approve Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dangerOutlineBtn} onPress={() => setShowRejectModal(true)}>
          <Feather name="corner-up-left" size={18} color={THEME.danger} style={{ marginRight: 8 }} />
          <Text style={styles.dangerOutlineBtnText}>Reject / Send Back</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* ── APPROVE MODAL ── */}
      <Modal visible={showApproveModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <TouchableOpacity style={styles.closeBtn} onPress={handleCloseModals}><Feather name="x" size={24} color={THEME.textSecondary} /></TouchableOpacity>
            <View style={[styles.modalIconBox, { backgroundColor: THEME.successBg }]}><Feather name="check" size={32} color={THEME.success} /></View>
            <Text style={[styles.modalTitle, { color: THEME.success }]}>Report Approved Successfully</Text>

            <View style={styles.modalDetailsBox}>
              <ModalDetailRow label="Patient Name" value={selectedReport.name} />
              <View style={styles.divider} />
              <ModalDetailRow label="Report ID" value={selectedReport.rid} />
              <View style={styles.divider} />
              <ModalDetailRow label="Approval Time" value="15 May 2026, 12:05 PM" />
              <View style={styles.divider} />
              <ModalDetailRow label="Approved By" value="Dr. Pathologist" />
            </View>

            <TouchableOpacity style={styles.primaryBtn}><Feather name="send" size={18} color="#FFF" style={{ marginRight: 8 }}/><Text style={styles.primaryBtnText}>Notify Patient</Text></TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleCloseModals}><Text style={styles.secondaryBtnText}>Back to Pending Reports</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── REJECT MODAL ── */}
      <Modal visible={showRejectModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <TouchableOpacity style={styles.closeBtn} onPress={handleCloseModals}><Feather name="x" size={24} color={THEME.textSecondary} /></TouchableOpacity>
            <View style={[styles.modalIconBox, { backgroundColor: THEME.dangerBg }]}><Feather name="alert-triangle" size={32} color={THEME.danger} /></View>
            <Text style={[styles.modalTitle, { color: THEME.danger }]}>Reject Report</Text>
            <Text style={styles.modalSubtitle}>Please select reason for rejection</Text>

            <View style={{ width: '100%', marginBottom: 16 }}>
              <View style={styles.dropdown}>
                <Text style={{ color: THEME.textPrimary }}>Select Reason</Text>
                <Feather name="chevron-down" size={20} color={THEME.textSecondary} />
              </View>
              <Text style={[styles.inputTitle, { marginTop: 16, marginBottom: 8 }]}>Comments <Text style={styles.optional}>(Optional)</Text></Text>
              <TextInput style={styles.rejectInput} multiline placeholder="Add comments..." value={rejectReason} onChangeText={setRejectReason} textAlignVertical="top" />
            </View>

            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity style={[styles.secondaryBtn, { flex: 1 }]} onPress={handleCloseModals}><Text style={styles.secondaryBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn, { flex: 1, backgroundColor: THEME.danger, marginTop: 0 }]}><Text style={styles.primaryBtnText}>Submit Rejection</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

// ─── Table Row Component ───
const TableRow = ({ test, result, range, status }: any) => {
  const isHigh = status === 'High';
  return (
    <View style={styles.tr}>
      <Text style={[styles.td, { flex: 2, fontWeight: '600', color: THEME.textPrimary }]}>{test}</Text>
      <Text style={[styles.td, { flex: 1, fontWeight: '700', color: isHigh ? THEME.danger : THEME.textPrimary }]}>{result}</Text>
      <Text style={[styles.td, { flex: 1.5 }]}>{range}</Text>
      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        <View style={[styles.statusPill, { backgroundColor: isHigh ? THEME.dangerBg : THEME.successBg }]}>
          <MaterialCommunityIcons name={isHigh ? "alert-circle" : "check-circle"} size={12} color={isHigh ? THEME.danger : THEME.success} style={{ marginRight: 4 }} />
          <Text style={[styles.statusPillText, { color: isHigh ? THEME.danger : THEME.success }]}>{status}</Text>
        </View>
      </View>
    </View>
  );
};

const ModalDetailRow = ({ label, value }: { label: string, value: string }) => (
  <View style={styles.modalRow}>
    <Text style={styles.modalLabel}>{label}</Text>
    <Text style={styles.modalValue}>{value}</Text>
  </View>
);

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.screenBg },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: THEME.textPrimary },
  bellBtn: { position: 'relative', padding: 4 },
  badge: { position: 'absolute', top: 0, right: 0, backgroundColor: THEME.danger, width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: THEME.bg },
  badgeText: { fontSize: 8, color: '#FFF', fontWeight: 'bold' },
  iconBtn: { padding: 4 },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.bg, marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: THEME.border, marginBottom: 16 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 13, color: THEME.textPrimary },

  tabsScroll: { marginBottom: 16, maxHeight: 40 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: THEME.border, marginRight: 10, backgroundColor: THEME.bg, height: 36 },
  tabBtnActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  tabText: { fontSize: 13, color: THEME.textSecondary, fontWeight: '500' },
  tabTextActive: { color: '#FFF', fontWeight: '600' },

  scrollContent: { paddingHorizontal: 20 },
  scrollContentForm: { paddingHorizontal: 20, paddingTop: 10, backgroundColor: THEME.screenBg, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  
  sectionTitle: { fontSize: 16, fontWeight: '700', color: THEME.textPrimary, marginBottom: 12, marginTop: 10 },

  // Summary Cards
  summaryGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  summaryCard: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '800' },
  summaryLabel: { fontSize: 10, fontWeight: '600', marginTop: 4, textAlign: 'center' },

  // Patient Cards
  patientCard: { backgroundColor: THEME.bg, borderRadius: 16, borderWidth: 1, borderColor: THEME.border, marginBottom: 16, padding: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6 },
  cardHeader: { flexDirection: 'row', marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E2E8F0', marginRight: 12 },
  patientInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  patientName: { fontSize: 15, fontWeight: '700', color: THEME.textPrimary },
  metaTextSm: { fontSize: 11, color: THEME.textSecondary },
  patientId: { fontSize: 12, color: THEME.textSecondary, fontWeight: '500', marginBottom: 2 },
  
  cardMetaRow: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F5F9', paddingVertical: 12, marginBottom: 12 },
  metaGrid: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F5F9', paddingVertical: 12, marginTop: 12 },
  metaLabel: { fontSize: 11, color: THEME.textSecondary, marginBottom: 2 },
  metaValue: { fontSize: 12, fontWeight: '600', color: THEME.textPrimary },
  metaValueBlue: { fontSize: 12, fontWeight: '700', color: THEME.primary },

  testsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  testsLabel: { fontSize: 12, color: THEME.textSecondary, fontWeight: '500', marginRight: 8 },
  testChip: { backgroundColor: '#F0FDFA', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#CCFBF1', marginRight: 6 },
  testChipText: { fontSize: 11, color: THEME.primary, fontWeight: '600' },

  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.warningBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: THEME.warning, marginRight: 4 },
  statusText: { fontSize: 9, fontWeight: '700', color: THEME.warning },

  cardFooter: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontSize: 11, color: THEME.textSecondary, marginLeft: 4 },

  // Table
  table: { backgroundColor: THEME.bg, borderRadius: 12, borderWidth: 1, borderColor: THEME.border, overflow: 'hidden', paddingBottom: 8 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 12, borderBottomWidth: 1, borderBottomColor: THEME.border },
  th: { fontSize: 10, fontWeight: '700', color: THEME.textSecondary, textTransform: 'uppercase' },
  tableCategory: { fontSize: 13, fontWeight: '700', color: THEME.primary, paddingHorizontal: 12, paddingTop: 16, paddingBottom: 8 },
  tr: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  td: { fontSize: 11, color: THEME.textSecondary },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  statusPillText: { fontSize: 9, fontWeight: '700' },

  // AI Box
  aiBox: { flexDirection: 'row', backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#BFDBFE', marginTop: 16 },
  aiIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center' },
  aiTitle: { fontSize: 13, fontWeight: '700', color: '#1E3A8A', marginBottom: 4 },
  aiText: { fontSize: 11, color: '#1E40AF', marginTop: 2 },

  // Inputs
  inputTitle: { fontSize: 14, fontWeight: '700', color: THEME.textPrimary },
  optional: { fontSize: 11, color: THEME.textSecondary, fontWeight: '400' },
  notesBox: { borderWidth: 1, borderColor: THEME.border, borderRadius: 12, padding: 12, backgroundColor: THEME.bg, height: 90 },
  notesInput: { flex: 1, fontSize: 13, color: THEME.textPrimary },
  charCount: { fontSize: 10, color: THEME.textSecondary, textAlign: 'right', marginTop: 4 },

  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  checkboxText: { fontSize: 14, color: THEME.textPrimary, marginLeft: 12, fontWeight: '500' },

  // Buttons
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.primary, height: 50, borderRadius: 12, marginTop: 10 },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.bg, height: 50, borderRadius: 12, borderWidth: 1.5, borderColor: THEME.primary, marginTop: 12 },
  secondaryBtnText: { fontSize: 15, fontWeight: '700', color: THEME.primary },
  dangerOutlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.bg, height: 50, borderRadius: 12, borderWidth: 1.5, borderColor: THEME.danger, marginTop: 12 },
  dangerOutlineBtnText: { fontSize: 15, fontWeight: '700', color: THEME.danger },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  sheet: { backgroundColor: THEME.bg, borderRadius: 20, padding: 24, width: '100%', alignItems: 'center' },
  closeBtn: { position: 'absolute', top: 16, right: 16 },
  modalIconBox: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 24 },
  modalSubtitle: { fontSize: 13, color: THEME.textSecondary, marginBottom: 20, marginTop: -16 },
  
  modalDetailsBox: { width: '100%', backgroundColor: THEME.screenBg, borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: THEME.border },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  modalLabel: { fontSize: 13, color: THEME.textSecondary },
  modalValue: { fontSize: 13, fontWeight: '600', color: THEME.textPrimary },
  divider: { height: 1, backgroundColor: THEME.border, marginVertical: 8 },

  dropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: THEME.border, borderRadius: 12, paddingHorizontal: 14, height: 50 },
  rejectInput: { borderWidth: 1, borderColor: THEME.border, borderRadius: 12, padding: 12, backgroundColor: THEME.screenBg, height: 80, fontSize: 13 },
});