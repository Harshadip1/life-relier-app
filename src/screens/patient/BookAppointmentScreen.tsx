import React, { useState, useEffect } from 'react';
import { COLORS } from '../../utils/constants';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Platform, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../utils/constants';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  getDoctorDropdown,
  DoctorDropdownItem,
  saveAppointment,
  getAllAppointments,
  AppointmentRecord,
  getAllSlots,
  DrSlotRecord,
  getAllDoctorSchedules,
  DoctorScheduleRecord,
} from '../../services/doctorScheduleService';

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

function getNextDates(count = 7) {
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

const TIME_SLOTS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM', '06:00 PM',
];

// ── Helper functions (same as admin) ──────────────────────────────────────────
function toAPIDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

/** Parse "10:00:00" or "10:00 AM" → total minutes since midnight */
function parseTimeToMins(t: string): number {
  if (!t) return 0;
  t = t.trim();
  if (/AM|PM/i.test(t)) {
    const [timePart, meridiem] = t.split(' ');
    let [h, m] = timePart.split(':').map(Number);
    if (/PM/i.test(meridiem) && h !== 12) h += 12;
    if (/AM/i.test(meridiem) && h === 12) h = 0;
    return h * 60 + m;
  }
  const parts = t.split(':').map(Number);
  return parts[0] * 60 + (parts[1] || 0);
}

