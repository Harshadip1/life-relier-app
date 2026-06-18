import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';

// Using exact colors from your design
const THEME = {
  primary: '#0D9488',
  primaryLight: '#F0FDFA',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  border: '#F1F5F9',
  bg: '#FFFFFF',
  screenBg: '#F8FAFC',
};

// ─── Data ────────────────────────────────────────────────────────────────────

const POPULAR_TESTS = [
  { id: 'cbc',      label: 'CBC',                 price: 700  },
  { id: 'thyroid',  label: 'Thyroid\nProfile',    price: 1200 },
  { id: 'liver',    label: 'Liver\nFunction Test',price: 900  },
  { id: 'kidney',   text: 'Kidney\nFunction Test',price: 850 },
  { id: 'sugar',    label: 'Blood\nSugar',        price: 200  },
  { id: 'vitamind', label: 'Vitamin D',           price: 1100 },
];

const HEALTH_PACKAGES = [
  { id: 'basic',   title: 'Basic Health\nCheckup',      tests: 20, price: 999  },
  { id: 'full',    title: 'Full Body\nCheckup',         tests: 65, price: 1999 },
  { id: 'women',   title: "Women's Wellness\nPackage",  tests: 45, price: 1499 },
];

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
    { id: 'cbc',     label: 'CBC',             description: 'Complete Blood Count',           price: 700  },
    { id: 'thyroid', label: 'Thyroid Profile', description: 'Thyroid Profile (T3, T4, TSH)',  price: 1200 },
  ]);
  
  // ─── Dynamic Center State ───
  const [centers, setCenters] = useState<any[]>([]); 
  const [selectedCenter, setSelectedCenter] = useState('Loading centers...');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // ─── Fetch Centers from Database ───
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        // ⚠️ REPLACE THIS URL WITH YOUR ACTUAL API ENDPOINT
        const response = await fetch('https://your-api-domain.com/api/centers');
        const data = await response.json();

        setCenters(data);
        
        // Automatically select the first center in the list once it loads
        if (data && data.length > 0) {
          // ⚠️ Change '.name' to whatever your database column is called
          setSelectedCenter(data[0].name); 
        } else {
          setSelectedCenter('No centers available');
        }
      } catch (error) {
        console.error('Error fetching centers:', error);
        setSelectedCenter('Error loading centers');
      }
    };

    fetchCenters();
  }, []);

  function toggleTest(test: any) {
    const exists = selectedTests.find((t) => t.id === test.id);
    if (exists) {
      setSelectedTests((prev) => prev.filter((t) => t.id !== test.id));
    } else {
      setSelectedTests((prev) => [
        ...prev,
        {
          id: test.id,
          label: test.label ? test.label.replace('\n', ' ') : 'Test',
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
    const exists = selectedTests.find((t) => t.id === pkg.id);
    if (exists) {
      Alert.alert('Already Selected', 'This package is already in your cart.');
    } else {
      setSelectedTests((prev) => [
        ...prev,
        {
          id: pkg.id,
          label: pkg.title.replace('\n', ' '),
          description: `${pkg.tests} Tests Included`,
          price: pkg.price,
        },
      ]);
    }
  }

  const searchQuery = search.toLowerCase().trim();

  const filteredTests = POPULAR_TESTS.filter((test) =>
    test.label?.replace('\n', ' ').toLowerCase().includes(searchQuery)
  );

  const filteredPackages = HEALTH_PACKAGES.filter((pkg) =>
    pkg.title.replace('\n', ' ').toLowerCase().includes(searchQuery)
  );

  const totalAmount = selectedTests.reduce((sum, t) => sum + t.price, 0);

  return (
    <SafeAreaView style={styles.root}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={THEME.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Test</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Search ── */}
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color={THEME.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for tests, packages..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* ── Empty State if No Search Results ── */}
        {search !== '' && filteredTests.length === 0 && filteredPackages.length === 0 && (
          <View style={styles.emptySearchBox}>
            <Feather name="search" size={32} color="#CBD5E1" />
            <Text style={styles.emptySearchText}>No tests found for "{search}"</Text>
          </View>
        )}

        {/* ── Popular Tests ── */}
        {filteredTests.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Popular Tests</Text>
              {search === '' && (
                <TouchableOpacity>
                  <Text style={styles.viewAll}>View All ›</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              {filteredTests.map((test) => {
                const isSelected = !!selectedTests.find((t) => t.id === test.id);
                return (
                  <TouchableOpacity
                    key={test.id}
                    style={[styles.testChipCard, isSelected && styles.testChipCardSelected]}
                    onPress={() => toggleTest(test)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.testChipIconBox, isSelected && styles.testChipIconBoxSelected]}>
                      <Ionicons
                        name={isSelected ? 'checkmark' : 'add'}
                        size={18}
                        color={isSelected ? '#fff' : THEME.primary}
                      />
                    </View>
                    <Text style={styles.testChipLabel}>
                      {test.label || 'Test'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* ── Health Packages ── */}
        {filteredPackages.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Health Packages</Text>
              {search === '' && (
                <TouchableOpacity>
                  <Text style={styles.viewAll}>View All ›</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              {filteredPackages.map((pkg) => (
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
          </>
        )}

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
                  <Feather name="x" size={20} color={THEME.textSecondary} />
                </TouchableOpacity>
              </View>
            ))
          )}

          {/* Total Amount Row */}
          {selectedTests.length > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>₹{totalAmount.toLocaleString('en-IN')}</Text>
            </View>
          )}
        </View>

        {/* ── Dynamic Center Selection Dropdown ── */}
        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Select Center</Text>

        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={[styles.dropdownHeader, isDropdownOpen && styles.dropdownHeaderActive]} 
            onPress={() => {
              if (centers.length > 0) setIsDropdownOpen(!isDropdownOpen);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.dropdownHeaderText}>{selectedCenter}</Text>
            
            {/* Show loader if centers haven't arrived from DB yet */}
            {centers.length === 0 && selectedCenter === 'Loading centers...' ? (
              <ActivityIndicator size="small" color={THEME.primary} />
            ) : (
              <Feather 
                name={isDropdownOpen ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={THEME.textSecondary} 
              />
            )}
          </TouchableOpacity>

          {isDropdownOpen && (
            <View style={styles.dropdownList}>
              {centers.map((centerObj, index) => {
                // ⚠️ Update 'centerObj.name' to match your database column!
                const centerName = centerObj.name; 
                const isSelected = selectedCenter === centerName;
                
                return (
                  <TouchableOpacity
                    key={centerObj.id || index}
                    style={[
                      styles.dropdownItem,
                      index === centers.length - 1 && { borderBottomWidth: 0 }
                    ]}
                    onPress={() => {
                      setSelectedCenter(centerName);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]}>
                      {centerName}
                    </Text>
                    {isSelected && <Feather name="check" size={18} color={THEME.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Continue Button ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, selectedTests.length === 0 && styles.continueBtnDisabled]}
          disabled={selectedTests.length === 0}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('ScheduleCollection', {
            tests: selectedTests,
            total: totalAmount,
            centerName: selectedCenter
          })}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
          <Feather name="arrow-right" size={20} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: THEME.bg,
  },
  backBtn: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: THEME.textPrimary },

  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 24,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: THEME.textPrimary },

  // Empty Search Results
  emptySearchBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  emptySearchText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },

  // Section header
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textPrimary,
  },
  viewAll: { fontSize: 13, color: THEME.primary, fontWeight: '600' },

  hScroll: { marginBottom: 24, overflow: 'visible' },

  // Popular test chips
  testChipCard: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 86,
    height: 100,
    backgroundColor: THEME.bg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    marginRight: 12,
    elevation: 1,
  },
  testChipCardSelected: {
    borderColor: THEME.primary,
  },
  testChipIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  testChipIconBoxSelected: {
    backgroundColor: THEME.primary,
  },
  testChipLabel: {
    fontSize: 11,
    color: THEME.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 14,
  },

  // Health packages
  packageCard: {
    backgroundColor: THEME.bg,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 170,
    borderWidth: 1,
    borderColor: THEME.border,
    elevation: 1,
  },
  packageTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textPrimary,
    marginBottom: 6,
    height: 40,
  },
  packageTests: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginBottom: 16,
  },
  packageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packagePrice: { fontSize: 18, fontWeight: '700', color: THEME.primary },
  addBtn: {
    borderWidth: 1,
    borderColor: THEME.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addBtnText: { fontSize: 12, fontWeight: '600', color: THEME.primary },

  // Selected tests card
  selectedCard: {
    backgroundColor: THEME.bg,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 24,
    marginTop: 16,
    elevation: 1,
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  selectedRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedInfo: { flex: 1 },
  selectedName: { fontSize: 14, fontWeight: '600', color: THEME.textPrimary },
  selectedDesc: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  selectedPrice: { fontSize: 14, fontWeight: '600', color: THEME.textPrimary, marginRight: 16 },
  removeBtn: { padding: 4 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  totalLabel: { fontSize: 14, fontWeight: '700', color: THEME.textPrimary },
  totalAmount: { fontSize: 18, fontWeight: '700', color: THEME.primary },
  emptyText: { textAlign: 'center', color: THEME.textSecondary, paddingVertical: 24 },

  // Center Dropdown Styles
  dropdownContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.bg,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
  },
  dropdownHeaderActive: {
    borderColor: THEME.primary,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownHeaderText: {
    fontSize: 14,
    color: THEME.textPrimary,
    fontWeight: '500',
  },
  dropdownList: {
    backgroundColor: THEME.bg,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: THEME.primary,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemText: {
    fontSize: 13,
    color: THEME.textSecondary,
  },
  dropdownItemTextSelected: {
    color: THEME.primary,
    fontWeight: '600',
  },

  // Footer
  footer: {
    backgroundColor: THEME.bg,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  continueBtn: {
    backgroundColor: THEME.primary,
    borderRadius: 12,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnDisabled: { opacity: 0.6 },
  continueBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});