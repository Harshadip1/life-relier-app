import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Alert,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import BlinkingEmergencyBulb from '../../components/BlinkingEmergencyBulb';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL , COLORS} from '../../utils/constants';

const THEME = {
  primary: '#0F766E', bg: '#FFFFFF', screenBg: '#FAFAFA',
  textPrimary: '#0F172A', textSecondary: '#64748B', border: '#E2E8F0',
  warning: '#F59E0B', warningBg: '#FFFBEB',
  success: '#10B981', successBg: '#ECFDF5',
  danger: '#EF4444', dangerBg: '#FEF2F2',
};

// Filter types for clickable summary cards
type FilterType = 'Pending' | 'Ready' | 'Urgent' | null;

interface ReportRow {
  PID: number; PatRegID: number; PatientName: string;
  BarcodeID: string; Status: string; Patphoneno: string;
  Patregdate: string; TestCharges: number; PaidAmount: number;
  Drname: string; Isemergency: boolean; tests: string[];
}

function statusMeta(status: string) {
  switch (status) {
    case 'Report Ready':     return { color: THEME.success, bg: THEME.successBg, label: 'Report Ready' };
    case 'Processing':       return { color: '#F97316', bg: '#FFF7ED', label: 'Processing' };
    case 'Sample Collected': return { color: '#3B82F6', bg: '#EFF6FF', label: 'Sample Collected' };
    default:                 return { color: THEME.warning, bg: THEME.warningBg, label: status };
  }
}

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

async function fetchReports(status: string): Promise<ReportRow[]> {
  const today = new Date().toISOString().split('T')[0];
  const apiStatus = status === 'All' ? 'All'
    : status === 'Pending Approval' ? 'Registered'
    : status;
  const res = await fetch(`${API_BASE_URL}/api/TestStatus/GetPatientTestStatus`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      BranchId: 1, FromDate: '2024-01-01', ToDate: today,
      PatRegID: '', PatientName: '', DoctorName: '', TestName: '',
      MobileNo: '', Barcode: '', CenterCode: '', SubDepartment: '', Status: apiStatus,
    }),
  });
  const data = await res.json();
  const rows: any[] = Array.isArray(data) ? data : (data?.value ?? []);
  const map = new Map<number, ReportRow>();
  for (const r of rows) {
    if (map.has(r.PID)) { map.get(r.PID)!.tests.push(r.MainTestName); }
    else { map.set(r.PID, { ...r, Drname: (r.Drname || r.RefDoctor || r.RefDr || r.DoctorName || r.OtherRefDoctor || 'Self').trim(), tests: [r.MainTestName] }); }
  }
  return Array.from(map.values());
}

