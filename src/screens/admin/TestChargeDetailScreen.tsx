import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { getTestChargeById, deleteTestCharge } from '../../services/testChargesService';
import { TestCharge } from '../../utils/types';

const T = {
  primary:  '#0D9488',
  bg:       '#F8FAFC',
  card:     '#FFFFFF',
  text:     '#0F172A',
  sub:      '#64748B',
  muted:    '#94A3B8',
  border:   '#E2E8F0',
  green:    '#15803D',
  greenBg:  '#F0FDF4',
  tealBg:   '#F0FDFA',
  tealBorder:'#CCFBF1',
};

// ─── Row helper ────────────────────────────────────────────────────────────────
function DetailRow({ label, value, highlight }: { label: string; value: string | number | null; highlight?: boolean }) {
  const display = value === null || value === undefined || value === '' ? '—' : String(value);
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, highlight && { color: T.green, fontWeight: '800' }]}>
        {display}
      </Text>
    </View>
  );
}

export default function TestChargeDetailScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const [inputId, setInputId]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [charge, setCharge]       = useState<TestCharge | null>(null);
  const [deleting, setDeleting]   = useState(false);

  const fetchCharge = useCallback(async () => {
    const id = parseInt(inputId.trim(), 10);
    if (isNaN(id) || id <= 0) {
      Alert.alert('Invalid ID', 'Please enter a valid numeric Test Charge ID.');
      return;
    }
    setLoading(true);
    setCharge(null);
    try {
      const data = await getTestChargeById(id);
      setCharge(data);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to fetch test charge. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [inputId]);

  const handleDelete = useCallback(() => {
    if (!charge) return;
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${charge.TestName}" (ID: ${charge.TestChargeId})? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const msg = await deleteTestCharge(charge.TestChargeId);
              setCharge(null);
              setInputId('');
              Alert.alert('Deleted', msg);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete test charge. Please try again.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }, [charge]);

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 0) }]}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={T.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Test Charge Detail</Text>
          <Text style={styles.headerSub}>Lookup by Test Charge ID</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Search Card ── */}
        <View style={styles.searchCard}>
          <Text style={styles.searchLabel}>Enter Test Charge ID</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.input}
              placeholder="e.g.  4"
              placeholderTextColor={T.muted}
              keyboardType="numeric"
              value={inputId}
              onChangeText={setInputId}
              onSubmitEditing={fetchCharge}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={[styles.searchBtn, loading && { opacity: 0.6 }]}
              onPress={fetchCharge}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading
                ? <ActivityIndicator color="#FFF" size="small" />
                : <Feather name="search" size={18} color="#FFF" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Loading ── */}
        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={T.primary} />
            <Text style={styles.loadingText}>Fetching test charge...</Text>
          </View>
        )}

        {/* ── Result Card ── */}
        {!loading && charge && (
          <View style={styles.resultCard}>

            {/* Title row */}
            <View style={styles.resultHeader}>
              <View style={styles.resultIconBox}>
                <MaterialCommunityIcons name="test-tube" size={26} color={T.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.testName}>{charge.TestName}</Text>
                <View style={styles.mtcodeRow}>
                  <MaterialCommunityIcons name="barcode" size={14} color={T.sub} />
                  <Text style={styles.mtcode}>  {charge.MTCODE}</Text>
                </View>
              </View>
              {/* Amount badge */}
              <View style={styles.amountBadge}>
                <Text style={styles.amountValue}>
                  ₹{typeof charge.Amount === 'number' ? charge.Amount.toLocaleString('en-IN') : charge.Amount}
                </Text>
                <Text style={styles.amountLabel}>Amount</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Details */}
            <DetailRow label="Test Charge ID"  value={charge.TestChargeId} />
            <DetailRow label="Main Test ID"    value={charge.MainTestId} />
            <DetailRow label="Sub Dept ID"     value={charge.SubDeptId} />
            <DetailRow label="Test Type"       value={charge.TestType} />
            <DetailRow label="Rate Type"       value={charge.RateTypeName} />
            <DetailRow label="Rate Type ID"    value={charge.RateTypeId} />
            <DetailRow label="Package ID"      value={charge.PackageId} />
            <DetailRow label="Package Name"    value={charge.PackageName} />
            <DetailRow label="Amount"          value={`₹${typeof charge.Amount === 'number' ? charge.Amount.toLocaleString('en-IN') : charge.Amount}`} highlight />

            {/* ── Delete Button ── */}
            <TouchableOpacity
              style={[styles.deleteBtn, deleting && { opacity: 0.6 }]}
              onPress={handleDelete}
              disabled={deleting}
              activeOpacity={0.8}
            >
              {deleting
                ? <ActivityIndicator color="#FFF" size="small" />
                : <>
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color="#FFF" />
                    <Text style={styles.deleteBtnText}>Delete Test Charge</Text>
                  </>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* ── Empty state ── */}
        {!loading && !charge && (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="flask-empty-outline" size={56} color={T.muted} />
            <Text style={styles.emptyText}>Enter a Test Charge ID above{'\n'}and tap Search to load details.</Text>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: T.bg },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14,
    backgroundColor: T.card,
    borderBottomWidth: 1, borderBottomColor: T.border,
    gap: 14,
  },
  backBtn:     { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: T.text },
  headerSub:   { fontSize: 12, color: T.sub, marginTop: 2 },

  scroll: { padding: 16 },

  // Search
  searchCard: {
    backgroundColor: T.card, borderRadius: 16,
    borderWidth: 1, borderColor: T.tealBorder,
    padding: 16, marginBottom: 20,
  },
  searchLabel: { fontSize: 13, fontWeight: '700', color: T.text, marginBottom: 10 },
  searchRow:   { flexDirection: 'row', gap: 10 },
  input: {
    flex: 1, height: 48, borderRadius: 12,
    borderWidth: 1, borderColor: T.border,
    paddingHorizontal: 14, fontSize: 15,
    color: T.text, backgroundColor: T.bg,
  },
  searchBtn: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: T.primary,
    alignItems: 'center', justifyContent: 'center',
  },

  centerBox: { alignItems: 'center', marginTop: 40, gap: 12 },
  loadingText: { fontSize: 14, color: T.sub, fontWeight: '500' },

  // Result
  resultCard: {
    backgroundColor: T.card, borderRadius: 16,
    borderWidth: 1, borderColor: T.tealBorder,
    padding: 16,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  resultIconBox: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: T.tealBg,
    alignItems: 'center', justifyContent: 'center',
  },
  testName: { fontSize: 17, fontWeight: '800', color: T.text },
  mtcodeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  mtcode:    { fontSize: 12, color: T.sub, fontWeight: '500' },
  amountBadge: {
    backgroundColor: T.greenBg, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  amountValue: { fontSize: 18, fontWeight: '900', color: T.green },
  amountLabel: { fontSize: 10, fontWeight: '600', color: T.green, marginTop: 1 },

  divider: { height: 1, backgroundColor: T.border, marginBottom: 12 },

  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  detailLabel: { fontSize: 13, color: T.sub, fontWeight: '500', flex: 1 },
  detailValue: { fontSize: 13, color: T.text, fontWeight: '600', textAlign: 'right', flex: 1 },

  // Empty
  emptyBox: { alignItems: 'center', marginTop: 60, gap: 14 },
  emptyText: { fontSize: 14, color: T.muted, textAlign: 'center', lineHeight: 22 },

  // Delete
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#EF4444', borderRadius: 12,
    paddingVertical: 14, marginTop: 18, gap: 8,
  },
  deleteBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
