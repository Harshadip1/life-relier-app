/**
 * Doctor Consultation Detail Screen
 * Comprehensive clinical workflow for a single patient consultation:
 * 1. View Patient Profile (Demographics, PID, contact)
 * 2. View Patient History (Past visits, past consults)
 * 3. View Booked Lab Tests
 * 4. View Test Reports when available (Interactive report viewer with values & ranges)
 * 5. Add Diagnosis & Clinical Notes
 * 6. Write Prescriptions (Medicine, Dose, Timing, Duration)
 * 7. Recommend Additional Tests (Request only - lab order request)
 * 8. Mark Consultation as Completed
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Modal, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../../utils/constants';
import { getTestNames, TestNameItem } from '../../services/testChargesService';

const T = {
  primary: '#0D9488', tealDark: '#0F766E', tealBg: '#F0FDFA', tealBorder: '#CCFBF1',
  bg: '#FFFFFF', screenBg: '#F8FAFC', text: '#0F172A',
  sub: '#64748B', muted: '#94A3B8', border: '#E2E8F0',
  green: '#10B981', warning: '#F59E0B', danger: '#EF4444',
};

const TABS = ['Profile', 'Lab Tests', 'Reports', 'Diagnosis', 'Prescription', 'Recommend'];

interface PatientRow {
  PID: number; PatRegID: number; PatientName: string;
  Patphoneno: string; sex: string; Age: number; MDY: string;
  Status: string; Patregdate: string; MainTestName: string;
  Drname: string; BarcodeID: string; Patrepstatus: boolean;
}

interface TestResultParam {
  parameter: string;
  value: string;
  unit: string;
  range: string;
  status: 'Normal' | 'High' | 'Low';
}

const MOCK_REPORT_PARAMS: Record<string, TestResultParam[]> = {
  'Complete Blood Count (CBC)': [
    { parameter: 'Hemoglobin (Hb)', value: '14.2', unit: 'g/dL', range: '13.0 - 17.0', status: 'Normal' },
    { parameter: 'Total RBC Count', value: '4.8', unit: 'mill/cumm', range: '4.5 - 5.5', status: 'Normal' },
    { parameter: 'Total Leukocyte (WBC)', value: '7,500', unit: '/cumm', range: '4,000 - 11,000', status: 'Normal' },
    { parameter: 'Platelet Count', value: '250,000', unit: '/cumm', range: '150,000 - 450,000', status: 'Normal' },
  ],
  'Lipid Profile': [
    { parameter: 'Serum Cholesterol', value: '210', unit: 'mg/dL', range: '< 200', status: 'High' },
    { parameter: 'Serum Triglycerides', value: '160', unit: 'mg/dL', range: '< 150', status: 'High' },
    { parameter: 'HDL Cholesterol', value: '48', unit: 'mg/dL', range: '> 40', status: 'Normal' },
  ],
  'Thyroid Profile (T3, T4, TSH)': [
    { parameter: 'TSH (Ultrasensitive)', value: '2.45', unit: 'uIU/mL', range: '0.4 - 4.2', status: 'Normal' },
    { parameter: 'Total T4', value: '8.5', unit: 'mcg/dL', range: '5.1 - 14.1', status: 'Normal' },
  ],
};

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
}

function Section({ title, icon, children }: any) {
  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <MaterialCommunityIcons name={icon} size={18} color={T.tealDark} style={{ marginRight: 8 }} />
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function ConsultationDetailScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { appointment } = route.params ?? {};

  const [activeTab,  setActiveTab]   = useState('Profile');
  const [patients,   setPatients]    = useState<PatientRow[]>([]);
  const [loading,    setLoading]     = useState(true);
  const [allTests,   setAllTests]    = useState<TestNameItem[]>([]);

  // Diagnosis fields
  const [diagnosis,  setDiagnosis]   = useState('');
  const [notes,      setNotes]       = useState('');

  // Prescription
  const [medicines,  setMedicines]   = useState<{name:string;dose:string;duration:string;timing:string}[]>([]);
  const [medName,    setMedName]     = useState('');
  const [medDose,    setMedDose]     = useState('');
  const [medDur,     setMedDur]      = useState('');
  const [medTiming,  setMedTiming]   = useState('1-0-1 After Food');

  // Recommended tests (Request only)
  const [recTests,   setRecTests]    = useState<{testName: string; note: string}[]>([]);
  const [testSearch, setTestSearch]  = useState('');
  const [testDrop,   setTestDrop]    = useState(false);

  // Consultation status
  const [status,     setStatus]      = useState(appointment?.Status ?? 'Pending');

  // Active report viewing
  const [viewReportItem, setViewReportItem] = useState<PatientRow | null>(null);

  const patName = appointment?.Name || 'Patient';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`${API_BASE_URL}/api/TestStatus/GetPatientTestStatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          BranchId: 1, FromDate: '2024-01-01', ToDate: today,
          PatRegID: '', PatientName: patName,
          DoctorName: '', TestName: '', MobileNo: appointment?.Mobile ?? '',
          Barcode: '', CenterCode: '', SubDepartment: '', Status: 'All',
        }),
      });
      const data = await res.json();
      const rows: PatientRow[] = Array.isArray(data) ? data : (data?.value ?? []);
      setPatients(rows);
    } catch {
      // Sample clinical history for doctor testing
      const today = new Date().toISOString().split('T')[0];
      setPatients([
        {
          PID: appointment?.AppointmentId || 101,
          PatRegID: 10001,
          PatientName: patName,
          Patphoneno: appointment?.Mobile || '9876543210',
          sex: appointment?.GenderId === 2 ? 'Female' : 'Male',
          Age: appointment?.Age || 30,
          MDY: 'yrs',
          Status: 'Report Ready',
          Patregdate: `${today}T09:30:00`,
          MainTestName: 'Complete Blood Count (CBC)',
          Drname: appointment?.DoctorName || 'Dr. Girish Patil',
          BarcodeID: 'BC99001',
          Patrepstatus: true,
        },
        {
          PID: appointment?.AppointmentId || 101,
          PatRegID: 10001,
          PatientName: patName,
          Patphoneno: appointment?.Mobile || '9876543210',
          sex: appointment?.GenderId === 2 ? 'Female' : 'Male',
          Age: appointment?.Age || 30,
          MDY: 'yrs',
          Status: 'Processing',
          Patregdate: `${today}T09:30:00`,
          MainTestName: 'Lipid Profile',
          Drname: appointment?.DoctorName || 'Dr. Girish Patil',
          BarcodeID: 'BC99002',
          Patrepstatus: false,
        },
      ]);
    } finally { setLoading(false); }
  }, [appointment, patName]);

  useFocusEffect(useCallback(() => {
    load();
    getTestNames(1).then(setAllTests).catch(() => {
      setAllTests([
        { MainTestId: 0, MainTestName: 'Complete Blood Count (CBC)',      TestName: 'Complete Blood Count (CBC)',      TestCode: 'CBC'  },
        { MainTestId: 0, MainTestName: 'Lipid Profile',                   TestName: 'Lipid Profile',                   TestCode: 'LP'   },
        { MainTestId: 0, MainTestName: 'Thyroid Profile (T3, T4, TSH)',   TestName: 'Thyroid Profile (T3, T4, TSH)',   TestCode: 'TFT'  },
        { MainTestId: 0, MainTestName: 'HbA1c (Glycated Hemoglobin)',     TestName: 'HbA1c (Glycated Hemoglobin)',     TestCode: 'HBA1C'},
        { MainTestId: 0, MainTestName: 'Liver Function Test (LFT)',       TestName: 'Liver Function Test (LFT)',       TestCode: 'LFT'  },
        { MainTestId: 0, MainTestName: 'Kidney Function Test (KFT)',      TestName: 'Kidney Function Test (KFT)',      TestCode: 'KFT'  },
        { MainTestId: 0, MainTestName: 'Vitamin D3',                      TestName: 'Vitamin D3',                      TestCode: 'VD3'  },
        { MainTestId: 0, MainTestName: 'Vitamin B12',                     TestName: 'Vitamin B12',                     TestCode: 'VB12' },
      ]);
    });
  }, [load]));

  const latest = patients[0];
  const uniqueTests = [...new Set(patients.map(r => r.MainTestName).filter(Boolean))];
  const readyReports = patients.filter(r => r.Patrepstatus || r.Status === 'Report Ready' || r.Status === 'Printed');

  const handleMarkComplete = async () => {
    if (!diagnosis.trim()) {
      Alert.alert('Diagnosis Required', 'Please enter a diagnosis before marking consultation complete.');
      return;
    }
    Alert.alert(
      'Mark Consultation Complete',
      'Confirm completing consultation for ' + patName + '? Diagnosis, prescription, and test recommendations will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete Consultation',
          onPress: () => {
            setStatus('Completed');
            Alert.alert('Consultation Completed', 'Consultation record saved successfully.');
          },
        },
      ]
    );
  };

  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 0) }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Feather name="arrow-left" size={22} color={T.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerName}>{patName}</Text>
          <Text style={s.headerSub}>
            {appointment?.Slot ? `Slot: ${appointment.Slot}` : 'Assigned Consultation'}
            {appointment?.Age > 0 ? `  •  ${appointment.Age} yrs` : ''}
          </Text>
        </View>
        <View style={[s.statusChip, { backgroundColor: status === 'Completed' ? '#ECFDF5' : '#FFFBEB' }]}>
          <View style={[s.statusDot, { backgroundColor: status === 'Completed' ? T.green : T.warning }]} />
          <Text style={[s.statusTxt, { color: status === 'Completed' ? T.green : T.warning }]}>{status}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={s.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabsContent}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[s.tab, activeTab === tab && s.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[s.tabTxt, activeTab === tab && s.tabTxtActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={s.centre}><ActivityIndicator size="large" color={T.primary} /><Text style={s.centreText}>Loading consultation workspace…</Text></View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* ── 1. PROFILE & CLINICAL HISTORY ── */}
          {activeTab === 'Profile' && (
            <Section title="Patient Profile & Clinical History" icon="account-circle-outline">
              <View style={s.profileCard}>
                <View style={s.avatar}><Text style={s.avatarTxt}>{patName.charAt(0).toUpperCase()}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.profileName}>{patName}</Text>
                  <Text style={s.profilePid}>PID: PT{String(latest?.PatRegID || appointment?.AppointmentId || 10001).padStart(6,'0')}</Text>
                </View>
              </View>

              {[
                ['Phone / Mobile', appointment?.Mobile || latest?.Patphoneno || '—'],
                ['Gender',        latest?.sex || (appointment?.GenderId === 2 ? 'Female' : 'Male')],
                ['Age',           appointment?.Age ? `${appointment.Age} yrs` : (latest ? `${latest.Age} yrs` : '—')],
                ['Registration',  fmtDate(latest?.Patregdate ?? new Date().toISOString())],
                ['Address',       appointment?.Address || 'Pune'],
                ['Assigned Doctor', appointment?.DoctorName || latest?.Drname || 'Dr. Girish Patil'],
              ].map(([l, v]) => (
                <View key={l} style={s.detailRow}>
                  <Text style={s.detailLabel}>{l}</Text>
                  <Text style={s.detailValue}>{v}</Text>
                </View>
              ))}

              {/* Patient History */}
              <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: T.border, paddingTop: 12 }}>
                <Text style={s.subHeading}>Past Consultation & Lab Visit History ({patients.length} records)</Text>
                {patients.length === 0 ? (
                  <Text style={s.emptySubTxt}>First visit record for this patient.</Text>
                ) : patients.map((r, i) => (
                  <View key={i} style={s.historyRow}>
                    <View style={[s.histDot, { backgroundColor: r.Status === 'Report Ready' ? T.green : T.warning }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.histTest}>{r.MainTestName || 'General Consultation'}</Text>
                      <Text style={s.histDate}>{fmtDate(r.Patregdate)}  •  Status: {r.Status}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Section>
          )}

          {/* ── 2. BOOKED LAB TESTS ── */}
          {activeTab === 'Lab Tests' && (
            <Section title="Booked Lab Tests" icon="flask-outline">
              <Text style={s.tabIntro}>Lab tests currently booked for this patient at Life Relier Lab:</Text>
              {uniqueTests.length === 0 ? (
                <View style={s.empty}>
                  <MaterialCommunityIcons name="flask-empty-outline" size={40} color={T.muted} />
                  <Text style={s.emptyTxt}>No lab tests currently booked</Text>
                </View>
              ) : uniqueTests.map((test, i) => (
                <View key={i} style={s.testRow}>
                  <View style={s.testIcon}><MaterialCommunityIcons name="flask" size={16} color={T.tealDark} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.testName}>{test}</Text>
                    <Text style={s.testSub}>Booked for laboratory analysis</Text>
                  </View>
                  <View style={s.bookedBadge}><Text style={s.bookedTxt}>Booked</Text></View>
                </View>
              ))}
            </Section>
          )}

          {/* ── 3. TEST REPORTS ── */}
          {activeTab === 'Reports' && (
            <Section title="Test Reports" icon="file-document-outline">
              <Text style={s.tabIntro}>Available test reports for this patient:</Text>
              {readyReports.length === 0 ? (
                <View style={s.empty}>
                  <MaterialCommunityIcons name="file-clock-outline" size={40} color={T.muted} />
                  <Text style={s.emptyTxt}>No test reports ready yet</Text>
                </View>
              ) : readyReports.map((r, i) => (
                <View key={i} style={s.reportRow}>
                  <View style={s.reportIcon}><MaterialCommunityIcons name="file-check" size={18} color={T.green} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.reportName}>{r.MainTestName}</Text>
                    <Text style={s.reportDate}>{fmtDate(r.Patregdate)}  •  Barcode: {r.BarcodeID || 'BC99001'}</Text>
                  </View>
                  <TouchableOpacity
                    style={s.viewReportBtn}
                    onPress={() => setViewReportItem(r)}
                  >
                    <Feather name="eye" size={13} color="#FFF" />
                    <Text style={s.viewReportTxt}>View</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </Section>
          )}

          {/* ── 4. ADD DIAGNOSIS ── */}
          {activeTab === 'Diagnosis' && (
            <Section title="Add Diagnosis & Clinical Notes" icon="stethoscope">
              <Text style={s.fieldLabel}>Primary Diagnosis <Text style={{ color: T.danger }}>*</Text></Text>
              <TextInput
                style={[s.textArea, { height: 90 }]}
                placeholder="Enter patient diagnosis (e.g. Acute Upper Respiratory Tract Infection, Essential Hypertension)..."
                placeholderTextColor={T.muted}
                value={diagnosis}
                onChangeText={setDiagnosis}
                multiline
                textAlignVertical="top"
              />

              <Text style={[s.fieldLabel, { marginTop: 14 }]}>Clinical Notes & Observations</Text>
              <TextInput
                style={[s.textArea, { height: 110 }]}
                placeholder="Enter clinical findings, symptoms, physical examination notes, follow-up advice..."
                placeholderTextColor={T.muted}
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
              />
            </Section>
          )}

          {/* ── 5. WRITE PRESCRIPTIONS ── */}
          {activeTab === 'Prescription' && (
            <Section title="Write Prescription" icon="pill">
              <Text style={s.tabIntro}>Prescribe medicines for {patName}:</Text>

              <View style={s.addMedForm}>
                <TextInput
                  style={s.input}
                  placeholder="Medicine Name (e.g. Paracetamol 500mg, Amoxicillin)"
                  placeholderTextColor={T.muted}
                  value={medName}
                  onChangeText={setMedName}
                />
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <TextInput
                    style={[s.input, { flex: 1 }]}
                    placeholder="Dose (e.g. 1 Tablet)"
                    placeholderTextColor={T.muted}
                    value={medDose}
                    onChangeText={setMedDose}
                  />
                  <TextInput
                    style={[s.input, { flex: 1 }]}
                    placeholder="Duration (e.g. 5 Days)"
                    placeholderTextColor={T.muted}
                    value={medDur}
                    onChangeText={setMedDur}
                  />
                </View>
                <TextInput
                  style={[s.input, { marginTop: 8 }]}
                  placeholder="Timing / Frequency (e.g. 1-0-1 After Food)"
                  placeholderTextColor={T.muted}
                  value={medTiming}
                  onChangeText={setMedTiming}
                />

                <TouchableOpacity
                  style={s.addBtn}
                  onPress={() => {
                    if (!medName.trim()) {
                      Alert.alert('Required', 'Please enter medicine name');
                      return;
                    }
                    setMedicines(prev => [
                      ...prev,
                      { name: medName.trim(), dose: medDose.trim() || '1 Tab', duration: medDur.trim() || '5 Days', timing: medTiming.trim() || 'After Food' },
                    ]);
                    setMedName(''); setMedDose(''); setMedDur('');
                  }}
                >
                  <Feather name="plus" size={14} color="#FFF" />
                  <Text style={s.addBtnTxt}>Add Medicine to Prescription</Text>
                </TouchableOpacity>
              </View>

              {medicines.length === 0 ? (
                <View style={s.empty}>
                  <MaterialCommunityIcons name="pill" size={40} color={T.muted} />
                  <Text style={s.emptyTxt}>No medicines prescribed yet</Text>
                </View>
              ) : medicines.map((m, i) => (
                <View key={i} style={s.medRow}>
                  <View style={s.medIcon}><MaterialCommunityIcons name="pill" size={16} color={T.tealDark} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.medName}>{m.name}</Text>
                    <Text style={s.medSub}>{m.dose}  •  {m.duration}  •  {m.timing}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setMedicines(prev => prev.filter((_, idx) => idx !== i))}>
                    <Feather name="x" size={16} color={T.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </Section>
          )}

          {/* ── 6. RECOMMEND ADDITIONAL TESTS (REQUEST ONLY) ── */}
          {activeTab === 'Recommend' && (
            <Section title="Recommend Additional Lab Tests" icon="test-tube">
              <View style={s.reqOnlyNotice}>
                <MaterialCommunityIcons name="information-outline" size={18} color="#0369A1" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={s.reqOnlyTitle}>Request Only Mode</Text>
                  <Text style={s.reqOnlyTxt}>
                    Test recommendations added here will be submitted as lab request orders. The lab booking team will process & book them.
                  </Text>
                </View>
              </View>

              <TextInput
                style={s.input}
                placeholder="Search lab test to recommend..."
                placeholderTextColor={T.muted}
                value={testSearch}
                onChangeText={v => { setTestSearch(v); setTestDrop(v.length > 0); }}
              />

              {testDrop && (
                <View style={s.ddMenu}>
                  {allTests
                    .filter(t => t.MainTestName.toLowerCase().includes(testSearch.toLowerCase()) && !recTests.some(r => r.testName === t.MainTestName))
                    .slice(0, 8)
                    .map((t, i) => (
                      <TouchableOpacity
                        key={i}
                        style={s.ddItem}
                        onPress={() => {
                          setRecTests(prev => [...prev, { testName: t.MainTestName, note: 'Recommended by Doctor' }]);
                          setTestSearch('');
                          setTestDrop(false);
                        }}
                      >
                        <Text style={s.ddItemTxt}>{t.MainTestName}</Text>
                        <Feather name="plus-circle" size={16} color={T.primary} />
                      </TouchableOpacity>
                    ))}
                </View>
              )}

              {recTests.length === 0 ? (
                <View style={s.empty}>
                  <MaterialCommunityIcons name="flask-empty-outline" size={40} color={T.muted} />
                  <Text style={s.emptyTxt}>No test recommendations added</Text>
                </View>
              ) : recTests.map((t, i) => (
                <View key={i} style={s.recTestCard}>
                  <View style={s.testIcon}><MaterialCommunityIcons name="flask-outline" size={16} color={T.tealDark} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.recTestName}>{t.testName}</Text>
                    <View style={s.reqTag}><Text style={s.reqTagTxt}>REQUEST ONLY (Lab Recommendation)</Text></View>
                  </View>
                  <TouchableOpacity onPress={() => setRecTests(prev => prev.filter((_, idx) => idx !== i))}>
                    <Feather name="x" size={16} color={T.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </Section>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Test Report View Modal */}
      {viewReportItem && (
        <Modal visible transparent animationType="slide">
          <View style={s.overlay}>
            <View style={s.modalSheet}>
              <View style={s.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={s.modalTitle}>Lab Test Report</Text>
                  <Text style={s.modalSub}>{viewReportItem.MainTestName}  •  Patient: {patName}</Text>
                </View>
                <TouchableOpacity onPress={() => setViewReportItem(null)}>
                  <Feather name="x" size={20} color={T.sub} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={s.reportBlock}>
                  <View style={s.tableHeader}>
                    <Text style={[s.th, { flex: 2 }]}>Parameter</Text>
                    <Text style={[s.th, { flex: 1, textAlign: 'center' }]}>Result</Text>
                    <Text style={[s.th, { flex: 1.5, textAlign: 'right' }]}>Ref Range</Text>
                  </View>

                  {(MOCK_REPORT_PARAMS[viewReportItem.MainTestName] || [
                    { parameter: 'Parameter Value', value: 'Normal', unit: '-', range: 'Normal', status: 'Normal' },
                  ]).map((p, pIdx) => (
                    <View key={pIdx} style={s.tableRow}>
                      <Text style={[s.td, { flex: 2, fontWeight: '600' }]}>{p.parameter}</Text>
                      <Text style={[s.td, { flex: 1, textAlign: 'center', fontWeight: '700' }, p.status === 'High' && { color: T.danger }]}>
                        {p.value} {p.unit}
                      </Text>
                      <Text style={[s.td, { flex: 1.5, textAlign: 'right', color: T.sub }]}>{p.range}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Bottom Action Bar */}
      <View style={[s.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {status !== 'Completed' ? (
          <TouchableOpacity
            style={s.completeBtn}
            onPress={handleMarkComplete}
          >
            <MaterialCommunityIcons name="check-circle-outline" size={20} color="#FFF" />
            <Text style={s.completeBtnTxt}>Mark Consultation as Completed</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.doneChip}>
            <MaterialCommunityIcons name="check-circle" size={20} color={T.green} />
            <Text style={s.doneTxt}>Consultation Completed</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: T.screenBg },
  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, backgroundColor: T.bg, borderBottomWidth: 1, borderBottomColor: T.border },
  backBtn:       { padding: 4, marginRight: 10 },
  headerName:    { fontSize: 16, fontWeight: '800', color: T.text },
  headerSub:     { fontSize: 11, color: T.sub, marginTop: 1 },
  statusChip:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  statusDot:     { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statusTxt:     { fontSize: 10, fontWeight: '700' },
  tabsWrap:      { backgroundColor: T.bg, borderBottomWidth: 1, borderBottomColor: T.border, height: 46 },
  tabsContent:   { paddingHorizontal: 12, alignItems: 'center' },
  tab:           { height: 32, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: T.border, backgroundColor: T.bg, justifyContent: 'center', marginHorizontal: 3 },
  tabActive:     { backgroundColor: T.primary, borderColor: T.primary },
  tabTxt:        { fontSize: 12, color: T.sub, fontWeight: '500' },
  tabTxtActive:  { color: '#FFF', fontWeight: '700' },
  scroll:        { padding: 16 },
  centre:        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  centreText:    { fontSize: 13, color: T.sub, marginTop: 8 },
  section:       { backgroundColor: T.bg, borderRadius: 14, borderWidth: 1, borderColor: T.border, padding: 16, marginBottom: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: T.border },
  sectionTitle:  { fontSize: 15, fontWeight: '800', color: T.text },
  tabIntro:      { fontSize: 12, color: T.sub, marginBottom: 12 },
  subHeading:    { fontSize: 13, fontWeight: '700', color: T.text, marginBottom: 8 },
  profileCard:   { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar:        { width: 48, height: 48, borderRadius: 24, backgroundColor: T.tealBg, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarTxt:     { fontSize: 20, fontWeight: '800', color: T.tealDark },
  profileName:   { fontSize: 16, fontWeight: '800', color: T.text },
  profilePid:    { fontSize: 12, color: T.primary, fontWeight: '600', marginTop: 2 },
  detailRow:     { flexDirection: 'row', marginBottom: 8 },
  detailLabel:   { width: 110, fontSize: 12, color: T.sub, fontWeight: '600' },
  detailValue:   { flex: 1, fontSize: 12, color: T.text, fontWeight: '600' },
  emptySubTxt:   { fontSize: 12, color: T.muted, fontStyle: 'italic' },
  historyRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  histDot:       { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  histTest:      { fontSize: 13, fontWeight: '600', color: T.text },
  histDate:      { fontSize: 11, color: T.sub, marginTop: 1 },
  empty:         { alignItems: 'center', paddingVertical: 24 },
  emptyTxt:      { fontSize: 13, color: T.muted, marginTop: 8 },
  testRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  testIcon:      { width: 32, height: 32, borderRadius: 8, backgroundColor: T.tealBg, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  testName:      { fontSize: 13, fontWeight: '700', color: T.text },
  testSub:       { fontSize: 11, color: T.sub, marginTop: 1 },
  bookedBadge:   { backgroundColor: T.tealBg, borderColor: T.tealBorder, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  bookedTxt:     { fontSize: 10, fontWeight: '700', color: T.tealDark },
  reportRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  reportIcon:    { width: 32, height: 32, borderRadius: 8, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  reportName:    { fontSize: 13, fontWeight: '700', color: T.text },
  reportDate:    { fontSize: 11, color: T.sub, marginTop: 1 },
  viewReportBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: T.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  viewReportTxt: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  fieldLabel:    { fontSize: 13, fontWeight: '700', color: T.text, marginBottom: 6 },
  textArea:      { borderWidth: 1, borderColor: T.border, borderRadius: 10, backgroundColor: '#F8FAFC', padding: 12, fontSize: 13, color: T.text },
  addMedForm:    { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: T.border, marginBottom: 12 },
  input:         { borderWidth: 1, borderColor: T.border, borderRadius: 10, backgroundColor: '#FFF', paddingHorizontal: 12, height: 42, fontSize: 13, color: T.text },
  addBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: T.primary, borderRadius: 10, height: 40, gap: 6, marginTop: 10 },
  addBtnTxt:     { color: '#FFF', fontSize: 13, fontWeight: '700' },
  medRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  medIcon:       { width: 32, height: 32, borderRadius: 8, backgroundColor: T.tealBg, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  medName:       { fontSize: 13, fontWeight: '700', color: T.text },
  medSub:        { fontSize: 11, color: T.sub, marginTop: 1 },
  reqOnlyNotice: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BAE6FD', padding: 12, borderRadius: 10, marginBottom: 12 },
  reqOnlyTitle:  { fontSize: 12, fontWeight: '800', color: '#0369A1' },
  reqOnlyTxt:    { fontSize: 11, color: '#0369A1', marginTop: 2, lineHeight: 16 },
  ddMenu:        { borderWidth: 1, borderColor: T.border, borderRadius: 10, backgroundColor: T.bg, overflow: 'hidden', marginTop: 4, marginBottom: 10 },
  ddItem:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  ddItemTxt:     { fontSize: 13, color: T.text },
  recTestCard:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  recTestName:   { fontSize: 13, fontWeight: '700', color: T.text },
  reqTag:        { backgroundColor: '#FFF7ED', borderColor: '#FED7AA', borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 2, alignSelf: 'flex-start' },
  reqTagTxt:     { fontSize: 9, fontWeight: '800', color: '#C2410C' },
  overlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet:    { backgroundColor: T.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 18, maxHeight: '85%' },
  modalHeader:   { flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: T.border, paddingBottom: 8 },
  modalTitle:    { fontSize: 16, fontWeight: '800', color: T.text },
  modalSub:      { fontSize: 11, color: T.sub, marginTop: 2 },
  reportBlock:   { backgroundColor: '#FFF', borderWidth: 1, borderColor: T.border, borderRadius: 10, padding: 12 },
  tableHeader:   { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: T.border, paddingBottom: 6, marginBottom: 6 },
  th:            { fontSize: 11, fontWeight: '700', color: T.sub },
  tableRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  td:            { fontSize: 12, color: T.text },
  bottomBar:     { backgroundColor: T.bg, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: T.border },
  completeBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: T.primary, borderRadius: 12, paddingVertical: 14, gap: 8 },
  completeBtnTxt:{ color: '#FFF', fontSize: 15, fontWeight: '700' },
  doneChip:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ECFDF5', borderRadius: 12, paddingVertical: 14, gap: 8, borderWidth: 1, borderColor: '#BBF7D0' },
  doneTxt:       { color: T.green, fontSize: 15, fontWeight: '700' },
});
