import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, Modal, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  getAllTestCharges,
  getAllRateTypes,
  getAllSubDepts,
  getAllMainTests,
  deleteTestCharge,
} from '../../services/testChargesService';
import { TestCharge } from '../../utils/types';

const TEAL = '#0D9488';
const TEAL_DARK = '#0F766E';

interface DropItem { id: number; label: string }

// ─── Modal-based Dropdown (no clipping issues) ───────────────────────────────
function ModalDropdown({
  label, required, optional,
  value, options, onSelect, loading, placeholder,
}: {
  label: string; required?: boolean; optional?: boolean;
  value: string; options: DropItem[];
  onSelect: (item: DropItem | null) => void;
  loading?: boolean; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={s.fieldBlock}>
      <Text style={s.fieldLabel}>
        {label}
        {required && <Text style={{ color: '#EF4444' }}> *</Text>}
        {optional && <Text style={{ color: '#94A3B8', fontWeight: '400' }}> (Optional)</Text>}
      </Text>
      <TouchableOpacity
        style={s.ddTrigger}
        onPress={() => !loading && setOpen(true)}
        activeOpacity={0.8}
      >
        {loading
          ? <ActivityIndicator size={14} color={TEAL} style={{ marginRight: 8 }} />
          : null}
        <Text style={[s.ddTriggerText, !value && { color: '#94A3B8' }]} numberOfLines={1}>
          {loading ? 'Loading…' : (value || placeholder || 'Select…')}
        </Text>
        <Feather name="chevron-down" size={16} color="#64748B" />
      </TouchableOpacity>

      {/* Modal picker — no clipping */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={s.pickerOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={s.pickerBox}>
            <View style={s.pickerHeader}>
              <Text style={s.pickerTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Feather name="x" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 320 }}>
              {optional && (
                <TouchableOpacity
                  style={s.pickerItem}
                  onPress={() => { onSelect(null); setOpen(false); }}
                >
                  <Text style={s.pickerItemText}>All Tests (Optional)</Text>
                </TouchableOpacity>
              )}
              {options.length === 0
                ? <View style={s.pickerEmpty}><Text style={s.pickerEmptyText}>No data found</Text></View>
                : options.map(o => (
                  <TouchableOpacity
                    key={o.id}
                    style={[s.pickerItem, value === o.label && s.pickerItemActive]}
                    onPress={() => { onSelect(o); setOpen(false); }}
                  >
                    <Text style={[s.pickerItemText, value === o.label && s.pickerItemTextActive]}>
                      {o.label}
                    </Text>
                    {value === o.label && <Feather name="check" size={15} color={TEAL} />}
                  </TouchableOpacity>
                ))
              }
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ─── Detail Row ───────────────────────────────────────────────────────────────
function DetailRow({ label, value, highlight }: { label: string; value: any; highlight?: boolean }) {
  const display = (value === null || value === undefined || value === '') ? '—' : String(value);
  return (
    <View style={s.detailRow}>
      <Text style={s.detailLabel}>{label}</Text>
      <Text style={[s.detailValue, highlight && { color: '#15803D', fontWeight: '800' }]}>
        {display}
      </Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function TestChargeDetailScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  // Dropdown data
  const [rateTypes,  setRateTypes]  = useState<DropItem[]>([]);
  const [subDepts,   setSubDepts]   = useState<DropItem[]>([]);
  const [mainTests,  setMainTests]  = useState<DropItem[]>([]);
  const [loadingRT,  setLoadingRT]  = useState(false);
  const [loadingSD,  setLoadingSD]  = useState(false);
  const [loadingMT,  setLoadingMT]  = useState(false);

  // Selected values
  const [rateTypeId,   setRateTypeId]   = useState<number | null>(null);
  const [rateTypeName, setRateTypeName] = useState('');
  const [subDeptId,    setSubDeptId]    = useState<number | null>(null);
  const [subDeptName,  setSubDeptName]  = useState('');
  const [mainTestId,   setMainTestId]   = useState<number | null>(null);
  const [mainTestName, setMainTestName] = useState('');

  // Results
  const [results,  setResults]  = useState<TestCharge[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading,  setLoading]  = useState(false);

  // Detail modal
  const [selected,  setSelected]  = useState<TestCharge | null>(null);
  const [deleting,  setDeleting]  = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Load dropdowns on mount
  useEffect(() => {
    setLoadingRT(true);
    getAllRateTypes()
      .then(data => {
        console.log('[RateTypes] response:', JSON.stringify(data));
        setRateTypes(data.map(r => ({ id: r.RateTypeId, label: r.RateTypeName })));
      })
      .catch(err => console.log('[RateTypes] ERROR:', err?.message))
      .finally(() => setLoadingRT(false));

    setLoadingSD(true);
    getAllSubDepts()
      .then(data => {
        console.log('[SubDepts] response:', JSON.stringify(data));
        setSubDepts(data.map(d => ({ id: d.SubDeptId, label: d.SubDeptName })));
      })
      .catch(err => console.log('[SubDepts] ERROR:', err?.message))
      .finally(() => setLoadingSD(false));

    setLoadingMT(true);
    getAllMainTests()
      .then(data => {
        console.log('[MainTests] response:', JSON.stringify(data));
        setMainTests(data.map(t => ({ id: t.MainTestId, label: t.MainTestName })));
      })
      .catch(err => console.log('[MainTests] ERROR:', err?.message))
      .finally(() => setLoadingMT(false));
  }, []);

  // Search
  const handleSearch = useCallback(async () => {
    if (!rateTypeId) { Alert.alert('Required', 'Please select a Rate Type.'); return; }
    if (!subDeptId)  { Alert.alert('Required', 'Please select a Sub Department.'); return; }
    setLoading(true);
    setSearched(true);
    setResults([]);
    try {
      // API body: { MainTestId?, RateTypeId, BranchId: 1 }
      const data = await getAllTestCharges({
        RateTypeId: rateTypeId,
        MainTestId: mainTestId ?? undefined,
      });
      // SubDeptId filter is client-side (not in API)
      const filtered = data.filter(t => t.SubDeptId === subDeptId);
      setResults(filtered);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to fetch test charges.');
    } finally {
      setLoading(false);
    }
  }, [rateTypeId, subDeptId, mainTestId]);

  // Clear
  const handleClear = useCallback(() => {
    setRateTypeId(null);  setRateTypeName('');
    setSubDeptId(null);   setSubDeptName('');
    setMainTestId(null);  setMainTestName('');
    setResults([]);
    setSearched(false);
  }, []);

  // Delete
  const handleDelete = useCallback(() => {
    if (!selected) return;
    Alert.alert(
      'Confirm Delete',
      `Delete "${selected.TestName}" (ID: ${selected.TestChargeId})?\nThis cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const msg = await deleteTestCharge(selected.TestChargeId);
              setResults(prev => prev.filter(r => r.TestChargeId !== selected.TestChargeId));
              setModalOpen(false);
              Alert.alert('Deleted', msg);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Delete failed.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }, [selected]);

  // Table row
  const renderRow = ({ item, index }: { item: TestCharge; index: number }) => (
    <TouchableOpacity
      style={[s.tableRow, index % 2 === 1 && s.tableRowAlt]}
      onPress={() => { setSelected(item); setModalOpen(true); }}
      activeOpacity={0.75}
    >
      <Text style={[s.cell, s.cId]}>{item.TestChargeId}</Text>
      <Text style={[s.cell, s.cName]} numberOfLines={2}>{item.TestName}</Text>
      <Text style={[s.cell, s.cCode]}>{item.MTCODE}</Text>
      <Text style={[s.cell, s.cRate]}>{item.RateTypeName}</Text>
      <Text style={[s.cell, s.cAmt, { color: '#15803D', fontWeight: '700' }]}>
        ₹{typeof item.Amount === 'number' ? item.Amount.toLocaleString('en-IN') : item.Amount}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 0) }]}>

      {/* ── Page Header ── */}
      <View style={s.pageHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color="#FFF" />
        </TouchableOpacity>
        <MaterialCommunityIcons name="currency-inr" size={20} color="#FFF" />
        <Text style={s.pageTitle}>Test Charges</Text>
      </View>

      {/* ── Filter Card — stacked vertically ── */}
      <View style={s.filterCard}>

        {/* 1. Rate Type */}
        <ModalDropdown
          label="RATE TYPE"
          required
          placeholder="SELECT RATE TYPE"
          value={rateTypeName}
          options={rateTypes}
          loading={loadingRT}
          onSelect={o => { setRateTypeId(o?.id ?? null); setRateTypeName(o?.label ?? ''); }}
        />

        {/* 2. Sub Department */}
        <ModalDropdown
          label="SUB DEPARTMENT"
          required
          placeholder="SELECT SUB DEPARTMENT"
          value={subDeptName}
          options={subDepts}
          loading={loadingSD}
          onSelect={o => { setSubDeptId(o?.id ?? null); setSubDeptName(o?.label ?? ''); }}
        />

        {/* 3. Main Test */}
        <ModalDropdown
          label="MAIN TEST"
          optional
          placeholder="ALL TESTS (OPTIONAL)"
          value={mainTestName}
          options={mainTests}
          loading={loadingMT}
          onSelect={o => { setMainTestId(o?.id ?? null); setMainTestName(o?.label ?? ''); }}
        />

        {/* Action buttons */}
        <View style={s.btnRow}>
          <TouchableOpacity
            style={[s.searchBtn, loading && { opacity: 0.6 }]}
            onPress={handleSearch}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#FFF" size="small" />
              : <Text style={s.searchBtnTxt}>Search</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={s.clearBtn} onPress={handleClear} activeOpacity={0.8}>
            <Text style={s.clearBtnTxt}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Results Section ── */}
      <View style={s.resultsSection}>

        {/* Title bar */}
        <View style={s.resultBar}>
          <MaterialCommunityIcons name="table" size={15} color="#FFF" />
          <Text style={s.resultBarTxt}>
            Test Charges{'  '}
            <Text style={{ fontWeight: '400' }}>
              {searched
                ? `${results.length} record${results.length !== 1 ? 's' : ''}`
                : '0 records'}
            </Text>
          </Text>
        </View>

        {/* Table header */}
        {results.length > 0 && (
          <View style={s.tableHead}>
            <Text style={[s.headCell, s.cId]}>ID</Text>
            <Text style={[s.headCell, s.cName]}>Test Name</Text>
            <Text style={[s.headCell, s.cCode]}>MT Code</Text>
            <Text style={[s.headCell, s.cRate]}>Rate Type</Text>
            <Text style={[s.headCell, s.cAmt]}>Amount</Text>
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View style={s.centerBox}>
            <ActivityIndicator size="large" color={TEAL} />
            <Text style={s.centerTxt}>Searching…</Text>
          </View>
        )}

        {/* Empty / prompt */}
        {!loading && !searched && (
          <View style={s.centerBox}>
            <MaterialCommunityIcons name="filter-outline" size={46} color="#94A3B8" />
            <Text style={s.centerTxt}>Select Rate Type and Sub Department, then click Search.</Text>
          </View>
        )}
        {!loading && searched && results.length === 0 && (
          <View style={s.centerBox}>
            <MaterialCommunityIcons name="flask-empty-outline" size={46} color="#94A3B8" />
            <Text style={s.centerTxt}>No data available.</Text>
          </View>
        )}

        {/* Rows */}
        {!loading && results.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={item => String(item.TestChargeId)}
            renderItem={renderRow}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#F1F5F9' }} />}
          />
        )}
      </View>

      {/* ── Detail Bottom Sheet ── */}
      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.handle} />
            <View style={s.sheetHeader}>
              <View style={s.sheetIconBox}>
                <MaterialCommunityIcons name="test-tube" size={22} color={TEAL} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.sheetTitle} numberOfLines={2}>{selected?.TestName}</Text>
                <Text style={s.sheetSub}>MT Code: {selected?.MTCODE}  •  ID: {selected?.TestChargeId}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalOpen(false)} style={s.closeBtn}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={s.amountHero}>
              <Text style={s.amountVal}>
                ₹{selected && typeof selected.Amount === 'number'
                  ? selected.Amount.toLocaleString('en-IN')
                  : selected?.Amount ?? '—'}
              </Text>
              <Text style={s.amountLbl}>Charge Amount</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={s.sheetScroll}>
              <View style={s.detailCard}>
                <DetailRow label="Test Charge ID"  value={selected?.TestChargeId} />
                <DetailRow label="Test Name"       value={selected?.TestName} />
                <DetailRow label="MT Code"         value={selected?.MTCODE} />
                <DetailRow label="Test Type"       value={selected?.TestType} />
                <DetailRow label="Rate Type"       value={selected?.RateTypeName} />
                <DetailRow label="Rate Type ID"    value={selected?.RateTypeId} />
                <DetailRow label="Sub Dept ID"     value={selected?.SubDeptId} />
                <DetailRow label="Main Test ID"    value={selected?.MainTestId} />
                <DetailRow label="Package ID"      value={selected?.PackageId} />
                <DetailRow label="Package Name"    value={selected?.PackageName} />
                <DetailRow
                  label="Amount"
                  value={selected ? `₹${typeof selected.Amount === 'number'
                    ? selected.Amount.toLocaleString('en-IN') : selected.Amount}` : '—'}
                  highlight
                />
              </View>
              <View style={{ height: 16 }} />
            </ScrollView>

            <TouchableOpacity
              style={[s.deleteBtn, deleting && { opacity: 0.6 }]}
              onPress={handleDelete}
              disabled={deleting}
              activeOpacity={0.8}
            >
              {deleting
                ? <ActivityIndicator color="#FFF" size="small" />
                : <>
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color="#FFF" />
                    <Text style={s.deleteTxt}>Delete Test Charge</Text>
                  </>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },

  pageHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: TEAL,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14,
  },
  backBtn:   { padding: 4 },
  pageTitle: { fontSize: 17, fontWeight: '800', color: '#FFF', flex: 1 },

  // Filter card — vertical stack
  filterCard: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
    elevation: 3, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4,
  },

  // Each dropdown field block
  fieldBlock: { marginBottom: 12 },
  fieldLabel: {
    fontSize: 11, fontWeight: '700', color: '#64748B',
    letterSpacing: 0.4, marginBottom: 6,
  },
  ddTrigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 13,
    backgroundColor: '#F8FAFC',
  },
  ddTriggerText: { flex: 1, fontSize: 14, color: '#0F172A', fontWeight: '500', marginRight: 6 },

  // Modal picker
  pickerOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', paddingHorizontal: 24,
  },
  pickerBox: {
    backgroundColor: '#FFF', borderRadius: 16,
    overflow: 'hidden',
    elevation: 10, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12,
  },
  pickerHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  pickerTitle:     { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  pickerItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  pickerItemActive: { backgroundColor: '#F0FDFA' },
  pickerItemText:   { fontSize: 14, color: '#0F172A' },
  pickerItemTextActive: { color: TEAL, fontWeight: '700' },
  pickerEmpty:      { paddingHorizontal: 18, paddingVertical: 16 },
  pickerEmptyText:  { fontSize: 13, color: '#94A3B8' },

  // Search / Clear buttons
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  searchBtn: {
    flex: 1, backgroundColor: TEAL, borderRadius: 10,
    paddingVertical: 13, alignItems: 'center', justifyContent: 'center',
  },
  searchBtnTxt: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  clearBtn: {
    paddingHorizontal: 24, paddingVertical: 13, borderRadius: 10,
    borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC',
    alignItems: 'center', justifyContent: 'center',
  },
  clearBtnTxt: { fontSize: 14, fontWeight: '600', color: '#64748B' },

  // Results
  resultsSection: { flex: 1 },
  resultBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: TEAL_DARK,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  resultBarTxt: { fontSize: 13, fontWeight: '700', color: '#FFF' },

  tableHead: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 12, paddingVertical: 9,
    borderBottomWidth: 1, borderBottomColor: '#CCFBF1',
  },
  headCell: { fontSize: 11, fontWeight: '800', color: TEAL_DARK },
  tableRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  tableRowAlt: { backgroundColor: '#F8FAFC' },
  cell: { fontSize: 12, color: '#0F172A' },
  cId:   { width: 36 },
  cName: { flex: 1, paddingRight: 6 },
  cCode: { width: 68 },
  cRate: { width: 52 },
  cAmt:  { width: 66, textAlign: 'right' },

  centerBox: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 44, paddingHorizontal: 32, gap: 12,
  },
  centerTxt: { fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 20 },

  // Bottom sheet
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24,
    maxHeight: '88%',
  },
  handle: {
    width: 40, height: 4, backgroundColor: '#E2E8F0',
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  sheetIconBox: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: '#F0FDFA', alignItems: 'center', justifyContent: 'center',
  },
  sheetTitle:  { fontSize: 15, fontWeight: '800', color: '#0F172A', lineHeight: 20 },
  sheetSub:    { fontSize: 11, color: '#64748B', marginTop: 3 },
  closeBtn:    { padding: 4, marginLeft: 8 },
  amountHero: {
    backgroundColor: '#F0FDF4', borderRadius: 14,
    borderWidth: 1, borderColor: '#BBF7D0',
    alignItems: 'center', paddingVertical: 14, marginBottom: 14,
  },
  amountVal: { fontSize: 26, fontWeight: '900', color: '#15803D' },
  amountLbl: { fontSize: 11, color: '#64748B', marginTop: 3, fontWeight: '500' },
  sheetScroll: { flex: 1 },
  detailCard: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: '#FFF',
  },
  detailLabel: { fontSize: 12, color: '#64748B', fontWeight: '500', flex: 1 },
  detailValue: { fontSize: 13, color: '#0F172A', fontWeight: '600', textAlign: 'right', flex: 1 },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#EF4444', borderRadius: 12,
    paddingVertical: 14, marginTop: 12, gap: 8,
  },
  deleteTxt: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
