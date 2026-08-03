import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, Platform, ActivityIndicator,
  RefreshControl, Alert, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../../utils/constants';
import { useTheme } from '../../theme';

const T = {
  primary:    '#0D9488',
  tealDark:   '#0F766E',
  tealBg:     '#F0FDFA',
  tealBorder: '#CCFBF1',
  bg:         '#FFFFFF',
  screenBg:   '#F8FAFC',
  text:       '#0F172A',
  sub:        '#64748B',
  muted:      '#94A3B8',
  border:     '#E2E8F0',
  danger:     '#EF4444',
  green:      '#10B981',
};

const TABS = ['All', 'Registered', 'Sample Collected', 'Processing', 'Report Ready', 'Delivered'];

// ── Types ─────────────────────────────────────────────────────────────────────
interface PatientRow {
  PID:               number;
  PatRegID:          number;
  PatientName:       string;
  Patphoneno:        string;
  sex:               string;
  Age:               number;
  MDY:               string;
  Drname:            string;
  CenterName:        string;
  Status:            string;
  Patregdate:        string;
  TestCharges:       number;
  PaidAmount:        number;
  DiscountAmount:    number;
  OutstandingAmount: number;
  Isemergency:       boolean;
  Remark:            string | null;
  tests:             string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

function toAPIDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function toDisplayDate(d: Date) {
  return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
}

async function fetchPatients(fromDate: Date, toDate: Date, status: string): Promise<PatientRow[]> {
  const res = await fetch(`${API_BASE_URL}/api/TestStatus/GetPatientTestStatus`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      BranchId:      1,
      FromDate:      toAPIDate(fromDate),
      ToDate:        toAPIDate(toDate),
      PatRegID:      '',
      PatientName:   '',
      DoctorName:    '',
      TestName:      '',
      MobileNo:      '',
      Barcode:       '',
      CenterCode:    '',
      SubDepartment: '',
      Status:        status === 'All' ? 'All' : status,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || data?.Message || `Server error (${res.status})`);

  const rows: any[] = Array.isArray(data) ? data : (data?.value ?? []);

  // Group by PID — collapse tests into one card per patient
  const map = new Map<number, PatientRow>();
  for (const r of rows) {
    if (map.has(r.PID)) {
      map.get(r.PID)!.tests.push(r.MainTestName);
    } else {
      map.set(r.PID, {
        PID:               r.PID,
        PatRegID:          r.PatRegID,
        PatientName:       r.PatientName ?? r.Patname ?? '—',
        Patphoneno:        r.Patphoneno ?? '—',
        sex:               r.sex ?? '',
        Age:               r.Age ?? 0,
        MDY:               r.MDY ?? 'Year',
        Drname:            r.Drname ?? '—',
        CenterName:        r.CenterName ?? '—',
        Status:            r.Status ?? 'Registered',
        Patregdate:        r.Patregdate ?? '',
        TestCharges:       r.TestCharges ?? 0,
        PaidAmount:        r.PaidAmount  ?? 0,
        DiscountAmount:    r.DiscountAmount    ?? 0,
        OutstandingAmount: r.OutstandingAmount ?? 0,
        Isemergency:       r.Isemergency ?? false,
        Remark:            r.Remark ?? null,
        tests:             [r.MainTestName],
      });
    }
  }
  return Array.from(map.values());
}

function statusColor(status: string) {
  switch (status) {
    case 'Registered':        return { color: '#F59E0B', bg: '#FFFBEB' };
    case 'Sample Collected':  return { color: '#3B82F6', bg: '#EFF6FF' };
    case 'Processing':        return { color: '#F97316', bg: '#FFF7ED' };
    case 'Report Ready':      return { color: colors.success,  bg: '#ECFDF5' };
    case 'Delivered':         return { color: '#6366F1', bg: '#EEF2FF' };
    default:                  return { color: colors.textMuted,  bg: '#F1F5F9' };
  }
}

// ─── Patient Card ─────────────────────────────────────────────────────────────
function PatientCard({ item, onView, onEdit }: {
  item: PatientRow;
  onView: () => void;
  onEdit: () => void;
}) {
  const sc = statusColor(item.Status ?? 'Registered');

  return (
    <View style={s.card}>
      {/* Top row */}
      <View style={s.cardTop}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{(item.PatientName ?? '?').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.name} numberOfLines={1}>{item.PatientName}</Text>
          <Text style={s.pid}>
            PID: <Text style={{ color: colors.primary }}>PT{String(item.PatRegID).padStart(6,'0')}</Text>
            {'  ·  '}{item.sex || '—'}, {item.Age ?? '—'} {item.MDY ?? 'Year'}
          </Text>
          <View style={s.metaRow}>
            <MaterialCommunityIcons name="phone-outline" size={12} color={colors.textSecondary} />
            <Text style={s.metaText}>{item.Patphoneno || '—'}</Text>
            <MaterialCommunityIcons name="calendar-outline" size={12} color={colors.textSecondary} style={{ marginLeft: 10 }} />
            <Text style={s.metaText}>{fmtDate(item.Patregdate)}</Text>
          </View>
        </View>
        <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
          <View style={[s.statusDot, { backgroundColor: sc.color }]} />
          <Text style={[s.statusText, { color: sc.color }]}>{item.Status ?? 'Registered'}</Text>
        </View>
      </View>

      {/* Tests row */}
      {item.tests.length > 0 && (
        <View style={s.testsRow}>
          <MaterialCommunityIcons name="pulse" size={13} color={colors.textSecondary} style={{ marginRight: 6 }} />
          <Text style={s.testsText} numberOfLines={1}>{item.tests.join(' · ')}</Text>
        </View>
      )}

      {/* Billing row */}
      <View style={s.billingRow}>
        <View style={s.billingItem}>
          <Text style={s.billingLabel}>Charges</Text>
          <Text style={s.billingValue}>₹{(item.TestCharges ?? 0).toFixed(0)}</Text>
        </View>
        <View style={s.billingItem}>
          <Text style={s.billingLabel}>Paid</Text>
          <Text style={[s.billingValue, { color: T.green }]}>₹{(item.PaidAmount ?? 0).toFixed(0)}</Text>
        </View>
        <View style={s.billingItem}>
          <Text style={s.billingLabel}>Doctor</Text>
          <Text style={[s.billingValue, { fontWeight: '700' }]} numberOfLines={1}>
            {(item.Drname ?? '—').trim()}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={s.actionsRow}>
        <TouchableOpacity style={s.actionBtn} onPress={onView}>
          <MaterialCommunityIcons name="file-document-outline" size={14} color={colors.primary} />
          <Text style={s.actionText}>View Details</Text>
        </TouchableOpacity>
        <View style={s.actionDivider} />
        <TouchableOpacity style={s.actionBtn} onPress={onEdit}>
          <Feather name="edit-2" size={13} color={colors.primary} />
          <Text style={s.actionText}>Edit</Text>
        </TouchableOpacity>
        <View style={s.actionDivider} />
        <TouchableOpacity
          style={s.actionBtn}
          onPress={() => item.Patphoneno && Linking.openURL(`tel:${item.Patphoneno}`)}
        >
          <MaterialCommunityIcons name="phone-outline" size={14} color={colors.primary} />
          <Text style={s.actionText}>Call Patient</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Detail Sheet ─────────────────────────────────────────────────────────────
function DetailSheet({ item, onClose, onEdit }: {
  item: PatientRow; onClose: () => void; onEdit: () => void;
}) {
  const sc = statusColor(item.Status ?? 'Registered');
  return (
    <Modal visible transparent animationType="slide">
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.drag} />
          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <Feather name="x" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <View style={[s.avatar, { width: 52, height: 52, borderRadius: 26 }]}>
              <Text style={[s.avatarText, { fontSize: 20 }]}>{(item.PatientName ?? '?').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ marginLeft: 14, flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: colors.textPrimary }}>{item.PatientName}</Text>
              <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '600', marginTop: 2 }}>
                PT{String(item.PatRegID).padStart(6,'0')}
              </Text>
              <View style={[s.statusBadge, { backgroundColor: sc.bg, alignSelf: 'flex-start', marginTop: 4 }]}>
                <View style={[s.statusDot, { backgroundColor: sc.color }]} />
                <Text style={[s.statusText, { color: sc.color }]}>{item.Status ?? 'Registered'}</Text>
              </View>
            </View>
          </View>
          {[
            ['Gender',    `${item.sex || '—'}, ${item.Age} ${item.MDY}`],
            ['Mobile',    item.Patphoneno || '—'],
            ['Center',    item.CenterName || '—'],
            ['Doctor',    (item.Drname ?? '—').trim()],
            ['Reg Date',  fmtDate(item.Patregdate)],
            ['Tests',     item.tests.join(', ') || '—'],
            ['Charges',   `₹${(item.TestCharges ?? 0).toFixed(2)}`],
            ['Paid',      `₹${(item.PaidAmount ?? 0).toFixed(2)}`],
            ['Due',       `₹${(item.OutstandingAmount ?? 0).toFixed(2)}`],
            ['Remark',    item.Remark || '—'],
          ].map(([label, value]) => (
            <View key={label} style={s.detailRow}>
              <Text style={s.detailLabel}>{label}</Text>
              <Text style={s.detailValue}>{value}</Text>
            </View>
          ))}
          <TouchableOpacity style={s.editSheetBtn} onPress={onEdit}>
            <Feather name="edit-2" size={15} color="#FFF" />
            <Text style={s.editSheetBtnText}>Edit Patient</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function PatientsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();

