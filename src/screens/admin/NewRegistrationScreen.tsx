import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../utils/constants';
import {
  registerPatient,
  updatePatientFiles,
  getInitials,
  getDoctors,
  searchTests,
  InitialItem,
  DoctorItem,
} from '../../services/registrationService';

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
  green:     '#15803D',
};

const INITIALS  = ['Mr', 'Mrs', 'Ms', 'Dr', 'Master'];
const GENDERS   = ['Male', 'Female', 'Other'];
const AGE_TYPES = ['Year', 'Month', 'Day'];
const PAYMENT_TYPES = ['Cash', 'Cheque', 'Card', 'Online'];
const DISC_TYPES = ['Amt', 'Per%'];

// ─── Section Header (teal bar like web) ───────────────────────────────────────
function SectionBar({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={s.sectionBar}>
      <MaterialCommunityIcons name={icon as any} size={16} color="#FFF" />
      <Text style={s.sectionBarText}>{title}</Text>
    </View>
  );
}

// ─── Simple inline dropdown ───────────────────────────────────────────────────
function InlineSelect({ value, options, onSelect, placeholder, style }: any) {
  const [open, setOpen] = useState(false);
  return (
    <View style={[{ flex: 1 }, style]}>
      <TouchableOpacity style={s.inlineSelect} onPress={() => setOpen(!open)} activeOpacity={0.8}>
        <Text style={[s.inlineSelectText, !value && { color: T.muted }]}>
          {value || placeholder}
        </Text>
        <Feather name="chevron-down" size={14} color={T.sub} />
      </TouchableOpacity>
      {open && (
        <View style={s.ddMenu}>
          {options.map((o: string) => (
            <TouchableOpacity key={o} style={s.ddItem} onPress={() => { onSelect(o); setOpen(false); }}>
              <Text style={s.ddItemText}>{o}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ children }: { children: React.ReactNode }) {
  return <View style={s.fieldWrap}>{children}</View>;
}

export default function NewRegistrationScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  // ── Patient Info ─────────────────────────────────────────────────────────
  const [mainLab,      setMainLab]      = useState('');
  const [rateType,     setRateType]     = useState('MRP1');
  const [refDoctor,    setRefDoctor]    = useState('');
  const [initial,      setInitial]      = useState('');
  const [patName,      setPatName]      = useState('');
  const [gender,       setGender]       = useState('');
  const [ageType,      setAgeType]      = useState('Year');
  const [age,          setAge]          = useState('');
  const [dob,          setDob]          = useState('');
  const [mobile,       setMobile]       = useState('');
  const [email,        setEmail]        = useState('');
  const [address,      setAddress]      = useState('');
  const [patCardNo,    setPatCardNo]    = useState('');
  const [cardExp,      setCardExp]      = useState('');
  const [hospitalId,   setHospitalId]   = useState('');
  const [weight,       setWeight]       = useState('');
  const [height,       setHeight]       = useState('');
  const [disease,      setDisease]      = useState('');
  const [symptoms,     setSymptoms]     = useState('');
  const [therapy,      setTherapy]      = useState('');
  const [fsTime,       setFsTime]       = useState('');
  const [lastPeriod,   setLastPeriod]   = useState('');
  const [clinicalHist, setClinicalHist] = useState('');

  // ── Report Type ───────────────────────────────────────────────────────────
  const [repPrint,     setRepPrint]     = useState(false);
  const [repEmail,     setRepEmail]     = useState(false);
  const [repWhatsapp,  setRepWhatsapp]  = useState(false);
  const [repOnline,    setRepOnline]    = useState(false);

  // ── Add Tests ─────────────────────────────────────────────────────────────
  const [testSearch,   setTestSearch]   = useState('');
  const [addedTests,   setAddedTests]   = useState<string[]>([]);

  // ── Payment ───────────────────────────────────────────────────────────────
  const [payType,      setPayType]      = useState('Cash');
  const [otherCharge,  setOtherCharge]  = useState('0');
  const [otherRemark,  setOtherRemark]  = useState('');
  const [discType,     setDiscType]     = useState('Amt');
  const [discAmt,      setDiscAmt]      = useState('0');
  const [paidAmt,      setPaidAmt]      = useState('0.00');
  const [remark,       setRemark]       = useState('');
  const [emergency,    setEmergency]    = useState(false);

  // ── Register ──────────────────────────────────────────────────────────────
  const [registering, setRegistering] = useState(false);
  const [updating,    setUpdating]    = useState(false);
  const [regNo,       setRegNo]       = useState<string>('—');

  // ── API-loaded dropdown data ───────────────────────────────────────────────
  const [initialsList,  setInitialsList]  = useState<InitialItem[]>([]);
  const [doctorsList,   setDoctorsList]   = useState<DoctorItem[]>([]);
  const [testResults,   setTestResults]   = useState<any[]>([]);
  const [searchingTest, setSearchingTest] = useState(false);

  useEffect(() => {
    // Load initials from API
    getInitials()
      .then(data => { if (data.length > 0) setInitialsList(data); })
      .catch(() => {});
    // Load referring doctors from API
    getDoctors()
      .then(data => { if (data.length > 0) setDoctorsList(data); })
      .catch(() => {});
  }, []);

  const handleClear = () => {
    setMainLab(''); setRateType('MRP1'); setRefDoctor('');
    setInitial(''); setPatName(''); setGender('');
    setAgeType('Year'); setAge(''); setDob('');
    setMobile(''); setEmail(''); setAddress('');
    setPatCardNo(''); setCardExp(''); setHospitalId('');
    setWeight(''); setHeight(''); setDisease('');
    setSymptoms(''); setTherapy(''); setFsTime('');
    setLastPeriod(''); setClinicalHist('');
    setRepPrint(false); setRepEmail(false); setRepWhatsapp(false); setRepOnline(false);
    setTestSearch(''); setAddedTests([]);
    setPayType('Cash'); setOtherCharge('0'); setOtherRemark('');
    setDiscType('Amt'); setDiscAmt('0'); setPaidAmt('0.00');
    setRemark(''); setEmergency(false);
    setRegNo('—');
  };

  const handleSave = async () => {
    if (!patName.trim()) { Alert.alert('Required', 'Please enter patient name.'); return; }
    if (!age.trim())     { Alert.alert('Required', 'Please enter age.'); return; }

    setRegistering(true);
    try {
      const data = await registerPatient({
        Patname:    patName.trim(),
        Age:        parseInt(age, 10),
        Pataddress: address.trim() || 'N/A',
      });

      const pid = String(data?.PID ?? data?.PPID ?? data?.PatRegID ?? '—');
      setRegNo(pid);

      Alert.alert(
        '✅ ' + (data?.Message ?? 'Patient Registered Successfully'),
        `Patient ID       : ${data?.PID            ?? '—'}\n` +
        `Reg Number       : ${data?.PrefixRegNumber ?? '—'}\n` +
        `Pat Reg ID       : ${data?.PatRegID        ?? '—'}\n` +
        `Receipt No       : ${data?.ReceiptNo       ?? '—'}\n` +
        `Bill No          : ${data?.BillNo          ?? '—'}\n` +
        `RID              : ${data?.RID             ?? '—'}`,
        [
          { text: 'New Patient', onPress: handleClear },
          { text: 'Done',        onPress: () => navigation.goBack() },
        ]
      );
    } catch (err: any) {
      Alert.alert('Registration Failed', err?.message ?? 'Could not connect to server.');
    } finally {
      setRegistering(false);
    }
  };

  const handleUpdate = async () => {
    if (regNo === '—' || !regNo) {
      Alert.alert('No Patient', 'Please register a patient first to get a Patient ID.');
      return;
    }
    if (!patName.trim()) { Alert.alert('Required', 'Please enter patient name.'); return; }
    if (!age.trim())     { Alert.alert('Required', 'Please enter age.'); return; }

    setUpdating(true);
    try {
      const data = await updatePatientFiles({
        PID:        parseInt(regNo, 10),
        Patname:    patName.trim(),
        Age:        parseInt(age, 10),
        Pataddress: address.trim() || 'N/A',
        BranchID:   1,
      });

      Alert.alert(
        '✅ ' + (data?.Message ?? 'Files Updated Successfully'),
        `Patient ID  : ${regNo}\nPat Reg ID  : ${data?.PatRegID ?? '—'}\nBranch ID   : ${data?.BranchId ?? '—'}`,
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      Alert.alert('Update Failed', err?.message ?? 'Could not connect to server.');
    } finally {
      setUpdating(false);
    }
  };

  // Checkbox helper
  const Checkbox = ({ value, onToggle, label }: { value: boolean; onToggle: () => void; label: string }) => (
    <TouchableOpacity style={s.checkRow} onPress={onToggle} activeOpacity={0.8}>
      <View style={[s.checkBox, value && s.checkBoxOn]}>
        {value && <Feather name="check" size={11} color="#FFF" />}
      </View>
      <Text style={s.checkLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView style={[s.root, { paddingTop: Math.max(insets.top, 0) }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Feather name="arrow-left" size={22} color={T.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>New Registration</Text>
        <MaterialCommunityIcons name="line-scan" size={22} color={T.primary} />
      </View>

      {/* ── Breadcrumb ── */}
      <View style={s.breadcrumb}>
        <Feather name="home" size={13} color={T.primary} />
        <Text style={s.bcText}> Front Desk</Text>
        <Feather name="chevron-right" size={13} color={T.muted} style={{ marginHorizontal: 2 }} />
        <Text style={[s.bcText, { color: T.primary, fontWeight: '700' }]}>New Registration</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.scroll}>

        {/* Reg No banner */}
        <View style={s.regNoBanner}>
          <MaterialCommunityIcons name="account-badge-outline" size={16} color={T.tealDark} />
          <Text style={s.regNoText}>  Your Reg No: <Text style={{ fontWeight: '800', color: T.tealDark }}>{regNo}</Text></Text>
        </View>

        {/* ══ PATIENT INFORMATION ══ */}
        <SectionBar icon="account" title="Patient Information" />
        <View style={s.formCard}>

          {/* Main Lab */}
          <Field>
            <InlineSelect value={mainLab} options={['Main Lab', 'Branch 1', 'Branch 2']}
              onSelect={setMainLab} placeholder="Main Lab" />
          </Field>

          {/* Rate Type */}
          <Field>
            <InlineSelect value={rateType} options={['MRP1', 'MRP2', 'MRP3', 'General']}
              onSelect={setRateType} placeholder="MRP1" />
          </Field>

          {/* Ref Doctor */}
          <Field>
            <InlineSelect value={refDoctor}
              options={doctorsList.length > 0
                ? doctorsList.map(d => d.Name)
                : ['Dr. Smith', 'Dr. Patel', 'Dr. Khan']}
              onSelect={setRefDoctor} placeholder="Ref Doctor" />
          </Field>

          {/* Initial | Name | Gender | Age */}
          <Field>
            <View style={s.rowWrap}>
              <View style={{ width: 80 }}>
                <InlineSelect value={initial}
                  options={initialsList.length > 0
                    ? initialsList.map(i => i.Name)
                    : INITIALS}
                  onSelect={setInitial} placeholder="Initial" />
              </View>
              <TextInput style={[s.input, { flex: 1, marginHorizontal: 6 }]}
                placeholder="Enter Name" placeholderTextColor={T.muted}
                value={patName} onChangeText={setPatName} />
              <View style={{ width: 100 }}>
                <InlineSelect value={gender} options={GENDERS} onSelect={setGender} placeholder="Gender" />
              </View>
              <TextInput style={[s.input, { width: 52, marginLeft: 6 }]}
                placeholder="Age" placeholderTextColor={T.muted}
                keyboardType="numeric" value={age} onChangeText={setAge} />
            </View>
          </Field>

          {/* Age Type | DOB */}
          <Field>
            <View style={s.rowWrap}>
              <View style={{ width: 80 }}>
                <InlineSelect value={ageType} options={AGE_TYPES} onSelect={setAgeType} placeholder="Year" />
              </View>
              <Text style={[s.inputLabel, { marginHorizontal: 8, alignSelf: 'center' }]}>DOB</Text>
              <TextInput style={[s.input, { flex: 1 }]}
                placeholder="dd-mm-yyyy" placeholderTextColor={T.muted}
                value={dob} onChangeText={setDob} />
            </View>
          </Field>

          {/* Mobile */}
          <Field>
            <TextInput style={s.input} placeholder="Mobile" placeholderTextColor={T.muted}
              keyboardType="phone-pad" value={mobile} onChangeText={setMobile} />
          </Field>

          {/* Email */}
          <Field>
            <TextInput style={s.input} placeholder="Enter Email" placeholderTextColor={T.muted}
              keyboardType="email-address" autoCapitalize="none"
              value={email} onChangeText={setEmail} />
          </Field>

          {/* Address */}
          <Field>
            <TextInput style={s.input} placeholder="Enter Address" placeholderTextColor={T.muted}
              value={address} onChangeText={setAddress} />
          </Field>

          {/* Patient Card No | Hospital Id */}
          <Field>
            <View style={s.rowWrap}>
              <TextInput style={[s.input, { flex: 1, marginRight: 6 }]}
                placeholder="Patient Card No (e.g. PCN2026001)" placeholderTextColor={T.muted}
                value={patCardNo} onChangeText={setPatCardNo} />
              <TextInput style={[s.input, { flex: 1 }]}
                placeholder="Hospital Id" placeholderTextColor={T.muted}
                value={hospitalId} onChangeText={setHospitalId} />
            </View>
          </Field>

          {/* Card Exp */}
          <Field>
            <TextInput style={s.input} placeholder="Card Exp (e.g.2030)" placeholderTextColor={T.muted}
              value={cardExp} onChangeText={setCardExp} />
          </Field>

          {/* Weight | Height */}
          <Field>
            <View style={s.rowWrap}>
              <TextInput style={[s.input, { flex: 1, marginRight: 6 }]}
                placeholder="Weight in kg (numeric only)" placeholderTextColor={T.muted}
                keyboardType="numeric" value={weight} onChangeText={setWeight} />
              <TextInput style={[s.input, { flex: 1 }]}
                placeholder="Height in cm (numeric only)" placeholderTextColor={T.muted}
                keyboardType="numeric" value={height} onChangeText={setHeight} />
            </View>
          </Field>

          {/* Disease */}
          <Field>
            <TextInput style={s.input} placeholder="Enter Disease" placeholderTextColor={T.muted}
              value={disease} onChangeText={setDisease} />
          </Field>

          {/* Symptoms */}
          <Field>
            <TextInput style={s.input} placeholder="Enter Symptoms" placeholderTextColor={T.muted}
              value={symptoms} onChangeText={setSymptoms} />
          </Field>

          {/* Therapy */}
          <Field>
            <TextInput style={s.input} placeholder="Enter Therapy" placeholderTextColor={T.muted}
              value={therapy} onChangeText={setTherapy} />
          </Field>

          {/* FSTime */}
          <Field>
            <TextInput style={s.input} placeholder="FSTime (e.g. 08:00 AM)" placeholderTextColor={T.muted}
              value={fsTime} onChangeText={setFsTime} />
          </Field>

          {/* Last Period */}
          <Field>
            <TextInput style={s.input} placeholder="Last Period (e.g. 2026-05-01)" placeholderTextColor={T.muted}
              value={lastPeriod} onChangeText={setLastPeriod} />
          </Field>

          {/* Clinical History */}
          <Field>
            <TextInput style={[s.input, s.inputHighlight]} placeholder="Enter Clinical History"
              placeholderTextColor={T.muted} value={clinicalHist} onChangeText={setClinicalHist} />
          </Field>

          {/* Report Type */}
          <View style={s.reportTypeRow}>
            <View style={s.reportTypeLabel}>
              <MaterialCommunityIcons name="file-document-outline" size={14} color={T.tealDark} />
              <Text style={s.reportTypeLabelText}> REPORT TYPE</Text>
            </View>
            <Checkbox value={repPrint}    onToggle={() => setRepPrint(!repPrint)}       label="Print" />
            <Checkbox value={repEmail}    onToggle={() => setRepEmail(!repEmail)}       label="Email" />
            <Checkbox value={repWhatsapp} onToggle={() => setRepWhatsapp(!repWhatsapp)} label="Whatsapp" />
          </View>
          <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
            <Checkbox value={repOnline} onToggle={() => setRepOnline(!repOnline)} label="Online" />
          </View>
        </View>

        {/* ══ ADD TESTS ══ */}
        <SectionBar icon="flask-outline" title="Add Tests" />
        <View style={s.formCard}>
          <Field>
            <View style={[s.rowWrap, { borderWidth: 1.5, borderColor: T.danger, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 }]}>
              <Feather name="search" size={16} color={T.muted} style={{ marginRight: 8 }} />
              <TextInput style={{ flex: 1, fontSize: 13, color: T.text }}
                placeholder="Type test name to search..."
                placeholderTextColor={T.muted}
                value={testSearch}
                onChangeText={async (txt) => {
                  setTestSearch(txt);
                  if (txt.length >= 2) {
                    setSearchingTest(true);
                    try {
                      const results = await searchTests(txt);
                      setTestResults(results);
                    } catch { setTestResults([]); }
                    finally { setSearchingTest(false); }
                  } else {
                    setTestResults([]);
                  }
                }}
              />
              {searchingTest && <ActivityIndicator size="small" color={T.primary} />}
            </View>
            {testResults.length > 0 && (
              <View style={s.ddMenu}>
                {testResults.slice(0, 8).map((t: any, i: number) => (
                  <TouchableOpacity key={i} style={s.ddItem}
                    onPress={() => {
                      const name = t.TestName || t.testName || t.name || String(t);
                      if (!addedTests.includes(name)) setAddedTests([...addedTests, name]);
                      setTestSearch('');
                      setTestResults([]);
                    }}>
                    <Text style={s.ddItemText}>{t.TestName || t.testName || t.name || String(t)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Field>
          <View style={s.noTestsBox}>
            {addedTests.length === 0
              ? <>
                  <MaterialCommunityIcons name="flask-outline" size={40} color={T.primary} />
                  <Text style={s.noTestsText}>No tests added yet</Text>
                </>
              : <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 4 }}>
                  {addedTests.map((t, i) => (
                    <TouchableOpacity key={i}
                      style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: T.tealBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: T.tealBorder }}
                      onPress={() => setAddedTests(addedTests.filter((_, idx) => idx !== i))}>
                      <Text style={{ fontSize: 12, color: T.tealDark, fontWeight: '600' }}>{t}</Text>
                      <Feather name="x" size={13} color={T.tealDark} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  ))}
                </View>
            }
          </View>
        </View>

        {/* ══ PAYMENT DETAILS ══ */}
        <SectionBar icon="credit-card-outline" title="Payment Details" />
        <View style={s.formCard}>

          {/* Payment Type */}
          <View style={s.payTypeRow}>
            <Text style={s.payTypeLabel}>Payment Type</Text>
            <View style={s.payTypeBtns}>
              {PAYMENT_TYPES.map(pt => (
                <TouchableOpacity key={pt}
                  style={[s.payTypeBtn, payType === pt && s.payTypeBtnActive]}
                  onPress={() => setPayType(pt)} activeOpacity={0.8}>
                  <Text style={[s.payTypeBtnText, payType === pt && s.payTypeBtnTextActive]}>{pt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Total Amount */}
          <View style={s.amountRow}>
            <Text style={s.amountLabel}>Total Amount</Text>
            <View style={s.amountValueBox}>
              <Text style={s.amountValue}>0.00</Text>
            </View>
            <Checkbox value={false} onToggle={() => {}} label="BTH" />
          </View>

          {/* Other Charge | Remark */}
          <View style={s.rowWrap2}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={s.fieldLabel}>Other Charge</Text>
              <TextInput style={s.input} value={otherCharge} onChangeText={setOtherCharge}
                keyboardType="numeric" placeholderTextColor={T.muted} />
            </View>
            <View style={{ flex: 1.5 }}>
              <Text style={s.fieldLabel}>Other Charge Remark</Text>
              <TextInput style={s.input} value={otherRemark} onChangeText={setOtherRemark}
                placeholderTextColor={T.muted} />
            </View>
          </View>

          {/* Disc Type */}
          <View style={s.discRow}>
            <Text style={s.fieldLabel}>Disc Type</Text>
            <View style={{ marginLeft: 12 }}>
              {DISC_TYPES.map(dt => (
                <TouchableOpacity key={dt} style={s.radioRow} onPress={() => setDiscType(dt)}>
                  <View style={[s.radioOuter, discType === dt && s.radioOuterOn]}>
                    {discType === dt && <View style={s.radioInner} />}
                  </View>
                  <Text style={s.radioLabel}>{dt}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flex: 1 }} />
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.fieldLabel}>Disc Amt</Text>
              <TextInput style={[s.input, { width: 80, textAlign: 'right' }]}
                value={discAmt} onChangeText={setDiscAmt}
                keyboardType="numeric" placeholderTextColor={T.muted} />
            </View>
          </View>

          {/* Net Amount */}
          <View style={s.netAmtRow}>
            <Text style={s.netAmtLabel}>Net Amount</Text>
            <Text style={s.netAmtValue}>₹ 0.00</Text>
          </View>

          {/* Paid Amt */}
          <View style={s.rowWrap2}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={s.fieldLabel}>Paid Amt <Text style={{ color: T.danger }}>*</Text></Text>
              <TextInput style={s.input} value={paidAmt} onChangeText={setPaidAmt}
                keyboardType="numeric" placeholderTextColor={T.muted} />
            </View>
            <View style={{ flex: 1.5 }}>
              <Text style={s.fieldLabel}>Balance <Text style={{ color: T.danger }}>*</Text></Text>
              <View style={s.balanceBox}><Text style={s.balanceText}>0.00</Text></View>
            </View>
          </View>

          {/* Remark */}
          <View style={s.remarkRow}>
            <Text style={s.fieldLabel}>Remark <Text style={{ color: T.danger }}>*</Text></Text>
            <TextInput style={[s.input, { marginTop: 4 }]} placeholder="Remark"
              placeholderTextColor={T.muted} value={remark} onChangeText={setRemark} />
          </View>

          {/* Emergency */}
          <View style={s.emergencyRow}>
            <Checkbox value={emergency} onToggle={() => setEmergency(!emergency)} label="Emergency" />
          </View>
        </View>

        {/* ══ FOOTER BUTTONS ══ */}
        <View style={s.footerBtns}>
          <TouchableOpacity style={s.clearBtn} onPress={handleClear} activeOpacity={0.8}>
            <MaterialCommunityIcons name="refresh" size={16} color="#FFF" />
            <Text style={s.clearBtnText}> Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.saveBtn, registering && { opacity: 0.6 }]}
            onPress={handleSave} disabled={registering} activeOpacity={0.8}>
            {registering
              ? <ActivityIndicator color="#FFF" size="small" />
              : <MaterialCommunityIcons name="content-save-outline" size={16} color="#FFF" />}
            <Text style={s.saveBtnText}> {registering ? 'Saving…' : 'Save'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.updateBtn, (updating || regNo === '—') && { opacity: 0.5 }]}
            onPress={handleUpdate} disabled={updating || regNo === '—'} activeOpacity={0.8}>
            {updating
              ? <ActivityIndicator color="#FFF" size="small" />
              : <MaterialCommunityIcons name="pencil-outline" size={16} color="#FFF" />}
            <Text style={s.saveBtnText}> {updating ? 'Updating…' : 'Update'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.saveBillBtn} activeOpacity={0.8}>
            <MaterialCommunityIcons name="receipt" size={14} color="#FFF" />
            <Text style={s.saveBtnText}>{'\n'}Save{'\n'}&amp; Bill</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.waBtn} activeOpacity={0.8}>
            <MaterialCommunityIcons name="whatsapp" size={16} color="#FFF" />
            <Text style={s.saveBtnText}> WhatsApp</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: T.screenBg },
  header:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, backgroundColor: T.bg, borderBottomWidth: 1, borderBottomColor: T.border, gap: 12 },
  backBtn:    { padding: 4 },
  headerTitle:{ flex: 1, fontSize: 18, fontWeight: '800', color: T.text },
  breadcrumb: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5F4', paddingHorizontal: 16, paddingVertical: 8 },
  bcText:     { fontSize: 12, color: T.sub },
  scroll:     { paddingBottom: 20 },

  regNoBanner:{ flexDirection: 'row', alignItems: 'center', backgroundColor: T.tealBg, borderWidth: 1, borderColor: T.tealBorder, margin: 12, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
  regNoText:  { fontSize: 13, color: T.tealDark, fontWeight: '600' },

  sectionBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.tealDark, paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  sectionBarText: { fontSize: 14, fontWeight: '700', color: '#FFF' },

  formCard:   { backgroundColor: T.bg, paddingHorizontal: 12, paddingTop: 8, marginBottom: 2 },
  fieldWrap:  { marginBottom: 8 },
  rowWrap:    { flexDirection: 'row', alignItems: 'center' },
  rowWrap2:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, paddingHorizontal: 0 },

  input: {
    borderWidth: 1, borderColor: T.border, borderRadius: 6,
    paddingHorizontal: 10, height: 40,
    fontSize: 13, color: T.text, backgroundColor: T.bg,
  },
  inputHighlight: { borderColor: T.primary, borderWidth: 1.5 },
  inputLabel: { fontSize: 11, color: T.sub, fontWeight: '600' },
  fieldLabel: { fontSize: 11, color: T.sub, fontWeight: '600', marginBottom: 4 },

  // Inline Select
  inlineSelect: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: T.border, borderRadius: 6, paddingHorizontal: 8, height: 40, backgroundColor: T.bg },
  inlineSelectText: { flex: 1, fontSize: 13, color: T.text },
  ddMenu: { borderWidth: 1, borderColor: T.border, borderRadius: 6, backgroundColor: T.bg, zIndex: 999, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 6 },
  ddItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  ddItemText: { fontSize: 13, color: T.text },

  // Checkbox
  checkRow:   { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  checkBox:   { width: 16, height: 16, borderRadius: 3, borderWidth: 1.5, borderColor: T.border, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center', marginRight: 5 },
  checkBoxOn: { backgroundColor: T.primary, borderColor: T.primary },
  checkLabel: { fontSize: 12, color: T.text, fontWeight: '500' },

  // Report Type
  reportTypeRow:   { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: T.border },
  reportTypeLabel: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  reportTypeLabelText: { fontSize: 11, fontWeight: '800', color: T.tealDark, letterSpacing: 0.4 },

  // No tests
  noTestsBox: { alignItems: 'center', paddingVertical: 24 },
  noTestsText:{ fontSize: 13, color: T.muted, marginTop: 8 },

  // Payment type
  payTypeRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 0 },
  payTypeLabel: { fontSize: 13, fontWeight: '600', color: T.text, marginRight: 12, width: 90 },
  payTypeBtns:  { flexDirection: 'row', gap: 6 },
  payTypeBtn:   { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: T.border, backgroundColor: T.bg },
  payTypeBtnActive: { backgroundColor: T.primary, borderColor: T.primary },
  payTypeBtnText:   { fontSize: 12, color: T.sub, fontWeight: '600' },
  payTypeBtnTextActive: { color: '#FFF' },

  // Amount
  amountRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  amountLabel:   { fontSize: 13, color: T.text, fontWeight: '600', width: 100 },
  amountValueBox:{ flex: 1, borderWidth: 1, borderColor: T.border, borderRadius: 6, paddingHorizontal: 10, height: 38, justifyContent: 'center', backgroundColor: '#F0FDFA' },
  amountValue:   { fontSize: 15, fontWeight: '800', color: T.primary },

  // Disc
  discRow:  { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  radioRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  radioOuter: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: T.border, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  radioOuterOn: { borderColor: T.primary },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: T.primary },
  radioLabel: { fontSize: 13, color: T.text },

  // Net Amount
  netAmtRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: T.tealBg, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, borderWidth: 1, borderColor: T.tealBorder },
  netAmtLabel: { flex: 1, fontSize: 15, fontWeight: '800', color: T.tealDark },
  netAmtValue: { fontSize: 18, fontWeight: '900', color: T.tealDark },

  // Balance
  balanceBox:  { borderWidth: 1, borderColor: '#FDE68A', borderRadius: 6, paddingHorizontal: 10, height: 40, justifyContent: 'center', backgroundColor: '#FFFBEB' },
  balanceText: { fontSize: 14, fontWeight: '700', color: '#92400E' },

  remarkRow:    { marginBottom: 10 },
  emergencyRow: { paddingBottom: 10 },

  // Footer
  footerBtns: { flexDirection: 'row', gap: 8, padding: 12, flexWrap: 'wrap' },
  clearBtn:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#64748B', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 11 },
  clearBtnText:{ color: '#FFF', fontSize: 13, fontWeight: '700' },
  saveBtn:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 11 },
  updateBtn:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D97706', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 11 },
  saveBillBtn:{ flexDirection: 'row', alignItems: 'center', backgroundColor: T.tealDark, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  waBtn:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16A34A', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 11 },
  saveBtnText:{ color: '#FFF', fontSize: 12, fontWeight: '700' },
});
