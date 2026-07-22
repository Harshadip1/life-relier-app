import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { getPatient, updatePatient, PatientDetail, UpdatePatientPayload } from '../../services/editPatientService';

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
  const [fetching,    setFetching]    = useState(true);
  const [saving,      setSaving]      = useState(false);

  // from GetPatient — kept as-is for UpdatePatient pass-through
  const [raw,         setRaw]         = useState<PatientDetail | null>(null);

  // editable fields
  const [patRegID,    setPatRegID]    = useState<number>(passedPatient.patRegId ?? 0);
  const [initial,     setInitial]     = useState('');
  const [name,        setName]        = useState(passedPatient.name     ?? '');
  const [mobile,      setMobile]      = useState(passedPatient.phone    ?? '');
  const [age,         setAge]         = useState(String(passedPatient.age ?? ''));
  const [mdy,         setMdy]         = useState('Year');
  const [gender,      setGender]      = useState(passedPatient.gender   ?? '');
  const [genderOpen,  setGenderOpen]  = useState(false);
  const [dob,         setDob]         = useState(passedPatient.dob      ?? '');
  const [address,     setAddress]     = useState(passedPatient.address  ?? '');
  const [email,       setEmail]       = useState(passedPatient.email    ?? '');
  const [patHistory,  setPatHistory]  = useState('');
  const [comment,     setComment]     = useState('');
  const [cardNo,      setCardNo]      = useState('');
  const [cardExp,     setCardExp]     = useState('');
  const [weight,      setWeight]      = useState('');
  const [height,      setHeight]      = useState('');
  const [disease,     setDisease]     = useState('');
  const [symptoms,    setSymptoms]    = useState('');
  const [fsTime,      setFsTime]      = useState('');
  const [therapy,     setTherapy]     = useState('');
  const [lastPeriod,  setLastPeriod]  = useState('');
  const [hospitalNo,  setHospitalNo]  = useState('');
  const [reportType,  setReportType]  = useState('Print');
  const [isEmergency, setIsEmergency] = useState(false);

  // ── Load from API on mount ────────────────────────────────────────────────
  useEffect(() => {
    if (!pid) { setFetching(false); return; }
    setFetching(true);
    getPatient(pid)
      .then((d: PatientDetail) => {
        setRaw(d);
        setPatRegID(d.PatRegID        ?? 0);
        setInitial(d.intial ?? d.Initial ?? '');
        setName(d.Patname ?? d.PatientName ?? '');
        setMobile(d.MobileNo          ?? '');
        setAge(String(d.Age           ?? ''));
        setMdy(d.MDY                  ?? 'Year');
        setGender(d.sex ?? d.Gender   ?? '');
        setDob(d.DateOfBirth ?? d.DOB ?? '');
        setAddress(d.Pataddress ?? d.Address ?? '');
        setEmail(d.Email ?? d.EmailID ?? '');
        setPatHistory(d.PatHistory    ?? '');
        setComment(d.Comment          ?? '');
        setCardNo(d.PatientCardNo     ?? '');
        setCardExp(d.PatientCardExpNo ?? '');
        setWeight(d.Weights           ?? '');
        setHeight(d.Heights           ?? '');
        setDisease(d.Disease          ?? '');
        setSymptoms(d.Symptoms        ?? '');
        setFsTime(d.FSTime            ?? '');
        setTherapy(d.Therapy          ?? '');
        setLastPeriod(d.LastPeriod    ?? '');
        setHospitalNo(d.HospitalNo    ?? '');
        setReportType(d.ReportType    ?? 'Print');
        setIsEmergency(d.Isemergency  ?? false);
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
      const payload: UpdatePatientPayload = {
        // ── IDs ──
        PID:               pid,
        PPID:              raw?.PPID ?? pid,
        BranchId:          raw?.BranchId ?? passedPatient.branchId ?? 1,
        // ── Patient info ──
        Patregdate:        raw?.Patregdate,
        Age:               parseInt(age, 10),
        MDY:               mdy,
        intial:            initial,
        Patname:           name.trim(),
        sex:               gender,
        MobileNo:          mobile.replace(/\s/g, ''),
        Email:             email.trim(),
        EmailID:           email.trim(),
        Pataddress:        address.trim(),
        PatHistory:        patHistory.trim(),
        Comment:           comment.trim(),
        DateOfBirth:       dob || raw?.DateOfBirth,
        AccDateofBirth:    raw?.AccDateofBirth ?? false,
        PatientCardNo:     cardNo.trim(),
        PatientCardExpNo:  cardExp.trim(),
        DoctorCode:        raw?.DoctorCode,
        CenterCode:        raw?.CenterCode,
        Username:          raw?.Username ?? 'admin',
        Usertype:          raw?.Usertype ?? 'Patient',
        Drname:            raw?.Drname,
        CenterName:        raw?.CenterName,
        Weights:           weight,
        Heights:           height,
        Disease:           disease.trim(),
        RefDr:             raw?.RefDr,
        LastPeriod:        lastPeriod,
        Symptoms:          symptoms.trim(),
        FSTime:            fsTime,
        Therapy:           therapy.trim(),
        TestCharges:       raw?.TestCharges,
        Isemergency:       isEmergency,
        IsbillBH:          raw?.IsbillBH ?? false,
        HospitalNo:        hospitalNo || null,
        ReportType:        reportType,
        FID:               raw?.FID,
        Patauthicante:     raw?.Patauthicante,
        TestList:          raw?.TestList ?? [],
        // ── Billing (pass through unchanged) ──
        RID:               raw?.RID,
        billdate:          raw?.billdate,
        transdate:         raw?.transdate,
        PaymentType:       raw?.PaymentType,
        OnlineTransType:   raw?.OnlineTransType,
        OnlineTransID:     raw?.OnlineTransID,
        BankName:          raw?.BankName ?? null,
        ChqNo:             raw?.ChqNo ?? null,
        ChqDate:           raw?.ChqDate ?? null,
        CardNo:            raw?.CardNo ?? null,
        CardName:          raw?.CardName ?? null,
        Cardtype:          raw?.Cardtype ?? null,
        CardExpiryDate:    raw?.CardExpiryDate ?? null,
        CardTransactionID: raw?.CardTransactionID ?? null,
        BillAmt:           raw?.BillAmt,
        DisAmt:            raw?.DisAmt,
        OtherCharges:      raw?.OtherCharges,
        OtherChargeRemark: raw?.OtherChargeRemark ?? null,
        DiscountRemark:    raw?.DiscountRemark,
        TaxPer:            raw?.TaxPer,
        TaxAmount:         raw?.TaxAmount,
        AmtPaid:           raw?.AmtPaid,
        BalAmt:            raw?.BalAmt,
      };

      const msg = await updatePatient(payload);
      Alert.alert('✅ Update Successful', msg, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
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

            {/* Initial + Name row */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ width: 80 }}>
                <Field label="Initial">
                  <View style={s.inputRow}>
                    <TextInput style={s.input} value={initial} onChangeText={setInitial}
                      placeholder="Mr" placeholderTextColor={T.muted} />
                  </View>
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Full Name" required>
                  <View style={s.inputRow}>
                    <Feather name="user" size={16} color={T.muted} style={s.inputIcon} />
                    <TextInput style={s.input} value={name} onChangeText={setName}
                      placeholder="Enter full name" placeholderTextColor={T.muted} />
                  </View>
                </Field>
              </View>
            </View>

            <Field label="Mobile Number" required>
              <View style={s.inputRow}>
                <Feather name="phone" size={16} color={T.muted} style={s.inputIcon} />
                <TextInput style={s.input} value={mobile} onChangeText={setMobile}
                  keyboardType="phone-pad" placeholder="Enter mobile" placeholderTextColor={T.muted} />
              </View>
            </Field>

            {/* Age + MDY + Gender */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Field label="Age" required>
                  <View style={s.inputRow}>
                    <TextInput style={s.input} value={age} onChangeText={setAge}
                      keyboardType="numeric" placeholder="Age" placeholderTextColor={T.muted} />
                  </View>
                </Field>
              </View>
              <View style={{ width: 72 }}>
                <Field label="Unit">
                  <TouchableOpacity style={s.inputRow} onPress={() =>
                    setMdy(m => m === 'Year' ? 'Month' : m === 'Month' ? 'Day' : 'Year')}>
                    <Text style={[s.input, { fontSize: 13 }]}>{mdy}</Text>
                    <Feather name="chevron-down" size={13} color={T.sub} />
                  </TouchableOpacity>
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Gender" required>
                  <TouchableOpacity style={s.inputRow} activeOpacity={0.8}
                    onPress={() => setGenderOpen(o => !o)}>
                    <Text style={[s.input, !gender && { color: T.muted }]}>{gender || 'Select'}</Text>
                    <Feather name="chevron-down" size={13} color={T.sub} />
                  </TouchableOpacity>
                  {genderOpen && (
                    <View style={s.ddMenu}>
                      {GENDERS.map(g => (
                        <TouchableOpacity key={g} style={s.ddItem}
                          onPress={() => { setGender(g); setGenderOpen(false); }}>
                          <Text style={[s.ddItemText, gender === g && { color: T.primary, fontWeight: '700' }]}>{g}</Text>
                          {gender === g && <Feather name="check" size={13} color={T.primary} />}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </Field>
              </View>
            </View>

            {/* DOB + Email */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Field label="Date of Birth">
                  <View style={s.inputRow}>
                    <Feather name="calendar" size={14} color={T.muted} style={s.inputIcon} />
                    <TextInput style={s.input} value={dob} onChangeText={setDob}
                      placeholder="YYYY-MM-DD" placeholderTextColor={T.muted} />
                  </View>
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Email">
                  <View style={s.inputRow}>
                    <Feather name="mail" size={14} color={T.muted} style={s.inputIcon} />
                    <TextInput style={s.input} value={email} onChangeText={setEmail}
                      keyboardType="email-address" autoCapitalize="none"
                      placeholder="Email" placeholderTextColor={T.muted} />
                  </View>
                </Field>
              </View>
            </View>

            <Field label="Address">
              <View style={s.inputRow}>
                <Feather name="map-pin" size={14} color={T.muted} style={s.inputIcon} />
                <TextInput style={s.input} value={address} onChangeText={setAddress}
                  placeholder="Enter address" placeholderTextColor={T.muted} />
              </View>
            </Field>

            {/* Card No + Expiry */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Field label="Patient Card No">
                  <View style={s.inputRow}>
                    <TextInput style={s.input} value={cardNo} onChangeText={setCardNo}
                      placeholder="PCN2026001" placeholderTextColor={T.muted} />
                  </View>
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Card Expiry">
                  <View style={s.inputRow}>
                    <TextInput style={s.input} value={cardExp} onChangeText={setCardExp}
                      placeholder="2030" placeholderTextColor={T.muted} keyboardType="numeric" />
                  </View>
                </Field>
              </View>
            </View>

            {/* Weight + Height */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Field label="Weight (kg)">
                  <View style={s.inputRow}>
                    <TextInput style={s.input} value={weight} onChangeText={setWeight}
                      keyboardType="numeric" placeholder="62" placeholderTextColor={T.muted} />
                  </View>
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Height (cm)">
                  <View style={s.inputRow}>
                    <TextInput style={s.input} value={height} onChangeText={setHeight}
                      keyboardType="numeric" placeholder="165" placeholderTextColor={T.muted} />
                  </View>
                </Field>
              </View>
            </View>

            <Field label="Hospital No">
              <View style={s.inputRow}>
                <TextInput style={s.input} value={hospitalNo} onChangeText={setHospitalNo}
                  placeholder="Hospital number (optional)" placeholderTextColor={T.muted} />
              </View>
            </Field>
          </View>

          {/* ── Clinical Info ── */}
          <SectionBar icon="stethoscope" title="Clinical Info" />
          <View style={s.formCard}>

            <Field label="Disease">
              <View style={s.inputRow}>
                <TextInput style={s.input} value={disease} onChangeText={setDisease}
                  placeholder="e.g. Hypertension" placeholderTextColor={T.muted} />
              </View>
            </Field>

            <Field label="Symptoms">
              <View style={s.inputRow}>
                <TextInput style={s.input} value={symptoms} onChangeText={setSymptoms}
                  placeholder="e.g. Headache" placeholderTextColor={T.muted} />
              </View>
            </Field>

            <Field label="Therapy">
              <View style={s.inputRow}>
                <TextInput style={s.input} value={therapy} onChangeText={setTherapy}
                  placeholder="e.g. Medication" placeholderTextColor={T.muted} />
              </View>
            </Field>

            {/* FS Time + Last Period */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Field label="FS Time">
                  <View style={s.inputRow}>
                    <TextInput style={s.input} value={fsTime} onChangeText={setFsTime}
                      placeholder="08:00 AM" placeholderTextColor={T.muted} />
                  </View>
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Last Period">
                  <View style={s.inputRow}>
                    <TextInput style={s.input} value={lastPeriod} onChangeText={setLastPeriod}
                      placeholder="YYYY-MM-DD" placeholderTextColor={T.muted} />
                  </View>
                </Field>
              </View>
            </View>

            <Field label="Pat History">
              <View style={[s.inputRow, { height: 70, alignItems: 'flex-start', paddingTop: 10 }]}>
                <TextInput style={[s.input, { textAlignVertical: 'top' }]}
                  multiline value={patHistory} onChangeText={setPatHistory}
                  placeholder="Patient history…" placeholderTextColor={T.muted} />
              </View>
            </Field>

            <Field label="Comment">
              <View style={s.inputRow}>
                <TextInput style={s.input} value={comment} onChangeText={setComment}
                  placeholder="e.g. Follow Up" placeholderTextColor={T.muted} />
              </View>
            </Field>
          </View>

          {/* ── Report & Flags ── */}
          <SectionBar icon="file-document-outline" title="Report & Flags" />
          <View style={s.formCard}>

            <Field label="Report Type">
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['Print', 'Email', 'WhatsApp', 'Online'].map(rt => (
                  <TouchableOpacity
                    key={rt}
                    style={[s.pill, reportType === rt && s.pillActive]}
                    onPress={() => setReportType(rt)}
                  >
                    <Text style={[s.pillText, reportType === rt && s.pillTextActive]}>{rt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>

            {/* Emergency toggle */}
            <TouchableOpacity style={s.toggleRow} onPress={() => setIsEmergency(e => !e)}>
              <View style={[s.checkbox, isEmergency && s.checkboxOn]}>
                {isEmergency && <Feather name="check" size={12} color="#FFF" />}
              </View>
              <Text style={s.toggleLabel}>Emergency</Text>
              {isEmergency && (
                <View style={s.urgentBadge}>
                  <Text style={s.urgentText}>URGENT</Text>
                </View>
              )}
            </TouchableOpacity>
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

  // Notes (kept for any multiline use)
  notesInput: {
    borderWidth: 1, borderColor: T.border, borderRadius: 8,
    paddingHorizontal: 12, paddingTop: 10, minHeight: 70,
    fontSize: 13, color: T.text, backgroundColor: T.bg,
  },
  charCount: { fontSize: 10, color: T.muted, textAlign: 'right', marginTop: 4 },

  // Report type pills
  pill:          { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20,
                   borderWidth: 1, borderColor: T.border, backgroundColor: T.bg },
  pillActive:    { backgroundColor: T.primary, borderColor: T.primary },
  pillText:      { fontSize: 11, color: T.sub, fontWeight: '600' },
  pillTextActive:{ color: '#FFF' },

  // Emergency toggle
  toggleRow:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  checkbox:   { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5,
                borderColor: T.border, backgroundColor: T.bg,
                alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  checkboxOn: { backgroundColor: T.danger, borderColor: T.danger },
  toggleLabel:{ fontSize: 14, color: T.text, fontWeight: '600' },
  urgentBadge:{ marginLeft: 8, backgroundColor: '#FEE2E2', borderRadius: 6,
                paddingHorizontal: 7, paddingVertical: 2 },
  urgentText: { fontSize: 9, fontWeight: '800', color: '#EF4444' },

  // Update button
  updateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: T.tealDark,
    marginHorizontal: 14, marginTop: 20, borderRadius: 12,
    paddingVertical: 15,
  },
  updateBtnText: { fontSize: 15, fontWeight: '800', color: '#FFF' },
});