/** Total minutes → "HH:MM" 24-hour string (stored in API) */
function minsToSlotKey(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

/** "HH:MM" 24-hour → "08:00 AM" / "05:00 PM" for display */
function slotKeyToDisplay(slot: string): string {
  if (!slot) return slot;
  if (/AM|PM/i.test(slot)) return slot;
  const [hStr, mStr] = slot.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h % 12 || 12;
  return `${String(h12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ampm}`;
}

/** Generate time slot strings from startTime to endTime every slotMins minutes */
function generateSlots(startTime: string, endTime: string, slotMins: number): string[] {
  const start = parseTimeToMins(startTime);
  const end   = parseTimeToMins(endTime);
  const slots: string[] = [];
  for (let t = start; t + slotMins <= end; t += slotMins) {
    slots.push(minsToSlotKey(t));
  }
  return slots;
}

// Helper to check if a time slot is in the past
function isSlotPast(selectedDate: Date, slotTime: string): boolean {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(selectedDate);
  selected.setHours(0, 0, 0, 0);
  
  // If selected date is in the future, all slots are available
  if (selected > today) return false;
  
  // If selected date is in the past, all slots are past
  if (selected < today) return true;
  
  // For today, compare time
  return parseTimeToMins(slotTime) < parseTimeToMins(
    `${now.getHours()}:${now.getMinutes()}`
  );
}

function formatDate(d: Date) {
  return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
}

export default function BookAppointmentScreen({ navigation }: any) {
  const insets   = useSafeAreaInsets();
  const { user } = useAuth();
  const DATES    = getNextDates(7);

  const [patientName, setPatientName]     = useState('');
  const [patientPhone, setPatientPhone]   = useState('');
  const [patientAddress, setPatientAddress] = useState('');
  const [selectedDate, setSelectedDate]   = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime]   = useState<string | null>(null);
  const [showSuccess, setShowSuccess]     = useState(false);
  const [booking, setBooking]             = useState(false);

  // Collection Person (Doctor) dropdown
  const [doctors, setDoctors]             = useState<DoctorDropdownItem[]>([]);
  const [selectedDrId, setSelectedDrId]   = useState<number | null>(null);
  const [selectedDrName, setSelectedDrName] = useState('');
  const [showDropdown, setShowDropdown]   = useState(false);

  // Generated slots from schedule (like admin)
  const [generatedSlots, setGeneratedSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots]       = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots]     = useState(false);

  // Load doctor dropdown once
  useEffect(() => {
    getDoctorDropdown(1).then(setDoctors).catch(() => {});
  }, []);

  // Load slots when date or doctor changes (like admin's Search)
  useEffect(() => {
    if (!selectedDrId || !selectedDate) {
      setGeneratedSlots([]);
      setBookedSlots([]);
      return;
    }
    
    const fetchSlotsForDoctor = async () => {
      setLoadingSlots(true);
      try {
        // Fetch schedules from both branches
        const [schedulesB1, schedulesB4] = await Promise.all([
          getAllDoctorSchedules(1).catch(() => [] as DoctorScheduleRecord[]),
          getAllDoctorSchedules(4).catch(() => [] as DoctorScheduleRecord[]),
        ]);
        
        // Deduplicate by ScheduleId
        const seen = new Set<number>();
        const schedules: DoctorScheduleRecord[] = [...schedulesB1, ...schedulesB4].filter(sc => {
          const id = sc.ScheduleId ?? (sc as any).scheduleId;
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        
        const dateStr = toAPIDate(selectedDate);
        
        // Find schedule for selected doctor and date
        const match = schedules.find(sc => {
          const drId = sc.DrId ?? (sc as any).drId;
          if (Number(drId) !== Number(selectedDrId)) return false;
          const startMatch = String(sc.StartDate).match(/^(\d{4})-(\d{2})-(\d{2})/);
          const endMatch   = String(sc.EndDate).match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (!startMatch || !endMatch) return false;
          const start = `${startMatch[1]}-${startMatch[2]}-${startMatch[3]}`;
          const end   = `${endMatch[1]}-${endMatch[2]}-${endMatch[3]}`;
          return dateStr >= start && dateStr <= end;
        });
        
        if (!match) {
          setGeneratedSlots([]);
          setBookedSlots([]);
          setLoadingSlots(false);
          return;
        }
        
        // Fetch slot duration for this doctor
        const [slotsB1, slotsB4] = await Promise.all([
          getAllSlots(1).catch(() => []),
          getAllSlots(4).catch(() => []),
        ]);
        const allSlotRecords = [...slotsB1, ...slotsB4];
        const drSlot = allSlotRecords.find(sl => Number(sl.DrId) === Number(selectedDrId) && sl.IsActive)
                    || allSlotRecords.find(sl => Number(sl.DrId) === Number(selectedDrId));
        const slotMins = drSlot ? parseInt(drSlot.Slot, 10) : 30;
        
        // Generate time slots
        const slots = generateSlots(match.StartTime, match.EndTime || '20:00:00', slotMins);
        
        // Fetch already booked slots
        const [apptB1, apptB4] = await Promise.all([
          getAllAppointments(1).catch(() => []),
          getAllAppointments(4).catch(() => []),
        ]);
        const allAppts = [...apptB1, ...apptB4];
        const booked = allAppts
          .filter(a => {
            const dateMatch = String(a.AppointmentDate).match(/^(\d{4})-(\d{2})-(\d{2})/);
            const aDate = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : '';
            return Number(a.DrId) === Number(selectedDrId) && aDate === dateStr;
          })
          .map(a => {
            // Normalise to "HH:MM" 24h
            const slot = a.Slot ?? '';
            if (/AM|PM/i.test(slot)) {
              const [timePart, meridiem] = slot.trim().split(' ');
              let [h, m] = timePart.split(':').map(Number);
              if (/PM/i.test(meridiem) && h !== 12) h += 12;
              if (/AM/i.test(meridiem) && h === 12) h = 0;
              return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
            }
            return slot.trim().substring(0, 5);
          });
        
        setBookedSlots(booked);
        setGeneratedSlots(slots);
      } catch (error) {
        console.error('Failed to fetch slots:', error);
        setGeneratedSlots([]);
        setBookedSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    
    fetchSlotsForDoctor();
  }, [selectedDate, selectedDrId]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handlePhoneChange = (text: string) => {
    // Only allow numbers and max 10 digits
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 10) {
      setPatientPhone(cleaned);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
      // Reset time selection when date changes
      setSelectedTime(null);
    }
  };

  const handleConfirmBooking = async () => {
    // Validation
    if (!patientName.trim()) {
      Alert.alert('Required', 'Please enter patient name');
      return;
    }
    if (!patientPhone.trim()) {
      Alert.alert('Required', 'Please enter mobile number');
      return;
    }
    if (patientPhone.length !== 10) {
      Alert.alert('Invalid Mobile', 'Mobile number must be exactly 10 digits');
      return;
    }
    if (!patientAddress.trim()) {
      Alert.alert('Required', 'Please enter your address');
      return;
    }
    if (!selectedDrId) {
      Alert.alert('Required', 'Please select a collection person');
      return;
    }
    if (!selectedTime) {
      Alert.alert('Required', 'Please select a preferred time slot');
      return;
    }

    setBooking(true);
    try {
      // Save appointment booking to the system
      const isoDate = toAPIDate(selectedDate);
      
      // Prepare appointment data for API - exact structure from API documentation
      const appointmentPayload = {
        DrId: selectedDrId,
        Name: patientName,
        FirstName: patientName.split(' ')[0] || patientName,
        LastName: patientName.split(' ').slice(1).join(' ') || '',
        Mobile: patientPhone,
        AppointmentDate: isoDate,
        Slot: selectedTime,  // Slot is in "HH:MM" format (24-hour)
        Address: patientAddress,
        GenderId: 1,
        InitialId: 1,
        BirthDate: '1990-01-01',
        BranchId: 4,
        CreatedBy: user?.name || patientName,
      };

      // Call the saveAppointment API
      const result = await saveAppointment(appointmentPayload);
      console.log('Appointment saved successfully:', result);
      
      // Add to booked slots locally
      setBookedSlots(prev => [...prev, selectedTime]);
      
      setShowSuccess(true);
    } catch (err: any) {
      console.error('Booking error:', err);
      Alert.alert('Booking Failed', err?.message ?? 'Could not book appointment. Please try again.');
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
        <Text style={styles.headerTitle}>Book Home Collection</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <MaterialCommunityIcons name="information-outline" size={20} color={THEME.primary} />
          <Text style={styles.infoBannerText}>
            Book a home collection appointment. Our phlebotomist will visit you, collect samples, and process payment.
          </Text>
        </View>

        {/* Patient Details Section */}
        <Text style={styles.sectionTitle}>Patient Details</Text>
        
        <View style={styles.inputCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter patient name"
              placeholderTextColor={THEME.textSecondary}
              value={patientName}
              onChangeText={setPatientName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 10 digit mobile number"
              placeholderTextColor={THEME.textSecondary}
              value={patientPhone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              maxLength={10}
            />
            {patientPhone.length > 0 && patientPhone.length !== 10 && (
              <Text style={styles.errorText}>Mobile number must be exactly 10 digits</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Complete Address *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter your full address for home collection"
              placeholderTextColor={THEME.textSecondary}
              value={patientAddress}
              onChangeText={setPatientAddress}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Collection Person (Doctor) *</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowDropdown(!showDropdown)}>
              <Text style={[styles.dropdownText, !selectedDrName && { color: THEME.textSecondary }]}>
                {selectedDrName || 'Select doctor...'}
              </Text>
              <Feather name="chevron-down" size={18} color="#64748B" />
            </TouchableOpacity>
            {showDropdown && (
              <View style={styles.dropdownMenu}>
                {doctors.length === 0
                  ? <View style={styles.dropdownItem}><Text style={{ color: THEME.textSecondary }}>No doctors found</Text></View>
                  : doctors.map(d => (
                    <TouchableOpacity key={d.Id} style={styles.dropdownItem}
                      onPress={() => { setSelectedDrId(d.Id); setSelectedDrName(d.FullName); setShowDropdown(false); }}>
                      <Text style={styles.dropdownItemText}>{d.FullName}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            )}
          </View>
        </View>

        {/* Preferred Date */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Preferred Date</Text>
        <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowDatePicker(true)}>
          <MaterialCommunityIcons name="calendar" size={20} color={THEME.primary} />
          <Text style={styles.datePickerText}>{formatDate(selectedDate)}</Text>
          <MaterialCommunityIcons name="calendar-blank-outline" size={20} color="#64748B" />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {/* Time Slot Legend */}
        {selectedDrId && (
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Booked</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#64748B' }]} />
              <Text style={styles.legendText}>Past</Text>
            </View>
          </View>
        )}

        {/* Preferred Time */}
        {!selectedDrId ? (
          <View style={styles.noSelectionBox}>
            <MaterialCommunityIcons name="account-clock" size={48} color="#CBD5E1" />
            <Text style={styles.noSelectionText}>Please select a collection person to view available slots</Text>
          </View>
        ) : loadingSlots ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={THEME.primary} />
            <Text style={styles.loadingText}>Loading slots...</Text>
          </View>
        ) : generatedSlots.length === 0 ? (
          <View style={styles.noSelectionBox}>
            <MaterialCommunityIcons name="calendar-remove" size={48} color="#CBD5E1" />
            <Text style={styles.noSelectionText}>No slots available for {selectedDrName} on {formatDate(selectedDate)}</Text>
          </View>
        ) : (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
              Available Slots for {formatDate(selectedDate)}
            </Text>
            <View style={styles.slotGrid}>
              {generatedSlots.map((slotTime, i) => {
                const isPast = isSlotPast(selectedDate, slotTime);
                const isBooked = bookedSlots.includes(slotTime);
                const isDisabled = isPast || isBooked;
                
                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.slotBtn,
                      selectedTime === slotTime && !isDisabled && styles.slotBtnActive,
                      isPast && styles.slotBtnPast,
                      isBooked && styles.slotBtnBooked,
                    ]}
                    onPress={() => !isDisabled && setSelectedTime(slotTime)}
                    disabled={isDisabled}
                  >
                    <Text style={[
                      styles.slotText,
                      selectedTime === slotTime && !isDisabled && styles.textWhite,
                      isPast && styles.slotTextPast,
                      isBooked && styles.slotTextBooked,
                    ]}>
                      {slotKeyToDisplay(slotTime)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Payment Note */}
        <View style={styles.paymentNote}>
          <MaterialCommunityIcons name="wallet-outline" size={18} color="#D97706" />
          <Text style={styles.paymentNoteText}>
            <Text style={{ fontWeight: '700' }}>Payment:</Text> An advance registration fee will be collected now. Final payment after test completion at home.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom action bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            (!patientName.trim() || patientPhone.length !== 10 || !patientAddress.trim() || !selectedDrId || !selectedTime || booking)
              && styles.btnDisabled,
          ]}
          disabled={!patientName.trim() || patientPhone.length !== 10 || !patientAddress.trim() || !selectedDrId || !selectedTime || booking}
          onPress={handleConfirmBooking}
        >
          {booking
            ? <ActivityIndicator color="#FFF" />
            : <Text style={styles.primaryBtnText}>Confirm Booking</Text>}
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
              Your home collection appointment is scheduled for{' '}
              {formatDate(selectedDate)} at {selectedTime} with {selectedDrName}.
              {'\n\n'}
              Our phlebotomist will contact you shortly and arrive at your location.
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

  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  sectionTitle:  { fontSize: 16, fontWeight: '700', color: THEME.textPrimary, marginBottom: 16 },

  // Info Banner
  infoBanner:     { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: THEME.primaryLight, borderRadius: 12, padding: 14, marginBottom: 24, gap: 10 },
  infoBannerText: { flex: 1, fontSize: 13, color: THEME.textPrimary, lineHeight: 19 },

  // Input Card
  inputCard:      { backgroundColor: THEME.bg, borderRadius: 16, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: THEME.border },
  inputGroup:     { marginBottom: 16 },
  inputLabel:     { fontSize: 13, fontWeight: '600', color: THEME.textPrimary, marginBottom: 8 },
  input:          { backgroundColor: THEME.screenBg, borderWidth: 1, borderColor: THEME.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: THEME.textPrimary },
  textArea:       { minHeight: 80, paddingTop: 12 },
  errorText:      { fontSize: 11, color: '#EF4444', marginTop: 4 },

  // Doctor Dropdown
  dropdown:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: THEME.border, borderRadius: 10, backgroundColor: THEME.screenBg, paddingHorizontal: 14, height: 50 },
  dropdownText:   { fontSize: 14, color: THEME.textPrimary, flex: 1 },
  dropdownMenu:   { borderWidth: 1, borderColor: THEME.border, borderRadius: 10, backgroundColor: THEME.bg, marginTop: 4, overflow: 'hidden', maxHeight: 200 },
  dropdownItem:   { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: THEME.border },
  dropdownItemText: { fontSize: 14, color: THEME.textPrimary },

  // Date Picker
  datePickerBtn:  { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.bg, borderWidth: 1, borderColor: THEME.border, borderRadius: 12, padding: 16, marginBottom: 16, gap: 12 },
  datePickerText: { flex: 1, fontSize: 15, fontWeight: '600', color: THEME.textPrimary },

  // Legend
  legendRow:      { flexDirection: 'row', gap: 16, marginTop: 16, marginBottom: 8 },
  legendItem:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:      { width: 12, height: 12, borderRadius: 6 },
  legendText:     { fontSize: 12, color: THEME.textSecondary },

  // Date Selection
  dateScroll:        { marginBottom: 16, overflow: 'visible' },
  dateCard:          { width: 64, height: 78, backgroundColor: THEME.bg, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 10, borderWidth: 1, borderColor: THEME.border },
  dateCardActive:    { backgroundColor: THEME.primary, borderColor: THEME.primary },
  dateDay:           { fontSize: 12, color: THEME.textSecondary, marginBottom: 4, fontWeight: '500' },
  dateNum:           { fontSize: 20, fontWeight: '700', color: THEME.textPrimary },
  textWhite:         { color: '#FFF' },

  // Time Slots
  slotGrid:          { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  slotBtn:           { width: '31%', backgroundColor: THEME.bg, paddingVertical: 16, borderRadius: 12, borderWidth: 2, borderColor: '#10B981', alignItems: 'center' },
  slotBtnActive:     { backgroundColor: THEME.primary, borderColor: THEME.primary },
  slotBtnPast:       { backgroundColor: '#F1F5F9', borderColor: '#64748B', opacity: 0.5 },
  slotBtnBooked:     { backgroundColor: '#FEE2E2', borderColor: '#EF4444', opacity: 0.7 },
  slotText:          { fontSize: 14, fontWeight: '700', color: '#10B981' },
  slotTextPast:      { color: '#64748B' },
  slotTextBooked:    { color: '#EF4444' },

  // No Selection / Loading Messages
  noSelectionBox:    { alignItems: 'center', paddingVertical: 50, paddingHorizontal: 20 },
  noSelectionText:   { fontSize: 14, color: THEME.textSecondary, textAlign: 'center', marginTop: 16, lineHeight: 22 },
  loadingBox:        { alignItems: 'center', paddingVertical: 40 },
  loadingText:       { fontSize: 13, color: THEME.textSecondary, marginTop: 12 },

  // Payment Note
  paymentNote:     { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFFBEB', borderRadius: 12, padding: 14, marginTop: 8, gap: 10, borderWidth: 1, borderColor: '#FEF08A' },
  paymentNoteText: { flex: 1, fontSize: 12, color: '#78350F', lineHeight: 18 },

  // Bottom bar
  bottomBar:      { backgroundColor: THEME.bg, paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: THEME.border, paddingBottom: Platform.OS === 'ios' ? 30 : 14 },
  primaryBtn:     { backgroundColor: THEME.primary, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  btnDisabled:    { backgroundColor: COLORS.textMuted, opacity: 0.5 },

  // Modal
  modalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  successSheet:  { backgroundColor: THEME.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, alignItems: 'center', paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  successIconBox:{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successTitle:  { fontSize: 22, fontWeight: '800', color: THEME.textPrimary, marginBottom: 8 },
  successSubtitle:{ fontSize: 14, color: THEME.textSecondary, textAlign: 'center', lineHeight: 22 },
});
