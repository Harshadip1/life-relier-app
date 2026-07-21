import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Platform, ActivityIndicator, Alert, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../utils/constants';
import {
  getDoctorDropdown,
  getAllSlots,
  getAllDoctorSchedules,
  getAllAppointments,
  saveAppointment,
  DoctorDropdownItem,
  DoctorScheduleRecord,
  AppointmentRecord,
  SaveAppointmentPayload,
  DrSlotRecord,
} from '../../services/doctorScheduleService';
import { getReferingDoctorPro, ReferingDoctorProItem } from '../../services/referingDoctorService';
import { useAuth } from '../../context/AuthContext';

const TEAL = COLORS.primary;
const INITIALS = [{ id: 1, label: 'Mr' }, { id: 2, label: 'Mrs' }, { id: 3, label: 'Ms' }, { id: 4, label: 'Dr' }];
const GENDERS  = [{ id: 1, label: 'Male' }, { id: 2, label: 'Female' }, { id: 3, label: 'Other' }];

// ── Helpers ───────────────────────────────────────────────────────────────────
function toAPIDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function displayDate(d: Date) {
  return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
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

/** Total minutes → "HH:MM" 24-hour string (stored in API and used as slot key) */
function minsToSlotKey(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

/** "HH:MM" 24-hour → "08:00 AM" / "05:00 PM" for display only */
function slotKeyToDisplay(slot: string): string {
  if (!slot) return slot;
  // Already has AM/PM — return as-is (old records)
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
    slots.push(minsToSlotKey(t));   // store as "HH:MM" — matches what the API expects
  }
  return slots;
}

// ── Small reusable dropdown ───────────────────────────────────────────────────
function InlineDropdown({ label, required, value, options, onSelect, placeholder = 'Select...' }: any) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={s.label}>{label}{required && <Text style={{ color: '#EF4444' }}> *</Text>}</Text> : null}
      <TouchableOpacity style={s.dd} onPress={() => setOpen(!open)}>
        <Text style={[s.ddText, !value && { color: '#94A3B8' }]}>{value || placeholder}</Text>
        <Feather name="chevron-down" size={16} color="#64748B" />
      </TouchableOpacity>
      {open && (
        <View style={s.ddMenu}>
          {options.map((o: any) => (
            <TouchableOpacity key={o.id} style={s.ddItem} onPress={() => { onSelect(o); setOpen(false); }}>
              <Text style={s.ddItemText}>{o.label ?? o.FullName}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function SearchAvailableSlotsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // ── Step 1: Search state ──────────────────────────────────────────────────
  const [doctors, setDoctors]         = useState<DoctorDropdownItem[]>([]);
  const [selectedDr, setSelectedDr]   = useState<DoctorDropdownItem | null>(null);
  const [showDrDrop, setShowDrDrop]   = useState(false);
  const [loadingDr, setLoadingDr]     = useState(false);
  const [apptDate, setApptDate]       = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searching, setSearching]     = useState(false);

  // ── Generated slot grid ───────────────────────────────────────────────────
  const [generatedSlots, setGeneratedSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots]       = useState<string[]>([]);
  const [slotsSearched, setSlotsSearched]   = useState(false);

  // ── Step 2: Booking modal ─────────────────────────────────────────────────
  const [showBookModal, setShowBookModal]   = useState(false);
  const [selectedSlotTime, setSelectedSlotTime] = useState('');
  const [slotDurationMins, setSlotDurationMins] = useState(30);

  // Patient fields
  const [initialId, setInitialId]     = useState(1);
  const [initialLabel, setInitialLabel] = useState('Mr');
  const [name, setName]               = useState('');
  const [mobile, setMobile]           = useState('');
  const [address, setAddress]         = useState('');
  const [email, setEmail]             = useState('');
  const [remark, setRemark]           = useState('');
  const [genderId, setGenderId]       = useState(1);
  const [genderLabel, setGenderLabel] = useState('Male');
  const [birthDate, setBirthDate]     = useState(new Date(1990, 0, 1));
  const [showBirthPicker, setShowBirthPicker] = useState(false);
  const [age, setAge]                 = useState('');
  const [saving, setSaving]           = useState(false);

  // Referring doctor state
  const [referringDoctors, setReferringDoctors] = useState<ReferingDoctorProItem[]>([]);
  const [referringDrId, setReferringDrId]       = useState<number | null>(null);
  const [referringDrLabel, setReferringDrLabel] = useState('');

  useEffect(() => {
    setLoadingDr(true);
    getDoctorDropdown(1)
      .then(list => setDoctors(list))
      .catch(() => {})
      .finally(() => setLoadingDr(false));
    // Load referring doctors from the dedicated endpoint
    getReferingDoctorPro(1).then(setReferringDoctors).catch(() => {});
  }, []);

  // ── Search: fetch schedule + slot duration → generate time grid ──────────
  const handleSearch = async () => {
    if (!selectedDr) { Alert.alert('Validation', 'Please select a collection person.'); return; }
    setSearching(true);
    setSlotsSearched(false);
    setGeneratedSlots([]);
    try {
      // Fetch schedules from ALL branches and merge — website uses BranchId 1, app uses BranchId 4
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
      const dateStr = toAPIDate(apptDate);

      // Find a schedule that covers the selected date
      // Use regex extraction to avoid timezone shifts on date parsing
      const match = schedules.find(sc => {
        const drId = sc.DrId ?? (sc as any).drId;
        if (Number(drId) !== Number(selectedDr.Id)) return false;
        const startMatch = String(sc.StartDate).match(/^(\d{4})-(\d{2})-(\d{2})/);
        const endMatch   = String(sc.EndDate).match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (!startMatch || !endMatch) return false;
        const start = `${startMatch[1]}-${startMatch[2]}-${startMatch[3]}`;
        const end   = `${endMatch[1]}-${endMatch[2]}-${endMatch[3]}`;
        return dateStr >= start && dateStr <= end;
      });

      if (!match) {
        Alert.alert('No Schedule', `No schedule found for ${selectedDr.FullName} on ${displayDate(apptDate)}.`);
        setSlotsSearched(true);
        setGeneratedSlots([]);
        setSearching(false);
        return;
      }

      // Fetch slot duration for this doctor — check both BranchId 1 and 4
      const [slotsB1, slotsB4] = await Promise.all([
        getAllSlots(1).catch(() => []),
        getAllSlots(4).catch(() => []),
      ]);
      const allSlotRecords = [...slotsB1, ...slotsB4];
      const drSlot = allSlotRecords.find(sl => Number(sl.DrId) === Number(selectedDr.Id) && sl.IsActive)
                  || allSlotRecords.find(sl => Number(sl.DrId) === Number(selectedDr.Id));
      const slotMins = drSlot ? parseInt(drSlot.Slot, 10) : 30;
      setSlotDurationMins(slotMins);

      // Generate time slots
      const slots = generateSlots(match.StartTime, match.EndTime || '20:00:00', slotMins);

      // Fetch already booked slots for this doctor on this date — check both branches
      const [apptB1, apptB4] = await Promise.all([
        getAllAppointments(1).catch(() => []),
        getAllAppointments(4).catch(() => []),
      ]);
      const allAppts = [...apptB1, ...apptB4];
      const booked = allAppts
        .filter(a => {
          const dateMatch = String(a.AppointmentDate).match(/^(\d{4})-(\d{2})-(\d{2})/);
          const aDate = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : '';
          return Number(a.DrId) === Number(selectedDr.Id) && aDate === dateStr;
        })
        .map(a => {
          // Normalise to "HH:MM" 24h so comparison always works regardless of source
          const slot = a.Slot ?? '';
          if (/AM|PM/i.test(slot)) {
            const [timePart, meridiem] = slot.trim().split(' ');
            let [h, m] = timePart.split(':').map(Number);
            if (/PM/i.test(meridiem) && h !== 12) h += 12;
            if (/AM/i.test(meridiem) && h === 12) h = 0;
            return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
          }
          return slot.trim().substring(0, 5); // already "HH:MM"
        });

      setBookedSlots(booked);
      setGeneratedSlots(slots);
      setSlotsSearched(true);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to load slots.');
    } finally {
      setSearching(false);
    }
  };

  // ── When slot tapped → open booking modal ────────────────────────────────
  const handleSlotTap = (slotTime: string) => {
    setSelectedSlotTime(slotTime);
    setName(''); setMobile(''); setAddress(''); setEmail(''); setRemark(''); setAge('');
    setInitialId(1); setInitialLabel('Mr');
    setGenderId(1); setGenderLabel('Male');
    setBirthDate(new Date(1990, 0, 1));
    setReferringDrId(null); setReferringDrLabel('');
    setShowBookModal(true);
  };

  // ── Save appointment ──────────────────────────────────────────────────────
  const handleBook = async () => {
    if (!name.trim())   { Alert.alert('Validation', 'Name is required.');          return; }
    if (!mobile.trim()) { Alert.alert('Validation', 'Mobile number is required.'); return; }

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName  = nameParts.slice(1).join(' ') || nameParts[0];

    const payload: SaveAppointmentPayload = {
      DrId:            selectedDr!.Id,
      Name:            name.trim(),          // full name — what GetAllAppointment returns
      FirstName:       firstName,
      LastName:        lastName,
      Mobile:          mobile.trim(),
      AppointmentDate: toAPIDate(apptDate),
      Slot:            selectedSlotTime,
      Address:         address.trim() || '',
      GenderId:        genderId,
      InitialId:       initialId,
      BirthDate:       toAPIDate(birthDate),
      BranchId:        1,
      CreatedBy:       user?.name || 'Admin',
      Email:           email.trim() || '',
      Remark:          remark.trim() || '',
      ReferingDoctorId: referringDrId ?? null,
    };

    setSaving(true);
    try {
      const res = await saveAppointment(payload);
      setShowBookModal(false);
      setBookedSlots(prev => [...prev, selectedSlotTime]);
      Alert.alert('Success', `Appointment #${res?.AppointmentId ?? ''} booked successfully.`);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not book appointment.');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const isPast = (slotTime: string) => {
    const today = toAPIDate(new Date());
    if (toAPIDate(apptDate) > today) return false;
    if (toAPIDate(apptDate) < today) return true;
    return parseTimeToMins(slotTime) < parseTimeToMins(
      `${new Date().getHours()}:${new Date().getMinutes()}`
    );
  };

  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Feather name="arrow-left" size={22} color={TEAL} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Appointment Desk</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Breadcrumb */}
      <View style={s.breadcrumb}>
        <MaterialCommunityIcons name="calendar-clock" size={13} color={TEAL} />
        <Text style={s.bcText}> Dr Appointment</Text>
        <Feather name="chevron-right" size={12} color="#94A3B8" style={{ marginHorizontal: 2 }} />
        <Text style={s.bcText}>Appointment Desk</Text>
        <Feather name="chevron-right" size={12} color="#94A3B8" style={{ marginHorizontal: 2 }} />
        <View style={s.bcBadge}><Text style={s.bcBadgeText}>Select Slot</Text></View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* ── Search card ── */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <MaterialCommunityIcons name="calendar-clock" size={16} color="#FFF" />
            <Text style={s.cardTitle}> Search Available Slots</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.backSmall}>
              <Feather name="arrow-left" size={14} color="#FFF" />
              <Text style={s.backSmallTxt}> Back</Text>
            </TouchableOpacity>
          </View>

          <View style={s.form}>
            {/* Doctor dropdown */}
            <Text style={s.label}>Collection Person <Text style={s.req}>*</Text></Text>
            <TouchableOpacity style={s.dd} onPress={() => setShowDrDrop(!showDrDrop)} disabled={loadingDr}>
              {loadingDr ? <ActivityIndicator size={14} color={TEAL} style={{ marginRight: 8 }} /> : null}
              <Text style={[s.ddText, !selectedDr && { color: '#94A3B8' }]}>
                {loadingDr ? 'Loading…' : (selectedDr?.FullName || 'Select...')}
              </Text>
              <Feather name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
            {showDrDrop && (
              <View style={s.ddMenu}>
                {doctors.map(d => (
                  <TouchableOpacity key={d.Id} style={s.ddItem} onPress={() => { setSelectedDr(d); setShowDrDrop(false); setSlotsSearched(false); setGeneratedSlots([]); }}>
                    <Text style={s.ddItemText}>{d.FullName}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Date picker */}
            <Text style={[s.label, { marginTop: 14 }]}>Appointment Date <Text style={s.req}>*</Text></Text>
            <TouchableOpacity style={s.dateRow} onPress={() => setShowDatePicker(true)}>
              <MaterialCommunityIcons name="calendar" size={16} color="#64748B" style={{ marginRight: 8 }} />
              <Text style={s.dateText}>{displayDate(apptDate)}</Text>
              <Feather name="calendar" size={14} color="#94A3B8" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker value={apptDate} mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={(_, d) => { setShowDatePicker(false); if (d) { setApptDate(d); setSlotsSearched(false); setGeneratedSlots([]); } }} />
            )}

            {/* Search button */}
            <TouchableOpacity style={[s.searchBtn, searching && { opacity: 0.7 }]} onPress={handleSearch} disabled={searching}>
              {searching
                ? <ActivityIndicator size={16} color="#FFF" />
                : <Feather name="search" size={16} color="#FFF" />}
              <Text style={s.searchBtnTxt}>{searching ? '  Searching…' : '  Search Slots'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Slot grid ── */}
        {slotsSearched && (
          <View style={[s.card, { marginTop: 16 }]}>
            {/* Legend */}
            <View style={s.legend}>
              <View style={s.legendItem}><View style={[s.dot, { backgroundColor: TEAL }]} /><Text style={s.legendTxt}>Available</Text></View>
              <View style={s.legendItem}><View style={[s.dot, { backgroundColor: '#EF4444' }]} /><Text style={s.legendTxt}>Booked</Text></View>
              <View style={s.legendItem}><View style={[s.dot, { backgroundColor: '#94A3B8' }]} /><Text style={s.legendTxt}>Past</Text></View>
            </View>

            {generatedSlots.length === 0 ? (
              <Text style={s.noSlots}>No slots available for the selected date.</Text>
            ) : (
              <>
                <Text style={s.slotsHeading}>
                  AVAILABLE SLOTS FOR {toAPIDate(apptDate)}
                </Text>
                <View style={s.slotsGrid}>
                  {generatedSlots.map((slotTime, i) => {
                    const isBooked = bookedSlots.includes(slotTime);
                    const past     = isPast(slotTime);
                    return (
                      <TouchableOpacity
                        key={i}
                        style={[s.slotBtn, isBooked && s.slotBooked, past && s.slotPast]}
                        onPress={() => !isBooked && !past && handleSlotTap(slotTime)}
                        disabled={isBooked || past}
                        activeOpacity={0.7}
                      >
                        <Text style={[s.slotBtnTxt, isBooked && s.slotBookedTxt, past && s.slotPastTxt]}>
                          {slotKeyToDisplay(slotTime)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Footer */}
      <View style={s.footer}>
        <Text style={s.footerTxt}>© 2026 - Life Relier Infosoft Pvt Ltd</Text>
      </View>

      {/* ── Book Appointment Modal ── */}
      <Modal visible={showBookModal} animationType="slide" transparent onRequestClose={() => setShowBookModal(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            {/* Modal header */}
            <View style={s.modalHeader}>
              <MaterialCommunityIcons name="calendar-check" size={16} color="#FFF" />
              <Text style={s.modalTitle}> Book Appointment</Text>
            </View>
            <View style={s.modalActions}>
              <TouchableOpacity style={[s.bookBtn, saving && { opacity: 0.6 }]} onPress={handleBook} disabled={saving}>
                {saving ? <ActivityIndicator size={14} color="#FFF" /> : <MaterialCommunityIcons name="calendar-check" size={14} color="#FFF" />}
                <Text style={s.btnTxt}>{saving ? ' Booking…' : ' Book Appointment'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowBookModal(false)} disabled={saving}>
                <Feather name="x" size={14} color="#FFF" />
                <Text style={s.btnTxt}> Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={s.modalScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {/* Pre-filled read-only fields */}
              <Field label="Collection Person"><Text style={s.readOnly}>{selectedDr?.FullName}</Text></Field>
              <Field label="Appointment Date"><Text style={s.readOnly}>{displayDate(apptDate)}</Text></Field>
              <Field label="Slot"><Text style={s.readOnly}>{slotKeyToDisplay(selectedSlotTime)}</Text></Field>

              {/* Initial */}
              <InlineDropdown label="Initial" required value={initialLabel}
                options={INITIALS.map(i => ({ id: i.id, label: i.label }))}
                onSelect={(o: any) => { setInitialId(o.id); setInitialLabel(o.label); }} />

              {/* Name */}
              <Field label="Name" required>
                <View style={s.inputWrap}>
                  <TextInput style={s.input} placeholder="Enter Name" placeholderTextColor="#94A3B8"
                    value={name} onChangeText={setName} />
                </View>
              </Field>

              {/* Birth Date */}
              <Field label="Birth Date" required>
                <TouchableOpacity style={s.dateRow} onPress={() => setShowBirthPicker(true)}>
                  <MaterialCommunityIcons name="calendar-account" size={16} color="#64748B" style={{ marginRight: 8 }} />
                  <Text style={s.dateText}>{displayDate(birthDate)}</Text>
                </TouchableOpacity>
                {showBirthPicker && (
                  <DateTimePicker value={birthDate} mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    maximumDate={new Date()}
                    onChange={(_, d) => { setShowBirthPicker(false); if (d) { setBirthDate(d); const a = new Date().getFullYear() - d.getFullYear(); setAge(String(a)); } }} />
                )}
              </Field>

              {/* Age */}
              <Field label="Age">
                <View style={s.inputWrap}>
                  <TextInput style={s.input} placeholder="Age" placeholderTextColor="#94A3B8"
                    value={age} onChangeText={setAge} keyboardType="numeric" />
                </View>
              </Field>

              {/* Gender */}
              <InlineDropdown label="Gender" required value={genderLabel}
                options={GENDERS.map(g => ({ id: g.id, label: g.label }))}
                onSelect={(o: any) => { setGenderId(o.id); setGenderLabel(o.label); }} />

              {/* Mobile */}
              <Field label="Mobile No" required>
                <View style={s.inputWrap}>
                  <TextInput style={s.input} placeholder="Enter Mobile No" placeholderTextColor="#94A3B8"
                    value={mobile} onChangeText={setMobile} keyboardType="phone-pad" maxLength={10} />
                </View>
              </Field>

              {/* Referring Doctor */}
              <InlineDropdown
                label="Referring Doctor"
                value={referringDrLabel}
                placeholder="Select..."
                options={[
                  { id: 0, label: 'None' },
                  ...referringDoctors.map(d => ({ id: d.ReferingDoctorId, label: d.DoctorName })),
                ]}
                onSelect={(o: any) => {
                  if (o.id === 0) { setReferringDrId(null); setReferringDrLabel(''); }
                  else { setReferringDrId(o.id); setReferringDrLabel(o.label); }
                }}
              />

              {/* Email */}
              <Field label="Email">
                <View style={s.inputWrap}>
                  <TextInput style={s.input} placeholder="Enter Email" placeholderTextColor="#94A3B8"
                    value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                </View>
              </Field>

              {/* Address */}
              <Field label="Address">
                <View style={[s.inputWrap, { height: 60, alignItems: 'flex-start', paddingTop: 8 }]}>
                  <TextInput style={[s.input, { height: 44 }]} placeholder="Enter Address" placeholderTextColor="#94A3B8"
                    value={address} onChangeText={setAddress} multiline />
                </View>
              </Field>

              {/* Remark */}
              <Field label="Remark">
                <View style={[s.inputWrap, { height: 60, alignItems: 'flex-start', paddingTop: 8 }]}>
                  <TextInput style={[s.input, { height: 44 }]} placeholder="Enter Remark" placeholderTextColor="#94A3B8"
                    value={remark} onChangeText={setRemark} multiline />
                </View>
              </Field>

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Field({ label, required, children }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}{required && <Text style={{ color: '#EF4444' }}> *</Text>}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  // ── Root / layout
  root:           { flex: 1, backgroundColor: '#F1F5F9' },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  backBtn:        { padding: 4 },
  headerTitle:    { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  breadcrumb:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5F4', paddingHorizontal: 16, paddingVertical: 8 },
  bcText:         { fontSize: 12, color: '#64748B' },
  bcBadge:        { backgroundColor: TEAL, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  bcBadgeText:    { fontSize: 11, color: '#FFF', fontWeight: '600' },
  scroll:         { padding: 16, paddingBottom: 20 },
  footer:         { backgroundColor: TEAL, paddingVertical: 12, alignItems: 'center' },
  footerTxt:      { fontSize: 12, color: '#FFF', fontWeight: '500' },

  // ── Search card
  card:           { backgroundColor: '#FFF', borderRadius: 14, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  cardHeader:     { backgroundColor: TEAL, padding: 14, flexDirection: 'row', alignItems: 'center' },
  cardTitle:      { flex: 1, fontSize: 15, fontWeight: '700', color: '#FFF' },
  backSmall:      { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5 },
  backSmallTxt:   { fontSize: 12, color: '#FFF', fontWeight: '600' },
  form:           { padding: 16 },

  // ── Form elements
  label:          { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  req:            { color: '#EF4444' },
  dd:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, backgroundColor: '#F8FAFC', paddingHorizontal: 14, height: 48 },
  ddText:         { flex: 1, fontSize: 14, color: '#0F172A' },
  ddMenu:         { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, backgroundColor: '#FFF', marginTop: 4, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
  ddItem:         { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  ddItemText:     { fontSize: 14, color: '#0F172A' },
  dateRow:        { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, backgroundColor: '#F8FAFC', paddingHorizontal: 14, height: 48 },
  dateText:       { flex: 1, fontSize: 14, color: '#0F172A' },
  searchBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: TEAL, borderRadius: 10, paddingVertical: 13, marginTop: 16 },
  searchBtnTxt:   { fontSize: 15, fontWeight: '700', color: '#FFF', marginLeft: 6 },
  inputWrap:      { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, backgroundColor: '#F8FAFC', paddingHorizontal: 14, height: 48 },
  input:          { flex: 1, fontSize: 14, color: '#0F172A' },
  readOnly:       { fontSize: 14, color: '#0F172A', fontWeight: '600' },

  // ── Slot grid
  legend:         { flexDirection: 'row', gap: 16, padding: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  legendItem:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot:            { width: 10, height: 10, borderRadius: 5 },
  legendTxt:      { fontSize: 12, color: '#64748B' },
  noSlots:        { textAlign: 'center', color: '#94A3B8', fontSize: 14, paddingVertical: 24 },
  slotsHeading:   { fontSize: 11, fontWeight: '700', color: '#64748B', letterSpacing: 0.8, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 8 },
  slotsGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 14 },
  slotBtn:        { width: '30%', backgroundColor: '#F0FDFA', borderWidth: 1.5, borderColor: TEAL, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  slotBooked:     { backgroundColor: '#FEF2F2', borderColor: '#EF4444' },
  slotPast:       { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' },
  slotBtnTxt:     { fontSize: 13, fontWeight: '700', color: TEAL },
  slotBookedTxt:  { color: '#EF4444' },
  slotPastTxt:    { color: '#94A3B8' },

  // ── Modal
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard:      { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '92%' },
  modalHeader:    { flexDirection: 'row', alignItems: 'center', backgroundColor: TEAL, paddingHorizontal: 16, paddingVertical: 14, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle:     { fontSize: 15, fontWeight: '700', color: '#FFF' },
  modalActions:   { flexDirection: 'row', gap: 10, padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalScroll:    { padding: 16 },
  bookBtn:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: TEAL, borderRadius: 10, paddingVertical: 11 },
  cancelBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#64748B', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 11 },
  btnTxt:         { fontSize: 13, fontWeight: '700', color: '#FFF' },
});
