import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../utils/constants';
import { getPatient, PatientDetail, fmtDate } from '../../services/editPatientService';

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  primary:   '#0D9488',
  tealDark:  '#0F766E',
  tealBg:    '#F0FDFA',
  tealBorder:'#CCFBF1',
  bg:        '#FFFFFF',
  screenBg:  '#F8FAFC',
  text:      '#0F172A',
  sub:       '#64748B',
  muted:     '#94A3B8',
  border:    '#E2E8F0',
  danger:    '#EF4444',
};

const GENDERS = ['Male', 'Female', 'Other'];

// ─── Small helpers ────────────────────────────────────────────────────────────
function Field({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <View style={s.fieldWrap}>
      <Text style={s.fieldLabel}>
        {label}
        {required && <Text style={{ color: T.danger }}> *</Text>}
      </Text>
      {children}
    </View>
  );
}

function SectionBar({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={s.sectionBar}>
      <MaterialCommunityIcons name={icon as any} size={15} color="#FFF" />
      <Text style={s.sectionBarText}>{title}</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function EditPatientScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();

  // PID can come from grid row params or as a standalone number
  const passedPatient = route?.params?.patient ?? {};
  const pid: number   = passedPatient.pid ?? passedPatient.PID ?? passedPatient.patRegId ?? 0;

  // ── Form state ──────────────────────────────────────────────────────────
  const [fetching,  setFetching]  = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [patRegID,  setPatRegID]  = useState<number>(passedPatient.patRegId ?? 0);

  const [name,      setName]      = useState(passedPatient.name     ?? '');
  const [mobile,    setMobile]    = useState(passedPatient.phone     ?? '');
  const [age,       setAge]       = useState(String(passedPatient.age ?? ''));
  const [gender,    setGender]    = useState(passedPatient.gender    ?? '');
  const [genderOpen,setGenderOpen]= useState(false);
  const [dob,       setDob]       = useState(passedPatient.dob       ?? '');
  const [address,   setAddress]   = useState(passedPatient.address   ?? '');
  const [city,      setCity]      = useState(passedPatient.city      ?? '');
  const [area,      setArea]      = useState(passedPatient.area      ?? '');
  const [email,     setEmail]     = useState(passedPatient.email     ?? '');
  const [notes,     setNotes]     = useState(passedPatient.notes     ?? '');

  // ── Load from API on mount ────────────────────────────────────────────────
  useEffect(() => {
    if (!pid) { setFetching(false); return; }
    setFetching(true);
    getPatient(pid)
      .then((d: PatientDetail) => {
        setPatRegID(d.PatRegID ?? 0);
        setName(d.PatientName   ?? '');
        setMobile(d.MobileNo ?? d.Patphoneno ?? '');
        setAge(String(d.Age ?? ''));
        setGender(d.Gender      ?? '');
        setDob(d.DOB            ?? '');
        setAddress(d.Address ?? d.Pataddress ?? '');
        setCity(d.City          ?? '');
        setArea(d.Area          ?? '');
        setEmail(d.Email        ?? '');
        setNotes(d.Notes ?? d.Remark ?? '');
      })
      .catch((e: any) => {
        Alert.alert('Load Failed', e.message || 'Could not fetch patient details.');
      })
      .finally(() => setFetching(false));
  }, [pid]);

  // ── Save / Update ─────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    if (!name.trim())   { Alert.alert('Required', 'Patient name is required.');  return; }
    if (!mobile.trim()) { Alert.alert('Required', 'Mobile number is required.'); return; }
    if (!age.trim())    { Alert.alert('Required', 'Age is required.');           return; }

    setSaving(true);
    try {
      const payload = {
        PID:          pid,
        PatRegID:     patRegID,
        PatientName:  name.trim(),
        MobileNo:     mobile.replace(/\s/g, ''),
        Age:          parseInt(age, 10),
        Gender:       gender,
        DOB:          dob,
        Address:      address.trim(),
        City:         city.trim(),
        Area:         area.trim(),
        Email:        email.trim(),
        Notes:        notes.trim(),
        BranchId:     passedPatient.branchId ?? 1,
        UpdatedBy:    'admin',
      };

      const res = await fetch(`${API_BASE_URL}/api/NewRegistration/UpdatePatientFiles`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.Message || data?.message || `Server error (${res.status})`);

      Alert.alert(
        '✅ Update Successful',
        data.Message || 'Patient updated successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={[s.root, { paddingTop: Math.max(insets.top, 0) }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Feather name="arrow-left" size={22} color={T.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Edit Patient</Text>
          {pid > 0 && (
            <Text style={s.headerSub}>
              PID: <Text style={{ color: T.primary, fontWeight: '700' }}>{pid}</Text>
              {patRegID > 0 && `   ·   PT${String(patRegID).padStart(6, '0')}`}
            </Text>
          )}
        </View>
        {fetching && <ActivityIndicator size="small" color={T.primary} style={{ marginRight: 4 }} />}
      </View>

      {/* Loading skeleton */}
      {fetching ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color={T.primary} />
          <Text style={s.loadingText}>Loading patient details…</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={s.scroll}
        >
          {/* ── Patient Information ── */}
          <SectionBar icon="account" title="Patient Information" />
          <View style={s.formCard}>

            <Field label="Full Name" required>
              <View style={s.inputRow}>
                <Feather name="user" size={16} color={T.muted} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter full name"
                  placeholderTextColor={T.muted}
                />
              </View>
            </Field>

            <Field label="Mobile Number" required>
              <View style={s.inputRow}>
                <Feather name="phone" size={16} color={T.muted} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  value={mobile}
                  onChangeText={setMobile}
                  keyboardType="phone-pad"
                  placeholder="Enter mobile"
                  placeholderTextColor={T.muted}
                />
              </View>
            </Field>

            {/* Age + Gender row */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Field label="Age" required>
                  <View style={s.inputRow}>
                    <Feather name="calendar" size={16} color={T.muted} style={s.inputIcon} />
                    <TextInput
                      style={s.input}
                      value={age}
                      onChangeText={setAge}
                      keyboardType="numeric"
                      placeholder="Age"
                      placeholderTextColor={T.muted}
                    />
                  </View>
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Gender" required>
                  <TouchableOpacity
                    style={s.inputRow}
                    activeOpacity={0.8}
                    onPress={() => setGenderOpen(o => !o)}
                  >
                    <Feather name="users" size={16} color={T.muted} style={s.inputIcon} />
                    <Text style={[s.input, !gender && { color: T.muted }]}>
                      {gender || 'Select'}
                    </Text>
                    <Feather name="chevron-down" size={15} color={T.sub} />
                  </TouchableOpacity>
                  {genderOpen && (
                    <View style={s.ddMenu}>
                      {GENDERS.map(g => (
                        <TouchableOpacity
                          key={g}
                          style={s.ddItem}
                          onPress={() => { setGender(g); setGenderOpen(false); }}
                        >
                          <Text style={[s.ddItemText, gender === g && { color: T.primary, fontWeight: '700' }]}>{g}</Text>
                          {gender === g && <Feather name="check" size={14} color={T.primary} />}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </Field>
              </View>
            </View>

            <Field label="Date of Birth">
              <View style={s.inputRow}>
                <Feather name="calendar" size={16} color={T.muted} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  value={dob}
                  onChangeText={setDob}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={T.muted}
                />
              </View>
            </Field>

            <Field label="Email">
              <View style={s.inputRow}>
                <Feather name="mail" size={16} color={T.muted} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Enter email"
                  placeholderTextColor={T.muted}
                />
              </View>
            </Field>
          </View>

          {/* ── Address ── */}
          <SectionBar icon="map-marker-outline" title="Address" />
          <View style={s.formCard}>

            <Field label="Address">
              <View style={s.inputRow}>
                <Feather name="map-pin" size={16} color={T.muted} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter address"
                  placeholderTextColor={T.muted}
                />
              </View>
            </Field>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Field label="City">
                  <View style={s.inputRow}>
                    <Feather name="map" size={16} color={T.muted} style={s.inputIcon} />
                    <TextInput
                      style={s.input}
                      value={city}
                      onChangeText={setCity}
                      placeholder="City"
                      placeholderTextColor={T.muted}
                    />
                  </View>
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Area / Locality">
                  <View style={s.inputRow}>
                    <Feather name="navigation" size={16} color={T.muted} style={s.inputIcon} />
                    <TextInput
                      style={s.input}
                      value={area}
                      onChangeText={setArea}
                      placeholder="Area"
                      placeholderTextColor={T.muted}
                    />
                  </View>
                </Field>
              </View>
            </View>
          </View>

          {/* ── Notes ── */}
          <SectionBar icon="note-text-outline" title="Notes" />
          <View style={s.formCard}>
            <TextInput
              style={s.notesInput}
              multiline
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes for laboratory staff…"
              placeholderTextColor={T.muted}
              maxLength={300}
            />
            <Text style={s.charCount}>{notes.length}/300</Text>
          </View>

          {/* ── Update Button ── */}
          <TouchableOpacity
            style={[s.updateBtn, saving && { opacity: 0.65 }]}
            activeOpacity={0.85}
            onPress={handleUpdate}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color="#FFF" size="small" />
              : <Feather name="save" size={18} color="#FFF" />}
            <Text style={s.updateBtnText}>{saving ? 'Saving…' : 'Update Patient'}</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: T.screenBg },

  header:     {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12,
    backgroundColor: T.bg, borderBottomWidth: 1, borderBottomColor: T.border,
  },
  backBtn:    { padding: 4, marginRight: 10 },
  headerTitle:{ fontSize: 18, fontWeight: '800', color: T.text },
  headerSub:  { fontSize: 11, color: T.sub, marginTop: 1 },

  centered:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText:{ marginTop: 12, fontSize: 14, color: T.sub },

  scroll:     { paddingBottom: 24 },

  sectionBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: T.tealDark, paddingHorizontal: 14, paddingVertical: 10,
  },
  sectionBarText: { fontSize: 13, fontWeight: '700', color: '#FFF' },

  formCard:   { backgroundColor: T.bg, paddingHorizontal: 14, paddingTop: 8, paddingBottom: 4, marginBottom: 2 },

  fieldWrap:  { marginBottom: 10 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: T.sub, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 },

  inputRow:   {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: T.border, borderRadius: 8,
    paddingHorizontal: 10, height: 44, backgroundColor: T.bg,
  },
  inputIcon:  { marginRight: 8 },
  input:      { flex: 1, fontSize: 14, color: T.text },

  // Gender dropdown
  ddMenu:     {
    borderWidth: 1, borderColor: T.border, borderRadius: 8,
    backgroundColor: T.bg, marginTop: 2,
    elevation: 6, shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 6,
    zIndex: 999,
  },
  ddItem:     {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  ddItemText: { fontSize: 14, color: T.text },

  // Notes
  notesInput: {
    borderWidth: 1, borderColor: T.border, borderRadius: 8,
    paddingHorizontal: 12, paddingTop: 10, minHeight: 90,
    fontSize: 13, color: T.text, backgroundColor: T.bg,
  },
  charCount:  { fontSize: 10, color: T.muted, textAlign: 'right', marginTop: 4 },

  // Update button
  updateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: T.tealDark,
    marginHorizontal: 14, marginTop: 20, borderRadius: 12,
    paddingVertical: 15,
  },
  updateBtnText: { fontSize: 15, fontWeight: '800', color: '#FFF' },
});
