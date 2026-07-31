import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const T = {
  primary:  '#0D9488',
  tealDark: '#0F766E',
  tealBg:   '#F0FDFA',
  tealBorder:'#CCFBF1',
  bg:       '#FFFFFF',
  screenBg: '#F8FAFC',
  text:     '#0F172A',
  sub:      '#64748B',
  muted:    '#94A3B8',
  border:   '#E2E8F0',
  amber:    '#F59E0B',
  green:    '#10B981',
  danger:   '#EF4444',
  orange:   '#F97316',
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface OrderedTest { name: string; full: string; status: 'Pending' | 'Collected'; color: string }
interface Tube        { name: string; sub: string; color: string; collected: number; total: number }
interface CheckItem   { label: string; done: boolean }

// ── Data ──────────────────────────────────────────────────────────────────────
const PATIENT = {
  name:        'Rajesh Patil',
  gender:      'Male',
  age:         34,
  id:          'P20260042',
  doctor:      'Dr. Shah',
  visitType:   'Lab Visit',
  appointment: '30 Jul 2025, 09:40 AM',
  avatar:      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
};

const INITIAL_TESTS: OrderedTest[] = [
  { name: 'CBC',    full: 'Complete Blood Count',  status: 'Pending',   color: T.orange },
  { name: 'LFT',   full: 'Liver Function Test',   status: 'Pending',   color: T.orange },
  { name: 'HbA1c', full: 'Glycated Hemoglobin',   status: 'Collected', color: T.green  },
];

const INITIAL_TUBES: Tube[] = [
  { name: 'Purple', sub: '(EDTA)',  color: '#7C3AED', collected: 1, total: 1 },
  { name: 'Red',    sub: '(Plain)', color: '#EF4444', collected: 1, total: 1 },
  { name: 'Yellow', sub: '(SST)',   color: '#F59E0B', collected: 0, total: 1 },
];

const INITIAL_CHECKLIST: CheckItem[] = [
  { label: 'Patient Verified',     done: true  },
  { label: 'Consent Taken',        done: true  },
  { label: 'Tube Label Printed',   done: true  },
  { label: 'Barcode Scanned',      done: false },
  { label: 'Sample Collected',     done: false },
];

const NOTE_TAGS = ['Difficult Vein', 'Second Attempt', 'Haemolysis Observed'];

// ── Helper: toggle button pair ────────────────────────────────────────────────
function TogglePair({ options, selected, onSelect }: { options: string[]; selected: string; onSelect: (v: string) => void }) {
  return (
    <View style={s.toggleRow}>
      {options.map(o => (
        <TouchableOpacity
          key={o}
          style={[s.toggleBtn, selected === o && s.toggleBtnActive]}
          onPress={() => onSelect(o)}
          activeOpacity={0.8}
        >
          <Text style={[s.toggleTxt, selected === o && s.toggleTxtActive]}>{o}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function SampleCollectionScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const [checklist,      setChecklist]      = useState<CheckItem[]>(INITIAL_CHECKLIST);
  const [collectionMethod, setMethod]       = useState('Venous');
  const [bodyPosition,   setBodyPosition]   = useState('Sitting');
  const [fasting,        setFasting]        = useState('No');
  const [notes,          setNotes]          = useState('');
  const [activeTags,     setActiveTags]     = useState<string[]>([]);

  const toggleCheck = (idx: number) => {
    setChecklist(prev => prev.map((c, i) => i === idx ? { ...c, done: !c.done } : c));
  };

  const toggleTag = (tag: string) => {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleCollect = () => {
    const pending = checklist.filter(c => !c.done);
    if (pending.length > 0) {
      Alert.alert('Incomplete Checklist', `Please complete: ${pending.map(c => c.label).join(', ')}`);
      return;
    }
    Alert.alert('✅ Sample Collected', 'Sample for Rajesh Patil has been successfully collected.', [
      { text: 'Done', onPress: () => navigation.goBack() },
    ]);
  };

  const handleReject = () => {
    Alert.alert('Reject Sample', 'Are you sure you want to reject this sample?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  const handleReschedule = () => {
    Alert.alert('Reschedule', 'Reschedule this appointment?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reschedule', onPress: () => {} },
    ]);
  };

  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 0) }]}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Feather name="arrow-left" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Sample Collection</Text>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          <TouchableOpacity>
            <MaterialCommunityIcons name="barcode-scan" size={22} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Feather name="more-vertical" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* ── Patient Info ── */}
        <View style={s.patientCard}>
          <View style={s.patientLeft}>
            <Image source={{ uri: PATIENT.avatar }} style={s.avatar} />
            <View style={{ marginLeft: 12 }}>
              <Text style={s.patientName}>{PATIENT.name}</Text>
              <Text style={s.patientMeta}>{PATIENT.gender}  •  {PATIENT.age} Years</Text>
              <View style={s.idBadge}>
                <Text style={s.idText}>ID: {PATIENT.id}</Text>
              </View>
            </View>
          </View>
          <View style={s.patientRight}>
            <View style={s.metaRow}>
              <MaterialCommunityIcons name="doctor" size={13} color={T.sub} />
              <View style={{ marginLeft: 6 }}>
                <Text style={s.metaLabel}>Doctor</Text>
                <Text style={s.metaValue}>{PATIENT.doctor}</Text>
              </View>
            </View>
            <View style={s.metaRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={13} color={T.sub} />
              <View style={{ marginLeft: 6 }}>
                <Text style={s.metaLabel}>Visit Type</Text>
                <Text style={s.metaValue}>{PATIENT.visitType}</Text>
              </View>
            </View>
            <View style={s.metaRow}>
              <MaterialCommunityIcons name="calendar-clock-outline" size={13} color={T.sub} />
              <View style={{ marginLeft: 6 }}>
                <Text style={s.metaLabel}>Appointment</Text>
                <Text style={s.metaValue}>{PATIENT.appointment}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Two-column row: Ordered Tests + Required Tubes ── */}
        <View style={s.twoCol}>

          {/* Ordered Tests */}
          <View style={[s.sectionCard, { flex: 1.1 }]}>
            <View style={s.sectionHeaderRow}>
              <Text style={s.sectionTitle}>Ordered Tests <Text style={{ color: T.primary }}>({INITIAL_TESTS.length})</Text></Text>
              <TouchableOpacity><Text style={s.viewAll}>View All</Text></TouchableOpacity>
            </View>
            {INITIAL_TESTS.map((t, i) => (
              <View key={t.name} style={[s.testRow, i < INITIAL_TESTS.length - 1 && { marginBottom: 10 }]}>
                <View style={[s.testDot, { backgroundColor: t.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.testName}>{t.name}</Text>
                  <Text style={s.testFull}>{t.full}</Text>
                </View>
                {t.status === 'Collected'
                  ? <View style={s.collectedBadge}>
                      <Text style={s.collectedTxt}>Collected</Text>
                      <MaterialCommunityIcons name="check-circle" size={12} color={T.green} style={{ marginLeft: 2 }} />
                    </View>
                  : <View style={s.pendingBadge}>
                      <Text style={s.pendingTxt}>Pending</Text>
                    </View>}
              </View>
            ))}
          </View>

          {/* Required Tubes */}
          <View style={[s.sectionCard, { flex: 0.9 }]}>
            <Text style={[s.sectionTitle, { marginBottom: 10 }]}>Required Tubes</Text>
            {INITIAL_TUBES.map((tube, i) => (
              <View key={tube.name} style={[s.tubeRow, i < INITIAL_TUBES.length - 1 && { marginBottom: 10 }]}>
                {/* Tube icon */}
                <View style={[s.tubeIcon, { borderColor: tube.color }]}>
                  <View style={[s.tubeFill, { backgroundColor: tube.color }]} />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={s.tubeName}>{tube.name} <Text style={{ color: T.sub, fontWeight: '400' }}>{tube.sub}</Text></Text>
                  <Text style={s.tubeSub}>1 Tube</Text>
                </View>
                <View style={[s.tubeCount, {
                  borderColor: tube.collected === tube.total ? T.green : T.amber,
                  backgroundColor: tube.collected === tube.total ? '#ECFDF5' : '#FFFBEB',
                }]}>
                  <Text style={[s.tubeCountTxt, { color: tube.collected === tube.total ? T.green : T.amber }]}>
                    {tube.collected}/{tube.total}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── Two-column row: Checklist + Collection Details ── */}
        <View style={s.twoCol}>

          {/* Collection Checklist */}
          <View style={[s.sectionCard, { flex: 1 }]}>
            <Text style={[s.sectionTitle, { marginBottom: 10 }]}>Collection Checklist</Text>
            {checklist.map((item, idx) => (
              <TouchableOpacity
                key={item.label}
                style={s.checkRow}
                onPress={() => toggleCheck(idx)}
                activeOpacity={0.7}
              >
                <View style={[s.checkCircle, item.done && s.checkCircleDone]}>
                  {item.done && <Feather name="check" size={12} color="#FFF" />}
                </View>
                <Text style={[s.checkLabel, item.done && { color: T.sub }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Collection Details */}
          <View style={[s.sectionCard, { flex: 1 }]}>
            <Text style={[s.sectionTitle, { marginBottom: 10 }]}>Collection Details</Text>

            <Text style={s.detailLabel}>Collection Method</Text>
            <TogglePair options={['Venous', 'Capillary']} selected={collectionMethod} onSelect={setMethod} />

            <Text style={[s.detailLabel, { marginTop: 10 }]}>Body Position</Text>
            <TogglePair options={['Sitting', 'Standing']} selected={bodyPosition} onSelect={setBodyPosition} />

            <Text style={[s.detailLabel, { marginTop: 10 }]}>Fasting</Text>
            <TogglePair options={['Yes', 'No']} selected={fasting} onSelect={setFasting} />

            <Text style={[s.detailLabel, { marginTop: 10 }]}>Sample Collected By</Text>
            <View style={s.collectedByBtn}>
              <Text style={s.collectedByTxt}>Ubaid (Phlebologist)</Text>
              <Feather name="chevron-down" size={14} color={T.sub} />
            </View>
          </View>
        </View>

        {/* ── Sample Image ── */}
        <View style={s.sectionCard}>
          <Text style={[s.sectionTitle, { marginBottom: 12 }]}>Sample Image (Optional)</Text>
          <View style={s.imageRow}>
            <TouchableOpacity style={s.imageBtn} activeOpacity={0.8}>
              <MaterialCommunityIcons name="camera-outline" size={24} color={T.primary} />
              <Text style={s.imageBtnTxt}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.imageBtn} activeOpacity={0.8}>
              <MaterialCommunityIcons name="image-plus-outline" size={24} color={T.primary} />
              <Text style={s.imageBtnTxt}>Upload</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Collection Notes ── */}
        <View style={s.sectionCard}>
          <Text style={[s.sectionTitle, { marginBottom: 10 }]}>Collection Notes (Optional)</Text>
          <View style={s.tagsRow}>
            {NOTE_TAGS.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[s.noteTag, activeTags.includes(tag) && s.noteTagActive]}
                onPress={() => toggleTag(tag)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={tag === 'Difficult Vein' ? 'needle' : tag === 'Second Attempt' ? 'pencil-outline' : 'alert-circle-outline'}
                  size={12}
                  color={activeTags.includes(tag) ? T.primary : T.sub}
                  style={{ marginRight: 4 }}
                />
                <Text style={[s.noteTagTxt, activeTags.includes(tag) && { color: T.primary, fontWeight: '700' }]}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.notesBox}>
            <TextInput
              style={s.notesInput}
              placeholder="Add notes here..."
              placeholderTextColor={T.muted}
              multiline
              maxLength={200}
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />
            <Text style={s.notesCount}>{notes.length}/200</Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── Footer Action Buttons ── */}
      <View style={s.footer}>
        <TouchableOpacity style={s.rejectBtn} onPress={handleReject} activeOpacity={0.8}>
          <MaterialCommunityIcons name="close-circle-outline" size={16} color={T.danger} />
          <Text style={s.rejectTxt}> Reject Sample</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.rescheduleBtn} onPress={handleReschedule} activeOpacity={0.8}>
          <MaterialCommunityIcons name="calendar-refresh-outline" size={16} color={T.orange} />
          <Text style={s.rescheduleTxt}> Reschedule</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.collectBtn} onPress={handleCollect} activeOpacity={0.8}>
          <MaterialCommunityIcons name="test-tube" size={16} color="#FFF" />
          <Text style={s.collectTxt}> Collect Sample</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.screenBg },

  header:  { flexDirection: 'row', alignItems: 'center', backgroundColor: T.tealDark, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '800', color: '#FFF' },

  scroll: { padding: 12, paddingBottom: 20 },

  // Patient card
  patientCard:  { flexDirection: 'row', backgroundColor: T.bg, borderRadius: 14, borderWidth: 1, borderColor: T.border, padding: 14, marginBottom: 10, gap: 12 },
  patientLeft:  { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  avatar:       { width: 56, height: 56, borderRadius: 28, backgroundColor: T.border },
  patientName:  { fontSize: 15, fontWeight: '800', color: T.text },
  patientMeta:  { fontSize: 12, color: T.sub, marginTop: 2 },
  idBadge:      { backgroundColor: '#F1F5F9', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, marginTop: 4, alignSelf: 'flex-start' },
  idText:       { fontSize: 11, color: T.sub, fontWeight: '600' },
  patientRight: { flex: 1, gap: 6 },
  metaRow:      { flexDirection: 'row', alignItems: 'flex-start' },
  metaLabel:    { fontSize: 10, color: T.muted },
  metaValue:    { fontSize: 12, fontWeight: '600', color: T.text },

  // Two-column layout
  twoCol: { flexDirection: 'row', gap: 10, marginBottom: 10 },

  // Section card
  sectionCard: { backgroundColor: T.bg, borderRadius: 14, borderWidth: 1, borderColor: T.border, padding: 12 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: T.text },
  viewAll:      { fontSize: 11, fontWeight: '700', color: T.primary },

  // Ordered tests
  testRow:    { flexDirection: 'row', alignItems: 'flex-start' },
  testDot:    { width: 8, height: 8, borderRadius: 4, marginTop: 4, marginRight: 6 },
  testName:   { fontSize: 12, fontWeight: '700', color: T.text },
  testFull:   { fontSize: 10, color: T.sub, marginTop: 1 },
  collectedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  collectedTxt:   { fontSize: 9, fontWeight: '700', color: T.green },
  pendingBadge:   { backgroundColor: '#FFFBEB', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  pendingTxt:     { fontSize: 9, fontWeight: '700', color: T.amber },

  // Tubes
  tubeRow:   { flexDirection: 'row', alignItems: 'center' },
  tubeIcon:  { width: 22, height: 34, borderRadius: 11, borderWidth: 2, justifyContent: 'flex-end', overflow: 'hidden', alignItems: 'center' },
  tubeFill:  { width: '100%', height: '60%', borderBottomLeftRadius: 9, borderBottomRightRadius: 9 },
  tubeName:  { fontSize: 11, fontWeight: '700', color: T.text },
  tubeSub:   { fontSize: 10, color: T.sub },
  tubeCount: { borderWidth: 1.5, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  tubeCountTxt: { fontSize: 11, fontWeight: '800' },

  // Checklist
  checkRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: T.border, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  checkCircleDone: { backgroundColor: T.green, borderColor: T.green },
  checkLabel:  { fontSize: 12, color: T.text, fontWeight: '500' },

  // Collection details
  detailLabel:    { fontSize: 11, fontWeight: '600', color: T.sub, marginBottom: 6 },
  toggleRow:      { flexDirection: 'row', gap: 6 },
  toggleBtn:      { flex: 1, paddingVertical: 6, borderRadius: 8, borderWidth: 1.5, borderColor: T.border, alignItems: 'center' },
  toggleBtnActive:{ borderColor: T.primary, backgroundColor: T.tealBg },
  toggleTxt:      { fontSize: 11, fontWeight: '600', color: T.sub },
  toggleTxtActive:{ color: T.primary, fontWeight: '800' },
  collectedByBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: T.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  collectedByTxt: { fontSize: 12, color: T.text, fontWeight: '500' },

  // Sample Image
  imageRow:   { flexDirection: 'row', gap: 12 },
  imageBtn:   { flex: 1, borderWidth: 1.5, borderColor: T.border, borderRadius: 10, borderStyle: 'dashed', paddingVertical: 16, alignItems: 'center', gap: 6 },
  imageBtnTxt:{ fontSize: 12, fontWeight: '600', color: T.sub },

  // Notes
  tagsRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  noteTag:    { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: T.border, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  noteTagActive: { borderColor: T.primary, backgroundColor: T.tealBg },
  noteTagTxt: { fontSize: 11, color: T.sub },
  notesBox:   { borderWidth: 1, borderColor: T.border, borderRadius: 10, padding: 10, minHeight: 70 },
  notesInput: { fontSize: 13, color: T.text, minHeight: 50 },
  notesCount: { fontSize: 10, color: T.muted, textAlign: 'right', marginTop: 4 },

  // Footer
  footer:       { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: T.bg, borderTopWidth: 1, borderTopColor: T.border },
  rejectBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#FECACA', borderRadius: 12, paddingVertical: 12, backgroundColor: '#FEF2F2' },
  rejectTxt:    { fontSize: 12, fontWeight: '700', color: T.danger },
  rescheduleBtn:{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#FED7AA', borderRadius: 12, paddingVertical: 12, backgroundColor: '#FFF7ED' },
  rescheduleTxt:{ fontSize: 12, fontWeight: '700', color: T.orange },
  collectBtn:   { flex: 1.2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: T.tealDark, borderRadius: 12, paddingVertical: 12 },
  collectTxt:   { fontSize: 12, fontWeight: '700', color: '#FFF' },
});