export default function PendingReportsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterType>(null); // null = show all
  const [allRecords, setAllRecords] = useState<ReportRow[]>([]); // All records from DB
  const [loading,    setLoading]    = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState('');

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try { 
      // Fetch ALL records from database
      const allData = await fetchReports('All');
      setAllRecords(allData);
    }
    catch (e: any) { Alert.alert('Error', e.message || 'Failed to load.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Filter records based on active filter and search
  const filtered = allRecords.filter(r => {
    // First apply active filter
    let passesFilter = true;
    if (activeFilter === 'Pending') {
      passesFilter = r.Status === 'Registered';
    } else if (activeFilter === 'Ready') {
      passesFilter = r.Status === 'Report Ready';
    } else if (activeFilter === 'Urgent') {
      passesFilter = r.Isemergency === true;
    }
    // If doesn't pass filter, exclude it
    if (!passesFilter) return false;
    
    // Then apply search filter
    const q = search.toLowerCase();
    return r.PatientName.toLowerCase().includes(q) ||
           String(r.PatRegID).includes(q) ||
           r.BarcodeID.includes(q);
  });

  // Calculate summary counts by fetching each status separately for accuracy
  const [summaryStats, setSummaryStats] = useState({ pending: 0, approved: 0, critical: 0 });
  
  useEffect(() => {
    async function fetchSummaryCounts() {
      try {
        // Fetch ONLY pending (Registered) records - accurate count
        const pendingData = await fetchReports('Pending Approval');
        
        // Fetch ONLY ready records - accurate count
        const readyData = await fetchReports('Report Ready');
        
        // Fetch ALL records to count urgent/emergency across all statuses
        const allData = await fetchReports('All');
        
        setSummaryStats({
          pending: pendingData.length,
          approved: readyData.length,
          critical: allData.filter(r => r.Isemergency).length,
        });
      } catch (error) {
        console.error('Failed to fetch summary stats:', error);
      }
    }
    fetchSummaryCounts();
  }, [allRecords]); // Recalculate when records change
  
  const pending  = summaryStats.pending;
  const approved = summaryStats.approved;
  const critical = summaryStats.critical;
  
  // Handler for clicking summary cards
  const handleCardClick = (filter: FilterType) => {
    setActiveFilter(activeFilter === filter ? null : filter); // Toggle filter
  };

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={THEME.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pending Reports</Text>
        <TouchableOpacity onPress={() => load(true)}>
          <Feather name="refresh-cw" size={20} color={THEME.primary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={THEME.textSecondary} style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder="Search by Name, Barcode or ID"
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
          <Text style={styles.centreText}>Loading…</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[THEME.primary]} />}>

          {/* Clickable Summary Cards */}
          <View style={styles.summaryGrid}>
            <SummaryCard 
              icon="clock-outline" 
              label="Pending" 
              value={pending} 
              color={THEME.warning} 
              bg={THEME.warningBg}
              isActive={activeFilter === 'Pending'}
              onPress={() => handleCardClick('Pending')}
            />
            <SummaryCard 
              icon="check-circle-outline" 
              label="Ready" 
              value={approved} 
              color={THEME.success} 
              bg={THEME.successBg}
              isActive={activeFilter === 'Ready'}
              onPress={() => handleCardClick('Ready')}
            />
            <SummaryCard 
              icon="alert-circle-outline" 
              label="Urgent" 
              value={critical} 
              color={THEME.danger} 
              bg={THEME.dangerBg}
              isActive={activeFilter === 'Urgent'}
              onPress={() => handleCardClick('Urgent')}
            />
          </View>

          {filtered.length === 0 ? (
            <View style={styles.centre}>
              <MaterialCommunityIcons name="file-document-outline" size={48} color="#CBD5E1" />
              <Text style={styles.centreText}>No reports found</Text>
            </View>
          ) : (
            filtered.map((item, idx) => {
              const sm = statusMeta(item.Status);
              return (
                <View key={`${item.PID}-${idx}`} style={styles.card}>
                  {/* Card header */}
                  <View style={styles.cardTop}>
                    <View style={styles.avatarBox}>
                      <Text style={styles.avatarText}>{item.PatientName.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.name}>{item.PatientName}</Text>
                        {item.Isemergency && <BlinkingEmergencyBulb size={18} />}
                      </View>
                      <Text style={styles.pid}>
                        PT{String(item.PatRegID).padStart(6,'0')}  •  {fmtDate(item.Patregdate)}
                      </Text>
                      <Text style={styles.pid}>Barcode: {item.BarcodeID}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: sm.bg }]}>
                      <View style={[styles.statusDot, { backgroundColor: sm.color }]} />
                      <Text style={[styles.statusText, { color: sm.color }]}>{sm.label}</Text>
                    </View>
                  </View>

                  {/* Tests */}
                  <View style={styles.testsRow}>
                    <MaterialCommunityIcons name="flask-outline" size={13} color={THEME.textSecondary} style={{ marginRight: 6 }} />
                    <Text style={styles.testsText} numberOfLines={1}>{item.tests.join(' · ')}</Text>
                  </View>

                  {/* Billing */}
                  <View style={styles.billingRow}>
                    <View style={styles.billingItem}>
                      <Text style={styles.billingLabel}>Charges</Text>
                      <Text style={styles.billingValue}>₹{(item.TestCharges ?? 0).toFixed(0)}</Text>
                    </View>
                    <View style={styles.billingItem}>
                      <Text style={styles.billingLabel}>Paid</Text>
                      <Text style={[styles.billingValue, { color: THEME.success }]}>₹{(item.PaidAmount ?? 0).toFixed(0)}</Text>
                    </View>
                    <View style={styles.billingItem}>
                      <Text style={styles.billingLabel}>Doctor</Text>
                      <Text style={styles.billingValue} numberOfLines={1}>{(item.Drname && item.Drname !== '—' ? item.Drname : 'Self').trim()}</Text>
                    </View>
                  </View>

                  {/* Actions */}
                  <TouchableOpacity style={styles.reviewBtn}>
                    <Text style={styles.reviewBtnText}>Review Report</Text>
                    <Feather name="chevron-right" size={16} color="#FFF" style={{ position: 'absolute', right: 16 }} />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

function SummaryCard({ icon, label, value, color, bg, isActive, onPress }: any) {
  return (
    <TouchableOpacity 
      style={[
        styles.summaryCard, 
        { backgroundColor: bg },
        isActive && styles.summaryCardActive
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <Text style={[styles.summaryLabel, { color }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      {isActive && (
        <View style={styles.activeIndicator}>
          <Feather name="check" size={12} color={color} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: THEME.screenBg },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  backBtn:     { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: THEME.textPrimary },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.bg, marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: THEME.border, marginBottom: 16 },
  searchIcon:  { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 13, color: THEME.textPrimary },
  scrollContent:{ paddingHorizontal: 16, paddingTop: 12 },
  summaryGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryCard: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', position: 'relative', borderWidth: 2, borderColor: 'transparent' },
  summaryCardActive: { borderColor: THEME.primary, transform: [{ scale: 1.02 }] },
  summaryValue:{ fontSize: 22, fontWeight: '800' },
  summaryLabel:{ fontSize: 10, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  activeIndicator: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  centre:      { alignItems: 'center', paddingVertical: 40 },
  centreText:  { fontSize: 14, color: THEME.textSecondary, marginTop: 10 },
  card:        { backgroundColor: THEME.bg, borderRadius: 14, borderWidth: 1, borderColor: THEME.border, marginBottom: 14, elevation: 1, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6 },
  cardTop:     { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  avatarBox:   { width: 42, height: 42, borderRadius: 21, backgroundColor: THEME.warningBg, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText:  { fontSize: 17, fontWeight: '800', color: THEME.warning },
  name:        { fontSize: 14, fontWeight: '700', color: THEME.textPrimary, marginBottom: 2 },
  pid:         { fontSize: 11, color: THEME.textSecondary, marginBottom: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusDot:   { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statusText:  { fontSize: 9, fontWeight: '700' },
  testsRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  testsText:   { flex: 1, fontSize: 12, color: THEME.textSecondary },
  billingRow:  { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.divider, gap: 16 },
  billingItem: { flex: 1 },
  billingLabel:{ fontSize: 10, color: THEME.textSecondary, fontWeight: '500', marginBottom: 2 },
  billingValue:{ fontSize: 13, color: THEME.textPrimary, fontWeight: '700' },
  reviewBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.primary, margin: 12, borderRadius: 10, paddingVertical: 12 },
  reviewBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});
