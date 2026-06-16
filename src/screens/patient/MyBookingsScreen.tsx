import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, FlatList, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

// ─── Data ────────────────────────────────────────────────────────────────────

const POPULAR_TESTS = [
  { id: 'cbc',      label: 'CBC',                  price: 700  },
  { id: 'thyroid',  label: 'Thyroid\nProfile',      price: 1200 },
  { id: 'liver',    label: 'Liver\nFunction Test',  price: 900  },
  { id: 'kidney',   label: 'Kidney\nFunction Test', price: 850  },
  { id: 'sugar',    label: 'Blood\nSugar',          price: 200  },
  { id: 'vitamind', label: 'Vitamin D',             price: 1100 },
];

const HEALTH_PACKAGES = [
  { id: 'basic',   title: 'Basic Health\nCheckup',       tests: 20, price: 999  },
  { id: 'full',    title: 'Full Body\nCheckup',          tests: 65, price: 1999 },
  { id: 'women',   title: "Women's Wellness\nPackage",   tests: 45, price: 1499 },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface SelectedTest {
  id: string;
  label: string;
  description: string;
  price: number;
}

const TEST_DESCRIPTIONS: Record<string, string> = {
  cbc:      'Complete Blood Count',
  thyroid:  'Thyroid Profile (T3, T4, TSH)',
  liver:    'Liver Function Test (LFT)',
  kidney:   'Kidney Function Test (KFT)',
  sugar:    'Blood Sugar (Fasting)',
  vitamind: 'Vitamin D (25-OH)',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MyBookingsScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [selectedTests, setSelectedTests] = useState<SelectedTest[]>([
    { id: 'cbc',     label: 'CBC',            description: 'Complete Blood Count',           price: 700  },
    { id: 'thyroid', label: 'Thyroid Profile', description: 'Thyroid Profile (T3, T4, TSH)', price: 1200 },
  ]);
  const [collectionType, setCollectionType] = useState<'home' | 'lab'>('home');

  function toggleTest(test: typeof POPULAR_TESTS[0]) {
    const exists = selectedTests.find((t) => t.id === test.id);
    if (exists) {
      setSelectedTests((prev) => prev.filter((t) => t.id !== test.id));
    } else {
      setSelectedTests((prev) => [
        ...prev,
        {
          id: test.id,
          label: test.label.replace('\n', ' '),
          description: TEST_DESCRIPTIONS[test.id] || '',
          price: test.price,
        },
      ]);
    }
  }

  function removeTest(id: string) {
    setSelectedTests((prev) => prev.filter((t) => t.id !== id));
  }

  function addPackage(pkg: typeof HEALTH_PACKAGES[0]) {
    Alert.alert('Package Added', `${pkg.title.replace('\n', ' ')} has been added to your cart.`);
  }

  const totalAmount = selectedTests.reduce((sum, t) => sum + t.price, 0);

  return (
    <SafeAreaView style={styles.root}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Test</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Search ── */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for tests, packages..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* ── Popular Tests ── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Popular Tests</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All  &gt;</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
          {POPULAR_TESTS.map((test) => {
            const isSelected = !!selectedTests.find((t) => t.id === test.id);
            return (
              <TouchableOpacity
                key={test.id}
                style={[styles.testChip, isSelected && styles.testChipSelected]}
                onPress={() => toggleTest(test)}
                activeOpacity={0.8}
              >
                <View style={[styles.testChipIcon, isSelected && styles.testChipIconSelected]}>
                  <Ionicons
                    name={isSelected ? 'checkmark' : 'add'}
                    size={16}
                    color={isSelected ? '#fff' : COLORS.primary}
                  />
                </View>
                <Text style={[styles.testChipLabel, isSelected && styles.testChipLabelSelected]}>
                  {test.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Health Packages ── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Health Packages</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All  &gt;</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
          {HEALTH_PACKAGES.map((pkg) => (
            <View key={pkg.id} style={styles.packageCard}>
              <Text style={styles.packageTitle}>{pkg.title}</Text>
              <Text style={styles.packageTests}>{pkg.tests} Tests</Text>
              <View style={styles.packageFooter}>
                <Text style={styles.packagePrice}>₹{pkg.price}</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => addPackage(pkg)}>
                  <Text style={styles.addBtnText}>+ Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* ── Selected Tests ── */}
        <Text style={styles.sectionTitle}>
          Selected Tests ({selectedTests.length})
        </Text>

        <View style={styles.selectedCard}>
          {selectedTests.length === 0 ? (
            <Text style={styles.emptyText}>No tests selected yet</Text>
          ) : (
            selectedTests.map((test, idx) => (
              <View
                key={test.id}
                style={[
                  styles.selectedRow,
                  idx < selectedTests.length - 1 && styles.selectedRowBorder,
                ]}
              >
                <View style={styles.checkCircle}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
                <View style={styles.selectedInfo}>
                  <Text style={styles.selectedName}>{test.label}</Text>
                  <Text style={styles.selectedDesc}>{test.description}</Text>
                </View>
                <Text style={styles.selectedPrice}>₹{test.price}</Text>
                <TouchableOpacity onPress={() => removeTest(test.id)} style={styles.removeBtn}>
                  <Ionicons name="close" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            ))
          )}

          {/* Total */}
          {selectedTests.length > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>₹{totalAmount.toLocaleString('en-IN')}</Text>
            </View>
          )}
        </View>

        {/* ── Collection Type ── */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.md }]}>Collection Type</Text>

        <View style={styles.collectionRow}>
          {/* Home Collection */}
          <TouchableOpacity
            style={[styles.collectionCard, collectionType === 'home' && styles.collectionCardActive]}
            onPress={() => setCollectionType('home')}
            activeOpacity={0.85}
          >
            <View style={styles.collectionTop}>
              <Text style={[styles.collectionTitle, collectionType === 'home' && styles.collectionTitleActive]}>
                Home Collection
              </Text>
              <View style={[styles.radioOuter, collectionType === 'home' && styles.radioOuterActive]}>
                {collectionType === 'home' && <View style={styles.radioInner} />}
              </View>
            </View>
            <Text style={styles.collectionDesc}>Sample collected{'\n'}at your home</Text>
          </TouchableOpacity>

          {/* Visit Laboratory */}
          <TouchableOpacity
            style={[styles.collectionCard, collectionType === 'lab' && styles.collectionCardActive]}
            onPress={() => setCollectionType('lab')}
            activeOpacity={0.85}
          >
            <View style={styles.collectionTop}>
              <Text style={[styles.collectionTitle, collectionType === 'lab' && styles.collectionTitleActive]}>
                Visit Laboratory
              </Text>
              <View style={[styles.radioOuter, collectionType === 'lab' && styles.radioOuterActive]}>
                {collectionType === 'lab' && <View style={styles.radioInner} />}
              </View>
            </View>
            <Text style={styles.collectionDesc}>Visit lab for sample{'\n'}collection</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      {/* ── Continue Button ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, selectedTests.length === 0 && styles.continueBtnDisabled]}
          disabled={selectedTests.length === 0}
          activeOpacity={0.88}
          onPress={() => Alert.alert('Booking', `Proceeding with ${selectedTests.length} test(s) via ${collectionType === 'home' ? 'Home Collection' : 'Lab Visit'}.`)}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  backBtn: { marginRight: 14 },
  headerTitle: { fontSize: 19, fontWeight: '700', color: COLORS.textPrimary },

  scrollContent: { paddingHorizontal: SPACING.md, paddingTop: SPACING.md },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: '#E8EDF2',
    paddingHorizontal: SPACING.md,
    height: 48,
    marginBottom: SPACING.lg,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary },

  // Section header
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  viewAll: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },

  hScroll: { marginBottom: SPACING.lg },

  // Popular test chips
  testChip: {
    alignItems: 'center',
    marginRight: 10,
    width: 72,
  },
  testChipSelected: {},
  testChipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  testChipIconSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  testChipLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  testChipLabelSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Health packages
  packageCard: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginRight: 10,
    width: 150,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  packageTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  packageTests: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  packageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  packagePrice: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
  addBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  addBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  // Selected tests card
  selectedCard: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    marginBottom: SPACING.md,
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  selectedRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  selectedInfo: { flex: 1 },
  selectedName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  selectedDesc: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },
  selectedPrice: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginRight: 10 },
  removeBtn: { padding: 2 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 2,
  },
  totalLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  totalAmount: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  emptyText: { textAlign: 'center', color: COLORS.textMuted, paddingVertical: SPACING.lg },

  // Collection type
  collectionRow: { flexDirection: 'row', gap: SPACING.sm },
  collectionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#E8EDF2',
  },
  collectionCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDFA',
  },
  collectionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  collectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 4,
  },
  collectionTitleActive: { color: COLORS.textPrimary },
  collectionDesc: { fontSize: 11, color: COLORS.textSecondary, lineHeight: 16 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  radioOuterActive: { borderColor: COLORS.primary },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  // Footer
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  continueBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnDisabled: { opacity: 0.5 },
  continueBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