  // Date state — wide range by default to show all records
  const today      = new Date();
  const yearStart  = new Date('2024-01-01');
  const [fromDate, setFromDate]   = useState<Date>(yearStart);
  const [toDate,   setToDate]     = useState<Date>(today);
  const [showFrom, setShowFrom]       = useState(false);
  const [showTo,   setShowTo]         = useState(false);

  // Filter state
  const [activeTab,    setActiveTab]    = useState('All');
  const [search,       setSearch]       = useState('');

  // Data
  const [rows,       setRows]       = useState<PatientRow[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected,   setSelected]   = useState<PatientRow | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const data = await fetchPatients(fromDate, toDate, activeTab);
      setRows(data);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load patients.');
    } finally { setLoading(false); setRefreshing(false); }
  }, [fromDate, toDate, activeTab]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Also reload when tab changes
  useEffect(() => { load(); }, [activeTab]);

  // Filter by tab and search
  const displayed = rows.filter(r => {
    const tabOk  = activeTab === 'All' || (r.Status ?? 'Registered') === activeTab;
    const q      = search.toLowerCase();
    const searchOk = !q ||
      (r.PatientName ?? '').toLowerCase().includes(q) ||
      (r.MobileNo    ?? '').includes(q) ||
      String(r.PatRegID ?? '').includes(q);
    return tabOk && searchOk;
  });

  const goEdit = (item: PatientRow) => {
    setSelected(null);
    navigation.navigate('EditPatient', {
      patient: {
        patRegId: item.PatRegID, pid: item.PID,
        name: item.PatientName, phone: item.Patphoneno,
        age: String(item.Age ?? ''), gender: item.sex ?? '',
        branchId: 1,
      },
    });
  };

  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 0) }]}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Patient Status</Text>
        <TouchableOpacity style={s.iconBtn} onPress={() => load(true)}>
          <Feather name="refresh-cw" size={19} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={[s.iconBtn, { marginLeft: 6 }]}>
          <MaterialCommunityIcons name="tune-variant" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Date Range Row */}
      <View style={s.dateRow}>
        <TouchableOpacity style={s.datePicker} onPress={() => setShowFrom(true)} activeOpacity={0.8}>
          <MaterialCommunityIcons name="calendar-month" size={18} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={s.dateText}>{toDisplayDate(fromDate)}</Text>
          <MaterialCommunityIcons name="calendar-blank-outline" size={18} color={colors.primary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
        <Text style={s.dateSep}>→</Text>
        <TouchableOpacity style={s.datePicker} onPress={() => setShowTo(true)} activeOpacity={0.8}>
          <MaterialCommunityIcons name="calendar-month" size={18} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={s.dateText}>{toDisplayDate(toDate)}</Text>
          <MaterialCommunityIcons name="calendar-blank-outline" size={18} color={colors.primary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      </View>

      {showFrom && (
        <DateTimePicker value={fromDate} mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          maximumDate={toDate}
          onChange={(_, d) => { setShowFrom(false); if (d) setFromDate(d); }} />
      )}
      {showTo && (
        <DateTimePicker value={toDate} mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          minimumDate={fromDate} maximumDate={new Date()}
          onChange={(_, d) => { setShowTo(false); if (d) setToDate(d); }} />
      )}

      {/* Search */}
      <View style={s.searchBar}>
        <Feather name="search" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput style={s.searchInput}
          placeholder="Search by Name, Mobile, Patient ID"
          placeholderTextColor={colors.textMuted}
          value={search} onChangeText={setSearch} />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Feather name="x" size={15} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Tabs */}
      <View style={s.tabsWrap}>
        <FlatList
          data={TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={t => t}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}
          style={{ height: 50 }}
          renderItem={({ item: tab }) => (
            <TouchableOpacity
              style={[s.tabBtn, activeTab === tab && s.tabBtnActive]}
              onPress={() => { setActiveTab(tab); }}
            >
              <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* List */}
      {loading ? (
        <View style={s.centre}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.centreText}>Loading patients…</Text>
        </View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(item, i) => `${item.PatRegID}-${i}`}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[colors.primary]} />}
          ListEmptyComponent={
            <View style={s.centre}>
              <MaterialCommunityIcons name="account-search-outline" size={52} color={colors.textMuted} />
              <Text style={s.centreText}>No patients found</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>Try changing the date range</Text>
            </View>
          }
          ListFooterComponent={<View style={{ height: 100 }} />}
          renderItem={({ item }) => (
            <PatientCard
              item={item}
              onView={() => setSelected(item)}
              onEdit={() => goEdit(item)}
            />
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={s.fab} onPress={() => navigation.navigate('NewRegistration')} activeOpacity={0.85}>
        <Feather name="plus" size={26} color="#FFF" />
      </TouchableOpacity>

      {/* Detail Sheet */}
      {selected && (
        <DetailSheet item={selected} onClose={() => setSelected(null)} onEdit={() => goEdit(selected)} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: colors.background },

  // Header
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  backBtn:     { padding: 4, marginRight: 10 },
  headerTitle: { flex: 1, fontSize: 19, fontWeight: '800', color: colors.textPrimary },
  iconBtn:     { padding: 6, borderRadius: 8, backgroundColor: colors.primaryLight },

  // Date
  dateRow:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  datePicker:  { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 10, paddingHorizontal: 12, height: 44, backgroundColor: colors.background },
  dateText:    { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  dateSep:     { marginHorizontal: 8, fontSize: 18, color: colors.primary, fontWeight: '700' },

  // Search
  searchBar:   { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 10, marginBottom: 4, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 12, paddingHorizontal: 12, height: 46 },
  searchInput: { flex: 1, fontSize: 14, color: colors.textPrimary },

  // Tabs
  tabsWrap:    { backgroundColor: colors.background, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  tabBtn:      { height: 34, paddingHorizontal: 16, borderRadius: 17, borderWidth: 1, borderColor: colors.cardBorder, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  tabBtnActive:{ backgroundcolor: colors.primary, bordercolor: colors.primary },
  tabText:     { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  tabTextActive:{ color: '#FFF', fontWeight: '700' },

  // List
  listContent: { paddingHorizontal: 14, paddingTop: 10 },
  centre:      { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  centreText:  { marginTop: 12, fontSize: 14, color: colors.textSecondary },

  // Card
  card:        { backgroundColor: colors.background, borderRadius: 14, borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 12, elevation: 1, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
  cardTop:     { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderBottomWidth: 1, borderBottomColor: colors.divider },
  avatar:      { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText:  { fontSize: 18, fontWeight: '800', color: colors.primaryDark },
  name:        { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  pid:         { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  metaRow:     { flexDirection: 'row', alignItems: 'center' },
  metaText:    { fontSize: 11, color: colors.textSecondary, marginLeft: 3 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusDot:   { width: 7, height: 7, borderRadius: 4, marginRight: 5 },
  statusText:  { fontSize: 10, fontWeight: '700' },

  // Tests
  testsRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.divider },
  testsText:   { flex: 1, fontSize: 12, color: colors.textSecondary },

  // Billing
  billingRow:  { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider, gap: 16 },
  billingItem: { flex: 1 },
  billingLabel:{ fontSize: 10, color: colors.textMuted, fontWeight: '500', marginBottom: 2 },
  billingValue:{ fontSize: 14, color: colors.textPrimary, fontWeight: '600' },

  // Actions
  actionsRow:  { flexDirection: 'row', alignItems: 'center' },
  actionBtn:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 12 },
  actionText:  { fontSize: 12, fontWeight: '600', color: colors.primary },
  actionDivider: { width: 1, height: 20, backgroundColor: colors.cardBorder },

  // FAB
  fab:         { position: 'absolute', bottom: 90, right: 18, width: 56, height: 56, borderRadius: 28, backgroundcolor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowcolor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },

  // Sheet
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet:       { backgroundColor: colors.background, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, maxHeight: '88%' },
  drag:        { width: 36, height: 4, backgroundColor: colors.cardBorder, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  closeBtn:    { position: 'absolute', top: 18, right: 18, zIndex: 1 },
  detailRow:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  detailLabel: { width: 76, fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  detailValue: { flex: 1, fontSize: 13, color: colors.textPrimary, fontWeight: '600' },
  editSheetBtn:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundcolor: colors.primary, borderRadius: 12, paddingVertical: 14, marginTop: 16, gap: 8 },
  editSheetBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
