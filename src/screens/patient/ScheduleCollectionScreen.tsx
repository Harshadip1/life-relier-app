import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Using exact colors from your design
const THEME = {
  primary: '#0D9488',
  primaryLight: '#F0FDFA',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  bg: '#FFFFFF',
  screenBg: '#F8FAFC',
};

// ─── Mock Data ───────────────────────────────────────────────────────────────

const DATES = [
  { id: '15', date: '15', month: 'Jun', day: 'Sun' },
  { id: '16', date: '16', month: 'Jun', day: 'Mon' },
  { id: '17', date: '17', month: 'Jun', day: 'Tue' },
  { id: '18', date: '18', month: 'Jun', day: 'Wed' },
  { id: '19', date: '19', month: 'Jun', day: 'Thu' },
  { id: '20', date: '20', month: 'Jun', day: 'Fri' },
  { id: '21', date: '21', month: 'Jun', day: 'Sat' },
];

const TIME_SLOTS = [
  '08:00 AM - 09:00 AM',
  '08:30 AM - 09:30 AM',
  '09:00 AM - 10:00 AM',
  '09:30 AM - 10:30 AM',
  '10:00 AM - 11:00 AM',
];

export default function ScheduleCollectionScreen({ navigation, route }: any) {
  // In a real app, you would get these from route.params
  const selectedTests = route.params?.tests || [];
  const totalAmount = 1900;
  const collectionType = 'Home Collection';

  // State for selections
  const [selectedDate, setSelectedDate] = useState('16');
  const [selectedTime, setSelectedTime] = useState('08:30 AM - 09:30 AM');

  return (
    <SafeAreaView style={styles.root}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={THEME.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Collection</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Booking Summary Card ── */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          
          <View style={styles.summaryRow}>
            {/* Column 1: Tests */}
            <View style={styles.summaryCol1}>
            <Text style={styles.summaryLabel}>Selected Tests ({selectedTests.length})</Text>
            {selectedTests.map((item: any, index: number) => {
                // If 'item' is an object, grab its label. If it's already text, just use the text!
                const displayName = typeof item === 'string' ? item : item.label;

                return (
                <View key={index} style={styles.testItem}>
                    <MaterialCommunityIcons name="check-circle" size={14} color={THEME.primary} />
                    <Text style={styles.testName}>{displayName}</Text>
                </View>
                );
            })}
            </View>

            {/* Column 2: Total */}
            <View style={styles.summaryCol2}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.summaryAmount}>₹{totalAmount}</Text>
            </View>

            {/* Column 3: Type */}
            <View style={styles.summaryCol3}>
              <Text style={styles.summaryLabel}>Collection Type</Text>
              <View style={styles.typeItem}>
                <Feather name="home" size={14} color={THEME.textSecondary} />
                <Text style={styles.typeText}>{collectionType}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Select Date ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <Feather name="calendar" size={18} color={THEME.textSecondary} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
          {DATES.map((item) => {
            const isSelected = selectedDate === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                onPress={() => setSelectedDate(item.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dateNumber, isSelected && styles.textWhite]}>{item.date}</Text>
                <Text style={[styles.dateMonth, isSelected && styles.textWhite]}>{item.month}</Text>
                <Text style={[styles.dateDay, isSelected && styles.textWhite]}>{item.day}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Select Time ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <Feather name="clock" size={18} color={THEME.textSecondary} />
        </View>

        <View style={styles.timeContainer}>
          {/* Fake Dropdown Header */}
          <View style={styles.timeDropdownHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Feather name="clock" size={16} color={THEME.textSecondary} />
              <Text style={styles.timeDropdownText}>Select a time slot</Text>
            </View>
            <Feather name="chevron-down" size={20} color={THEME.textSecondary} />
          </View>

          {/* Time Slots List */}
          <View style={styles.timeList}>
            {TIME_SLOTS.map((time, index) => {
              const isSelected = selectedTime === time;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.timeSlotRow, isSelected && styles.timeSlotRowSelected]}
                  onPress={() => setSelectedTime(time)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.timeSlotText, isSelected && styles.timeSlotTextSelected]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Collection Address ── */}
        <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Collection Address</Text>
        <View style={styles.addressCard}>
          <View style={styles.addressIconBox}>
            <Feather name="map-pin" size={20} color={THEME.primary} />
          </View>
          <View style={styles.addressInfo}>
            <Text style={styles.addressTitle}>Home Address</Text>
            <Text style={styles.addressText}>House No 123,{'\n'}Main Road,{'\n'}Pune - 411001</Text>
          </View>
          <TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.changeAddressText}>Change Address</Text>
              <Feather name="chevron-right" size={16} color={THEME.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Assigned Collection Info ── */}
        <Text style={[styles.sectionTitle, { marginBottom: 12, marginTop: 10 }]}>Assigned Collection Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoIconCircle}>
            <Feather name="info" size={16} color={THEME.primary} />
          </View>
          <Text style={styles.infoText}>
            A professional phlebotomist will be assigned to you once your booking is confirmed.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Total Payable</Text>
          <Text style={styles.footerAmount}>₹{totalAmount}</Text>
        </View>
        <TouchableOpacity
          style={styles.continueBtn}
          activeOpacity={0.88}
          onPress={() => alert('Proceeding to Payment!')}
        >
          <Text style={styles.continueBtnText}>Continue to Payment</Text>
          <Feather name="arrow-right" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.screenBg },

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

  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },

  // Booking Summary Card
  summaryCard: {
    backgroundColor: THEME.bg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.borderLight,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: THEME.primary, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryCol1: { flex: 1.5, paddingRight: 8 },
  summaryCol2: { flex: 1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: THEME.borderLight, paddingHorizontal: 12 },
  summaryCol3: { flex: 1.2, paddingLeft: 12 },
  summaryLabel: { fontSize: 10, color: THEME.textSecondary, marginBottom: 8 },
  testItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
  testName: { fontSize: 12, color: THEME.textSecondary },
  summaryAmount: { fontSize: 20, fontWeight: '700', color: THEME.primary },
  typeItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  typeText: { fontSize: 11, color: THEME.textSecondary },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: THEME.textPrimary },

  // Date Scroll
  dateScroll: { marginBottom: 24, overflow: 'visible' },
  dateCard: {
    width: 60,
    height: 85,
    backgroundColor: THEME.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  dateCardSelected: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  dateNumber: { fontSize: 16, fontWeight: '700', color: THEME.textPrimary, marginBottom: 2 },
  dateMonth: { fontSize: 11, color: THEME.textSecondary, marginBottom: 2 },
  dateDay: { fontSize: 11, color: THEME.textSecondary },
  textWhite: { color: '#FFF' },

  // Time Container
  timeContainer: {
    backgroundColor: THEME.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.borderLight,
    marginBottom: 24,
    overflow: 'hidden',
  },
  timeDropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
    backgroundColor: THEME.bg,
  },
  timeDropdownText: { fontSize: 14, color: THEME.textSecondary },
  timeList: { paddingVertical: 8 },
  timeSlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  timeSlotRowSelected: { backgroundColor: THEME.primaryLight },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioOuterSelected: { borderColor: THEME.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: THEME.primary },
  timeSlotText: { fontSize: 13, color: THEME.textSecondary },
  timeSlotTextSelected: { color: THEME.primary, fontWeight: '600' },

  // Address Card
  addressCard: {
    flexDirection: 'row',
    backgroundColor: THEME.bg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.borderLight,
    alignItems: 'center',
    marginBottom: 20,
  },
  addressIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addressInfo: { flex: 1 },
  addressTitle: { fontSize: 13, fontWeight: '700', color: THEME.primary, marginBottom: 4 },
  addressText: { fontSize: 11, color: THEME.textSecondary, lineHeight: 16 },
  changeAddressText: { fontSize: 12, fontWeight: '600', color: THEME.primary, marginRight: 2 },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: THEME.bg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.borderLight,
    alignItems: 'center',
  },
  infoIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoText: { flex: 1, fontSize: 11, color: THEME.textSecondary, lineHeight: 16 },

  // Footer
  footer: {
    flexDirection: 'row',
    backgroundColor: THEME.bg,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: THEME.borderLight,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: { fontSize: 11, color: THEME.textSecondary, marginBottom: 2 },
  footerAmount: { fontSize: 24, fontWeight: '700', color: THEME.primary },
  continueBtn: {
    backgroundColor: THEME.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 50,
    gap: 8,
  },
  continueBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});