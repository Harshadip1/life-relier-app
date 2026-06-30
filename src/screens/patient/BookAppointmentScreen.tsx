import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Modal, SafeAreaView, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

// ─── Theme ───
const THEME = {
  primary: '#0F766E', // Deep Teal
  primaryLight: '#F0FDFA',
  bg: '#FFFFFF',
  screenBg: '#F8FAFC',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
};

// ─── Dummy Data (From your /GetDoctorDropdown & /GetAllDrSlot APIs) ───
const DOCTORS = [
  { id: 1, name: 'Dr. Rahul Sharma', spec: 'Cardiologist', exp: '12 Yrs Exp', rating: 4.8, fee: 800, avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=150&auto=format&fit=crop' },
  { id: 2, name: 'Dr. Priya Patil', spec: 'General Physician', exp: '8 Yrs Exp', rating: 4.9, fee: 500, avatar: 'https://images.unsplash.com/photo-1594824416928-8ae8acae7446?q=80&w=150&auto=format&fit=crop' },
  { id: 3, name: 'Dr. Arjun Verma', spec: 'Orthopedic', exp: '15 Yrs Exp', rating: 4.7, fee: 1000, avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=150&auto=format&fit=crop' },
];

const DATES = [
  { id: 1, day: 'Mon', date: '15', full: '15 May 2026' },
  { id: 2, day: 'Tue', date: '16', full: '16 May 2026' },
  { id: 3, day: 'Wed', date: '17', full: '17 May 2026' },
  { id: 4, day: 'Thu', date: '18', full: '18 May 2026' },
  { id: 5, day: 'Fri', date: '19', full: '19 May 2026' },
];

const SLOTS = [
  { time: '09:00 AM', available: true },
  { time: '09:30 AM', available: true },
  { time: '10:00 AM', available: false },
  { time: '10:30 AM', available: true },
  { time: '11:00 AM', available: true },
  { time: '11:30 AM', available: false },
  { time: '04:00 PM', available: true },
  { time: '04:30 PM', available: true },
  { time: '05:00 PM', available: true },
];

export default function BookAppointmentScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  
  // ─── Multi-Step Form State ───
  const [step, setStep] = useState(1);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<any>(DATES[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // ─── Handlers ───
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigation.goBack();
  };

  const handleNext = () => {
    if (step === 1 && selectedDoc) setStep(2);
    else if (step === 2 && selectedSlot) setStep(3);
  };

  const handleConfirmBooking = () => {
    // This is where you will call /api/DrAppointment/SaveAppointment
    setShowSuccess(true);
  };

  const finishBooking = () => {
    setShowSuccess(false);
    navigation.navigate('MyBookings'); // Navigate to the Bookings Tab
  };

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 10) }]}>
      
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Feather name="arrow-left" size={24} color={THEME.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === 1 ? 'Select Doctor' : step === 2 ? 'Select Slot' : 'Confirm Booking'}
        </Text>
        <View style={{ width: 32 }} /> {/* Spacer for alignment */}
      </View>

      {/* ── Progress Bar ── */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${(step / 3) * 100}%` }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ====================================================
            STEP 1: SELECT DOCTOR
        ==================================================== */}
        {step === 1 && (
          <View>
            <Text style={styles.sectionTitle}>Available Specialists</Text>
            {DOCTORS.map(doc => (
              <TouchableOpacity 
                key={doc.id} 
                style={[styles.docCard, selectedDoc?.id === doc.id && styles.docCardActive]}
                activeOpacity={0.8}
                onPress={() => setSelectedDoc(doc)}
              >
                <Image source={{ uri: doc.avatar }} style={styles.docAvatar} />
                <View style={styles.docInfo}>
                  <Text style={styles.docName}>{doc.name}</Text>
                  <Text style={styles.docSpec}>{doc.spec}</Text>
                  
                  <View style={styles.docMetaRow}>
                    <View style={styles.docMetaItem}>
                      <Feather name="briefcase" size={12} color={THEME.primary} />
                      <Text style={styles.docMetaText}>{doc.exp}</Text>
                    </View>
                    <View style={styles.docMetaItem}>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text style={styles.docMetaText}>{doc.rating}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.feeContainer}>
                  <Text style={styles.feeLabel}>Fees</Text>
                  <Text style={styles.feeAmount}>₹{doc.fee}</Text>
                  <View style={[styles.radioOuter, selectedDoc?.id === doc.id && styles.radioOuterActive]}>
                    {selectedDoc?.id === doc.id && <View style={styles.radioInner} />}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ====================================================
            STEP 2: SELECT DATE & TIME SLOT
        ==================================================== */}
        {step === 2 && selectedDoc && (
          <View>
            {/* Selected Doctor Summary */}
            <View style={styles.selectedDocHeader}>
              <Image source={{ uri: selectedDoc.avatar }} style={styles.smallAvatar} />
              <View>
                <Text style={styles.docName}>{selectedDoc.name}</Text>
                <Text style={styles.docSpec}>{selectedDoc.spec}</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              {DATES.map(item => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.dateCard, selectedDate.id === item.id && styles.dateCardActive]}
                  onPress={() => setSelectedDate(item)}
                >
                  <Text style={[styles.dateDay, selectedDate.id === item.id && styles.textWhite]}>{item.day}</Text>
                  <Text style={[styles.dateNum, selectedDate.id === item.id && styles.textWhite]}>{item.date}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Available Slots</Text>
            <View style={styles.slotGrid}>
              {SLOTS.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.slotBtn,
                    !slot.available && styles.slotBtnDisabled,
                    selectedSlot === slot.time && styles.slotBtnActive
                  ]}
                  disabled={!slot.available}
                  onPress={() => setSelectedSlot(slot.time)}
                >
                  <Text style={[
                    styles.slotText,
                    !slot.available && styles.slotTextDisabled,
                    selectedSlot === slot.time && styles.textWhite
                  ]}>
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ====================================================
            STEP 3: CONFIRM BOOKING SUMMARY
        ==================================================== */}
        {step === 3 && selectedDoc && (
          <View>
            <Text style={styles.sectionTitle}>Booking Summary</Text>
            
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Feather name="user" size={18} color={THEME.textSecondary} />
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryLabel}>Doctor</Text>
                  <Text style={styles.summaryValue}>{selectedDoc.name} ({selectedDoc.spec})</Text>
                </View>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.summaryRow}>
                <Feather name="calendar" size={18} color={THEME.textSecondary} />
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryLabel}>Date & Time</Text>
                  <Text style={styles.summaryValue}>{selectedDate.full} at {selectedSlot}</Text>
                </View>
              </View>

              <View style={styles.divider} />
              
              <View style={styles.summaryRow}>
                <Feather name="map-pin" size={18} color={THEME.textSecondary} />
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryLabel}>Clinic Address</Text>
                  <Text style={styles.summaryValue}>CityCare Polyclinic, Andheri West, Mumbai</Text>
                </View>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Payment Details</Text>
            <View style={styles.paymentCard}>
              <View style={styles.payRow}>
                <Text style={styles.payLabel}>Consultation Fee</Text>
                <Text style={styles.payValue}>₹{selectedDoc.fee}</Text>
              </View>
              <View style={styles.payRow}>
                <Text style={styles.payLabel}>Booking Charges</Text>
                <Text style={styles.payValue}>₹50</Text>
              </View>
              <View style={[styles.payRow, { borderTopWidth: 1, borderTopColor: THEME.border, paddingTop: 12, marginTop: 12 }]}>
                <Text style={styles.payTotalLabel}>Total Payable</Text>
                <Text style={styles.payTotalValue}>₹{selectedDoc.fee + 50}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Bottom Action Bar ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.primaryBtn, (step === 1 && !selectedDoc) || (step === 2 && !selectedSlot) ? styles.btnDisabled : null]} 
          disabled={(step === 1 && !selectedDoc) || (step === 2 && !selectedSlot)}
          onPress={step === 3 ? handleConfirmBooking : handleNext}
        >
          <Text style={styles.primaryBtnText}>
            {step === 1 ? 'Continue to Slots' : step === 2 ? 'Review Booking' : 'Confirm & Book Appointment'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── SUCCESS MODAL ── */}
      <Modal visible={showSuccess} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.successSheet}>
            <View style={styles.successIconBox}>
              <Feather name="check" size={40} color={THEME.success} />
            </View>
            <Text style={styles.successTitle}>Booking Confirmed!</Text>
            <Text style={styles.successSubtitle}>
              Your appointment with {selectedDoc?.name} has been successfully scheduled for {selectedDate?.full} at {selectedSlot}.
            </Text>

            <TouchableOpacity style={[styles.primaryBtn, { width: '100%', marginTop: 24 }]} onPress={finishBooking}>
              <Text style={styles.primaryBtnText}>View My Bookings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.screenBg },
  
  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: THEME.textPrimary },
  
  // Progress Bar
  progressContainer: { height: 4, backgroundColor: '#E2E8F0', width: '100%' },
  progressBar: { height: '100%', backgroundColor: THEME.primary },

  scrollContent: { paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: THEME.textPrimary, marginBottom: 16 },

  // Doctor Cards
  docCard: { flexDirection: 'row', backgroundColor: THEME.bg, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: THEME.border, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
  docCardActive: { borderColor: THEME.primary, borderWidth: 1.5, backgroundColor: THEME.primaryLight },
  docAvatar: { width: 64, height: 64, borderRadius: 32, marginRight: 16 },
  docInfo: { flex: 1 },
  docName: { fontSize: 16, fontWeight: '700', color: THEME.textPrimary, marginBottom: 4 },
  docSpec: { fontSize: 13, color: THEME.textSecondary, marginBottom: 8 },
  docMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  docMetaItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  docMetaText: { fontSize: 11, fontWeight: '600', color: THEME.textPrimary, marginLeft: 4 },
  
  feeContainer: { alignItems: 'flex-end', justifyContent: 'space-between' },
  feeLabel: { fontSize: 11, color: THEME.textSecondary },
  feeAmount: { fontSize: 16, fontWeight: '800', color: THEME.primary, marginBottom: 12 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: THEME.border, alignItems: 'center', justifyContent: 'center' },
  radioOuterActive: { borderColor: THEME.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: THEME.primary },

  // Step 2 Styles
  selectedDocHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.bg, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: THEME.border },
  smallAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  
  dateScroll: { overflow: 'visible' },
  dateCard: { width: 64, height: 80, backgroundColor: THEME.bg, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: THEME.border },
  dateCardActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  dateDay: { fontSize: 13, color: THEME.textSecondary, marginBottom: 4, fontWeight: '500' },
  dateNum: { fontSize: 20, fontWeight: '700', color: THEME.textPrimary },
  textWhite: { color: '#FFF' },

  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  slotBtn: { width: '30%', backgroundColor: THEME.bg, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: THEME.border, alignItems: 'center' },
  slotBtnActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  slotBtnDisabled: { backgroundColor: '#F1F5F9', borderColor: '#F1F5F9' },
  slotText: { fontSize: 13, fontWeight: '600', color: THEME.textPrimary },
  slotTextDisabled: { color: '#94A3B8' },

  // Step 3 Styles
  summaryCard: { backgroundColor: THEME.bg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: THEME.border },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryInfo: { marginLeft: 16, flex: 1 },
  summaryLabel: { fontSize: 12, color: THEME.textSecondary, marginBottom: 2 },
  summaryValue: { fontSize: 14, fontWeight: '600', color: THEME.textPrimary },
  divider: { height: 1, backgroundColor: THEME.border, marginVertical: 16 },

  paymentCard: { backgroundColor: THEME.bg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: THEME.border },
  payRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  payLabel: { fontSize: 14, color: THEME.textSecondary },
  payValue: { fontSize: 14, fontWeight: '600', color: THEME.textPrimary },
  payTotalLabel: { fontSize: 16, fontWeight: '800', color: THEME.textPrimary },
  payTotalValue: { fontSize: 20, fontWeight: '800', color: THEME.primary },

  // Bottom Bar
  bottomBar: { backgroundColor: THEME.bg, paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: THEME.border, paddingBottom: Platform.OS === 'ios' ? 30 : 16 },
  primaryBtn: { backgroundColor: THEME.primary, height: 54, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  btnDisabled: { backgroundColor: '#94A3B8' },

  // Success Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  successSheet: { backgroundColor: THEME.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, alignItems: 'center', paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  successIconBox: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successTitle: { fontSize: 22, fontWeight: '800', color: THEME.textPrimary, marginBottom: 8 },
  successSubtitle: { fontSize: 14, color: THEME.textSecondary, textAlign: 'center', lineHeight: 20 },
});