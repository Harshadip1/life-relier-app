import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Platform, Switch, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../utils/constants';
import {
  getDoctorDropdown,
  saveSchedule,
  updateSchedule,
  DoctorDropdownItem,
  SaveSchedulePayload,
} from '../../services/doctorScheduleService';
import { useAuth } from '../../context/AuthContext';

const TEAL = COLORS.primary;

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Date → "YYYY-MM-DD" for the API */
function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
/** Date → "10:00 AM" format for the API (matches Bruno exactly) */
function toTimeStr(d: Date) {
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${String(h % 12 || 12).padStart(2, '0')}:${m} ${ampm}`;
}
/** Date → "DD-MM-YYYY" for display */
function fmt(d: Date) {
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}
/** Alias — display and API time format are now identical */
const fmtTime = toTimeStr;

/** Parse "10:00:00" or "10:00 AM" into a Date object */
function parseTimeStr(timeStr: string | null): Date {
  const d = new Date();
  if (!timeStr) return d;
  try {
    if (timeStr.toUpperCase().includes('AM') || timeStr.toUpperCase().includes('PM')) {
      const parts = timeStr.split(' ');
      const time = parts[0];
      const modifier = parts[1] || '';
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier.toUpperCase() === 'PM' && hours < 12) {
        hours += 12;
      }
      if (modifier.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
      }
      d.setHours(hours, minutes, 0, 0);
    } else {
      const parts = timeStr.split(':').map(Number);
      if (parts.length >= 2) {
        d.setHours(parts[0], parts[1], parts[2] || 0, 0);
      }
    }
  } catch (e) {
    console.log('Error parsing time string:', timeStr, e);
  }
  return d;
}

export default function AddDoctorScheduleScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const editSchedule = route?.params?.schedule;
  const isEdit = !!editSchedule;

  // ── Doctor dropdown (loaded from API) ──────────────────────────────────────
  const [doctors, setDoctors]           = useState<DoctorDropdownItem[]>([]);
  const [loadingDr, setLoadingDr]       = useState(false);
  const [selectedDrId, setSelectedDrId] = useState<number | null>(editSchedule ? editSchedule.DrId : null);
  const [selectedDrName, setSelectedDrName] = useState(editSchedule ? (editSchedule.DoctorName || `Doctor ID: ${editSchedule.DrId}`) : '');
  const [showDrDrop, setShowDrDrop]     = useState(false);

  useEffect(() => {
    (async () => {
      setLoadingDr(true);
      try {
        const list = await getDoctorDropdown(1);
        setDoctors(list);
      } catch {
        // If dropdown fails, fall back silently — user can still type
      } finally {
        setLoadingDr(false);
      }
    })();
  }, []);

  // Helper to parse dates safely
  const parseDateStr = (dateStr: string | null): Date => {
    if (!dateStr) return new Date();
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  // ── Form state ─────────────────────────────────────────────────────────────
  const [startDate, setStartDate]   = useState(editSchedule ? parseDateStr(editSchedule.StartDate) : new Date());
  const [endDate, setEndDate]       = useState(editSchedule ? parseDateStr(editSchedule.EndDate) : new Date());
  const [startTime, setStartTime]   = useState(editSchedule ? parseTimeStr(editSchedule.StartTime) : new Date());
  const [endTime, setEndTime]       = useState(editSchedule ? parseTimeStr(editSchedule.EndTime) : new Date());

  const [showSD, setShowSD]         = useState(false);
  const [showED, setShowED]         = useState(false);
  const [showST, setShowST]         = useState(false);
  const [showET, setShowET]         = useState(false);

  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isActive, setIsActive]         = useState(editSchedule ? editSchedule.IsActive : true);
  const [saving, setSaving]             = useState(false);

  const toggleDay = (d: string) =>
    setSelectedDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedDrId) {
      Alert.alert('Validation', 'Please select a doctor.'); return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        const payload = {
          scheduleId: editSchedule.ScheduleId || editSchedule.scheduleId,
          DrId:      selectedDrId,
          StartDate: toISODate(startDate),
          EndDate:   toISODate(endDate),
          StartTime: toTimeStr(startTime),
          EndTime:   toTimeStr(endTime),
          BranchId:  editSchedule.BranchId ?? 4,
          UpdatedBy: user?.name || 'Admin',
          IsActive:  isActive,
        };
        await updateSchedule(payload);
        Alert.alert('Success', 'Doctor schedule updated successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        const payload: SaveSchedulePayload = {
          DrId:      selectedDrId,
          StartDate: toISODate(startDate),
          EndDate:   toISODate(endDate),
          StartTime: toTimeStr(startTime),
          EndTime:   toTimeStr(endTime),
          BranchId:  4,
          CreatedBy: user?.name || 'admin',
          IsActive:  isActive,
        };
        await saveSchedule(payload);
        Alert.alert('Success', 'Doctor schedule saved successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={TEAL} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Edit Doctor Schedule' : 'Add Doctor Schedule'}</Text>
        <TouchableOpacity>
          <Feather name="filter" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* ── Breadcrumb ── */}
      <View style={styles.breadcrumb}>
        <Feather name="home" size={13} color={TEAL} />
        <Text style={styles.bcText}> Master</Text>
        <Feather name="chevron-right" size={13} color="#94A3B8" style={{ marginHorizontal: 2 }} />
        <Text style={styles.bcText}>Doctor Schedule</Text>
        <Feather name="chevron-right" size={13} color="#94A3B8" style={{ marginHorizontal: 2 }} />
        <Text style={[styles.bcText, { color: TEAL, fontWeight: '700' }]}>{isEdit ? 'Edit Schedule' : 'Add New'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {/* Card header */}
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name={isEdit ? "edit-2" : "plus"} size={18} color="#FFF" />
              <Text style={styles.cardTitle}>{isEdit ? ' Edit Schedule' : ' Add Schedule'}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator size={14} color="#FFF" />
                  : <Feather name="save" size={14} color="#FFF" />}
                <Text style={styles.btnTxt}>{saving ? ' Saving…' : (isEdit ? ' Update' : ' Save')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => navigation.goBack()}
                disabled={saving}
              >
                <Feather name="x" size={14} color="#FFF" />
                <Text style={styles.btnTxt}> Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.form}>
            {/* Doctor */}
            <Field label="Doctor" required>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowDrDrop(!showDrDrop)}
                disabled={loadingDr}
              >
                {loadingDr ? (
                  <ActivityIndicator size={16} color={TEAL} style={{ marginRight: 8 }} />
                ) : null}
                <Text style={[styles.ddText, !selectedDrName && { color: '#94A3B8' }]}>
                  {loadingDr ? 'Loading doctors…' : (selectedDrName || 'Select...')}
                </Text>
                <Feather name="chevron-down" size={18} color="#64748B" />
              </TouchableOpacity>
              {showDrDrop && (
                <View style={styles.ddMenu}>
                  {doctors.length === 0 ? (
                    <View style={styles.ddEmpty}>
                      <Text style={styles.ddEmptyText}>No doctors found</Text>
                    </View>
                  ) : doctors.map(d => (
                    <TouchableOpacity
                      key={d.Id}
                      style={styles.ddItem}
                      onPress={() => {
                        setSelectedDrId(d.Id);
                        setSelectedDrName(d.FullName);
                        setShowDrDrop(false);
                      }}
                    >
                      <Text style={styles.ddItemText}>{d.FullName}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Field>

            {/* Working days */}
            <Field label="Working Days" required>
              <View style={styles.daysRow}>
                {DAYS.map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.dayChip, selectedDays.includes(d) && styles.dayChipActive]}
                    onPress={() => toggleDay(d)}
                  >
                    <Text style={[styles.dayChipText, selectedDays.includes(d) && styles.dayChipTextActive]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>

            {/* Date range */}
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Field label="Start Date" required>
                  <TouchableOpacity style={styles.dateInput} onPress={() => setShowSD(true)}>
                    <MaterialCommunityIcons name="calendar" size={16} color="#64748B" style={{ marginRight: 8 }} />
                    <Text style={styles.dateText}>{fmt(startDate)}</Text>
                  </TouchableOpacity>
                </Field>
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Field label="End Date" required>
                  <TouchableOpacity style={styles.dateInput} onPress={() => setShowED(true)}>
                    <MaterialCommunityIcons name="calendar" size={16} color="#64748B" style={{ marginRight: 8 }} />
                    <Text style={styles.dateText}>{fmt(endDate)}</Text>
                  </TouchableOpacity>
                </Field>
              </View>
            </View>

            {/* Time range */}
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Field label="Start Time" required>
                  <TouchableOpacity style={styles.dateInput} onPress={() => setShowST(true)}>
                    <Feather name="clock" size={16} color="#64748B" style={{ marginRight: 8 }} />
                    <Text style={styles.dateText}>{fmtTime(startTime)}</Text>
                  </TouchableOpacity>
                </Field>
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Field label="End Time" required>
                  <TouchableOpacity style={styles.dateInput} onPress={() => setShowET(true)}>
                    <Feather name="clock" size={16} color="#64748B" style={{ marginRight: 8 }} />
                    <Text style={styles.dateText}>{fmtTime(endTime)}</Text>
                  </TouchableOpacity>
                </Field>
              </View>
            </View>

            {/* Active toggle */}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Is Active?</Text>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ true: TEAL, false: '#CBD5E1' }}
                thumbColor="#FFF"
              />
            </View>
          </View>
        </View>

        {/* Date/time pickers */}
        {showSD && (
          <DateTimePicker value={startDate} mode="date" display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(_, d) => { setShowSD(false); if (d) setStartDate(d); }} />
        )}
        {showED && (
          <DateTimePicker value={endDate} mode="date" display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(_, d) => { setShowED(false); if (d) setEndDate(d); }} />
        )}
        {showST && (
          <DateTimePicker value={startTime} mode="time" display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(_, d) => { setShowST(false); if (d) setStartTime(d); }} />
        )}
        {showET && (
          <DateTimePicker value={endTime} mode="time" display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(_, d) => { setShowET(false); if (d) setEndTime(d); }} />
        )}
      </ScrollView>

      {/* SCAN FAB */}
      <TouchableOpacity style={styles.scanFab}>
        <MaterialCommunityIcons name="barcode-scan" size={28} color="#FFF" />
        <Text style={styles.scanLabel}>SCAN</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 - Life Relier Infosoft Pvt Ltd</Text>
      </View>
    </View>
  );
}

function Field({ label, required, children }: any) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={fieldStyles.label}>
        {label} {required && <Text style={{ color: '#EF4444' }}>*</Text>}
      </Text>
      {children}
    </View>
  );
}
const fieldStyles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 8 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F1F5F9' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#0F172A', textAlign: 'center' },
  breadcrumb: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E8F5F4', paddingHorizontal: 16, paddingVertical: 8,
  },
  bcText: { fontSize: 12, color: '#64748B' },
  scroll: { padding: 16, paddingBottom: 140 },
  card: {
    backgroundColor: '#FFF', borderRadius: 14, overflow: 'hidden',
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  cardHeader: {
    backgroundColor: TEAL, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#15803D',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
  },
  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#64748B',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
  },
  btnTxt: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  form: { padding: 16 },
  dropdown: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10,
    backgroundColor: '#F8FAFC', paddingHorizontal: 14, height: 50,
  },
  ddText: { fontSize: 14, color: '#0F172A', flex: 1 },
  ddMenu: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10,
    backgroundColor: '#FFF', marginTop: 4, overflow: 'hidden',
  },
  ddItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  ddItemText: { fontSize: 14, color: '#0F172A' },
  ddEmpty: { paddingHorizontal: 14, paddingVertical: 16, alignItems: 'center' },
  ddEmptyText: { fontSize: 13, color: '#94A3B8' },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC',
  },
  dayChipActive: { backgroundColor: TEAL, borderColor: TEAL },
  dayChipText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  dayChipTextActive: { color: '#FFF' },
  row2: { flexDirection: 'row', alignItems: 'flex-start' },
  dateInput: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10,
    backgroundColor: '#F8FAFC', paddingHorizontal: 12, height: 50,
  },
  dateText: { fontSize: 13, color: '#0F172A', flex: 1 },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 4,
  },
  switchLabel: { fontSize: 13, fontWeight: '600', color: '#334155' },
  scanFab: {
    position: 'absolute', bottom: 50, right: 20,
    backgroundColor: TEAL, width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    elevation: 6, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8,
  },
  scanLabel: { fontSize: 9, color: '#FFF', fontWeight: '700', marginTop: 2 },
  footer: { backgroundColor: TEAL, paddingVertical: 12, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#FFF', fontWeight: '500' },
});
