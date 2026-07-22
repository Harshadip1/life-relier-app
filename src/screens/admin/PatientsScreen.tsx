import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Platform, ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../utils/constants';
import { getCenters, CenterItem } from '../../services/testChargesService';

const THEME = {
  primary: '#0F766E',
  bg: '#FFFFFF',
  screenBg: '#FAFAFA',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
};

// ── Types ─────────────────────────────────────────────────────────────────────
export interface TestStatusRow {
  PID: number;
  PatRegID: number;
  PatientName: string;
  Patname: string;
  sex: string;
  Age: number;
  MDY: string;
  Drname: string;
  CenterName: string;
  MainTestName: string;
  BarcodeID: string;
  Status: string;
  Patrepstatus: boolean;
  SpecimanNo: number;
  PhlebotomistCollect: number;
  IspheboAccept: number;
  SampleAcceptDate: string | null;
  TestCharges: number;
  PaidAmount: number;
  DiscountAmount: number;
  OutstandingAmount: number;
  Patregdate: string;
  Isemergency: boolean;
  Patphoneno: string;
  Remark: string | null;
  Email: string | null;
}

// Grouped patient (one row per unique PID)
interface PatientGroup {
  PID: number;
  PatRegID: number;
  PatientName: string;
  sex: string;
  Age: number;
  MDY: string;
  Drname: string;
  CenterName: string;
  Status: string;
  Patphoneno: string;
  Patregdate: string;
  TestCharges: number;
  PaidAmount: number;
  DiscountAmount: number;
  OutstandingAmount: number;
  Isemergency: boolean;
  Remark: string | null;
  tests: string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function statusColor(status: string): { color: string; bg: string } {
  switch (status) {
    case 'Registered':       return { color: '#EAB308', bg: '#FEF9C3' };
    case 'Sample Collected': return { color: '#3B82F6', bg: '#EFF6FF' };
    case 'Processing':       return { color: '#F97316', bg: '#FFF7ED' };
    case 'Report Ready':     return { color: '#22C55E', bg: '#F0FDF4' };
    case 'Delivered':        return { color: '#6366F1', bg: '#EEF2FF' };
    default:                 return { color: '#64748B', bg: '#F1F5F9' };
  }
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const TABS = ['All', 'Registered', 'Sample Collected', 'Processing', 'Report Ready', 'Delivered'];

// ── API ───────────────────────────────────────────────────────────────────────
interface SubDept { ID: number; SubDepartmentName: string; }

async function fetchSubDepartments(): Promise<SubDept[]> {
  const res = await fetch(`${API_BASE_URL}/api/TestStatus/GetSubDepartment`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify({ BranchId: 1 }),
  });
  const data = await res.json();
  return Array.isArray(data) ? data : (data?.value ?? []);
}

async function fetchPatientTestStatus(filters: {
  fromDate?: string; toDate?: string; patientName?: string;
  mobileNo?: string; status?: string; subDepartment?: string; centerCode?: string;
}): Promise<PatientGroup[]> {
  const today = new Date().toISOString().split('T')[0];
  const body = {
    BranchId:      1,
    FromDate:      filters.fromDate      ?? '2024-01-01',
    ToDate:        filters.toDate        ?? today,
    PatRegID:      '',
    PatientName:   filters.patientName   ?? '',
    DoctorName:    '',
    TestName:      '',
    MobileNo:      filters.mobileNo      ?? '',
    Barcode:       '',
    CenterCode:    filters.centerCode    ?? '',
    SubDepartment: filters.subDepartment ?? '',
    Status:        filters.status        ?? 'All',
  };

  const res = await fetch(`${API_BASE_URL}/api/TestStatus/GetPatientTestStatus`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || `Server error (${res.status})`);

  const rows: TestStatusRow[] = Array.isArray(data) ? data : (data?.value ?? []);

  // Group rows by PID — each PID gets one card, tests are collapsed
  const map = new Map<number, PatientGroup>();
  for (const row of rows) {
    if (map.has(row.PID)) {
      map.get(row.PID)!.tests.push(row.MainTestName);
    } else {
      map.set(row.PID, {
        PID:               row.PID,
        PatRegID:          row.PatRegID,
        PatientName:       row.PatientName,
        sex:               row.sex,
        Age:               row.Age,
        MDY:               row.MDY,
        Drname:            row.Drname,
        CenterName:        row.CenterName,
        Status:            row.Status,
        Patphoneno:        row.Patphoneno,
        Patregdate:        row.Patregdate,
        TestCharges:       row.TestCharges,
        PaidAmount:        row.PaidAmount,
        DiscountAmount:    row.DiscountAmount,
        OutstandingAmount: row.OutstandingAmount,
        Isemergency:       row.Isemergency,
        Remark:            row.Remark,
        tests:             [row.MainTestName],
      });
    }
  }
  return Array.from(map.values());
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function PatientsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [patients, setPatients]               = useState<PatientGroup[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [refreshing, setRefreshing]           = useState(false);
  const [search, setSearch]                   = useState('');
  const [activeTab, setActiveTab]             = useState('All');
  const [selectedPatient, setSelectedPatient] = useState<PatientGroup | null>(null);

  // ── Sub-department filter state ──
  const [subDepts, setSubDepts]               = useState<SubDept[]>([]);
  const [selectedDept, setSelectedDept]       = useState<SubDept | null>(null);
  const [filterVisible, setFilterVisible]     = useState(false);
  const [deptLoading, setDeptLoading]         = useState(false);

  // ── Center filter state ──
  const [centers, setCenters]                 = useState<CenterItem[]>([]);
  const [selectedCenter, setSelectedCenter]   = useState<CenterItem | null>(null);
  const [centerLoading, setCenterLoading]     = useState(false);

  // Load department list once
  useEffect(() => {
    setDeptLoading(true);
    fetchSubDepartments()
      .then(setSubDepts)
      .catch(() => {})
      .finally(() => setDeptLoading(false));
  }, []);

  // Load centers once
  useEffect(() => {
    setCenterLoading(true);
    getCenters(1)
      .then(setCenters)
      .catch(() => {})
      .finally(() => setCenterLoading(false));
  }, []);

  const load = useCallback(async (tab = activeTab, dept = selectedDept, center = selectedCenter, isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const data = await fetchPatientTestStatus({
        status:        tab,
        subDepartment: dept?.SubDepartmentName ?? '',
        centerCode:    center?.CenterCode ?? '',
      });
      setPatients(data);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load patients.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, selectedDept, selectedCenter]);

  useEffect(() => { load(activeTab, selectedDept, selectedCenter); }, [activeTab, selectedDept, selectedCenter]);

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    return (
      p.PatientName.toLowerCase().includes(q) ||
      p.Patphoneno.includes(q) ||
      String(p.PatRegID).includes(q)
    );
  });

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 10) }]}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={THEME.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient Status</Text>
        <TouchableOpacity style={styles.filterBtn} onPress={() => load(activeTab, selectedDept, selectedCenter, true)}>
          <Feather name="refresh-cw" size={20} color={THEME.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, { marginLeft: 8, position: 'relative' }]}
          onPress={() => setFilterVisible(true)}
        >
          <Feather name="sliders" size={20} color={selectedDept ? '#FFF' : THEME.primary}
            style={selectedDept ? { backgroundColor: THEME.primary, borderRadius: 6, padding: 2 } : {}} />
        </TouchableOpacity>
      </View>

      {/* Active dept badge */}
      {selectedDept && (
        <View style={styles.activeDeptRow}>
          <Feather name="filter" size={13} color={THEME.primary} />
          <Text style={styles.activeDeptText}>{selectedDept.SubDepartmentName}</Text>
          <TouchableOpacity onPress={() => setSelectedDept(null)}>
            <Feather name="x" size={14} color={THEME.primary} />
          </TouchableOpacity>
        </View>
      )}
      {/* Active center badge */}
      {selectedCenter && (
        <View style={styles.activeDeptRow}>
          <Feather name="map-pin" size={13} color={THEME.primary} />
          <Text style={styles.activeDeptText}>{selectedCenter.CenterName}</Text>
          <TouchableOpacity onPress={() => setSelectedCenter(null)}>
            <Feather name="x" size={14} color={THEME.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={THEME.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Name, Mobile, Patient ID"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Feather name="x" size={18} color={THEME.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={{ paddingHorizontal: 20 }}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Patient List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text style={styles.loadingText}>Loading patients...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(activeTab, selectedDept, selectedCenter, true)} colors={[THEME.primary]} />}
        >
          {filtered.length === 0 ? (
            <View style={styles.centered}>
              <MaterialCommunityIcons name="account-search-outline" size={48} color={THEME.textSecondary} />
              <Text style={styles.emptyText}>No patients found</Text>
            </View>
          ) : (
            filtered.map(patient => {
              const sc = statusColor(patient.Status);
              return (
                <View key={`${patient.PID}-${patient.PatRegID}`} style={styles.card}>
                  <View style={styles.cardHeader}>
                    {/* Avatar */}
                    <View style={styles.avatarBox}>
                      <Text style={styles.avatarText}>
                        {patient.Patname?.charAt(0)?.toUpperCase() ?? '?'}
                      </Text>
                    </View>

                    <View style={styles.patientInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.patientName}>{patient.PatientName}</Text>
                        {patient.Isemergency && (
                          <View style={styles.emergencyBadge}>
                            <Text style={styles.emergencyText}>URGENT</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.patientId}>
                        PID: <Text style={{ color: THEME.primary }}>PT{String(patient.PatRegID).padStart(6, '0')}</Text>
                        {'  '}·{'  '}{patient.sex}, {patient.Age} {patient.MDY}
                      </Text>
                      <View style={styles.cardMetaRow}>
                        <Feather name="phone" size={12} color={THEME.textSecondary} />
                        <Text style={styles.metaText}>{patient.Patphoneno}</Text>
                        <Feather name="calendar" size={12} color={THEME.textSecondary} style={{ marginLeft: 8 }} />
                        <Text style={styles.metaText}>{formatDate(patient.Patregdate)}</Text>
                      </View>
                    </View>

                    <View style={styles.cardActionsRight}>
                      <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                        <View style={[styles.statusDot, { backgroundColor: sc.color }]} />
                        <Text style={[styles.statusText, { color: sc.color }]}>{patient.Status}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Tests row */}
                  <View style={styles.testsRow}>
                    <Feather name="activity" size={13} color={THEME.textSecondary} style={{ marginRight: 6 }} />
                    <Text style={styles.testsText} numberOfLines={1}>{patient.tests.join(' · ')}</Text>
                  </View>

                  {/* Billing row */}
                  <View style={styles.billingRow}>
                    <View style={styles.billingItem}>
                      <Text style={styles.billingLabel}>Charges</Text>
                      <Text style={styles.billingValue}>₹{patient.TestCharges.toFixed(0)}</Text>
                    </View>
                    <View style={styles.billingItem}>
                      <Text style={styles.billingLabel}>Paid</Text>
                      <Text style={[styles.billingValue, { color: '#16A34A' }]}>₹{patient.PaidAmount.toFixed(0)}</Text>
                    </View>
                    {patient.OutstandingAmount > 0 && (
                      <View style={styles.billingItem}>
                        <Text style={styles.billingLabel}>Due</Text>
                        <Text style={[styles.billingValue, { color: '#EF4444' }]}>₹{patient.OutstandingAmount.toFixed(0)}</Text>
                      </View>
                    )}
                    <View style={styles.billingItem}>
                      <Text style={styles.billingLabel}>Doctor</Text>
                      <Text style={styles.billingValue} numberOfLines={1}>{patient.Drname.trim()}</Text>
                    </View>
                  </View>

                  {/* Action buttons */}
                  <View style={styles.cardActionButtons}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => setSelectedPatient(patient)}>
                      <Feather name="file-text" size={14} color={THEME.primary} />
                      <Text style={styles.actionBtnText}>View Details</Text>
                    </TouchableOpacity>
                    <View style={styles.actionDivider} />
                    <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('EditPatient', { patient: { name: patient.PatientName, phone: patient.Patphoneno, age: String(patient.Age), gender: patient.sex, PID: patient.PID, PatRegID: patient.PatRegID, branchId: 1 } })}>
                      <Feather name="edit-2" size={14} color={THEME.primary} />
                      <Text style={styles.actionBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <View style={styles.actionDivider} />
                    <TouchableOpacity style={styles.actionBtn}>
                      <Feather name="phone-call" size={14} color={THEME.primary} />
                      <Text style={styles.actionBtnText}>Call Patient</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => navigation.navigate('NewRegistration')}>
        <Feather name="plus" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* SubDepartment Filter Modal */}
      <Modal visible={filterVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.dragHandle} />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setFilterVisible(false)}>
              <Feather name="x" size={24} color={THEME.textSecondary} />
            </TouchableOpacity>

            <Text style={styles.filterSheetTitle}>Filter by Department</Text>

            {deptLoading ? (
              <ActivityIndicator color={THEME.primary} style={{ marginTop: 20 }} />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* All option */}
                <TouchableOpacity
                  style={[styles.deptRow, !selectedDept && styles.deptRowActive]}
                  onPress={() => { setSelectedDept(null); }}
                >
                  <Text style={[styles.deptRowText, !selectedDept && styles.deptRowTextActive]}>All Departments</Text>
                  {!selectedDept && <Feather name="check" size={16} color={THEME.primary} />}
                </TouchableOpacity>

                {subDepts.map(dept => (
                  <TouchableOpacity
                    key={dept.ID}
                    style={[styles.deptRow, selectedDept?.ID === dept.ID && styles.deptRowActive]}
                    onPress={() => { setSelectedDept(dept); }}
                  >
                    <Text style={[styles.deptRowText, selectedDept?.ID === dept.ID && styles.deptRowTextActive]}>
                      {dept.SubDepartmentName}
                    </Text>
                    {selectedDept?.ID === dept.ID && <Feather name="check" size={16} color={THEME.primary} />}
                  </TouchableOpacity>
                ))}

                {/* Center section */}
                <Text style={[styles.filterSheetTitle, { marginTop: 16 }]}>Filter by Center</Text>
                {centerLoading ? (
                  <ActivityIndicator color={THEME.primary} style={{ marginVertical: 8 }} />
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.deptRow, !selectedCenter && styles.deptRowActive]}
                      onPress={() => setSelectedCenter(null)}
                    >
                      <Text style={[styles.deptRowText, !selectedCenter && styles.deptRowTextActive]}>All Centers</Text>
                      {!selectedCenter && <Feather name="check" size={16} color={THEME.primary} />}
                    </TouchableOpacity>
                    {centers.map(c => (
                      <TouchableOpacity
                        key={c.CenterCode}
                        style={[styles.deptRow, selectedCenter?.CenterCode === c.CenterCode && styles.deptRowActive]}
                        onPress={() => setSelectedCenter(c)}
                      >
                        <Text style={[styles.deptRowText, selectedCenter?.CenterCode === c.CenterCode && styles.deptRowTextActive]}>
                          {c.CenterName}
                        </Text>
                        {selectedCenter?.CenterCode === c.CenterCode && <Feather name="check" size={16} color={THEME.primary} />}
                      </TouchableOpacity>
                    ))}
                  </>
                )}

                <TouchableOpacity
                  style={[styles.deptRow, { marginTop: 12, justifyContent: 'center', backgroundColor: THEME.primary, borderRadius: 10 }]}
                  onPress={() => setFilterVisible(false)}
                >
                  <Text style={[styles.deptRowText, { color: '#FFF', fontWeight: '700' }]}>Apply Filters</Text>
                </TouchableOpacity>
                <View style={{ height: 20 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal visible={!!selectedPatient} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.dragHandle} />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedPatient(null)}>
              <Feather name="x" size={24} color={THEME.textSecondary} />
            </TouchableOpacity>

            {selectedPatient && (() => {
              const sc = statusColor(selectedPatient.Status);
              return (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Sheet Header */}
                  <View style={styles.sheetHeader}>
                    <View style={[styles.avatarBox, { width: 56, height: 56, borderRadius: 28 }]}>
                      <Text style={[styles.avatarText, { fontSize: 22 }]}>
                        {selectedPatient.PatientName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.sheetInfo}>
                      <Text style={styles.sheetName}>{selectedPatient.PatientName}</Text>
                      <View style={styles.sheetMetaGrid}>
                        <View style={styles.sheetMetaItem}>
                          <Feather name="user" size={13} color={THEME.textSecondary} />
                          <Text style={styles.sheetMetaText}>{selectedPatient.Age} {selectedPatient.MDY}</Text>
                        </View>
                        <View style={styles.sheetMetaItem}>
                          <Feather name="users" size={13} color={THEME.textSecondary} />
                          <Text style={styles.sheetMetaText}>{selectedPatient.sex}</Text>
                        </View>
                        <View style={styles.sheetMetaItem}>
                          <Feather name="phone" size={13} color={THEME.textSecondary} />
                          <Text style={styles.sheetMetaText}>{selectedPatient.Patphoneno}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: sc.bg, alignSelf: 'flex-start' }]}>
                      <View style={[styles.statusDot, { backgroundColor: sc.color }]} />
                      <Text style={[styles.statusText, { color: sc.color }]}>{selectedPatient.Status}</Text>
                    </View>
                  </View>

                  {/* Details */}
                  <View style={styles.detailGrid}>
                    <DetailRow icon="hash"       label="Patient ID"   value={`PT${String(selectedPatient.PatRegID).padStart(6, '0')}`} />
                    <DetailRow icon="user-check" label="Doctor"        value={selectedPatient.Drname.trim()} />
                    <DetailRow icon="home"       label="Center"        value={selectedPatient.CenterName} />
                    <DetailRow icon="calendar"   label="Reg Date"      value={formatDate(selectedPatient.Patregdate)} />
                    {selectedPatient.Remark && <DetailRow icon="message-square" label="Remark" value={selectedPatient.Remark} />}
                  </View>

                  {/* Billing */}
                  <Text style={styles.sheetSubTitle}>Billing</Text>
                  <View style={styles.billingCard}>
                    <BillingRow label="Test Charges"  value={`₹${selectedPatient.TestCharges.toFixed(2)}`} />
                    <BillingRow label="Paid Amount"   value={`₹${selectedPatient.PaidAmount.toFixed(2)}`} valueColor="#16A34A" />
                    <BillingRow label="Discount"      value={`₹${selectedPatient.DiscountAmount.toFixed(2)}`} />
                    <BillingRow label="Outstanding"   value={`₹${selectedPatient.OutstandingAmount.toFixed(2)}`} valueColor={selectedPatient.OutstandingAmount > 0 ? '#EF4444' : undefined} />
                  </View>

                  {/* Tests */}
                  <Text style={styles.sheetSubTitle}>Tests ({selectedPatient.tests.length})</Text>
                  <View style={styles.sheetChipsRow}>
                    {selectedPatient.tests.map((t, i) => (
                      <View key={i} style={styles.sheetChip}>
                        <Text style={styles.sheetChipText}>{t}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={{ height: 20 }} />
                </ScrollView>
              );
            })()}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DetailRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Feather name={icon} size={14} color={THEME.textSecondary} style={{ marginRight: 8 }} />
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function BillingRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.billingSheetRow}>
      <Text style={styles.billingSheetLabel}>{label}</Text>
      <Text style={[styles.billingSheetValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root:      { flex: 1, backgroundColor: THEME.screenBg },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  loadingText: { marginTop: 12, fontSize: 14, color: THEME.textSecondary },
  emptyText:   { marginTop: 12, fontSize: 15, color: THEME.textSecondary, fontWeight: '500' },

  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  backBtn:     { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: THEME.textPrimary },
  filterBtn:   { padding: 4 },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.bg, marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: THEME.border, marginBottom: 16 },
  searchIcon:      { marginRight: 10 },
  searchInput:     { flex: 1, fontSize: 14, color: THEME.textPrimary },

  tabsScroll:   { marginBottom: 12, overflow: 'visible' },
  tabBtn:       { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: THEME.border, marginRight: 10, backgroundColor: THEME.bg },
  tabBtnActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  tabText:      { fontSize: 13, color: THEME.textSecondary, fontWeight: '500' },
  tabTextActive: { color: '#FFF', fontWeight: '600' },

  listContent: { paddingHorizontal: 20, paddingTop: 4 },

  card: { backgroundColor: THEME.bg, borderRadius: 16, borderWidth: 1, borderColor: THEME.border, marginBottom: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
  cardHeader: { flexDirection: 'row', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },

  avatarBox:  { width: 44, height: 44, borderRadius: 22, backgroundColor: '#CCFBF1', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: '700', color: THEME.primary },

  patientInfo:   { flex: 1 },
  patientName:   { fontSize: 15, fontWeight: '700', color: THEME.textPrimary, marginBottom: 3 },
  patientId:     { fontSize: 12, color: THEME.textSecondary, fontWeight: '500', marginBottom: 5 },
  cardMetaRow:   { flexDirection: 'row', alignItems: 'center' },
  metaText:      { fontSize: 11, color: THEME.textSecondary, marginLeft: 4 },
  cardActionsRight: { alignItems: 'flex-end' },

  emergencyBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  emergencyText:  { fontSize: 9, fontWeight: '800', color: '#EF4444' },

  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusDot:   { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  statusText:  { fontSize: 10, fontWeight: '700' },

  testsRow:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  testsText: { flex: 1, fontSize: 12, color: THEME.textSecondary, fontWeight: '500' },

  billingRow:   { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 8, gap: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  billingItem:  { flex: 1 },
  billingLabel: { fontSize: 10, color: THEME.textSecondary, fontWeight: '500', marginBottom: 2 },
  billingValue: { fontSize: 13, color: THEME.textPrimary, fontWeight: '700' },

  cardActionButtons: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  actionBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  actionBtnText: { fontSize: 12, fontWeight: '600', color: THEME.primary },
  actionDivider: { width: 1, height: 18, backgroundColor: THEME.border },

  fab: { position: 'absolute', bottom: 90, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: THEME.primary, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: THEME.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  bottomSheet:  { backgroundColor: THEME.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '85%' },
  dragHandle:   { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  closeBtn:     { position: 'absolute', top: 20, right: 20, zIndex: 1 },

  sheetHeader:   { flexDirection: 'row', marginBottom: 16 },
  sheetInfo:     { flex: 1, marginLeft: 14 },
  sheetName:     { fontSize: 18, fontWeight: '700', color: THEME.textPrimary, marginBottom: 6 },
  sheetMetaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sheetMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sheetMetaText: { fontSize: 12, color: THEME.textSecondary, fontWeight: '500' },
  sheetSubTitle: { fontSize: 14, fontWeight: '700', color: THEME.textPrimary, marginBottom: 10, marginTop: 16 },

  detailGrid: { gap: 8 },
  detailRow:  { flexDirection: 'row', alignItems: 'center' },
  detailLabel: { fontSize: 13, color: THEME.textSecondary, fontWeight: '500', marginRight: 6, width: 72 },
  detailValue: { flex: 1, fontSize: 13, color: THEME.textPrimary, fontWeight: '600' },

  billingCard:       { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, gap: 8 },
  billingSheetRow:   { flexDirection: 'row', justifyContent: 'space-between' },
  billingSheetLabel: { fontSize: 13, color: THEME.textSecondary, fontWeight: '500' },
  billingSheetValue: { fontSize: 13, color: THEME.textPrimary, fontWeight: '700' },

  sheetChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sheetChip:     { backgroundColor: '#F0FDFA', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, borderWidth: 1, borderColor: '#CCFBF1' },
  sheetChipText: { fontSize: 12, color: THEME.primary, fontWeight: '600' },

  // Active dept badge
  activeDeptRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 20, marginBottom: 10, backgroundColor: '#F0FDFA', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#CCFBF1' },
  activeDeptText: { fontSize: 12, fontWeight: '700', color: THEME.primary },

  // Dept filter sheet
  filterSheetTitle: { fontSize: 18, fontWeight: '700', color: THEME.textPrimary, marginBottom: 16 },
  deptRow:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: THEME.border },
  deptRowActive:    { backgroundColor: '#F0FDFA', marginHorizontal: -4, paddingHorizontal: 4, borderRadius: 8 },
  deptRowText:      { fontSize: 15, color: THEME.textPrimary, fontWeight: '500' },
  deptRowTextActive:{ color: THEME.primary, fontWeight: '700' },
});
