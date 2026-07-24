import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Alert,
  ActivityIndicator, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import {
  registerPatient, updatePatientFiles,
  getInitials, getDoctors, searchTests, searchPatient,
  InitialItem, DoctorItem, SearchPatientItem, TestResult,
} from '../../services/registrationService';

const T = {
  primary:    '#0D9488',
  tealDark:   '#0F766E',
  tealBg:     '#F0FDFA',
  tealBorder: '#CCFBF1',
  bg:         '#FFFFFF',
  screenBg:   '#F8FAFC',
  text:       '#0F172A',
  sub:        '#64748B',
  muted:      '#94A3B8',
  border:     '#E2E8F0',
  danger:     '#EF4444',
  green:      '#15803D',
};

const INITIALS      = ['Mr','Mrs','Ms','Dr','Master'];
const GENDERS       = ['Male','Female','Other'];
const AGE_TYPES     = ['Year','Month','Day'];
const PAYMENT_TYPES = ['Cash','Cheque','Card','Online'];
const DISC_TYPES    = ['Amt','Per%'];

const STEPS = [
  { key: 1, label: 'Patient\nInfo',    icon: 'account-outline'    },
  { key: 2, label: 'Add\nTests',       icon: 'flask-outline'       },
  { key: 3, label: 'Payment\nDetails', icon: 'credit-card-outline' },
];

