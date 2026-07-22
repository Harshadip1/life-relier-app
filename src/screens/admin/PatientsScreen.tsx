import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Alert,
  Modal, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  getEditPatientGrid,
  EditPatientGridItem,
  startOfMonth,
  endOfToday,
  fmtDate,
} from '../../services/editPatientService';

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  primary:   '#0D9488',
  tealDark:  '#0F766E',
  tealBg:    '#F0FDFA',
  tealBorder:'#CCFBF1',
  bg:        '#FFFFFF',
  screenBg:  '#F8FAFC',
  text:      '#0F172A',
  sub:       '#64748B',
  muted:     '#94A3B8',
  border:    '#E2E8F0',
  danger:    '#EF4444',
};

const PAGE_SIZE = 20;

// ─── Date picker helpers (simple text-input based) ────────────────────────────
function isoToDisplay(iso: string): string {
  // "2026-06-01T00:00:00" → "01-06-2026"
  const [datePart] = iso.split('T');
  const [y, m, d] = datePart.split('-');
  return `${d}-${m}-${y}`;
}
function displayToIso(display: string, endOfDay = false): string {
  // "01-06-2026" → "2026-06-01T00:00:00"
  const parts = display.split('-');
  if (parts.length !== 3) return display;
  const [d, m, y] = parts;
  const time = endOfDay ? 'T23:59:59' : 'T00:00:00';
  return `${y}-${m}-${d}${time}`;
}

