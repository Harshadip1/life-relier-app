import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, Modal, Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const THEME = {
  primary: '#4F46E5', // Admin Indigo
  primaryLight: '#EEF2FF',
  bg: '#FFFFFF',
  screenBg: '#F8FAFC',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
};

const DUMMY_PATIENTS = [
  { id: 'PT123456', name: 'Rahul Sharma', phone: '9876543210', gender: 'Male', age: 32, avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop' },
  { id: 'PT123457', name: 'Priya Patil', phone: '9876512345', gender: 'Female', age: 28, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop' },
];

const DOCTORS = [
  { id: 1, name: 'Dr. Rahul Sharma', spec: 'Cardiologist', fee: 800 },
  { id: 2, name: 'Dr. Priya Patil', spec: 'General Physician', fee: 500 },
];

const SLOTS = [
  { time: '09:00 AM', available: true },
  { time: '09:30 AM', available: true },
  { time: '10:00 AM', available: false },
  { time: '10:30 AM', available: true },
];

export default function AdminBookAppointmentScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  
  // States
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleNext = () => {
    if (step === 1 && selectedPatient) setStep(2);
    else if (step === 2 && selectedDoc && selectedSlot) setStep(3);
  };

  const handleBook = () => {
    setShowSuccess(true);
  };

  const finishBooking = () => {
    setShowSuccess(false);
    navigation.navigate('DashboardMain');
  };

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={THEME.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === 1 ? 'Select Patient' : step === 2 ? 'Doctor & Slot' : 'Collect Payment'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${(step / 3) * 100}%` }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ====================================================
            STEP 1: SELECT PATIENT
        ==================================================== */}
        {step === 1 && (
          <View>
            <View style={styles.searchBar}>
              <Feather name="search" size={20} color={THEME.textSecondary} style={{ marginRight: 10 }} />
              <TextInput style={styles.searchInput} placeholder="Search patient by mobile or name..." value={search} onChangeText={setSearch} />
            </View>

            <TouchableOpacity style={styles.newPatientBtn} onPress={() => navigation.navigate('NewRegistration')}>
              <Feather name="user-plus" size={18} color={THEME.primary} style={{ marginRight: 8 }} />
              <Text style={styles.newPatientBtnText}>Register New Patient</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Recent Patients</Text>
            {DUMMY_PATIENTS.map(patient => (
              <TouchableOpacity 
                key={patient.id} 
                style={[styles.patientCard, selectedPatient?.id === patient.id && styles.patientCardActive]}
                onPress={() => setSelectedPatient(patient)}
              >
                <Image source={{ uri: patient.avatar }} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.patientName}>{patient.name}</Text>
                  <Text style={styles.patientSub}>{patient.age} Yrs • {patient.gender}</Text>
                  <Text style={styles.patientId}>PID: {patient.id} | {patient.phone}</Text>
                </View>
                <View style={[styles.radioOuter, selectedPatient?.id === patient.id && styles.radioOuterActive]}>
                  {selectedPatient?.id === patient.id && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ====================================================
            STEP 2: DOCTOR & SLOT
        ==================================================== */}
        {step === 2 && (
          <View>
            <Text style={styles.sectionTitle}>Select Doctor</Text>
            {DOCTORS.map(doc => (
              <TouchableOpacity 
                key={doc.id} 
                style={[styles.docCard, selectedDoc?.id === doc.id && styles.docCardActive]}
                onPress={() => setSelectedDoc(doc)}
              >
                <View style={styles.docIconBox}><MaterialCommunityIcons name="stethoscope" size={24} color={selectedDoc?.id === doc.id ? THEME.primary : THEME.textSecondary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.docName}>{doc.name}</Text>
                  <Text style={styles.docSpec}>{doc.spec}</Text>
                </View>
                <Text style={styles.docFee}>₹{doc.fee}</Text>
              </TouchableOpacity>
            ))}

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Available Slots (Today)</Text>
            <View style={styles.slotGrid}>
              {SLOTS.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.slotBtn, !slot.available && styles.slotBtnDisabled, selectedSlot === slot.time && styles.slotBtnActive]}
                  disabled={!slot.available}
                  onPress={() => setSelectedSlot(slot.time)}
                >
                  <Text style={[styles.slotText, !slot.available && styles.slotTextDisabled, selectedSlot === slot.time && styles.textWhite]}>
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ====================================================
            STEP 3: SUMMARY & PAYMENT
        ==================================================== */}
        {step === 3 && selectedPatient && selectedDoc && (
          <View>
            <Text style={styles.sectionTitle}>Booking Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Patient</Text>
                <Text style={styles.summaryValue}>{selectedPatient.name}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Doctor</Text>
                <Text style={styles.summaryValue}>{selectedDoc.name}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Time</Text>
                <Text style={styles.summaryValue}>Today at {selectedSlot}</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Payment Collection</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Consultation Fee</Text>
                <Text style={styles.summaryValue}>₹{selectedDoc.fee}</Text>
              </View>
              <View style={[styles.divider, { borderStyle: 'dashed' }]} />
              <View style={styles.summaryRow}>
                <Text style={styles.payTotalLabel}>Amount to Collect</Text>
                <Text style={styles.payTotalValue}>₹{selectedDoc.fee}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Bottom Action Bar ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.primaryBtn, (step === 1 && !selectedPatient) || (step === 2 && (!selectedDoc || !selectedSlot)) ? styles.btnDisabled : null]}
          disabled={(step === 1 && !selectedPatient) || (step === 2 && (!selectedDoc || !selectedSlot))}
          onPress={step === 3 ? handleBook : handleNext}
        >
          <Text style={styles.primaryBtnText}>
            {step === 1 ? 'Continue to Slots' : step === 2 ? 'Proceed to Payment' : 'Confirm & Collect Cash'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── SUCCESS MODAL ── */}
      <Modal visible={showSuccess} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.successSheet}>
            <View style={styles.successIconBox}><Feather name="check" size={40} color={THEME.success} /></View>
            <Text style={styles.successTitle}>Walk-in Booked!</Text>
            <Text style={styles.successSubtitle}>Appointment generated for {selectedPatient?.name} with {selectedDoc?.name} at {selectedSlot}.</Text>

            <TouchableOpacity style={[styles.primaryBtn, { width: '100%', marginTop: 24 }]} onPress={finishBooking}>
              <Text style={styles.primaryBtnText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.screenBg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: THEME.textPrimary },
  
  progressContainer: { height: 4, backgroundColor: '#E2E8F0', width: '100%' },
  progressBar: { height: '100%', backgroundColor: THEME.primary },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: THEME.textPrimary, marginBottom: 16 },

  // Search & Add
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.bg, borderRadius: 12, borderWidth: 1, borderColor: THEME.border, paddingHorizontal: 16, height: 50, marginBottom: 16 },
  searchInput: { flex: 1, fontSize: 14, color: THEME.textPrimary },
  newPatientBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.primaryLight, height: 50, borderRadius: 12, borderWidth: 1, borderColor: '#C7D2FE', marginBottom: 24 },
  newPatientBtnText: { color: THEME.primary, fontSize: 14, fontWeight: '700' },

  // Patient Card
  patientCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.bg, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: THEME.border },
  patientCardActive: { borderColor: THEME.primary, borderWidth: 1.5, backgroundColor: THEME.primaryLight },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 14 },
  patientName: { fontSize: 15, fontWeight: '700', color: THEME.textPrimary },
  patientSub: { fontSize: 12, color: THEME.textSecondary, marginTop: 2 },
  patientId: { fontSize: 11, color: THEME.primary, fontWeight: '600', marginTop: 4 },
  
  // Radio
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: THEME.border, alignItems: 'center', justifyContent: 'center' },
  radioOuterActive: { borderColor: THEME.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: THEME.primary },

  // Doc Card
  docCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.bg, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: THEME.border },
  docCardActive: { borderColor: THEME.primary, borderWidth: 1.5, backgroundColor: THEME.primaryLight },
  docIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  docName: { fontSize: 15, fontWeight: '700', color: THEME.textPrimary },
  docSpec: { fontSize: 13, color: THEME.textSecondary, marginTop: 2 },
  docFee: { fontSize: 16, fontWeight: '800', color: THEME.primary },

  // Slots
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  slotBtn: { width: '30%', backgroundColor: THEME.bg, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: THEME.border, alignItems: 'center' },
  slotBtnActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  slotBtnDisabled: { backgroundColor: '#F1F5F9', borderColor: '#F1F5F9' },
  slotText: { fontSize: 13, fontWeight: '600', color: THEME.textPrimary },
  slotTextDisabled: { color: '#94A3B8' },
  textWhite: { color: '#FFF' },

  // Summary
  summaryCard: { backgroundColor: THEME.bg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: THEME.border },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  summaryLabel: { fontSize: 13, color: THEME.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: '700', color: THEME.textPrimary },
  divider: { height: 1, backgroundColor: THEME.border, marginVertical: 12 },
  payTotalLabel: { fontSize: 16, fontWeight: '700', color: THEME.textPrimary },
  payTotalValue: { fontSize: 20, fontWeight: '800', color: THEME.primary },

  // Bottom Bar
  bottomBar: { backgroundColor: THEME.bg, paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: THEME.border, paddingBottom: Platform.OS === 'ios' ? 30 : 16 },
  primaryBtn: { backgroundColor: THEME.primary, height: 54, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  btnDisabled: { backgroundColor: '#94A3B8' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  successSheet: { backgroundColor: THEME.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, alignItems: 'center', paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  successIconBox: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successTitle: { fontSize: 22, fontWeight: '800', color: THEME.textPrimary, marginBottom: 8 },
  successSubtitle: { fontSize: 14, color: THEME.textSecondary, textAlign: 'center', lineHeight: 20 },
});