import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const THEME = {
  primary: '#0D9488',
  bg: '#FFFFFF',
  screenBg: '#F8FAFC',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
};

export default function ScheduleCollectionScreen({ route, navigation }: any) {
  // Grab the data passed from the Bookings screen
  const { tests = [], total = 0, centerName = 'Select a Center' } = route.params || {};

  // ─── Date & Time States ───
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Controls whether the native popups are visible
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // ─── Handlers ───
  const onDateChange = (event: any, date?: Date) => {
    // On Android, we must manually hide the picker after selection
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const onTimeChange = (event: any, time?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (time) setSelectedDate(time);
  };

  // ─── Formatters for UI ───
  const formattedDate = selectedDate.toLocaleDateString('en-US', { 
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' 
  });

  const format12HourTime = (date: Date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minsStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minsStr} ${ampm}`;
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={THEME.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Test</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ── Summary Card ── */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Feather name="map-pin" size={16} color={THEME.primary} />
            <Text style={styles.summaryText}>{centerName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Feather name="activity" size={16} color={THEME.primary} />
            <Text style={styles.summaryText}>{tests.length} Test(s) Selected</Text>
          </View>
          <View style={[styles.summaryRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>₹{total}</Text>
          </View>
        </View>

        {/* ── Pickers Section ── */}
        <Text style={[styles.sectionTitle, { marginLeft: 4, marginTop: 10 }]}>Select Date & Time</Text>

        {/* Date Button */}
        <TouchableOpacity 
          style={styles.pickerButton} 
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}
        >
          <View style={styles.pickerIconBox}>
            <Feather name="calendar" size={20} color={THEME.primary} />
          </View>
          <View style={styles.pickerTextBox}>
            <Text style={styles.pickerLabel}>Test Date</Text>
            <Text style={styles.pickerValue}>{formattedDate}</Text>
          </View>
          <Feather name="chevron-down" size={20} color={THEME.textSecondary} />
        </TouchableOpacity>

        {/* Time Button */}
        <TouchableOpacity 
          style={styles.pickerButton} 
          onPress={() => setShowTimePicker(true)}
          activeOpacity={0.7}
        >
          <View style={styles.pickerIconBox}>
            <Feather name="clock" size={20} color={THEME.primary} />
          </View>
          <View style={styles.pickerTextBox}>
            <Text style={styles.pickerLabel}>Arrival Time</Text>
            <Text style={styles.pickerValue}>{format12HourTime(selectedDate)}</Text>
          </View>
          <Feather name="chevron-down" size={20} color={THEME.textSecondary} />
        </TouchableOpacity>

        {/* ── Hidden Native Pickers ── */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default" // Triggers the standard calendar popup
            onChange={onDateChange}
            minimumDate={new Date()} // Prevents selecting dates in the past
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="time"
            display="default" // Triggers the standard clock popup
            is24Hour={false}  // Forces the AM/PM 12-hour format!
            onChange={onTimeChange}
          />
        )}

      </ScrollView>

      {/* ── Bottom Confirm Button ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueBtn}
          activeOpacity={0.88}
          // Navigate to Payments or whatever your next screen is!
          onPress={() => navigation.navigate('Payments', { 
            total, 
            centerName, 
            date: formattedDate, 
            time: format12HourTime(selectedDate) 
          })}
        >
          <Text style={styles.continueBtnText}>Proceed to Payment</Text>
          <Feather name="arrow-right" size={20} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.screenBg },
  
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: THEME.bg,
  },
  backBtn: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: THEME.textPrimary },
  
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  
  sectionTitle: { fontSize: 16, fontWeight: '700', color: THEME.textPrimary, marginBottom: 12 },

  // Summary Card
  summaryCard: {
    backgroundColor: THEME.bg, borderRadius: 16, padding: 16, marginBottom: 24,
    borderWidth: 1, borderColor: THEME.border, elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  summaryText: { fontSize: 14, fontWeight: '500', color: THEME.textPrimary, marginLeft: 12 },
  totalLabel: { fontSize: 14, fontWeight: '700', color: THEME.textSecondary, flex: 1 },
  totalAmount: { fontSize: 18, fontWeight: '800', color: THEME.primary },

  // Picker Buttons
  pickerButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.bg,
    borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: THEME.border, elevation: 1,
  },
  pickerIconBox: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: '#F0FDFA',
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  pickerTextBox: { flex: 1 },
  pickerLabel: { fontSize: 12, color: THEME.textSecondary, marginBottom: 4 },
  pickerValue: { fontSize: 15, fontWeight: '600', color: THEME.textPrimary },

  // Footer
  footer: { backgroundColor: THEME.bg, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  continueBtn: {
    backgroundColor: THEME.primary, borderRadius: 12, height: 54,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  continueBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});