// ─── Patient card ─────────────────────────────────────────────────────────────
function PatientCard({
  item,
  onEdit,
  onView,
}: {
  item: EditPatientGridItem;
  onEdit: () => void;
  onView: () => void;
}) {
  const initials = (item.PatientName ?? '?').charAt(0).toUpperCase();
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        {/* Info */}
        <View style={{ flex: 1 }}>
          <Text style={styles.cardName} numberOfLines={1}>{item.PatientName}</Text>
          <Text style={styles.cardSub}>
            ID: <Text style={{ color: T.primary }}>
              {item.PatRegID ? `PT${String(item.PatRegID).padStart(6, '0')}` : '—'}
            </Text>
            {'  ·  '}{item.Gender || '—'}, {item.Age ?? '—'} yrs
          </Text>
          <View style={styles.cardMeta}>
            <Feather name="phone" size={11} color={T.muted} />
            <Text style={styles.cardMetaText}>{item.MobileNo || '—'}</Text>
            <Feather name="calendar" size={11} color={T.muted} style={{ marginLeft: 8 }} />
            <Text style={styles.cardMetaText}>{fmtDate(item.Patregdate)}</Text>
          </View>
        </View>
        {/* Center badge */}
        {!!item.CenterName && (
          <View style={styles.centerBadge}>
            <Text style={styles.centerBadgeText} numberOfLines={1}>{item.CenterName}</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onView}>
          <Feather name="eye" size={13} color={T.primary} />
          <Text style={styles.actionBtnText}>View</Text>
        </TouchableOpacity>
        <View style={styles.actionDivider} />
        <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
          <Feather name="edit-2" size={13} color={T.primary} />
          <Text style={styles.actionBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Detail bottom-sheet ──────────────────────────────────────────────────────
function DetailSheet({
  item,
  onClose,
  onEdit,
}: {
  item: EditPatientGridItem;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <Modal visible transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Feather name="x" size={22} color={T.sub} />
          </TouchableOpacity>

          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <View style={[styles.avatar, { width: 52, height: 52, borderRadius: 26 }]}>
              <Text style={[styles.avatarText, { fontSize: 20 }]}>
                {(item.PatientName ?? '?').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ marginLeft: 14, flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: T.text }}>{item.PatientName}</Text>
              <Text style={{ fontSize: 12, color: T.primary, fontWeight: '600', marginTop: 2 }}>
                {item.PatRegID ? `PT${String(item.PatRegID).padStart(6, '0')}` : '—'}
              </Text>
            </View>
          </View>

          {/* Fields */}
          {[
            { label: 'Gender',    value: item.Gender     || '—' },
            { label: 'Age',       value: item.Age != null ? `${item.Age} yrs` : '—' },
            { label: 'Mobile',    value: item.MobileNo   || '—' },
            { label: 'DOB',       value: fmtDate(item.DOB) },
            { label: 'Center',    value: item.CenterName || '—' },
            { label: 'Reg Date',  value: fmtDate(item.Patregdate) },
            { label: 'Address',   value: item.Address    || '—' },
            { label: 'Email',     value: item.Email      || '—' },
          ].map(({ label, value }) => (
            <View key={label} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{label}</Text>
              <Text style={styles.detailValue}>{value}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.editSheetBtn} onPress={onEdit}>
            <Feather name="edit-2" size={15} color="#FFF" />
            <Text style={styles.editSheetBtnText}>Edit Patient</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function PatientsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  // ── Filter state ──────────────────────────────────────────────────────────
  const [fromDate,     setFromDate]     = useState(isoToDisplay(startOfMonth()));
  const [toDate,       setToDate]       = useState(isoToDisplay(endOfToday()));
  const [patientName,  setPatientName]  = useState('');
  const [mobileNo,     setMobileNo]     = useState('');
  const [centerName,   setCenterName]   = useState('');
  const [patRegID,     setPatRegID]     = useState('');
  const [filterOpen,   setFilterOpen]   = useState(false);

  // ── Data state ────────────────────────────────────────────────────────────
  const [rows,         setRows]         = useState<EditPatientGridItem[]>([]);
  const [totalCount,   setTotalCount]   = useState(0);
  const [pageNo,       setPageNo]       = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [loadingMore,  setLoadingMore]  = useState(false);
  const [refreshing,   setRefreshing]   = useState(false);
  const [selected,     setSelected]     = useState<EditPatientGridItem | null>(null);

  // ── Search (local debounce on already-loaded page) ────────────────────────
  const [search, setSearch] = useState('');

  const hasMore = rows.length < totalCount;

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchPage = useCallback(async (page: number, replace: boolean, isRefresh = false) => {
    if (replace && !isRefresh) setLoading(true);
    if (!replace)              setLoadingMore(true);
    if (isRefresh)             setRefreshing(true);
    try {
      const res = await getEditPatientGrid({
        FromDate:    displayToIso(fromDate, false),
        ToDate:      displayToIso(toDate,   true),
        PageNo:      page,
        PageSize:    PAGE_SIZE,
        PatientName: patientName.trim(),
        MobileNo:    mobileNo.trim(),
        CenterName:  centerName.trim(),
        PatRegID:    patRegID ? parseInt(patRegID, 10) : 0,
      });
      setRows(prev => replace ? res.data : [...prev, ...res.data]);
      setTotalCount(res.totalCount);
      setPageNo(page);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load patients.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [fromDate, toDate, patientName, mobileNo, centerName, patRegID]);

  // initial load
  useEffect(() => { fetchPage(1, true); }, []);

  const applyFilters = () => {
    setFilterOpen(false);
    fetchPage(1, true);
  };

  const onRefresh = () => fetchPage(1, true, true);

  const loadMore = () => {
    if (!loadingMore && hasMore) fetchPage(pageNo + 1, false);
  };

  // local search filter over current page
  const displayed = rows.filter(r => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      (r.PatientName ?? '').toLowerCase().includes(q) ||
      (r.MobileNo    ?? '').includes(q) ||
      String(r.PatRegID ?? '').includes(q)
    );
  });

  // ── Navigate to edit ──────────────────────────────────────────────────────
  const goEdit = (item: EditPatientGridItem) => {
    setSelected(null);
    navigation.navigate('EditPatient', {
      patient: {
        patRegId:  item.PatRegID,
        pid:       item.PID,
        name:      item.PatientName,
        phone:     item.MobileNo,
        age:       String(item.Age ?? ''),
        gender:    item.Gender ?? '',
        dob:       item.DOB ?? '',
        city:      item.City ?? '',
        area:      item.Area ?? '',
        address:   item.Address ?? '',
        notes:     item.Notes ?? '',
        branchId:  item.BranchId ?? 1,
      },
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 0) }]}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={T.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Patient Status</Text>
          <Text style={styles.headerSub}>
            {totalCount > 0 ? `${totalCount} records found` : 'Search patients'}
          </Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={onRefresh}>
          <Feather name="refresh-cw" size={19} color={T.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, { marginLeft: 6 }]} onPress={() => setFilterOpen(true)}>
          <Feather name="sliders" size={19} color={T.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Active filter chips ── */}
      {(patientName || mobileNo || centerName || patRegID) && (
        <View style={styles.chipRow}>
          {patientName  && <Chip label={patientName}  onClose={() => { setPatientName('');  fetchPage(1, true); }} />}
          {mobileNo     && <Chip label={mobileNo}     onClose={() => { setMobileNo('');     fetchPage(1, true); }} />}
          {centerName   && <Chip label={centerName}   onClose={() => { setCenterName('');   fetchPage(1, true); }} />}
          {patRegID     && <Chip label={`ID:${patRegID}`} onClose={() => { setPatRegID(''); fetchPage(1, true); }} />}
        </View>
      )}

      {/* ── Search box ── */}
      <View style={styles.searchBar}>
        <Feather name="search" size={16} color={T.muted} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search name, mobile or ID on this page…"
          placeholderTextColor={T.muted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Feather name="x" size={15} color={T.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Date range bar ── */}
      <View style={styles.dateBar}>
        <Feather name="calendar" size={13} color={T.sub} />
        <Text style={styles.dateBarText}>{fromDate}</Text>
        <Text style={[styles.dateBarText, { marginHorizontal: 4 }]}>→</Text>
        <Text style={styles.dateBarText}>{toDate}</Text>
        <TouchableOpacity onPress={() => setFilterOpen(true)} style={{ marginLeft: 'auto' }}>
          <Text style={styles.changeDateText}>Change</Text>
        </TouchableOpacity>
      </View>

      {/* ── List ── */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={T.primary} />
          <Text style={styles.loadingText}>Loading patients…</Text>
        </View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(item, idx) => `${item.PatRegID}-${item.PID}-${idx}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[T.primary]} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.centered}>
              <MaterialCommunityIcons name="account-search-outline" size={52} color={T.muted} />
              <Text style={styles.emptyText}>No patients found</Text>
              <Text style={styles.emptySub}>Try changing the date range or filters</Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                <ActivityIndicator color={T.primary} />
              </View>
            ) : hasMore ? (
              <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore}>
                <Text style={styles.loadMoreText}>Load more ({rows.length}/{totalCount})</Text>
              </TouchableOpacity>
            ) : rows.length > 0 ? (
              <Text style={styles.endText}>All {totalCount} records loaded</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <PatientCard
              item={item}
              onView={() => setSelected(item)}
              onEdit={() => goEdit(item)}
            />
          )}
        />
      )}

      {/* ── FAB: New Registration ── */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('NewRegistration')}
      >
        <Feather name="plus" size={26} color="#FFF" />
      </TouchableOpacity>

      {/* ── Detail sheet ── */}
      {selected && (
        <DetailSheet
          item={selected}
          onClose={() => setSelected(null)}
          onEdit={() => goEdit(selected)}
        />
      )}

      {/* ── Filter modal ── */}
      <Modal visible={filterOpen} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.dragHandle} />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setFilterOpen(false)}>
              <Feather name="x" size={22} color={T.sub} />
            </TouchableOpacity>

            <Text style={styles.sheetTitle}>Filter Patients</Text>

            {/* Date range */}
            <Text style={styles.filterLabel}>From Date  <Text style={styles.filterHint}>(dd-mm-yyyy)</Text></Text>
            <TextInput
              style={styles.filterInput}
              value={fromDate}
              onChangeText={setFromDate}
              placeholder="01-06-2026"
              placeholderTextColor={T.muted}
              keyboardType="numeric"
            />

            <Text style={styles.filterLabel}>To Date  <Text style={styles.filterHint}>(dd-mm-yyyy)</Text></Text>
            <TextInput
              style={styles.filterInput}
              value={toDate}
              onChangeText={setToDate}
              placeholder="29-06-2026"
              placeholderTextColor={T.muted}
              keyboardType="numeric"
            />

            {/* Patient Name */}
            <Text style={styles.filterLabel}>Patient Name</Text>
            <TextInput
              style={styles.filterInput}
              value={patientName}
              onChangeText={setPatientName}
              placeholder="e.g. Rahul"
              placeholderTextColor={T.muted}
            />

            {/* Mobile */}
            <Text style={styles.filterLabel}>Mobile No</Text>
            <TextInput
              style={styles.filterInput}
              value={mobileNo}
              onChangeText={setMobileNo}
              placeholder="e.g. 9876543210"
              placeholderTextColor={T.muted}
              keyboardType="phone-pad"
            />

            {/* Center */}
            <Text style={styles.filterLabel}>Center Name</Text>
            <TextInput
              style={styles.filterInput}
              value={centerName}
              onChangeText={setCenterName}
              placeholder="e.g. Main Lab"
              placeholderTextColor={T.muted}
            />

            {/* PatRegID */}
            <Text style={styles.filterLabel}>Patient Reg ID</Text>
            <TextInput
              style={styles.filterInput}
              value={patRegID}
              onChangeText={setPatRegID}
              placeholder="0 = all"
              placeholderTextColor={T.muted}
              keyboardType="numeric"
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <TouchableOpacity
                style={[styles.filterBtn, { flex: 1, backgroundColor: '#F1F5F9' }]}
                onPress={() => {
                  setPatientName(''); setMobileNo(''); setCenterName('');
                  setPatRegID('');
                  setFromDate(isoToDisplay(startOfMonth()));
                  setToDate(isoToDisplay(endOfToday()));
                }}
              >
                <Text style={[styles.filterBtnText, { color: T.sub }]}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.filterBtn, { flex: 2, backgroundColor: T.primary }]} onPress={applyFilters}>
                <Feather name="search" size={15} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.filterBtnText}>Search</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 20 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Helper: active filter chip ───────────────────────────────────────────────
function Chip({ label, onClose }: { label: string; onClose: () => void }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText} numberOfLines={1}>{label}</Text>
      <TouchableOpacity onPress={onClose} style={{ marginLeft: 4 }}>
        <Feather name="x" size={11} color={T.tealDark} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: T.screenBg },

  // Header
  header:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
                paddingTop: 14, paddingBottom: 12, backgroundColor: T.bg,
                borderBottomWidth: 1, borderBottomColor: T.border },
  backBtn:    { padding: 4, marginRight: 10 },
  headerTitle:{ fontSize: 18, fontWeight: '800', color: T.text },
  headerSub:  { fontSize: 11, color: T.sub, marginTop: 1 },
  iconBtn:    { padding: 6, borderRadius: 8, backgroundColor: T.tealBg },

  // Chips
  chipRow:    { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  chip:       { flexDirection: 'row', alignItems: 'center', backgroundColor: T.tealBg,
                borderWidth: 1, borderColor: T.tealBorder, borderRadius: 20,
                paddingHorizontal: 10, paddingVertical: 4 },
  chipText:   { fontSize: 11, color: T.tealDark, fontWeight: '600', maxWidth: 100 },

  // Search
  searchBar:  { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12,
                marginTop: 10, marginBottom: 6, backgroundColor: T.bg,
                borderWidth: 1, borderColor: T.border, borderRadius: 10,
                paddingHorizontal: 12, height: 42 },
  searchInput:{ flex: 1, fontSize: 13, color: T.text },

  // Date bar
  dateBar:    { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12,
                marginBottom: 8, backgroundColor: T.tealBg, borderRadius: 8,
                paddingHorizontal: 10, paddingVertical: 7,
                borderWidth: 1, borderColor: T.tealBorder },
  dateBarText:{ fontSize: 12, color: T.tealDark, fontWeight: '600' },
  changeDateText: { fontSize: 12, color: T.primary, fontWeight: '700' },

  // List
  listContent: { paddingHorizontal: 12, paddingTop: 4, paddingBottom: 100 },
  centered:    { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  loadingText: { marginTop: 12, fontSize: 14, color: T.sub },
  emptyText:   { fontSize: 15, fontWeight: '700', color: T.sub, marginTop: 12 },
  emptySub:    { fontSize: 12, color: T.muted, marginTop: 4 },
  loadMoreBtn: { alignItems: 'center', paddingVertical: 14 },
  loadMoreText:{ fontSize: 13, color: T.primary, fontWeight: '600' },
  endText:     { textAlign: 'center', fontSize: 12, color: T.muted, paddingVertical: 14 },

  // Card
  card:       { backgroundColor: T.bg, borderRadius: 12, borderWidth: 1,
                borderColor: T.border, marginBottom: 10,
                elevation: 1, shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 12,
                borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  avatar:     { width: 42, height: 42, borderRadius: 21, backgroundColor: T.tealBg,
                alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 17, fontWeight: '800', color: T.tealDark },
  cardName:   { fontSize: 14, fontWeight: '700', color: T.text, marginBottom: 2 },
  cardSub:    { fontSize: 11.5, color: T.sub, marginBottom: 3 },
  cardMeta:   { flexDirection: 'row', alignItems: 'center' },
  cardMetaText:{ fontSize: 11, color: T.muted, marginLeft: 3 },
  centerBadge:{ backgroundColor: '#EFF6FF', borderRadius: 6, paddingHorizontal: 7,
                paddingVertical: 3, marginLeft: 8, maxWidth: 90 },
  centerBadgeText: { fontSize: 10, color: '#1D4ED8', fontWeight: '700' },
  cardActions:{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  actionBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center',
                justifyContent: 'center', gap: 5 },
  actionBtnText:{ fontSize: 12, fontWeight: '600', color: T.primary },
  actionDivider:{ width: 1, height: 18, backgroundColor: T.border },

  // FAB
  fab:        { position: 'absolute', bottom: 88, right: 18, width: 56, height: 56,
                borderRadius: 28, backgroundColor: T.primary,
                alignItems: 'center', justifyContent: 'center',
                elevation: 4, shadowColor: T.primary,
                shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6 },

  // Modal / sheet
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: T.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22,
                padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, maxHeight: '90%' },
  dragHandle: { width: 36, height: 4, backgroundColor: T.border, borderRadius: 2,
                alignSelf: 'center', marginBottom: 18 },
  closeBtn:   { position: 'absolute', top: 18, right: 18, zIndex: 1 },
  sheetTitle: { fontSize: 17, fontWeight: '800', color: T.text, marginBottom: 16 },

  // Detail rows
  detailRow:  { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  detailLabel:{ width: 72, fontSize: 12, color: T.sub, fontWeight: '600' },
  detailValue:{ flex: 1, fontSize: 13, color: T.text, fontWeight: '600' },
  editSheetBtn:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                 backgroundColor: T.primary, borderRadius: 12, paddingVertical: 14,
                 marginTop: 18, gap: 8 },
  editSheetBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  // Filter modal
  filterLabel:{ fontSize: 12, fontWeight: '700', color: T.sub, marginBottom: 5, marginTop: 10 },
  filterHint: { fontSize: 11, color: T.muted, fontWeight: '400' },
  filterInput:{ borderWidth: 1, borderColor: T.border, borderRadius: 8,
                paddingHorizontal: 12, height: 42, fontSize: 13, color: T.text,
                backgroundColor: T.bg },
  filterBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                borderRadius: 10, paddingVertical: 13 },
  filterBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});
