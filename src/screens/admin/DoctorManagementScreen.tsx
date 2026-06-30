import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, Modal, KeyboardAvoidingView, Platform, Switch
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const THEME = {
  primary: '#4F46E5', // Indigo matching your Admin Profile
  primaryLight: '#EEF2FF',
  bg: '#FFFFFF',
  screenBg: '#F8F9FF',
  textPrimary: '#1E1B4B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  successBg: '#ECFDF5',
};

// ─── Dummy Data based on your APIs ───
const DUMMY_DOCTORS = [
  { id: 1, name: 'Dr. Rahul Sharma', spec: 'Cardiologist', phone: '9876543210', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=150&auto=format&fit=crop' },
  { id: 12, name: 'Dr. Priya Patil', spec: 'General Physician', phone: '9876512345', avatar: 'https://images.unsplash.com/photo-1594824416928-8ae8acae7446?q=80&w=150&auto=format&fit=crop' },
];

const DUMMY_SCHEDULES = [
  { id: 2, drName: 'Dr. Rahul Sharma', startDate: '2026-06-03', endDate: '2026-06-30', startTime: '09:00 AM', endTime: '06:00 PM', active: true },
];

const DUMMY_SLOTS = [
  { id: 5, drName: 'Dr. Priya Patil', slot: '30 Min' },
  { id: 6, drName: 'Dr. Rahul Sharma', slot: '15 Min' },
];

export default function DoctorManagementScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  
  // ─── States ───
  const [activeTab, setActiveTab] = useState('Schedules');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);

  // Form States
  const [isActive, setIsActive] = useState(true);

  // ─── Tab Navigation ───
  const TABS = ['Doctors', 'Schedules', 'Slots'];

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 10) }]}>
      
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={THEME.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Registry</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Feather name="search" size={20} color={THEME.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Custom Tabs ── */}
      <View style={styles.tabContainer}>
        {TABS.map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ==========================================
            TAB 1: DOCTORS
        ========================================== */}
        {activeTab === 'Doctors' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Registered Doctors</Text>
              <Text style={styles.countText}>{DUMMY_DOCTORS.length} Total</Text>
            </View>
            {DUMMY_DOCTORS.map(doc => (
              <View key={doc.id} style={styles.card}>
                <Image source={{ uri: doc.avatar }} style={styles.avatar} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{doc.name}</Text>
                  <Text style={styles.cardSub}>{doc.spec}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Feather name="phone" size={12} color={THEME.textSecondary} />
                    <Text style={styles.metaText}>{doc.phone}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.actionIconBtn}>
                  <Feather name="edit-2" size={16} color={THEME.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* ==========================================
            TAB 2: SCHEDULES
        ========================================== */}
        {activeTab === 'Schedules' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Doctor Schedules</Text>
              <TouchableOpacity style={styles.addMiniBtn} onPress={() => setShowScheduleModal(true)}>
                <Feather name="plus" size={14} color="#FFF" />
                <Text style={styles.addMiniBtnText}>Add Schedule</Text>
              </TouchableOpacity>
            </View>
            
            {DUMMY_SCHEDULES.map(sched => (
              <View key={sched.id} style={styles.cardVertical}>
                <View style={styles.cardHeaderFlex}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.iconCircle}><MaterialCommunityIcons name="calendar-clock" size={20} color={THEME.primary} /></View>
                    <Text style={styles.cardTitle}>{sched.drName}</Text>
                  </View>
                  <View style={[styles.statusBadge, sched.active ? styles.bgSuccess : styles.bgMuted]}>
                    <Text style={[styles.statusText, sched.active ? styles.textSuccess : styles.textMuted]}>
                      {sched.active ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>

                <View style={styles.grid2Col}>
                  <View>
                    <Text style={styles.metaLabel}>Valid Period</Text>
                    <Text style={styles.metaValue}>{sched.startDate} to {sched.endDate}</Text>
                  </View>
                  <View>
                    <Text style={styles.metaLabel}>Working Hours</Text>
                    <Text style={styles.metaValue}>{sched.startTime} - {sched.endTime}</Text>
                  </View>
                </View>

                <View style={styles.cardActionsRow}>
                  <TouchableOpacity style={styles.actionTextBtn}><Text style={styles.actionTextBlue}>Edit</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.actionTextBtn}><Text style={styles.actionTextRed}>Delete</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ==========================================
            TAB 3: SLOTS
        ========================================== */}
        {activeTab === 'Slots' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Appointment Slots</Text>
              <TouchableOpacity style={styles.addMiniBtn} onPress={() => setShowSlotModal(true)}>
                <Feather name="plus" size={14} color="#FFF" />
                <Text style={styles.addMiniBtnText}>Add Slot</Text>
              </TouchableOpacity>
            </View>

            {DUMMY_SLOTS.map(slot => (
              <View key={slot.id} style={[styles.card, { alignItems: 'center' }]}>
                <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
                  <Feather name="clock" size={20} color="#9333EA" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{slot.drName}</Text>
                  <Text style={styles.cardSub}>Consultation Slot</Text>
                </View>
                <View style={styles.slotBadge}>
                  <Text style={styles.slotBadgeText}>{slot.slot}</Text>
                </View>
                <TouchableOpacity style={[styles.actionIconBtn, { marginLeft: 10 }]}>
                  <Feather name="trash-2" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── ADD SCHEDULE MODAL (JSON: /SaveDoctorSchedule) ── */}
      <Modal visible={showScheduleModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.bottomSheet}>
            <View style={styles.dragHandle} />
            <Text style={styles.sheetTitle}>Create Schedule</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Select Doctor</Text>
              <View style={styles.dropdown}>
                <Text style={{ color: THEME.textPrimary }}>Dr. Rahul Sharma</Text>
                <Feather name="chevron-down" size={20} color={THEME.textSecondary} />
              </View>
            </View>

            <View style={styles.grid2Col}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Start Date</Text>
                <TextInput style={styles.input} placeholder="YYYY-MM-DD" value="2026-06-03" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>End Date</Text>
                <TextInput style={styles.input} placeholder="YYYY-MM-DD" value="2026-06-30" />
              </View>
            </View>

            <View style={styles.grid2Col}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Start Time</Text>
                <TextInput style={styles.input} placeholder="09:00 AM" value="09:00 AM" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>End Time</Text>
                <TextInput style={styles.input} placeholder="06:00 PM" value="06:00 PM" />
              </View>
            </View>

            <View style={[styles.inputGroup, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }]}>
              <Text style={styles.inputLabel}>Is Active?</Text>
              <Switch value={isActive} onValueChange={setIsActive} trackColor={{ true: THEME.primary, false: '#CBD5E1' }} />
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
              <TouchableOpacity style={[styles.secondaryBtn, { flex: 1 }]} onPress={() => setShowScheduleModal(false)}>
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]} onPress={() => setShowScheduleModal(false)}>
                <Text style={styles.primaryBtnText}>Save Schedule</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ── ADD SLOT MODAL (JSON: /SaveDrSlot) ── */}
      <Modal visible={showSlotModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.bottomSheet}>
            <View style={styles.dragHandle} />
            <Text style={styles.sheetTitle}>Set Consultation Slot</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Select Doctor</Text>
              <View style={styles.dropdown}>
                <Text style={{ color: THEME.textPrimary }}>Dr. Priya Patil</Text>
                <Feather name="chevron-down" size={20} color={THEME.textSecondary} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Slot Duration</Text>
              <View style={styles.dropdown}>
                <Text style={{ color: THEME.textPrimary }}>30 Min</Text>
                <Feather name="chevron-down" size={20} color={THEME.textSecondary} />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 30 }}>
              <TouchableOpacity style={[styles.secondaryBtn, { flex: 1 }]} onPress={() => setShowSlotModal(false)}>
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]} onPress={() => setShowSlotModal(false)}>
                <Text style={styles.primaryBtnText}>Save Slot</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.screenBg },
  
  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: THEME.textPrimary },
  iconBtn: { padding: 4 },

  // Tabs
  tabContainer: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#E2E8F0', borderRadius: 12, padding: 4, marginBottom: 16 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabBtnActive: { backgroundColor: THEME.bg, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  tabText: { fontSize: 13, fontWeight: '600', color: THEME.textSecondary },
  tabTextActive: { color: THEME.primary },

  scrollContent: { paddingHorizontal: 20 },
  
  // Section Titles
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: THEME.textPrimary },
  countText: { fontSize: 13, color: THEME.textSecondary, fontWeight: '600' },
  addMiniBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  addMiniBtnText: { fontSize: 12, fontWeight: '700', color: '#FFF', marginLeft: 4 },

  // Cards
  card: { flexDirection: 'row', backgroundColor: THEME.bg, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: THEME.border },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 14 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: THEME.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  cardInfo: { flex: 1, justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: THEME.textPrimary, marginBottom: 2 },
  cardSub: { fontSize: 13, color: THEME.textSecondary },
  metaText: { fontSize: 11, color: THEME.textSecondary, marginLeft: 6 },
  actionIconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: THEME.screenBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: THEME.border },

  // Vertical Cards (For Schedules)
  cardVertical: { backgroundColor: THEME.bg, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: THEME.border },
  cardHeaderFlex: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  bgSuccess: { backgroundColor: THEME.successBg },
  bgMuted: { backgroundColor: '#F1F5F9' },
  statusText: { fontSize: 10, fontWeight: '700' },
  textSuccess: { color: THEME.success },
  textMuted: { color: THEME.textSecondary },
  grid2Col: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  metaLabel: { fontSize: 11, color: THEME.textSecondary, marginBottom: 4 },
  metaValue: { fontSize: 13, fontWeight: '600', color: THEME.textPrimary },
  cardActionsRow: { flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12, marginTop: 4 },
  actionTextBtn: { paddingVertical: 4, paddingRight: 12 },
  actionTextBlue: { fontSize: 13, fontWeight: '700', color: THEME.primary },
  actionTextRed: { fontSize: 13, fontWeight: '700', color: '#EF4444' },

  // Slot Badge
  slotBadge: { backgroundColor: '#F3E8FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#D8B4FE' },
  slotBadgeText: { fontSize: 13, fontWeight: '700', color: '#9333EA' },

  // Bottom Sheet
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: THEME.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  dragHandle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: THEME.textPrimary, marginBottom: 20 },

  // Forms
  inputGroup: { marginBottom: 16, flex: 1 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: THEME.textPrimary, marginBottom: 8 },
  dropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: THEME.border, borderRadius: 12, paddingHorizontal: 14, height: 50, backgroundColor: THEME.screenBg },
  input: { borderWidth: 1, borderColor: THEME.border, borderRadius: 12, paddingHorizontal: 14, height: 50, backgroundColor: THEME.screenBg, fontSize: 14, color: THEME.textPrimary },

  primaryBtn: { alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.primary, height: 50, borderRadius: 12 },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  secondaryBtn: { alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.bg, height: 50, borderRadius: 12, borderWidth: 1.5, borderColor: THEME.border },
  secondaryBtnText: { fontSize: 15, fontWeight: '700', color: THEME.textPrimary },
});