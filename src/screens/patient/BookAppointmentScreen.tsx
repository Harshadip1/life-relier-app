import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import {
  getDoctorDropdown,
  getAllSlots,
  saveAppointment,
  DoctorDropdownItem,
  DrSlotRecord,
} from '../../services/doctorScheduleService';
import { useAuth } from '../../context/AuthContext';

const THEME = {
  primary:      '#0F766E',
  primaryLight: '#F0FDFA',
  bg:           '#FFFFFF',
  screenBg:     '#F8FAFC',
  textPrimary:  '#0F172A',
  textSecondary:'#64748B',
  border:       '#E2E8F0',
  success:      '#10B981',
};

function getNextDates(count = 5) {
  const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const base   = new Date(); base.setHours(0,0,0,0);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return {
      id:   i + 1,
      day:  days[d.getDay()],
      date: String(d.getDate()),
      full: `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()}`,
      iso:  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
    };
  });
}

export default function BookAppointmentScreen({ navigation }: any) {
  const insets   = useSafeAreaInsets();
  const { user } = useAuth();
  const DATES    = getNextDates(5);

  const [step, setStep]                   = useState(1);
  const [selectedDoc, setSelectedDoc]     = useState<DoctorDropdownItem | null>(null);
  const [selectedDate, setSelectedDate]   = useState(DATES[0]);
  const [selectedSlot, setSelectedSlot]   = useState<string | null>(null);
  const [showSuccess, setShowSuccess]     = useState(false);
  const [booking, setBooking]             = useState(false);

  const [doctors, setDoctors]     = useState<DoctorDropdownItem[]>([]);
  const [slots, setSlots]         = useState<DrSlotRecord[]>([]);
  const [loadingDr, setLoadingDr] = useState(false);
  const [loadingSl, setLoadingSl] = useState(false);

  useEffect(() => {
    setLoadingDr(true);
    getDoctorDropdown(1)
      .then(setDoctors)
      .catch(() => {})
      .finally(() => setLoadingDr(false));
  }, []);

  useEffect(() => {
    if (step !== 2 || !selectedDoc) return;
    setLoadingSl(true);
    getAllSlots(1)
      .then(all => setSlots(all.filter(s => s.DrId === selectedDoc.Id)))
      .catch(() => {})
      .finally(() => setLoadingSl(false));
  }, [step, selectedDoc]);

  // Generate time grid from slot duration
  const slotMins = slots[0]?.SlotMins ?? 30;
  const timeSlots: string[] = [];
  for (let h = 8; h < 20; h++) {
    for (let m = 0; m < 60; m += slotMins) {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12  = h % 12 || 12;
      timeSlots.push(`${String(h12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ampm}`);
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigation.goBack();
  };

  const handleNext = () => {
    if (step === 1 && selectedDoc) setStep(2);
    else if (step === 2 && selectedSlot) setStep(3);
  };

  const handleConfirmBooking = async () => {
    if (!selectedDoc || !selectedSlot) return;
    setBooking(true);
    try {
      await saveAppointment({
        DrId:            selectedDoc.Id,
        Name:            user?.name ?? '',
        FirstName:       (user?.name ?? '').split(' ')[0],
        LastName:        (user?.name ?? '').split(' ').slice(1).join(' '),
        Mobile:          user?.phone ?? '',
        AppointmentDate: selectedDate.iso,
        Slot:            selectedSlot,
        Address:         '',
        GenderId:        1,
        InitialId:       1,
        BirthDate:       '1990-01-01',
        BranchId:        1,
        CreatedBy:       user?.name ?? 'patient',
      });
      setShowSuccess(true);
    } catch (err: any) {
      Alert.alert('Booking Failed', err?.message ?? 'Could not book appointment.');
    } finally {
      setBooking(false);
    }
  };

  const finishBooking = () => {
    setShowSuccess(false);
    navigation.goBack();
  };

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 10) }]}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={THEME.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === 1 ? 'Select Doctor' : step === 2 ? 'Pick a Slot' : 'Confirm Booking'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${(step / 3) * 100}%` }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── STEP 1: SELECT DOCTOR ── */}
        {step === 1 && (
          <View>
            <Text style={styles.sectionTitle}>Available Doctors</Text>

            {loadingDr ? (
              <View style={styles.centre}>
                <ActivityIndicator size="large" color={THEME.primary} />
                <Text style={styles.centreText}>Loading doctors…</Text>
              </View>
            ) : doctors.length === 0 ? (
              <View style={styles.centre}>
                <Feather name="alert-circle" size={40} color="#CBD5E1" />
                <Text style={styles.centreText}>No doctors available right now.</Text>
              </View>
            ) : (
              doctors.map(doc => (
                <TouchableOpacity
                  key={doc.Id}
                  style={[styles.docCard, selectedDoc?.Id === doc.Id && styles.docCardActive]}
                  onPress={() => setSelectedDoc(doc)}
                  activeOpacity={0.8}
                >
                  {/* Avatar placeholder */}
                  <View style={styles.docAvatarBox}>
                    <Feather name="user" size={28} color={THEME.primary} />
                  </View>

                  <View style={styles.docInfo}>
                    <Text style={styles.docName}>{doc.FullName}</Text>
                    <Text style={styles.docSpec}>Consultation Doctor</Text>
                    <View style={styles.docMetaRow}>
                      <View style={styles.docMetaItem}>
                        <Feather name="briefcase" size={12} color={THEME.primary} />
                        <Text style={styles.docMetaText}>Dr. ID {doc.Id}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.radioOuter}>
                    {selectedDoc?.Id === doc.Id && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* ── STEP 2: DATE & TIME ── */}
        {step === 2 && selectedDoc && (
          <View>
            {/* Selected doctor chip */}
            <View style={styles.selectedDocHeader}>
              <View style={styles.smallAvatarBox}>
                <Feather name="user" size={20} color={THEME.primary} />
              </View>
              <View>
                <Text style={styles.docName}>{selectedDoc.FullName}</Text>
                <Text style={styles.docSpec}>Consultation Doctor</Text>
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
                  <Text style={[styles.dateDay, selectedDate.id === item.id && styles.textWhite]}>
                    {item.day}
                  </Text>
                  <Text style={[styles.dateNum, selectedDate.id === item.id && styles.textWhite]}>
                    {item.date}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Available Slots</Text>
            {loadingSl ? (
              <ActivityIndicator color={THEME.primary} style={{ marginTop: 16 }} />
            ) : (
              <View style={styles.slotGrid}>
                {timeSlots.map((slot, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.slotBtn, selectedSlot === slot && styles.slotBtnActive]}
                    onPress={() => setSelectedSlot(slot)}
                  >
                    <Text style={[styles.slotText, selectedSlot === slot && styles.textWhite]}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── STEP 3: CONFIRM ── */}
        {step === 3 && selectedDoc && (
          <View>
            <Text style={styles.sectionTitle}>Booking Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Feather name="user" size={18} color={THEME.textSecondary} />
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryLabel}>Doctor</Text>
                  <Text style={styles.summaryValue}>{selectedDoc.FullName}</Text>
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
                  <Text style={styles.summaryLabel}>Location</Text>
                  <Text style={styles.summaryValue}>Life Relier Diagnostics</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom action bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            ((step === 1 && !selectedDoc) || (step === 2 && !selectedSlot) || booking)
              && styles.btnDisabled,
          ]}
          disabled={(step === 1 && !selectedDoc) || (step === 2 && !selectedSlot) || booking}
          onPress={step === 3 ? handleConfirmBooking : handleNext}
        >
          {booking
            ? <ActivityIndicator color="#FFF" />
            : <Text style={styles.primaryBtnText}>
                {step === 1 ? 'Continue' : step === 2 ? 'Review Booking' : 'Confirm & Book'}
              </Text>}
        </TouchableOpacity>
      </View>

      {/* Success modal */}
      <Modal visible={showSuccess} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.successSheet}>
            <View style={styles.successIconBox}>
              <Feather name="check" size={40} color={THEME.success} />
            </View>
            <Text style={styles.successTitle}>Booking Confirmed!</Text>
            <Text style={styles.successSubtitle}>
              Your appointment with {selectedDoc?.FullName} is scheduled for{' '}
              {selectedDate?.full} at {selectedSlot}.
            </Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { width: '100%', marginTop: 24 }]}
              onPress={finishBooking}
            >
              <Text style={styles.primaryBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: THEME.screenBg },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  backBtn:     { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: THEME.textPrimary },

  progressContainer: { height: 4, backgroundColor: '#E2E8F0' },
  progressBar:       { height: '100%', backgroundColor: THEME.primary },

  scrollContent: { paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle:  { fontSize: 16, fontWeight: '700', color: THEME.textPrimary, marginBottom: 16 },

  centre:     { alignItems: 'center', paddingVertical: 40 },
  centreText: { fontSize: 14, color: THEME.textSecondary, marginTop: 12 },

  // Doctor card
  docCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.bg, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: THEME.border, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
  docCardActive:{ borderColor: THEME.primary, borderWidth: 1.5, backgroundColor: THEME.primaryLight },
  docAvatarBox: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F0FDFA', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  docInfo:      { flex: 1 },
  docName:      { fontSize: 15, fontWeight: '700', color: THEME.textPrimary, marginBottom: 2 },
  docSpec:      { fontSize: 12, color: THEME.textSecondary, marginBottom: 6 },
  docMetaRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  docMetaItem:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  docMetaText:  { fontSize: 11, fontWeight: '600', color: THEME.textPrimary, marginLeft: 4 },
  radioOuter:   { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: THEME.border, alignItems: 'center', justifyContent: 'center' },
  radioInner:   { width: 10, height: 10, borderRadius: 5, backgroundColor: THEME.primary },

  // Step 2
  selectedDocHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.bg, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: THEME.border },
  smallAvatarBox:    { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0FDFA', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  dateScroll:        { overflow: 'visible' },
  dateCard:          { width: 64, height: 78, backgroundColor: THEME.bg, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 10, borderWidth: 1, borderColor: THEME.border },
  dateCardActive:    { backgroundColor: THEME.primary, borderColor: THEME.primary },
  dateDay:           { fontSize: 12, color: THEME.textSecondary, marginBottom: 4, fontWeight: '500' },
  dateNum:           { fontSize: 20, fontWeight: '700', color: THEME.textPrimary },
  textWhite:         { color: '#FFF' },
  slotGrid:          { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotBtn:           { width: '30%', backgroundColor: THEME.bg, paddingVertical: 11, borderRadius: 10, borderWidth: 1, borderColor: THEME.border, alignItems: 'center' },
  slotBtnActive:     { backgroundColor: THEME.primary, borderColor: THEME.primary },
  slotText:          { fontSize: 12, fontWeight: '600', color: THEME.textPrimary },

  // Step 3
  summaryCard:  { backgroundColor: THEME.bg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: THEME.border },
  summaryRow:   { flexDirection: 'row', alignItems: 'center' },
  summaryInfo:  { marginLeft: 14, flex: 1 },
  summaryLabel: { fontSize: 12, color: THEME.textSecondary, marginBottom: 2 },
  summaryValue: { fontSize: 14, fontWeight: '600', color: THEME.textPrimary },
  divider:      { height: 1, backgroundColor: THEME.border, marginVertical: 14 },

  // Bottom bar
  bottomBar:      { backgroundColor: THEME.bg, paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: THEME.border, paddingBottom: Platform.OS === 'ios' ? 30 : 14 },
  primaryBtn:     { backgroundColor: THEME.primary, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  btnDisabled:    { backgroundColor: '#94A3B8' },

  // Modal
  modalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  successSheet:  { backgroundColor: THEME.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, alignItems: 'center', paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  successIconBox:{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successTitle:  { fontSize: 22, fontWeight: '800', color: THEME.textPrimary, marginBottom: 8 },
  successSubtitle:{ fontSize: 14, color: THEME.textSecondary, textAlign: 'center', lineHeight: 22 },
});