function SectionBar({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={s.sectionBar}>
      <MaterialCommunityIcons name={icon as any} size={16} color="#FFF" />
      <Text style={s.sectionBarText}>{title}</Text>
    </View>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <View style={s.fieldWrap}>{children}</View>;
}

function InlineSelect({ value, options, onSelect, placeholder }: any) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity style={s.inlineSelect} onPress={() => setOpen(!open)} activeOpacity={0.8}>
        <Text style={[s.inlineSelectText, !value && { color: T.muted }]} numberOfLines={1}>
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

function Checkbox({ value, onToggle, label }: { value: boolean; onToggle: () => void; label: string }) {
  return (
    <TouchableOpacity style={s.checkRow} onPress={onToggle} activeOpacity={0.8}>
      <View style={[s.checkBox, value && s.checkBoxOn]}>
        {value && <Feather name="check" size={11} color="#FFF" />}
      </View>
      <Text style={s.checkLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function DateField({ value, onChange }: { value: Date | null; onChange: (d: Date) => void }) {
  const [show, setShow] = useState(false);
  const display = value
    ? `${String(value.getDate()).padStart(2,'0')}-${String(value.getMonth()+1).padStart(2,'0')}-${value.getFullYear()}`
    : '';
  return (
    <>
      <TouchableOpacity style={s.datePicker} onPress={() => setShow(true)} activeOpacity={0.8}>
        <MaterialCommunityIcons name="calendar-month-outline" size={18} color={T.sub} style={{ marginRight: 8 }} />
        <Text style={[s.datePickerText, !value && { color: T.muted }]}>{display || 'dd-mm-yyyy'}</Text>
        <MaterialCommunityIcons name="calendar-blank-outline" size={18} color={T.sub} />
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(_, selected) => {
            setShow(Platform.OS === 'ios');
            if (selected) onChange(selected);
          }}
        />
      )}
    </>
  );
}

function StepIndicator({ current }: { current: number }) {
  return (
    <View style={s.stepBar}>
      {STEPS.map((step, idx) => {
        const done = current > step.key;
        const active = current === step.key;
        return (
          <React.Fragment key={step.key}>
            <View style={s.stepItem}>
              <View style={[s.stepCircle, done && s.stepCircleDone, active && s.stepCircleActive]}>
                {done
                  ? <Feather name="check" size={14} color="#FFF" />
                  : <MaterialCommunityIcons name={step.icon as any} size={16} color={active ? '#FFF' : T.muted} />}
              </View>
              <Text style={[s.stepLabel, active && { color: T.tealDark, fontWeight: '700' }, done && { color: T.green }]}>
                {step.label}
              </Text>
            </View>
            {idx < STEPS.length - 1 && <View style={[s.stepLine, done && s.stepLineDone]} />}
          </React.Fragment>
        );
      })}
    </View>
  );
}

export default function NewRegistrationScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState(1);

  const [mainLab,      setMainLab]      = useState('');
  const [rateType,     setRateType]     = useState('MRP1');
  const [refDoctor,    setRefDoctor]    = useState('');
  const [initial,      setInitial]      = useState('');
  const [patName,      setPatName]      = useState('');
  const [gender,       setGender]       = useState('');
  const [ageType,      setAgeType]      = useState('Year');
  const [age,          setAge]          = useState('');
  const [dob,          setDob]          = useState<Date | null>(null);
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
  const [lastPeriod,   setLastPeriod]   = useState<Date | null>(null);
  const [clinicalHist, setClinicalHist] = useState('');
  const [repPrint,     setRepPrint]     = useState(false);
  const [repEmail,     setRepEmail]     = useState(false);
  const [repWhatsapp,  setRepWhatsapp]  = useState(false);
  const [repOnline,    setRepOnline]    = useState(false);

  const [testSearch,    setTestSearch]   = useState('');
  const [addedTests,    setAddedTests]   = useState<string[]>([]);
  const [addedTestIds,  setAddedTestIds] = useState<number[]>([]);
  const [testResults,   setTestResults]  = useState<TestResult[]>([]);
  const [searchingTest, setSearchingTest]= useState(false);
  const [showTestDrop,  setShowTestDrop] = useState(false);
  const testDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [payType,      setPayType]      = useState('Cash');
  const [otherCharge,  setOtherCharge]  = useState('0');
  const [otherRemark,  setOtherRemark]  = useState('');
  const [discType,     setDiscType]     = useState('Amt');
  const [discAmt,      setDiscAmt]      = useState('0');
  const [paidAmt,      setPaidAmt]      = useState('0.00');
  const [remark,       setRemark]       = useState('');
  const [emergency,    setEmergency]    = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState<string | null>(null);
  const [photoFile,        setPhotoFile]        = useState<string | null>(null);

  const [registering,  setRegistering]  = useState(false);
  const [updating,     setUpdating]     = useState(false);
  const [regNo,        setRegNo]        = useState<string>('—');
  const [initialsList, setInitialsList] = useState<InitialItem[]>([]);
  const [doctorsList,  setDoctorsList]  = useState<DoctorItem[]>([]);

  // ── Patient search (auto-fill) ─────────────────────────────────────────────
  const [patSearch,        setPatSearch]        = useState('');
  const [patSearchResults, setPatSearchResults] = useState<SearchPatientItem[]>([]);
  const [searching,        setSearching]        = useState(false);

  // ── Autocomplete: Name field ───────────────────────────────────────────────
  const [nameResults,  setNameResults]  = useState<SearchPatientItem[]>([]);
  const [nameSearching,setNameSearching]= useState(false);
  const [showNameDrop, setShowNameDrop] = useState(false);

  // ── Autocomplete: Mobile field ─────────────────────────────────────────────
  const [mobileResults,  setMobileResults]  = useState<SearchPatientItem[]>([]);
  const [mobileSearching,setMobileSearching]= useState(false);
  const [showMobileDrop, setShowMobileDrop] = useState(false);

  useEffect(() => {
    getInitials().then(d => { if (d.length) setInitialsList(d); }).catch(() => {});
    getDoctors().then(d  => { if (d.length) setDoctorsList(d);  }).catch(() => {});
  }, []);

  // ── Auto-fill all fields from a searched patient ───────────────────────────
  const handlePatientSelect = (p: SearchPatientItem) => {
    setPatSearch('');
    setPatSearchResults([]);
    setShowNameDrop(false);
    setShowMobileDrop(false);
    setNameResults([]);
    setMobileResults([]);
    setRegNo(String(p.PPID));
    if (p.intial)          setInitial(p.intial);
    if (p.Patname)         setPatName(p.Patname);
    if (p.sex)             setGender(p.sex);
    if (p.Age != null)     setAge(String(p.Age));
    if (p.MobileNo)        setMobile(p.MobileNo);
    if (p.Email)           setEmail(p.Email);
    if (p.Pataddress)      setAddress(p.Pataddress);
    if (p.PatientCardNo)   setPatCardNo(p.PatientCardNo);
    if (p.PatientCardExpNo)setCardExp(p.PatientCardExpNo);
    if (p.DateOfBirth) {
      const d = new Date(p.DateOfBirth);
      if (!isNaN(d.getTime())) setDob(d);
    }
    Alert.alert('✅ Patient Loaded', `Data auto-filled for ${p.Patname ?? 'Patient'} (ID: ${p.PPID})`);
  };

  // ── Live search helpers ────────────────────────────────────────────────────
  const searchByName = async (txt: string) => {
    setPatName(txt);
    if (txt.trim().length < 2) { setNameResults([]); setShowNameDrop(false); return; }
    setNameSearching(true);
    setShowNameDrop(true);
    try {
      const r = await searchPatient(txt.trim());
      setNameResults(r);
    } catch { setNameResults([]); }
    finally { setNameSearching(false); }
  };

  const searchByMobile = async (txt: string) => {
    const clean = txt.replace(/\D/g, '').slice(0, 10);
    setMobile(clean);
    if (clean.length < 2) { setMobileResults([]); setShowMobileDrop(false); return; }
    setMobileSearching(true);
    setShowMobileDrop(true);
    try {
      const r = await searchPatient(clean);
      setMobileResults(r);
    } catch { setMobileResults([]); }
    finally { setMobileSearching(false); }
  };

  // ── Debounced test search ──────────────────────────────────────────────────
  const searchByTest = (txt: string) => {
    setTestSearch(txt);
    if (testDebounce.current) clearTimeout(testDebounce.current);
    if (txt.trim().length < 2) {
      setTestResults([]);
      setShowTestDrop(false);
      return;
    }
    setShowTestDrop(true);
    setSearchingTest(true);
    testDebounce.current = setTimeout(async () => {
      try {
        const r = await searchTests(txt.trim());
        setTestResults(r);
      } catch { setTestResults([]); }
      finally { setSearchingTest(false); }
    }, 350); // 350ms debounce
  };

  const handleTestSelect = (t: TestResult) => {
    if (!addedTestIds.includes(t.mainTestId)) {
      setAddedTests(prev => [...prev, t.testName]);
      setAddedTestIds(prev => [...prev, t.mainTestId]);
    }
    setTestSearch('');
    setTestResults([]);
    setShowTestDrop(false);
  };

  // Auto-set gender based on initial
  const handleInitialSelect = (val: string) => {
    setInitial(val);
    if (['Mr', 'Master', 'Dr'].includes(val))         setGender('Male');
    else if (['Mrs', 'Ms'].includes(val))             setGender('Female');
  };

  // Auto-calculate age from DOB
  const handleDobChange = (date: Date) => {
    setDob(date);
    const today = new Date();
    let years = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) years--;
    setAgeType('Year');
    setAge(String(Math.max(0, years)));
  };

  const goToStep = (n: number) => {
    setStep(n);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!patName.trim()) { Alert.alert('Required', 'Please enter patient name.'); return; }
      if (!age.trim())     { Alert.alert('Required', 'Please enter age.');          return; }
      if (mobile && mobile.length !== 10) { Alert.alert('Invalid Mobile', 'Mobile number must be exactly 10 digits.'); return; }
    }
    if (step === 2 && addedTests.length === 0) {
      Alert.alert('No Tests Added', 'Continue without tests?', [
        { text: 'Go Back', style: 'cancel' },
        { text: 'Continue', onPress: () => goToStep(3) },
      ]);
      return;
    }
    if (step < 3) goToStep(step + 1);
  };

  const handleBack = () => { if (step > 1) goToStep(step - 1); };

  const handleClear = () => {
    setStep(1);
    setMainLab(''); setRateType('MRP1'); setRefDoctor('');
    setInitial(''); setPatName(''); setGender('');
    setAgeType('Year'); setAge(''); setDob(null);
    setMobile(''); setEmail(''); setAddress('');
    setPatCardNo(''); setCardExp(''); setHospitalId('');
    setWeight(''); setHeight(''); setDisease('');
    setSymptoms(''); setTherapy(''); setFsTime('');
    setLastPeriod(null); setClinicalHist('');
    setRepPrint(false); setRepEmail(false); setRepWhatsapp(false); setRepOnline(false);
    setTestSearch(''); setAddedTests([]); setAddedTestIds([]);
    setTestResults([]); setShowTestDrop(false);
    setPayType('Cash'); setOtherCharge('0'); setOtherRemark('');
    setDiscType('Amt'); setDiscAmt('0'); setPaidAmt('0.00');
    setRemark(''); setEmergency(false);
    setPrescriptionFile(null); setPhotoFile(null);
    setRegNo('—');
    setPatSearch(''); setPatSearchResults([]);
    setNameResults([]); setShowNameDrop(false);
    setMobileResults([]); setShowMobileDrop(false);
  };

  const handleSave = async () => {
    if (!patName.trim()) { Alert.alert('Required', 'Please enter patient name.'); return; }
    if (!age.trim())     { Alert.alert('Required', 'Please enter age.');          return; }
    setRegistering(true);
    try {
      const data = await registerPatient({ Patname: patName.trim(), Age: parseInt(age, 10), Pataddress: address.trim() || 'N/A' });
      const pid = String(data?.PID ?? data?.PPID ?? data?.PatRegID ?? '—');
      setRegNo(pid);
      Alert.alert('✅ ' + (data?.Message ?? 'Patient Registered'),
        `Patient ID : ${data?.PID ?? '—'}\nReg Number : ${data?.PrefixRegNumber ?? '—'}\nReceipt No : ${data?.ReceiptNo ?? '—'}\nBill No    : ${data?.BillNo ?? '—'}`,
        [{ text: 'New Patient', onPress: handleClear }, { text: 'Done', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Registration Failed', err?.message ?? 'Could not connect to server.');
    } finally { setRegistering(false); }
  };

  const handleUpdate = async () => {
    if (regNo === '—') { Alert.alert('No Patient', 'Register a patient first.'); return; }
    setUpdating(true);
    try {
      const data = await updatePatientFiles({ PID: parseInt(regNo, 10), Patname: patName.trim(), Age: parseInt(age, 10), Pataddress: address.trim() || 'N/A', BranchID: 1 });
      Alert.alert('✅ ' + (data?.Message ?? 'Updated'), `Patient ID: ${regNo}`, [{ text: 'OK' }]);
    } catch (err: any) {
      Alert.alert('Update Failed', err?.message ?? 'Could not connect to server.');
    } finally { setUpdating(false); }
  };

  const handleChoosePrescription = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
      if (!res.canceled && res.assets?.length) setPrescriptionFile(res.assets[0].name);
    } catch { Alert.alert('Error', 'Could not open file picker.'); }
  };

  const pickImage = async (camera: boolean) => {
    const perm = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission Denied', `${camera ? 'Camera' : 'Gallery'} permission required.`); return; }
    const res = camera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true, aspect: [1,1] })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true, aspect: [1,1] });
    if (!res.canceled && res.assets?.length) setPhotoFile(res.assets[0].uri);
  };

  const handleChoosePhoto = () => Alert.alert('Upload Photo', 'Choose source', [
    { text: 'Take Photo', onPress: () => pickImage(true) },
    { text: 'Choose from Gallery', onPress: () => pickImage(false) },
    { text: 'Cancel', style: 'cancel' },
  ]);

  const handleDeptBarcode   = () => Alert.alert('Dept Barcode',   'Coming soon.');
  const handleCard          = () => Alert.alert('Card',           'Coming soon.');
  const handleSampleBarcode = () => Alert.alert('Sample Barcode', 'Coming soon.');
  const handleCapturePhoto  = () => pickImage(true);

  return (
    <KeyboardAvoidingView style={[s.root, { paddingTop: Math.max(insets.top, 0) }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Feather name="arrow-left" size={22} color={T.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>New Registration</Text>
        <View style={s.regNoBadge}><Text style={s.regNoBadgeTxt}>Reg: {regNo}</Text></View>
      </View>

      <StepIndicator current={step} />

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={s.scroll}>

        {step === 1 && (
          <>
            <SectionBar icon="account" title="Patient Information" />
            <View style={s.formCard}>

              {/* Ref Doctor */}
              <Field>
                <InlineSelect value={refDoctor}
                  options={doctorsList.length ? doctorsList.map(d => d.Name) : ['Dr. Smith','Dr. Patel','Dr. Khan']}
                  onSelect={setRefDoctor} placeholder="Ref Doctor" />
              </Field>

              {/* Initial | Name — with autocomplete */}
              <Field>
                <View style={s.rowWrap}>
                  <View style={{ width: 90 }}>
                    <InlineSelect
                      value={initial}
                      options={initialsList.length ? initialsList.map(i => i.Name) : INITIALS}
                      onSelect={handleInitialSelect}
                      placeholder="Initial"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <TextInput
                      style={s.input}
                      placeholder="Enter Name"
                      placeholderTextColor={T.muted}
                      value={patName}
                      onChangeText={searchByName}
                      onBlur={() => setTimeout(() => setShowNameDrop(false), 200)}
                      onFocus={() => { if (nameResults.length > 0) setShowNameDrop(true); }}
                    />
                    {showNameDrop && (
                      <View style={s.acDrop}>
                        {nameSearching && (
                          <View style={s.acLoading}>
                            <ActivityIndicator size="small" color={T.primary} />
                            <Text style={s.acLoadingTxt}> Searching…</Text>
                          </View>
                        )}
                        {!nameSearching && nameResults.length === 0 && (
                          <View style={s.acEmpty}>
                            <Feather name="user-x" size={13} color={T.muted} />
                            <Text style={s.acEmptyTxt}>  No patient found</Text>
                          </View>
                        )}
                        {!nameSearching && nameResults.slice(0, 5).map((p, i) => (
                          <TouchableOpacity
                            key={`n-${p.PPID}-${i}`}
                            style={[s.acRow, i < Math.min(nameResults.length, 5) - 1 && s.acRowBorder]}
                            onPress={() => handlePatientSelect(p)}
                            activeOpacity={0.75}
                          >
                            <MaterialCommunityIcons name="account-circle-outline" size={22} color={T.primary} style={{ marginRight: 8 }} />
                            <View style={{ flex: 1 }}>
                              <Text style={s.acName}>{p.intial ? `${p.intial} ` : ''}{p.Patname ?? '—'}</Text>
                              <Text style={s.acSub}>📱 {p.MobileNo ?? '—'}  •  Age {p.Age ?? '—'}  •  ID: {p.PPID}</Text>
                            </View>
                            <View style={s.acBadge}><Text style={s.acBadgeTxt}>Select</Text></View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </Field>

              {/* Gender — auto-set from Initial, can still be changed */}
              <Field>
                <InlineSelect value={gender} options={GENDERS} onSelect={setGender} placeholder="Gender" />
              </Field>

              {/* DOB — auto-fills Age */}
              <Field>
                <View style={s.rowWrap}>
                  <Text style={[s.inputLabel, { marginRight: 8, alignSelf: 'center', width: 30 }]}>DOB</Text>
                  <View style={{ flex: 1 }}><DateField value={dob} onChange={handleDobChange} /></View>
                </View>
              </Field>

              {/* Age Type | Age — auto-filled from DOB, editable */}
              <Field>
                <View style={s.rowWrap}>
                  <View style={{ width: 90 }}>
                    <InlineSelect value={ageType} options={AGE_TYPES} onSelect={setAgeType} placeholder="Year" />
                  </View>
                  <TextInput
                    style={[s.input, { flex: 1, marginLeft: 8 }]}
                    placeholder="Age"
                    placeholderTextColor={T.muted}
                    keyboardType="numeric"
                    value={age}
                    onChangeText={setAge}
                  />
                </View>
                {dob && <Text style={{ fontSize: 11, color: T.primary, marginTop: 3, marginLeft: 2 }}>Auto-calculated from DOB</Text>}
              </Field>

              {/* Mobile — with autocomplete */}
              <Field>
                <View style={[s.input, { flexDirection: 'row', alignItems: 'center', height: 44, paddingHorizontal: 12 }]}>
                  <Feather name="phone" size={15} color={T.sub} style={{ marginRight: 8 }} />
                  <TextInput
                    style={{ flex: 1, fontSize: 13, color: T.text }}
                    placeholder="Mobile (10 digits)"
                    placeholderTextColor={T.muted}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={mobile}
                    onChangeText={searchByMobile}
                    onBlur={() => setTimeout(() => setShowMobileDrop(false), 200)}
                    onFocus={() => { if (mobileResults.length > 0) setShowMobileDrop(true); }}
                  />
                  {mobileSearching
                    ? <ActivityIndicator size="small" color={T.primary} />
                    : mobile.length > 0
                      ? <Text style={{ fontSize: 11, fontWeight: '700', color: mobile.length === 10 ? '#15803D' : T.danger }}>
                          {mobile.length}/10
                        </Text>
                      : null}
                </View>
                {showMobileDrop && (
                  <View style={s.acDrop}>
                    {mobileSearching && (
                      <View style={s.acLoading}>
                        <ActivityIndicator size="small" color={T.primary} />
                        <Text style={s.acLoadingTxt}> Searching…</Text>
                      </View>
                    )}
                    {!mobileSearching && mobileResults.length === 0 && (
                      <View style={s.acEmpty}>
                        <Feather name="user-x" size={13} color={T.muted} />
                        <Text style={s.acEmptyTxt}>  No patient found</Text>
                      </View>
                    )}
                    {!mobileSearching && mobileResults.slice(0, 5).map((p, i) => (
                      <TouchableOpacity
                        key={`m-${p.PPID}-${i}`}
                        style={[s.acRow, i < Math.min(mobileResults.length, 5) - 1 && s.acRowBorder]}
                        onPress={() => handlePatientSelect(p)}
                        activeOpacity={0.75}
                      >
                        <MaterialCommunityIcons name="account-circle-outline" size={22} color={T.primary} style={{ marginRight: 8 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={s.acName}>{p.intial ? `${p.intial} ` : ''}{p.Patname ?? '—'}</Text>
                          <Text style={s.acSub}>📱 {p.MobileNo ?? '—'}  •  Age {p.Age ?? '—'}  •  ID: {p.PPID}</Text>
                        </View>
                        <View style={s.acBadge}><Text style={s.acBadgeTxt}>Select</Text></View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {mobile.length > 0 && mobile.length !== 10 && (
                  <Text style={{ fontSize: 11, color: T.danger, marginTop: 3, marginLeft: 2 }}>
                    Mobile must be exactly 10 digits
                  </Text>
                )}
              </Field>

              {/* Address */}
              <Field>
                <TextInput
                  style={[s.input, { height: 72, textAlignVertical: 'top', paddingTop: 8 }]}
                  placeholder="Enter Address"
                  placeholderTextColor={T.muted}
                  multiline
                  value={address}
                  onChangeText={setAddress}
                />
              </Field>

            </View>
          </>
        )}

        {step === 2 && (
          <>
            <SectionBar icon="flask-outline" title="Add Tests" />
            <View style={s.formCard}>
              <Field>
                <Text style={s.fieldHint}>Type at least 2 characters to search tests from database</Text>
                <View style={s.testSearchBox}>
                  <Feather name="search" size={16} color={T.sub} style={{ marginRight: 8 }} />
                  <TextInput
                    style={{ flex: 1, fontSize: 13, color: T.text }}
                    placeholder="Type test name or code (e.g. CBC, Blood)..."
                    placeholderTextColor={T.muted}
                    value={testSearch}
                    onChangeText={searchByTest}
                    onBlur={() => setTimeout(() => setShowTestDrop(false), 200)}
                    onFocus={() => { if (testResults.length > 0) setShowTestDrop(true); }}
                    returnKeyType="search"
                  />
                  {searchingTest
                    ? <ActivityIndicator size="small" color={T.primary} />
                    : testSearch.length > 0
                      ? <TouchableOpacity onPress={() => { setTestSearch(''); setTestResults([]); setShowTestDrop(false); }}>
                          <Feather name="x" size={16} color={T.muted} />
                        </TouchableOpacity>
                      : null}
                </View>

                {/* Autocomplete dropdown */}
                {showTestDrop && (
                  <View style={s.acDrop}>
                    {searchingTest && (
                      <View style={s.acLoading}>
                        <ActivityIndicator size="small" color={T.primary} />
                        <Text style={s.acLoadingTxt}> Searching tests…</Text>
                      </View>
                    )}
                    {!searchingTest && testResults.length === 0 && (
                      <View style={s.acEmpty}>
                        <MaterialCommunityIcons name="flask-off-outline" size={14} color={T.muted} />
                        <Text style={s.acEmptyTxt}>  No test found</Text>
                      </View>
                    )}
                    {!searchingTest && testResults.slice(0, 8).map((t, i) => {
                      const alreadyAdded = addedTestIds.includes(t.mainTestId);
                      return (
                        <TouchableOpacity
                          key={`t-${t.mainTestId}-${i}`}
                          style={[
                            s.acRow,
                            i < Math.min(testResults.length, 8) - 1 && s.acRowBorder,
                            alreadyAdded && { backgroundColor: T.tealBg },
                          ]}
                          onPress={() => !alreadyAdded && handleTestSelect(t)}
                          activeOpacity={alreadyAdded ? 1 : 0.75}
                        >
                          <View style={[s.testIconBox, { backgroundColor: alreadyAdded ? T.tealBorder : '#F0F9FF' }]}>
                            <MaterialCommunityIcons
                              name="flask-outline"
                              size={16}
                              color={alreadyAdded ? T.tealDark : '#0369A1'}
                            />
                          </View>
                          <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={[s.acName, alreadyAdded && { color: T.tealDark }]}>
                              {t.testName}
                            </Text>
                            {t.testCode ? (
                              <Text style={s.acSub}>Code: {t.testCode}  •  ID: {t.mainTestId}</Text>
                            ) : (
                              <Text style={s.acSub}>ID: {t.mainTestId}</Text>
                            )}
                          </View>
                          {alreadyAdded
                            ? <View style={[s.acBadge, { backgroundColor: T.tealDark }]}>
                                <Text style={s.acBadgeTxt}>Added ✓</Text>
                              </View>
                            : <View style={s.acBadge}>
                                <Text style={s.acBadgeTxt}>+ Add</Text>
                              </View>}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </Field>

              {/* Added tests chips */}
              {addedTests.length === 0
                ? <View style={s.noTestsBox}>
                    <MaterialCommunityIcons name="flask-outline" size={40} color={T.primary} />
                    <Text style={s.noTestsText}>No tests added yet</Text>
                    <Text style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>Search and select tests above</Text>
                  </View>
                : <View style={{ padding: 8 }}>
                    <Text style={[s.fieldHint, { marginBottom: 8 }]}>
                      {addedTests.length} test{addedTests.length > 1 ? 's' : ''} selected — tap to remove
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {addedTests.map((t, i) => (
                        <TouchableOpacity
                          key={i}
                          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: T.tealBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: T.tealBorder }}
                          onPress={() => {
                            setAddedTests(prev => prev.filter((_, idx) => idx !== i));
                            setAddedTestIds(prev => prev.filter((_, idx) => idx !== i));
                          }}
                        >
                          <MaterialCommunityIcons name="flask-outline" size={13} color={T.tealDark} style={{ marginRight: 4 }} />
                          <Text style={{ fontSize: 12, color: T.tealDark, fontWeight: '600' }}>{t}</Text>
                          <Feather name="x" size={13} color={T.tealDark} style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
              }
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <SectionBar icon="credit-card-outline" title="Payment Details" />
            <View style={s.formCard}>
              <View style={s.payTypeRow}>
                <Text style={s.payTypeLabel}>Payment Type</Text>
                <View style={s.payTypeBtns}>
                  {PAYMENT_TYPES.map(pt => (
                    <TouchableOpacity key={pt} style={[s.payTypeBtn, payType===pt && s.payTypeBtnActive]} onPress={() => setPayType(pt)} activeOpacity={0.8}>
                      <Text style={[s.payTypeBtnText, payType===pt && s.payTypeBtnTextActive]}>{pt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={s.amountRow}>
                <Text style={s.amountLabel}>Total Amount</Text>
                <View style={s.amountValueBox}><Text style={s.amountValue}>0.00</Text></View>
                <Checkbox value={false} onToggle={() => {}} label="BTH" />
              </View>
              <View style={s.rowWrap2}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={s.fieldLabel}>Other Charge</Text>
                  <TextInput style={s.input} value={otherCharge} onChangeText={setOtherCharge} keyboardType="numeric" placeholderTextColor={T.muted} />
                </View>
                <View style={{ flex: 1.5 }}>
                  <Text style={s.fieldLabel}>Other Charge Remark</Text>
                  <TextInput style={s.input} value={otherRemark} onChangeText={setOtherRemark} placeholderTextColor={T.muted} />
                </View>
              </View>
              <View style={s.discRow}>
                <Text style={s.fieldLabel}>Disc Type</Text>
                <View style={{ marginLeft: 12 }}>
                  {DISC_TYPES.map(dt => (
                    <TouchableOpacity key={dt} style={s.radioRow} onPress={() => setDiscType(dt)}>
                      <View style={[s.radioOuter, discType===dt && s.radioOuterOn]}>{discType===dt && <View style={s.radioInner} />}</View>
                      <Text style={s.radioLabel}>{dt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={{ flex: 1 }} />
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.fieldLabel}>Disc Amt</Text>
                  <TextInput style={[s.input, { width: 80, textAlign: 'right' }]} value={discAmt} onChangeText={setDiscAmt} keyboardType="numeric" placeholderTextColor={T.muted} />
                </View>
              </View>
              <View style={s.netAmtRow}><Text style={s.netAmtLabel}>Net Amount</Text><Text style={s.netAmtValue}>₹ 0.00</Text></View>
              <View style={s.rowWrap2}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={s.fieldLabel}>Paid Amt <Text style={{ color: T.danger }}>*</Text></Text>
                  <TextInput style={s.input} value={paidAmt} onChangeText={setPaidAmt} keyboardType="numeric" placeholderTextColor={T.muted} />
                </View>
                <View style={{ flex: 1.5 }}>
                  <Text style={s.fieldLabel}>Balance <Text style={{ color: T.danger }}>*</Text></Text>
                  <View style={s.balanceBox}><Text style={s.balanceText}>0.00</Text></View>
                </View>
              </View>
              <View style={s.remarkRow}>
                <Text style={s.fieldLabel}>Remark <Text style={{ color: T.danger }}>*</Text></Text>
                <TextInput style={[s.input, { marginTop: 4 }]} placeholder="Remark" placeholderTextColor={T.muted} value={remark} onChangeText={setRemark} />
              </View>
              <View style={s.uploadRow}>
                <Text style={s.uploadLabel}>Upload Prescription</Text>
                <TouchableOpacity style={s.chooseFileBtn} onPress={handleChoosePrescription} activeOpacity={0.8}>
                  <MaterialCommunityIcons name="paperclip" size={14} color={T.tealDark} />
                  <Text style={s.chooseFileTxt}> {prescriptionFile ?? 'Choose File'}</Text>
                </TouchableOpacity>
                <View style={{ width: 12 }} />
                <Checkbox value={emergency} onToggle={() => setEmergency(!emergency)} label="Emergency" />
              </View>
              <View style={[s.uploadRow, { marginBottom: 14 }]}>
                <Text style={s.uploadLabel}>Upload Photo</Text>
                <TouchableOpacity style={s.chooseFileBtn} onPress={handleChoosePhoto} activeOpacity={0.8}>
                  <MaterialCommunityIcons name="image-outline" size={14} color={T.tealDark} />
                  <Text style={s.chooseFileTxt}> {photoFile ? 'Change Photo' : 'Choose File'}</Text>
                </TouchableOpacity>
                {photoFile && <Image source={{ uri: photoFile }} style={{ width: 48, height: 48, borderRadius: 8, marginLeft: 10, borderWidth: 1, borderColor: T.tealBorder }} />}
              </View>
              <View style={s.footerBtns}>
                <TouchableOpacity style={s.clearBtn} onPress={handleClear} activeOpacity={0.8}><MaterialCommunityIcons name="refresh" size={16} color="#FFF" /><Text style={s.saveBtnText}> Clear</Text></TouchableOpacity>
                <TouchableOpacity style={[s.saveBtn, registering && { opacity: 0.6 }]} onPress={handleSave} disabled={registering} activeOpacity={0.8}>
                  {registering ? <ActivityIndicator color="#FFF" size="small" /> : <MaterialCommunityIcons name="content-save-outline" size={16} color="#FFF" />}
                  <Text style={s.saveBtnText}> {registering ? 'Saving…' : 'Save'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.updateBtn, (updating||regNo==='—') && { opacity: 0.5 }]} onPress={handleUpdate} disabled={updating||regNo==='—'} activeOpacity={0.8}>
                  {updating ? <ActivityIndicator color="#FFF" size="small" /> : <MaterialCommunityIcons name="pencil-outline" size={16} color="#FFF" />}
                  <Text style={s.saveBtnText}> {updating ? 'Updating…' : 'Update'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.saveBillBtn} activeOpacity={0.8}><MaterialCommunityIcons name="receipt" size={14} color="#FFF" /><Text style={s.saveBtnText}> Save &amp; Bill</Text></TouchableOpacity>
                <TouchableOpacity style={s.waBtn} activeOpacity={0.8}><MaterialCommunityIcons name="whatsapp" size={16} color="#FFF" /><Text style={s.saveBtnText}> WhatsApp</Text></TouchableOpacity>
              </View>
              <View style={s.bottomBar}>
                <TouchableOpacity style={s.bottomBarBtn} onPress={handleDeptBarcode} activeOpacity={0.8}><MaterialCommunityIcons name="barcode-scan" size={16} color="#FFF" /><Text style={s.bottomBarTxt}> Dept Barcode</Text></TouchableOpacity>
                <TouchableOpacity style={[s.bottomBarBtn,{backgroundColor:'#334155'}]} onPress={handleCard} activeOpacity={0.8}><MaterialCommunityIcons name="credit-card-outline" size={16} color="#FFF" /><Text style={s.bottomBarTxt}> Card</Text></TouchableOpacity>
                <TouchableOpacity style={[s.bottomBarBtn,{backgroundColor:T.tealDark}]} onPress={handleSampleBarcode} activeOpacity={0.8}><MaterialCommunityIcons name="qrcode-scan" size={16} color="#FFF" /><Text style={s.bottomBarTxt}> Sample Barcode</Text></TouchableOpacity>
                <TouchableOpacity style={[s.bottomBarBtn,{backgroundColor:'#1D4ED8'}]} onPress={handleCapturePhoto} activeOpacity={0.8}><MaterialCommunityIcons name="camera-outline" size={16} color="#FFF" /><Text style={s.bottomBarTxt}> Capture Photo</Text></TouchableOpacity>
              </View>
            </View>
          </>
        )}

        <View style={s.wizardNav}>
          {step > 1 && (
            <TouchableOpacity style={s.backNavBtn} onPress={handleBack} activeOpacity={0.8}>
              <Feather name="arrow-left" size={16} color={T.tealDark} />
              <Text style={s.backNavTxt}> Back</Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          {step < 3 && (
            <TouchableOpacity style={s.nextNavBtn} onPress={handleNext} activeOpacity={0.8}>
              <Text style={s.nextNavTxt}>Save & Next </Text>
              <Feather name="arrow-right" size={16} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: T.screenBg },
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, backgroundColor: T.bg, borderBottomWidth: 1, borderBottomColor: T.border, gap: 12 },
  backBtn:     { padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: T.text },
  regNoBadge:  { backgroundColor: T.tealBg, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: T.tealBorder },
  regNoBadgeTxt:{ fontSize: 11, fontWeight: '700', color: T.tealDark },
  stepBar:     { flexDirection: 'row', alignItems: 'center', backgroundColor: T.bg, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: T.border },
  stepItem:    { alignItems: 'center', width: 64 },
  stepCircle:  { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: T.border, marginBottom: 4 },
  stepCircleActive: { backgroundColor: T.primary, borderColor: T.primary },
  stepCircleDone:   { backgroundColor: T.green,   borderColor: T.green   },
  stepLabel:   { fontSize: 10, color: T.muted, textAlign: 'center', lineHeight: 13 },
  stepLine:    { flex: 1, height: 2, backgroundColor: T.border, marginBottom: 14 },
  stepLineDone:{ backgroundColor: T.green },
  scroll:      { paddingBottom: 20 },
  sectionBar:  { flexDirection: 'row', alignItems: 'center', backgroundColor: T.tealDark, paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  sectionBarText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  formCard:    { backgroundColor: T.bg, paddingHorizontal: 12, paddingTop: 8, marginBottom: 2 },
  fieldWrap:   { marginBottom: 8 },
  rowWrap:     { flexDirection: 'row', alignItems: 'center' },
  rowWrap2:    { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  input:       { borderWidth: 1, borderColor: T.border, borderRadius: 6, paddingHorizontal: 10, height: 40, fontSize: 13, color: T.text, backgroundColor: T.bg },
  inputHighlight: { borderColor: T.primary, borderWidth: 1.5 },
  inputLabel:  { fontSize: 11, color: T.sub, fontWeight: '600' },
  fieldLabel:  { fontSize: 11, color: T.sub, fontWeight: '600', marginBottom: 4 },
  datePicker:     { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: T.border, borderRadius: 6, paddingHorizontal: 10, height: 40, backgroundColor: T.bg },
  datePickerText: { flex: 1, fontSize: 13, color: T.text },
  inlineSelect: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: T.border, borderRadius: 6, paddingHorizontal: 8, height: 40, backgroundColor: T.bg },
  inlineSelectText: { flex: 1, fontSize: 13, color: T.text },
  ddMenu:      { borderWidth: 1, borderColor: T.border, borderRadius: 6, backgroundColor: T.bg, zIndex: 999, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 6 },
  ddItem:      { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  ddItemText:  { fontSize: 13, color: T.text },
  checkRow:    { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  checkBox:    { width: 16, height: 16, borderRadius: 3, borderWidth: 1.5, borderColor: T.border, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center', marginRight: 5 },
  checkBoxOn:  { backgroundColor: T.primary, borderColor: T.primary },
  checkLabel:  { fontSize: 12, color: T.text, fontWeight: '500' },
  reportTypeRow:   { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: T.border },
  reportTypeLabel: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  reportTypeLabelText: { fontSize: 11, fontWeight: '800', color: T.tealDark, letterSpacing: 0.4 },
  noTestsBox:  { alignItems: 'center', paddingVertical: 32 },
  noTestsText: { fontSize: 13, color: T.muted, marginTop: 8 },
  payTypeRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  payTypeLabel: { fontSize: 13, fontWeight: '600', color: T.text, marginRight: 12, width: 90 },
  payTypeBtns:  { flexDirection: 'row', gap: 6 },
  payTypeBtn:   { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: T.border, backgroundColor: T.bg },
  payTypeBtnActive:     { backgroundColor: T.primary, borderColor: T.primary },
  payTypeBtnText:       { fontSize: 12, color: T.sub, fontWeight: '600' },
  payTypeBtnTextActive: { color: '#FFF' },
  amountRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  amountLabel:   { fontSize: 13, color: T.text, fontWeight: '600', width: 100 },
  amountValueBox:{ flex: 1, borderWidth: 1, borderColor: T.border, borderRadius: 6, paddingHorizontal: 10, height: 38, justifyContent: 'center', backgroundColor: '#F0FDFA' },
  amountValue:   { fontSize: 15, fontWeight: '800', color: T.primary },
  discRow:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  radioRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  radioOuter:  { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: T.border, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  radioOuterOn:{ borderColor: T.primary },
  radioInner:  { width: 8, height: 8, borderRadius: 4, backgroundColor: T.primary },
  radioLabel:  { fontSize: 13, color: T.text },
  netAmtRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: T.tealBg, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, borderWidth: 1, borderColor: T.tealBorder },
  netAmtLabel: { flex: 1, fontSize: 15, fontWeight: '800', color: T.tealDark },
  netAmtValue: { fontSize: 18, fontWeight: '900', color: T.tealDark },
  balanceBox:  { borderWidth: 1, borderColor: '#FDE68A', borderRadius: 6, paddingHorizontal: 10, height: 40, justifyContent: 'center', backgroundColor: '#FFFBEB' },
  balanceText: { fontSize: 14, fontWeight: '700', color: '#92400E' },
  remarkRow:   { marginBottom: 10 },
  uploadRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 },
  uploadLabel:  { fontSize: 12, color: T.text, fontWeight: '600', width: 130 },
  chooseFileBtn:{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: T.tealBorder, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: T.tealBg },
  chooseFileTxt:{ fontSize: 12, color: T.tealDark, fontWeight: '600' },
  footerBtns:  { flexDirection: 'row', gap: 8, paddingVertical: 12, flexWrap: 'wrap' },
  clearBtn:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#64748B', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 11 },
  saveBtn:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 11 },
  updateBtn:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D97706', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 11 },
  saveBillBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.tealDark, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 11 },
  waBtn:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16A34A', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 11 },
  saveBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  bottomBar:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 10 },
  bottomBarBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#475569', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 },
  bottomBarTxt: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  wizardNav:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  backNavBtn:  { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: T.tealDark, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10 },
  backNavTxt:  { fontSize: 14, fontWeight: '700', color: T.tealDark },
  nextNavBtn:  { flexDirection: 'row', alignItems: 'center', backgroundColor: T.primary, borderRadius: 20, paddingHorizontal: 22, paddingVertical: 10 },
  nextNavTxt:  { fontSize: 14, fontWeight: '700', color: '#FFF' },

  // Patient search
  searchHint:    { fontSize: 11, color: T.primary, fontWeight: '600', marginBottom: 6 },
  patSearchBar:  {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: T.tealBorder, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: T.tealBg,
  },
  patResultsBox: {
    borderWidth: 1, borderColor: T.tealBorder, borderRadius: 10,
    backgroundColor: T.bg, marginTop: 4,
    elevation: 6, shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  patResultsHeader: {
    fontSize: 11, fontWeight: '700', color: T.tealDark,
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: T.tealBg, borderTopLeftRadius: 10, borderTopRightRadius: 10,
    borderBottomWidth: 1, borderBottomColor: T.tealBorder,
  },
  patResultRow:  {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 12,
    backgroundColor: T.bg,
  },
  patResultAvatar: { marginRight: 10 },
  patResultName: { fontSize: 14, fontWeight: '700', color: T.text },
  patResultSub:  { fontSize: 11, color: T.sub, marginTop: 2 },
  patResultAddr: { fontSize: 11, color: T.muted, marginTop: 1 },
  patResultFillBtn: {
    backgroundColor: T.primary, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5, marginLeft: 8,
  },
  patResultFillTxt: { fontSize: 11, fontWeight: '800', color: '#FFF' },
  noPatResult:   {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFBEB', borderRadius: 8,
    borderWidth: 1, borderColor: '#FDE68A',
    paddingHorizontal: 12, paddingVertical: 10, marginTop: 4,
  },
  noPatResultTxt:{ fontSize: 12, color: '#92400E', flex: 1 },

  // Test search
  fieldHint:    { fontSize: 11, color: T.sub, marginBottom: 6 },
  testSearchBox:{
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: T.border, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: T.bg,
  },
  testIconBox:  {
    width: 30, height: 30, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },

  // Autocomplete dropdown
  acDrop: {
    borderWidth: 1, borderColor: T.border, borderRadius: 8,
    backgroundColor: T.bg, marginTop: 2,
    elevation: 10, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8,
    zIndex: 9999,
  },
  acLoading: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  acLoadingTxt: { fontSize: 12, color: T.sub },
  acEmpty:  { flexDirection: 'row', alignItems: 'center', padding: 12 },
  acEmptyTxt: { fontSize: 12, color: T.muted },
  acRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 11, backgroundColor: T.bg },
  acRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  acName:   { fontSize: 13, fontWeight: '700', color: T.text },
  acSub:    { fontSize: 11, color: T.sub, marginTop: 2 },
  acBadge:  { backgroundColor: T.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginLeft: 6 },
  acBadgeTxt: { fontSize: 10, fontWeight: '800', color: '#FFF' },
});
