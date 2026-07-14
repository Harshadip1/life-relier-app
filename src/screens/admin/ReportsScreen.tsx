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
};

const DUMMY_PENDING = [
  { id: '1', name: 'Rahul Sharma', pid: 'PT123456', sid: 'SMP125487', time: '09:15 AM', tests: ['CBC', 'HbA1c', 'Lipid Profile'], avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop' },
  { id: '2', name: 'Priya Patil', pid: 'PT123455', sid: 'SMP125488', time: '09:45 AM', tests: ['Thyroid Profile', 'Vitamin D', 'CBC'], avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop' },
  { id: '3', name: 'Arjun Verma', pid: 'PT123454', sid: 'SMP125489', time: '10:10 AM', tests: ['CBC', 'KFT', 'Lipid Profile'], avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop' },
  { id: '4', name: 'Sneha Joshi', pid: 'PT123453', sid: 'SMP125490', time: '10:30 AM', tests: ['HbA1c', 'CBC'], avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop' },
];

export default function ReportsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  
  // ─── States ───
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Pending');
  const [selectedPatient, setSelectedPatient] = useState<any>(null); // Controls switching to form
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Form inputs
  const [hb, setHb] = useState('13.8');
  const [wbc, setWbc] = useState('7200');
  const [platelet, setPlatelet] = useState('2.8');
  const [glucose, setGlucose] = useState('245'); // High value
  const [notes, setNotes] = useState('');

  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);

  const TABS = ['Pending', 'In Progress', 'Completed', 'Critical'];

  const handleSave = () => {
    setShowSuccessModal(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    setSelectedPatient(null); // Go back to list
  };

  // ===========================================================================
  // VIEW 1: PENDING LIST
  // ===========================================================================
  if (!selectedPatient) {
    return (
      <View style={[styles.root, { paddingTop: Math.max(insets.top, 10) }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color={THEME.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Result Entry</Text>
          <TouchableOpacity style={styles.iconBtn}><Feather name="filter" size={20} color={THEME.primary} /></TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color={THEME.textSecondary} style={styles.searchIcon} />
          <TextInput style={styles.searchInput} placeholder="Search by Patient ID, Sample ID or Name" value={search} onChangeText={setSearch} />
          <TouchableOpacity><MaterialCommunityIcons name="line-scan" size={20} color={THEME.primary} /></TouchableOpacity>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {TABS.map(tab => (
            <TouchableOpacity key={tab} style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Summary Cards */}
          <View style={styles.summaryGrid}>
            <View style={[styles.summaryCard, { borderColor: '#FEF3C7', backgroundColor: THEME.warningBg }]}>
              <Text style={[styles.summaryLabel, { color: THEME.warning }]}>Pending Results</Text>
              <Text style={[styles.summaryValue, { color: THEME.warning }]}>18</Text>
            </View>
            <View style={[styles.summaryCard, { borderColor: '#DBEAFE', backgroundColor: '#EFF6FF' }]}>
              <View style={{ alignItems: 'center' }}><Feather name="activity" size={16} color="#3B82F6" style={{ marginBottom: 4 }}/></View>
              <Text style={[styles.summaryLabel, { color: '#3B82F6' }]}>In Progress</Text>
              <Text style={[styles.summaryValue, { color: '#3B82F6' }]}>7</Text>
            </View>
            <View style={[styles.summaryCard, { borderColor: '#FEE2E2', backgroundColor: THEME.dangerBg }]}>
              <View style={{ alignItems: 'center' }}><Feather name="alert-triangle" size={16} color={THEME.danger} style={{ marginBottom: 4 }}/></View>
              <Text style={[styles.summaryLabel, { color: THEME.danger }]}>Critical Results</Text>
              <Text style={[styles.summaryValue, { color: THEME.danger }]}>2</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Pending Result List</Text>

          {/* List */}
          {DUMMY_PENDING.map(patient => (
            <View key={patient.id} style={styles.patientCard}>
              <View style={styles.cardHeader}>
                <Image source={{ uri: patient.avatar }} style={styles.avatar} />
                <View style={styles.patientInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.patientName}>{patient.name}</Text>
                    <View style={styles.statusBadge}>
                      <View style={styles.statusDot} />
                      <Text style={styles.statusText}>Awaiting Result Entry</Text>
                    </View>
                  </View>
                  <Text style={styles.patientId}>PID: <Text style={{ color: THEME.primary }}>{patient.pid}</Text></Text>
                  <Text style={styles.patientId}>SID: <Text style={{ color: THEME.textSecondary }}>{patient.sid}</Text></Text>
                </View>
              </View>
              
              <View style={styles.testsRow}>
                <Text style={styles.testsLabel}>Tests: </Text>
                {patient.tests.map(test => (
                  <View key={test} style={styles.testChip}><Text style={styles.testChipText}>{test}</Text></View>
                ))}
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.timeRow}>
                  <Feather name="clock" size={12} color={THEME.textSecondary} />
                  <Text style={styles.timeText}>Collected Today • {patient.time}</Text>
                </View>
                <TouchableOpacity style={styles.enterBtn} onPress={() => setSelectedPatient(patient)}>
                  <Text style={styles.enterBtnText}>Enter Results</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  }

  // ===========================================================================
  // VIEW 2: RESULT ENTRY FORM
  // ===========================================================================
  return (
    <KeyboardAvoidingView style={[styles.root, { paddingTop: Math.max(insets.top, 10) }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedPatient(null)}>
          <Feather name="arrow-left" size={24} color={THEME.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Result Entry</Text>
        <TouchableOpacity style={styles.iconBtn}><Feather name="filter" size={20} color={THEME.primary} /></TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContentForm}>
        
        {/* Patient Detail Card */}
        <View style={[styles.patientCard, { padding: 16 }]}>
          <View style={styles.cardHeader}>
            <Image source={{ uri: selectedPatient.avatar }} style={[styles.avatar, { width: 50, height: 50, borderRadius: 25 }]} />
            <View style={styles.patientInfo}>
              <Text style={[styles.patientName, { fontSize: 18 }]}>{selectedPatient.name}</Text>
              <View style={{ flexDirection: 'row', gap: 20, marginTop: 4 }}>
                <View>
                  <Text style={styles.metaLabel}>PID</Text>
                  <Text style={styles.metaValueBlue}>{selectedPatient.pid}</Text>
                </View>
                <View>
                  <Text style={styles.metaLabel}>Age / Gender</Text>
                  <Text style={styles.metaValue}>32 Yrs / Male</Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.metaGrid}>
            <View style={{ flex: 1 }}>
              <Text style={styles.metaLabel}>Sample ID</Text>
              <Text style={styles.metaValue}>{selectedPatient.sid}</Text>
            </View>
            <View style={{ flex: 1.5 }}>
              <Text style={styles.metaLabel}>Collected On</Text>
              <Text style={styles.metaValue}>Today, {selectedPatient.time}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.metaLabel}>Technician</Text>
              <Text style={styles.metaValue}>Tech A</Text>
            </View>
          </View>

          <Text style={[styles.metaLabel, { marginTop: 12, marginBottom: 6 }]}>Tests Assigned</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
             {selectedPatient.tests.map((test: string) => (
                <View key={test} style={styles.testChip}><Text style={styles.testChipText}>{test}</Text></View>
             ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Test Results</Text>

        {/* Input Field: Hemoglobin */}
        <View style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputTitle}>Hemoglobin (Hb)</Text>
            <View style={styles.badgeNormal}><Text style={styles.badgeTextNormal}>◆ Normal</Text></View>
          </View>
          <View style={styles.inputBoxRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputSubLabel}>Result</Text>
              <View style={styles.inputWrapper}>
                <TextInput style={styles.mainInput} value={hb} onChangeText={setHb} keyboardType="numeric" />
                <Text style={styles.unitText}>g/dL</Text>
              </View>
            </View>
            <View style={styles.refRangeBox}>
              <Text style={styles.inputSubLabel}>Reference Range</Text>
              <Text style={styles.refRangeText}>13.0 - 17.0 <View style={styles.dotNormal} /></Text>
            </View>
          </View>
        </View>

        {/* Input Field: WBC Count */}
        <View style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputTitle}>WBC Count</Text>
            <View style={styles.badgeNormal}><Text style={styles.badgeTextNormal}>◆ Normal</Text></View>
          </View>
          <View style={styles.inputBoxRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputSubLabel}>Result</Text>
              <View style={styles.inputWrapper}>
                <TextInput style={styles.mainInput} value={wbc} onChangeText={setWbc} keyboardType="numeric" />
                <Text style={styles.unitText}>cells/µL</Text>
              </View>
            </View>
            <View style={styles.refRangeBox}>
              <Text style={styles.inputSubLabel}>Reference Range</Text>
              <Text style={styles.refRangeText}>4000 - 11000 <View style={styles.dotNormal} /></Text>
            </View>
          </View>
        </View>

        {/* Input Field: Platelet */}
        <View style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputTitle}>Platelet Count</Text>
            <View style={styles.badgeNormal}><Text style={styles.badgeTextNormal}>◆ Normal</Text></View>
          </View>
          <View style={styles.inputBoxRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputSubLabel}>Result</Text>
              <View style={styles.inputWrapper}>
                <TextInput style={styles.mainInput} value={platelet} onChangeText={setPlatelet} keyboardType="numeric" />
                <Text style={styles.unitText}>Lakh/µL</Text>
              </View>
            </View>
            <View style={styles.refRangeBox}>
              <Text style={styles.inputSubLabel}>Reference Range</Text>
              <Text style={styles.refRangeText}>1.5 - 4.5 <View style={styles.dotNormal} /></Text>
            </View>
          </View>
        </View>

        {/* Input Field: Blood Glucose (HIGH WARNING) */}
        <View style={[styles.inputCard, { borderColor: THEME.dangerBg, borderWidth: 2 }]}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputTitle}>Blood Glucose (Fasting)</Text>
            <View style={styles.badgeHigh}><Text style={styles.badgeTextHigh}>High</Text></View>
          </View>
          <View style={styles.inputBoxRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputSubLabel}>Result</Text>
              <View style={[styles.inputWrapper, { borderColor: THEME.danger }]}>
                <TextInput style={styles.mainInput} value={glucose} onChangeText={setGlucose} keyboardType="numeric" />
                <Text style={styles.unitText}>mg/dL</Text>
              </View>
            </View>
            <View style={styles.refRangeBox}>
              <Text style={styles.inputSubLabel}>Reference Range</Text>
              <Text style={styles.refRangeText}>70 - 140 <View style={styles.dotHigh} /></Text>
            </View>
          </View>
        </View>

        {/* Critical Alert Box */}
        <View style={styles.alertBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Feather name="alert-triangle" size={18} color={THEME.danger} style={{ marginRight: 8 }} />
            <Text style={styles.alertTitle}>Critical Value Detected</Text>
          </View>
          <Text style={styles.alertText}>Blood Glucose is above the normal reference range.</Text>
          <Text style={styles.alertText}>Please verify before submission.</Text>
        </View>

        {/* Notes */}
        <Text style={[styles.inputTitle, { marginTop: 10, marginBottom: 8 }]}>Technician Notes <Text style={styles.optional}>(Optional)</Text></Text>
        <View style={styles.notesBox}>
          <TextInput 
            style={styles.notesInput} multiline placeholder="Add observations or remarks..."
            value={notes} onChangeText={setNotes} textAlignVertical="top" maxLength={200}
          />
          <Text style={styles.charCount}>{notes.length}/200</Text>
        </View>

        {/* Verification Checkboxes */}
        <Text style={[styles.inputTitle, { color: THEME.primary, marginTop: 20, marginBottom: 12 }]}>Verification</Text>
        
        <TouchableOpacity style={styles.checkboxRow} onPress={() => setCheck1(!check1)} activeOpacity={0.7}>
          <MaterialCommunityIcons name={check1 ? "checkbox-marked" : "checkbox-blank-outline"} size={22} color={check1 ? THEME.primary : THEME.textSecondary} />
          <Text style={styles.checkboxText}>Results Verified</Text>
          <Feather name="info" size={16} color={THEME.textSecondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.checkboxRow} onPress={() => setCheck2(!check2)} activeOpacity={0.7}>
          <MaterialCommunityIcons name={check2 ? "checkbox-marked" : "checkbox-blank-outline"} size={22} color={check2 ? THEME.primary : THEME.textSecondary} />
          <Text style={styles.checkboxText}>Reference Range Checked</Text>
          <Feather name="info" size={16} color={THEME.textSecondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.checkboxRow} onPress={() => setCheck3(!check3)} activeOpacity={0.7}>
          <MaterialCommunityIcons name={check3 ? "checkbox-marked" : "checkbox-blank-outline"} size={22} color={check3 ? THEME.primary : THEME.textSecondary} />
          <Text style={styles.checkboxText}>Ready for Approval</Text>
          <Feather name="info" size={16} color={THEME.textSecondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {/* Actions */}
        <TouchableOpacity style={styles.primaryBtn} onPress={handleSave}>
          <Feather name="save" size={18} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.primaryBtnText}>Save Results</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn}>
          <Feather name="send" size={18} color={THEME.primary} style={{ marginRight: 8 }} />
          <Text style={styles.secondaryBtnText}>Submit for Verification</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* ── SUCCESS MODAL ── */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successSheet}>
            <TouchableOpacity style={styles.closeBtn} onPress={handleCloseSuccess}>
              <Feather name="x" size={24} color={THEME.textSecondary} />
            </TouchableOpacity>
            
            <View style={styles.successIconBox}>
              <Feather name="check" size={32} color={THEME.success} />
            </View>
            <Text style={styles.successTitle}>Results Saved Successfully</Text>

            <View style={styles.successDetailsBox}>
              <View style={styles.successRow}>
                <Text style={styles.successLabel}>Patient Name</Text>
                <Text style={styles.successValue}>{selectedPatient.name}</Text>
              </View>
              <View style={styles.successDivider} />
              <View style={styles.successRow}>
                <Text style={styles.successLabel}>Sample ID</Text>
                <Text style={styles.successValue}>{selectedPatient.sid}</Text>
              </View>
              <View style={styles.successDivider} />
              <View style={styles.successRow}>
                <Text style={styles.successLabel}>Tests Updated</Text>
                <Text style={styles.successValue}>{selectedPatient.tests.length} / {selectedPatient.tests.length}</Text>
              </View>
              <View style={styles.successDivider} />
              <View style={styles.successRow}>
                <Text style={styles.successLabel}>Submission Time</Text>
                <Text style={styles.successValue}>Today, 11:45 AM</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>View Pending Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleCloseSuccess}>
              <Text style={styles.secondaryBtnText}>Back to Queue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.screenBg },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: THEME.textPrimary },
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
  scrollContentForm: { paddingHorizontal: 20, paddingTop: 10 },
  
  sectionTitle: { fontSize: 16, fontWeight: '700', color: THEME.textPrimary, marginBottom: 12 },

  // Summary Cards
  summaryGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  summaryCard: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '800' },
  summaryLabel: { fontSize: 10, fontWeight: '600', marginTop: 2, textAlign: 'center' },

  // Patient Cards
  patientCard: { backgroundColor: THEME.bg, borderRadius: 16, borderWidth: 1, borderColor: THEME.border, marginBottom: 16, padding: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6 },
  cardHeader: { flexDirection: 'row', marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E2E8F0', marginRight: 12 },
  patientInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  patientName: { fontSize: 15, fontWeight: '700', color: THEME.textPrimary },
  patientId: { fontSize: 12, color: THEME.textSecondary, fontWeight: '500', marginBottom: 2 },
  
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.warningBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: THEME.warning, marginRight: 4 },
  statusText: { fontSize: 9, fontWeight: '700', color: THEME.warning },

  testsRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12, marginBottom: 12 },
  testsLabel: { fontSize: 12, color: THEME.textSecondary, fontWeight: '500', marginRight: 8 },
  testChip: { backgroundColor: '#F0FDFA', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#CCFBF1', marginRight: 6 },
  testChipText: { fontSize: 11, color: THEME.primary, fontWeight: '600' },

  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontSize: 11, color: THEME.textSecondary, marginLeft: 4 },
  enterBtn: { backgroundColor: THEME.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  enterBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },

  // Detail Form Elements
  metaGrid: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F5F9', paddingVertical: 12, marginTop: 12 },
  metaLabel: { fontSize: 11, color: THEME.textSecondary, marginBottom: 2 },
  metaValue: { fontSize: 12, fontWeight: '600', color: THEME.textPrimary },
  metaValueBlue: { fontSize: 12, fontWeight: '700', color: THEME.primary },
  
  inputCard: { backgroundColor: THEME.bg, borderWidth: 1, borderColor: THEME.border, borderRadius: 12, padding: 14, marginBottom: 12 },
  inputHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  inputTitle: { fontSize: 14, fontWeight: '700', color: THEME.textPrimary },
  badgeNormal: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeTextNormal: { fontSize: 10, color: THEME.success, fontWeight: '700' },
  badgeHigh: { backgroundColor: THEME.dangerBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeTextHigh: { fontSize: 10, color: THEME.danger, fontWeight: '700' },

  inputBoxRow: { flexDirection: 'row', alignItems: 'center' },
  inputSubLabel: { fontSize: 11, color: THEME.textSecondary, marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: THEME.border, borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: THEME.screenBg },
  mainInput: { flex: 1, fontSize: 16, fontWeight: '600', color: THEME.textPrimary },
  unitText: { fontSize: 12, color: THEME.textSecondary, marginLeft: 8 },
  
  refRangeBox: { flex: 1, alignItems: 'flex-end' },
  refRangeText: { fontSize: 14, fontWeight: '600', color: THEME.textSecondary, flexDirection: 'row', alignItems: 'center' },
  dotNormal: { width: 8, height: 8, borderRadius: 4, backgroundColor: THEME.success, marginLeft: 6 },
  dotHigh: { width: 8, height: 8, borderRadius: 4, backgroundColor: THEME.danger, marginLeft: 6 },

  alertBox: { backgroundColor: THEME.dangerBg, padding: 12, borderRadius: 8, marginBottom: 20 },
  alertTitle: { fontSize: 13, fontWeight: '700', color: THEME.danger },
  alertText: { fontSize: 11, color: THEME.textPrimary, marginTop: 2 },
  
  optional: { fontSize: 11, color: THEME.textSecondary, fontWeight: '400' },
  notesBox: { borderWidth: 1, borderColor: THEME.border, borderRadius: 12, padding: 12, backgroundColor: THEME.bg, height: 90 },
  notesInput: { flex: 1, fontSize: 13, color: THEME.textPrimary },
  charCount: { fontSize: 10, color: THEME.textSecondary, textAlign: 'right', marginTop: 4 },

  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  checkboxText: { fontSize: 14, color: THEME.textPrimary, marginLeft: 12, fontWeight: '500' },

  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.primary, height: 50, borderRadius: 12, marginBottom: 12, marginTop: 10 },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.bg, height: 50, borderRadius: 12, borderWidth: 1.5, borderColor: THEME.primary },
  secondaryBtnText: { fontSize: 15, fontWeight: '700', color: THEME.primary },

  // Success Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  successSheet: { backgroundColor: THEME.bg, borderRadius: 20, padding: 24, width: '100%', alignItems: 'center' },
  closeBtn: { position: 'absolute', top: 16, right: 16 },
  successIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  successTitle: { fontSize: 18, fontWeight: '700', color: THEME.success, marginBottom: 24 },
  
  successDetailsBox: { width: '100%', backgroundColor: THEME.screenBg, borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: THEME.border },
  successRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  successLabel: { fontSize: 13, color: THEME.textSecondary },
  successValue: { fontSize: 13, fontWeight: '600', color: THEME.textPrimary },
  successDivider: { height: 1, backgroundColor: THEME.border, marginVertical: 8 },
});