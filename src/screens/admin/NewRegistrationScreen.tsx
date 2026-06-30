import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// ─── Theme Colors ────────────────────────────────────────────────────────────
const THEME = {
  primary: '#0F766E',      // Deep Teal
  primaryLight: '#F0FDFA', // Ultra-light Teal
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  danger: '#EF4444',
  success: '#15803D',
  bg: '#FFFFFF',
  screenBg: '#FAFAFA'
};

const AVAILABLE_TESTS = ['CBC', 'Lipid Profile', 'HbA1c', 'Vitamin D', 'LFT', 'KFT'];

export default function NewRegistrationScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  // ─── Form States ───
  const [name, setName] = useState('Rahul Sharma');
  const [mobile, setMobile] = useState('98765 43210');
  const [age, setAge] = useState('32');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('15/08/1992');
  const [city, setCity] = useState('Mumbai');
  const [area, setArea] = useState('Andheri West');
  const [searchTest, setSearchTest] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const [selectedTests, setSelectedTests] = useState(['CBC', 'HbA1c', 'Vitamin D']);

  // ─── Handlers ───
  const toggleTest = (test: string) => {
    if (selectedTests.includes(test)) {
      setSelectedTests(prev => prev.filter(t => t !== test));
    } else {
      setSelectedTests(prev => [...prev, test]);
    }
  };

  // ─── Reusable UI Components ───
  const SectionHeader = ({ icon, title }: { icon: any, title: string }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconBox}>
        <Feather name={icon} size={16} color="#FFF" />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const InputLabel = ({ title, required }: { title: string, required?: boolean }) => (
    <Text style={styles.inputLabel}>
      {title} {required && <Text style={{ color: THEME.danger }}>*</Text>}
    </Text>
  );

  return (
    <KeyboardAvoidingView 
      style={[styles.root, { paddingTop: Math.max(insets.top, 10) }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={THEME.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Registration</Text>
        <TouchableOpacity style={styles.scanBtn}>
          <MaterialCommunityIcons name="line-scan" size={22} color={THEME.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ── Section 1: Patient Information ── */}
        <SectionHeader icon="user" title="Patient Information" />
        
        <View style={styles.inputGroup}>
          <InputLabel title="Full Name" required />
          <View style={styles.inputWrapper}>
            <Feather name="user" size={18} color={THEME.textSecondary} style={styles.inputIcon} />
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter full name" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 2, marginRight: 12 }]}>
            <InputLabel title="Mobile Number" required />
            <View style={styles.inputWrapper}>
              <Feather name="phone" size={18} color={THEME.textSecondary} style={styles.inputIcon} />
              <TextInput style={styles.input} value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
            <InputLabel title="Age" required />
            <View style={styles.inputWrapper}>
              <Feather name="calendar" size={18} color={THEME.textSecondary} style={styles.inputIcon} />
              <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" />
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1.2 }]}>
            <InputLabel title="Gender" required />
            <TouchableOpacity style={styles.inputWrapper} activeOpacity={0.7}>
              <Feather name="users" size={18} color={THEME.textSecondary} style={styles.inputIcon} />
              <Text style={[styles.input, { marginTop: 2 }]}>{gender}</Text>
              <Feather name="chevron-down" size={18} color={THEME.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <InputLabel title="Date of Birth" />
          <TouchableOpacity style={styles.inputWrapper} activeOpacity={0.7}>
            <Feather name="calendar" size={18} color={THEME.textSecondary} style={styles.inputIcon} />
            <Text style={[styles.input, { marginTop: 2 }]}>{dob}</Text>
            <Feather name="chevron-down" size={18} color={THEME.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── Section 2: Address ── */}
        <SectionHeader icon="map-pin" title="Address" />
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
            <InputLabel title="City" />
            <TouchableOpacity style={styles.inputWrapper} activeOpacity={0.7}>
              <Feather name="map-pin" size={18} color={THEME.textSecondary} style={styles.inputIcon} />
              <Text style={[styles.input, { marginTop: 2 }]}>{city}</Text>
              <Feather name="chevron-down" size={18} color={THEME.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <InputLabel title="Area / Locality" />
            <View style={styles.inputWrapper}>
              <Feather name="map" size={18} color={THEME.textSecondary} style={styles.inputIcon} />
              <TextInput style={styles.input} value={area} onChangeText={setArea} />
            </View>
          </View>
        </View>

        {/* ── Section 3: Select Tests ── */}
        <SectionHeader icon="activity" title="Select Tests" />
        <View style={[styles.inputWrapper, { marginBottom: 16 }]}>
          <Feather name="search" size={18} color={THEME.textSecondary} style={styles.inputIcon} />
          <TextInput style={styles.input} value={searchTest} onChangeText={setSearchTest} placeholder="Search Test" />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {AVAILABLE_TESTS.map(test => (
            <TouchableOpacity 
              key={test} 
              style={styles.availableChip}
              onPress={() => toggleTest(test)}
            >
              <Text style={styles.availableChipText}>{test}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.selectedTestsLabel}>Selected Tests: <Text style={{ color: THEME.primary }}>{selectedTests.length}</Text></Text>
        <View style={styles.selectedChipsContainer}>
          {selectedTests.map(test => (
            <TouchableOpacity key={test} style={styles.selectedChip} onPress={() => toggleTest(test)}>
              <Text style={styles.selectedChipText}>{test}</Text>
              <Feather name="x" size={14} color={THEME.primary} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Section 4: Booking Summary ── */}
        <SectionHeader icon="clipboard" title="Booking Summary" />
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Registration Fee</Text>
            <Text style={styles.summaryValue}>₹100</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Selected Tests Cost ({selectedTests.length})</Text>
            <Text style={styles.summaryValue}>₹1,500</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: THEME.success }]}>Discount</Text>
            <Text style={[styles.summaryValue, { color: THEME.success }]}>-₹100</Text>
          </View>
          
          <View style={styles.dashedLine} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹1,500</Text>
          </View>
        </View>

        {/* ── Section 5: Payment & Notes (Side-by-Side) ── */}
        <View style={styles.row}>
          {/* Payment Method Column */}
          <View style={[styles.halfColumn, { marginRight: 12 }]}>
            <SectionHeader icon="credit-card" title="Payment Method" />
            <View style={styles.radioGroup}>
              {['Cash', 'UPI', 'Card'].map(method => (
                <TouchableOpacity key={method} style={styles.radioRow} onPress={() => setPaymentMethod(method)}>
                  <View style={styles.radioOuter}>
                    {paymentMethod === method && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>{method}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Patient Notes Column */}
          <View style={styles.halfColumn}>
            <SectionHeader icon="file-text" title="Patient Notes (Optional)" />
            <View style={styles.notesBox}>
              <TextInput 
                style={styles.notesInput} 
                multiline 
                placeholder="Add notes for laboratory staff..."
                value={notes}
                onChangeText={setNotes}
                textAlignVertical="top"
                maxLength={200}
              />
              <Text style={styles.charCount}>{notes.length}/200</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 20 }} />

        {/* ── Footer Buttons ── */}
        <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8}>
          <Feather name="user-plus" size={18} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.primaryBtnText}>Register Patient</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8}>
          <Feather name="file-text" size={18} color={THEME.primary} style={{ marginRight: 8 }} />
          <Text style={styles.secondaryBtnText}>Save Draft</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bg },
  
  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { padding: 4, marginRight: 12 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: THEME.textPrimary },
  scanBtn: { padding: 4 },

  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  
  // Section Headers
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 24 },
  sectionIconBox: { width: 28, height: 28, borderRadius: 14, backgroundColor: THEME.primary, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: THEME.primary },

  // Inputs
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: THEME.textSecondary, marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: THEME.border, borderRadius: 12,
    paddingHorizontal: 12, height: 48, backgroundColor: THEME.bg,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: THEME.textPrimary, fontWeight: '500' },

  // Test Chips
  chipScroll: { marginBottom: 16, overflow: 'visible' },
  availableChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: THEME.primary,
    marginRight: 10, backgroundColor: THEME.bg
  },
  availableChipText: { fontSize: 13, color: THEME.textPrimary, fontWeight: '500' },
  
  selectedTestsLabel: { fontSize: 13, fontWeight: '700', color: THEME.textPrimary, marginBottom: 10 },
  selectedChipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  selectedChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: THEME.primaryLight, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, borderColor: '#CCFBF1'
  },
  selectedChipText: { fontSize: 13, color: THEME.primary, fontWeight: '600' },

  // Summary Box
  summaryBox: { marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: THEME.textPrimary, fontWeight: '500' },
  summaryValue: { fontSize: 14, color: THEME.textPrimary, fontWeight: '600' },
  dashedLine: { 
    height: 1, width: '100%', borderColor: THEME.border, 
    borderWidth: 1, borderStyle: 'dashed', marginVertical: 12 
  },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: THEME.primaryLight, padding: 12, borderRadius: 8
  },
  totalLabel: { fontSize: 15, fontWeight: '700', color: THEME.primary },
  totalValue: { fontSize: 20, fontWeight: '800', color: THEME.primary },

  // Side-by-Side Bottom Section
  halfColumn: { flex: 1 },
  
  // Radio Buttons
  radioGroup: { marginTop: -8 },
  radioRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: THEME.primary,
    alignItems: 'center', justifyContent: 'center', marginRight: 10
  },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: THEME.primary },
  radioText: { fontSize: 14, color: THEME.textPrimary, fontWeight: '500' },

  // Notes
  notesBox: {
    borderWidth: 1, borderColor: THEME.border, borderRadius: 12,
    padding: 12, backgroundColor: THEME.screenBg, height: 90, marginTop: -8
  },
  notesInput: { flex: 1, fontSize: 13, color: THEME.textPrimary },
  charCount: { fontSize: 10, color: THEME.textSecondary, textAlign: 'right', marginTop: 4 },

  // Buttons
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: THEME.primary, height: 54, borderRadius: 12, marginBottom: 12,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: THEME.bg, height: 54, borderRadius: 12,
    borderWidth: 1.5, borderColor: THEME.primary,
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '700', color: THEME.primary },
});