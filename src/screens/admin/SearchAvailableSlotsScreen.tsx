import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../utils/constants';
import {
  getDoctorDropdown,
  getAllSlots,
  saveAppointment,
  DoctorDropdownItem,
  DrSlotRecord,
  SaveAppointmentPayload,
} from '../../services/doctorScheduleService';
import { useAuth } from '../../context/AuthContext';

const TEAL = COLORS.primary;

// ── Lookup tables ─────────────────────────────────────────────────────────────
const INITIALS  = [{ id: 1, label: 'Mr' }, { id: 2, label: 'Mrs' }, { id: 3, label: 'Ms' }, { id: 4, label: 'Dr' }];
const GENDERS   = [{ id: 1, label: 'Male' }, { id: 2, label: 'Female' }, { id: 3, label: 'Other' }];

function toAPIDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function displayDate(d: Date) {
  return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
}

// Simple dropdown used multiple times
function InlineDropdown({ label, required, value, options, onSelect, placeholder = 'Select...' }: any) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={s.label}>{label}{required && <Text style={{ color: '#EF4444' }}> *</Text>}</Text>
      <TouchableOpacity style={s.dd} onPress={() => setOpen(!open)}>
        <Text style={[s.ddText, !value && { color: '#94A3B8' }]}>{value || placeholder}</Text>
        <Feather name="chevron-down" size={18} color="#64748B" />
      </TouchableOpacity>
      {open && (
        <View style={s.ddMenu}>
          {options.map((o: any) => (
            <TouchableOpacity key={o.id} style={s.ddItem}
              onPress={() => { onSelect(o); setOpen(false); }}>
              <Text style={s.ddItemText}>{o.label ?? o.FullName ?? o.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function SearchAvailableSlotsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // ── Doctors & slots ───────────────────────────────────────────────────────
  const [doctors, setDoctors]           = useState<DoctorDropdownItem[]>([]);
  const [selectedDr, setSelectedDr]     = useState<DoctorDropdownItem | null>(null);
  const [loadingDr, setLoadingDr]       = useState(false);
  const [showDrDrop, setShowDrDrop]     = useState(false);

  const [slots, setSlots]               = useState<DrSlotRecord[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<DrSlotRecord | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // ── Appointment date ───────────────────────────────────────────────────────
  const [apptDate, setApptDate]         = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ── Patient fields ─────────────────────────────────────────────────────────
  const [initialId, setInitialId]       = useState<number>(1);
  const [initialLabel, setInitialLabel] = useState('Mr');
  const [firstName, setFirstName]       = useState('');
  const [lastName, setLastName]         = useState('');
  const [mobile, setMobile]             = useState('');
  const [address, setAddress]           = useState('');
  const [genderId, setGenderId]         = useState<number>(1);
  const [genderLabel, setGenderLabel]   = useState('Male');
  const [birthDate, setBirthDate]       = useState(new Date(1990, 0, 1));
  const [showBirthPicker, setShowBirthPicker] = useState(false);

  const [saving, setSaving]             = useState(false);

  // Load doctors on mount
  useEffect(() => {
    setLoadingDr(true);
    getDoctorDropdown(1)
      .then(setDoctors)
      .catch(() => {})
      .finally(() => setLoadingDr(false));
  }, []);

  // Load slots when doctor is selected
  const handleSelectDoctor = async (dr: DoctorDropdownItem) => {
    setSelectedDr(dr);
    setSelectedSlot(null);
    setShowDrDrop(false);
    setLoadingSlots(true);
    try {
      const all = await getAllSlots(1);
      console.log('[Slots] Total slots fetched:', all.length);
      console.log('[Slots] Doctor selected Id:', dr.Id, 'FullName:', dr.FullName);
      all.forEach(sl => console.log('[Slots] Slot:', JSON.stringify(sl)));

      // Match by DrId — handle both Pascal and camel casing from API
      const matched = all.filter(sl => {
        const slotDrId = sl.DrId ?? (sl as any).drId ?? (sl as any).DRId;
        const isActive = sl.IsActive ?? (sl as any).isActive ?? true;
        return Number(slotDrId) === Number(dr.Id) && isActive;
      });

      console.log('[Slots] Matched slots for doctor:', matched.length);
      setSlots(matched);
    } catch (e: any) {
      console.log('[Slots] Error fetching slots:', e?.message);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedDr)    { Alert.alert('Validation', 'Please select a doctor.');        return; }
    if (!selectedSlot)  { Alert.alert('Validation', 'Please select a slot.');          return; }
    if (!firstName.trim()) { Alert.alert('Validation', 'First name is required.');    return; }
    if (!lastName.trim())  { Alert.alert('Validation', 'Last name is required.');     return; }
    if (!mobile.trim())    { Alert.alert('Validation', 'Mobile number is required.'); return; }

    const payload: SaveAppointmentPayload = {
      DrId:            selectedDr.Id,
      FirstName:       firstName.trim(),
      LastName:        lastName.trim(),
      Mobile:          mobile.trim(),
      AppointmentDate: toAPIDate(apptDate),
      Slot:            selectedSlot.Slot
                         ? `${selectedSlot.Slot} Minutes`
                         : '20 Minutes',
      Address:         address.trim() || '',
      GenderId:        genderId,
      InitialId:       initialId,
      BirthDate:       toAPIDate(birthDate),
      BranchId:        1,   // confirmed from Bruno
      CreatedBy:       user?.name || 'Admin',
    };

    setSaving(true);
    try {
      const res = await saveAppointment(payload);
      Alert.alert(
        'Appointment Booked',
        `Appointment #${res?.AppointmentId ?? ''} created successfully.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not book appointment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 10) }]}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Feather name="arrow-left" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>New Appointment</Text>
        <TouchableOpacity>
          <Feather name="filter" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Breadcrumb */}
      <View style={s.breadcrumb}>
        <Feather name="home" size={13} color={TEAL} />
        <Text style={s.bcText}> Dr Appointment</Text>
        <Feather name="chevron-right" size={13} color="#94A3B8" style={{ marginHorizontal: 2 }} />
        <Text style={s.bcText}>Appointment Desk</Text>
        <Feather name="chevron-right" size={13} color="#94A3B8" style={{ marginHorizontal: 2 }} />
        <View style={s.bcActive}><Text style={s.bcActiveText}>Book</Text></View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.card}>

          {/* Card header */}
          <View style={s.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="calendar-plus" size={18} color="#FFF" />
              <Text style={s.cardTitle}> Book Appointment</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={[s.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSave} disabled={saving}
              >
                {saving
                  ? <ActivityIndicator size={14} color="#FFF" />
                  : <Feather name="check" size={14} color="#FFF" />}
                <Text style={s.btnTxt}>{saving ? ' Booking…' : ' Book'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.cancelBtn} onPress={() => navigation.goBack()} disabled={saving}>
                <Feather name="x" size={14} color="#FFF" />
                <Text style={s.btnTxt}> Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.form}>

            {/* ── Section: Doctor & Slot ── */}
            <SectionLabel title="Doctor & Slot" icon="stethoscope" />

            {/* Doctor dropdown */}
            <Text style={s.label}>Doctor <Text style={s.req}>*</Text></Text>
            <TouchableOpacity style={s.dd} onPress={() => setShowDrDrop(!showDrDrop)} disabled={loadingDr}>
              {loadingDr
                ? <ActivityIndicator size={14} color={TEAL} style={{ marginRight: 8 }} />
                : null}
              <Text style={[s.ddText, !selectedDr && { color: '#94A3B8' }]}>
                {loadingDr ? 'Loading doctors…' : (selectedDr?.FullName || 'Select...')}
              </Text>
              <Feather name="chevron-down" size={18} color="#64748B" />
            </TouchableOpacity>
            {showDrDrop && (
              <View style={s.ddMenu}>
                {doctors.length === 0
                  ? <View style={s.ddItem}><Text style={{ color: '#94A3B8' }}>No doctors found</Text></View>
                  : doctors.map(d => (
                    <TouchableOpacity key={d.Id} style={s.ddItem} onPress={() => handleSelectDoctor(d)}>
                      <Text style={s.ddItemText}>{d.FullName}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            )}

            {/* Slot selection */}
            <Text style={[s.label, { marginTop: 16 }]}>Slot <Text style={s.req}>*</Text></Text>
            {loadingSlots ? (
              <View style={s.slotsLoading}>
                <ActivityIndicator size={16} color={TEAL} />
                <Text style={s.slotsLoadingText}> Loading slots…</Text>
              </View>
            ) : slots.length === 0 && selectedDr ? (
              <Text style={s.noSlots}>No slots available for this doctor.</Text>
            ) : (
              <View style={s.slotsRow}>
                {slots.map((sl, idx) => {
                    const slotVal = sl.Slot ?? '?';
                    const slotId  = sl.SlotId ?? idx;
                    return (
                      <TouchableOpacity
                        key={slotId}
                        style={[s.slotChip, selectedSlot?.SlotId === sl.SlotId && s.slotChipActive]}
                        onPress={() => setSelectedSlot(sl)}
                      >
                        <Feather name="clock" size={12}
                          color={selectedSlot?.SlotId === sl.SlotId ? '#FFF' : TEAL}
                          style={{ marginRight: 4 }} />
                        <Text style={[s.slotChipText, selectedSlot?.SlotId === sl.SlotId && { color: '#FFF' }]}>
                          {slotVal} min
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </View>
            )}

            {/* Appointment Date */}
            <Text style={[s.label, { marginTop: 16 }]}>Appointment Date <Text style={s.req}>*</Text></Text>
            <TouchableOpacity style={s.dateRow} onPress={() => setShowDatePicker(true)}>
              <MaterialCommunityIcons name="calendar" size={16} color="#64748B" style={{ marginRight: 8 }} />
              <Text style={s.dateText}>{displayDate(apptDate)}</Text>
              <MaterialCommunityIcons name="calendar-blank-outline" size={16} color="#64748B" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker value={apptDate} mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={(_, d) => { setShowDatePicker(false); if (d) setApptDate(d); }} />
            )}

            {/* ── Section: Patient Details ── */}
            <SectionLabel title="Patient Details" icon="account-outline" style={{ marginTop: 24 }} />

            {/* Initial + First Name row */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ width: 90 }}>
                <InlineDropdown
                  label="Initial" required
                  value={initialLabel}
                  options={INITIALS.map(i => ({ id: i.id, label: i.label }))}
                  onSelect={(o: any) => { setInitialId(o.id); setInitialLabel(o.label); }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>First Name <Text style={s.req}>*</Text></Text>
                <View style={s.inputWrap}>
                  <TextInput style={s.input} placeholder="First name"
                    placeholderTextColor="#94A3B8" value={firstName} onChangeText={setFirstName} />
                </View>
              </View>
            </View>

            {/* Last Name */}
            <Text style={s.label}>Last Name <Text style={s.req}>*</Text></Text>
            <View style={[s.inputWrap, { marginBottom: 16 }]}>
              <TextInput style={s.input} placeholder="Last name"
                placeholderTextColor="#94A3B8" value={lastName} onChangeText={setLastName} />
            </View>

            {/* Mobile */}
            <Text style={s.label}>Mobile <Text style={s.req}>*</Text></Text>
            <View style={[s.inputWrap, { marginBottom: 16 }]}>
              <TextInput style={s.input} placeholder="10-digit mobile number"
                placeholderTextColor="#94A3B8" value={mobile} onChangeText={setMobile}
                keyboardType="phone-pad" maxLength={10} />
            </View>

            {/* Gender */}
            <InlineDropdown
              label="Gender" required
              value={genderLabel}
              options={GENDERS.map(g => ({ id: g.id, label: g.label }))}
              onSelect={(o: any) => { setGenderId(o.id); setGenderLabel(o.label); }}
            />

            {/* Birth Date */}
            <Text style={s.label}>Birth Date <Text style={s.req}>*</Text></Text>
            <TouchableOpacity style={[s.dateRow, { marginBottom: 16 }]} onPress={() => setShowBirthPicker(true)}>
              <MaterialCommunityIcons name="calendar-account" size={16} color="#64748B" style={{ marginRight: 8 }} />
              <Text style={s.dateText}>{displayDate(birthDate)}</Text>
              <MaterialCommunityIcons name="calendar-blank-outline" size={16} color="#64748B" />
            </TouchableOpacity>
            {showBirthPicker && (
              <DateTimePicker value={birthDate} mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                maximumDate={new Date()}
                onChange={(_, d) => { setShowBirthPicker(false); if (d) setBirthDate(d); }} />
            )}

            {/* Address */}
            <Text style={s.label}>Address</Text>
            <View style={[s.inputWrap, { height: 70, alignItems: 'flex-start', paddingTop: 10 }]}>
              <TextInput style={[s.input, { height: 50 }]} placeholder="Address (optional)"
                placeholderTextColor="#94A3B8" value={address} onChangeText={setAddress}
                multiline numberOfLines={2} textAlignVertical="top" />
            </View>

          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* SCAN FAB */}
      <TouchableOpacity style={s.scanFab}>
        <MaterialCommunityIcons name="barcode-scan" size={28} color="#FFF" />
        <Text style={s.scanLabel}>SCAN</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={s.footer}>
        <Text style={s.footerText}>© 2026 - Life Relier Infosoft Pvt Ltd</Text>
      </View>
    </View>
  );
}

// ── Small section label ────────────────────────────────────────────────────────
function SectionLabel({ title, icon, style }: any) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }, style]}>
      <View style={{ width: 3, height: 16, backgroundColor: TEAL, borderRadius: 2, marginRight: 8 }} />
      <MaterialCommunityIcons name={icon} size={15} color={TEAL} style={{ marginRight: 6 }} />
      <Text style={{ fontSize: 13, fontWeight: '800', color: TEAL, letterSpacing: 0.3 }}>{title}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  breadcrumb: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', backgroundColor: '#E8F5F4', paddingHorizontal: 16, paddingVertical: 8 },
  bcText: { fontSize: 12, color: '#64748B' },
  bcActive: { backgroundColor: TEAL, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  bcActiveText: { fontSize: 11, color: '#FFF', fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#FFF', borderRadius: 14, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  cardHeader: { backgroundColor: TEAL, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#15803D', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#64748B', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  btnTxt: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  form: { padding: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 8 },
  req: { color: '#EF4444' },
  dd: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, backgroundColor: '#F8FAFC', paddingHorizontal: 14, height: 50, marginBottom: 4 },
  ddText: { fontSize: 14, color: '#0F172A', flex: 1 },
  ddMenu: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, backgroundColor: '#FFF', marginBottom: 8, overflow: 'hidden' },
  ddItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  ddItemText: { fontSize: 14, color: '#0F172A' },
  slotsLoading: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  slotsLoadingText: { fontSize: 13, color: '#64748B' },
  noSlots: { fontSize: 13, color: '#94A3B8', paddingVertical: 10, marginBottom: 8 },
  slotsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  slotChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5, borderColor: TEAL, backgroundColor: '#F0FDFA' },
  slotChipActive: { backgroundColor: TEAL },
  slotChipText: { fontSize: 13, fontWeight: '700', color: TEAL },
  dateRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, backgroundColor: '#F8FAFC', paddingHorizontal: 14, height: 50, marginBottom: 8 },
  dateText: { flex: 1, fontSize: 14, color: '#0F172A' },
  inputWrap: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, backgroundColor: '#F8FAFC', paddingHorizontal: 14, height: 50, justifyContent: 'center', marginBottom: 8 },
  input: { fontSize: 14, color: '#0F172A', flex: 1 },
  scanFab: { position: 'absolute', bottom: 50, right: 20, backgroundColor: TEAL, width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  scanLabel: { fontSize: 9, color: '#FFF', fontWeight: '700', marginTop: 2 },
  footer: { backgroundColor: TEAL, paddingVertical: 12, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#FFF', fontWeight: '500' },
});
