import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  getDoctorDropdown,
  getAllDoctorSchedules,
  getAllSlots,
  deleteSchedule,
  deleteSlot,
  DoctorDropdownItem,
  DoctorScheduleRecord
} from '../../services/doctorScheduleService';

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

function fmtDate(iso: string): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  } catch { return iso; }
}

function fmtTime(t: string | null): string {
  if (!t) return '—';
  if (t.toUpperCase().includes('AM') || t.toUpperCase().includes('PM')) {
    return t; // Already formatted
  }
  try {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  } catch { return t; }
}

export default function DoctorManagementScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  
  // ─── States ───
  const [activeTab, setActiveTab] = useState('Schedules');
  const [doctors, setDoctors] = useState<DoctorDropdownItem[]>([]);
  const [schedules, setSchedules] = useState<DoctorScheduleRecord[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Fetch Data ───
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch doctors
      const drList = await getDoctorDropdown(1);
      setDoctors(drList);

      const doctorMap = new Map<number, string>();
      drList.forEach(d => doctorMap.set(d.Id, d.FullName));

      // 2. Fetch schedules from both branches (website=1, app=4) and merge
      const [schedB1, schedB4] = await Promise.all([
        getAllDoctorSchedules(1).catch(() => []),
        getAllDoctorSchedules(4).catch(() => []),
      ]);
      const seenSched = new Set<number>();
      const mergedSched = [...schedB1, ...schedB4].filter(sc => {
        const id = sc.ScheduleId ?? (sc as any).scheduleId;
        if (seenSched.has(id)) return false;
        seenSched.add(id);
        return true;
      });
      setSchedules(mergedSched);

      // 3. Fetch slots from both branches and merge
      const [slotB1, slotB4] = await Promise.all([
        getAllSlots(1).catch(() => []),
        getAllSlots(4).catch(() => []),
      ]);
      const seenSlot = new Set<number>();
      const mergedSlots = [...slotB1, ...slotB4]
        .filter(sl => {
          if (seenSlot.has(sl.SlotId)) return false;
          seenSlot.add(sl.SlotId);
          return true;
        })
        .map(slot => ({
          ...slot,
          DoctorName: doctorMap.get(slot.DrId) || `Doctor ID: ${slot.DrId}`,
        }));
      setSlots(mergedSlots);

    } catch (err: any) {
      setError(err?.message ?? 'Failed to load registry data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // ─── Delete Actions ───
  const handleDeleteSchedule = (scheduleId: number) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this doctor schedule?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSchedule(scheduleId);
            Alert.alert('Success', 'Doctor schedule deleted successfully.');
            fetchData();
          } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'Failed to delete schedule.');
          }
        }
      }
    ]);
  };

  const handleDeleteSlot = (slotId: number) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this slot?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSlot(slotId);
            Alert.alert('Success', 'Slot deleted successfully.');
            fetchData();
          } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'Failed to delete slot.');
          }
        }
      }
    ]);
  };

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
        <TouchableOpacity style={styles.iconBtn} onPress={fetchData}>
          <Feather name="refresh-cw" size={20} color={THEME.primary} />
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

      {loading && (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={THEME.primary} />
        </View>
      )}

      {error && !loading && (
        <View style={styles.errorBox}>
          <Feather name="alert-triangle" size={32} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* ==========================================
              TAB 1: DOCTORS
          ========================================== */}
          {activeTab === 'Doctors' && (
            <View>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Registered Doctors</Text>
                <Text style={styles.countText}>{doctors.length} Total</Text>
              </View>
              {doctors.length === 0 ? (
                <Text style={styles.emptyText}>No registered doctors found.</Text>
              ) : doctors.map(doc => (
                <View key={doc.Id} style={styles.card}>
                  <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name="doctor" size={24} color={THEME.primary} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{doc.FullName}</Text>
                    <Text style={styles.cardSub}>Doctor ID: {doc.Id}</Text>
                  </View>
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
                <TouchableOpacity style={styles.addMiniBtn} onPress={() => navigation.navigate('AddDoctorSchedule')}>
                  <Feather name="plus" size={14} color="#FFF" />
                  <Text style={styles.addMiniBtnText}>Add Schedule</Text>
                </TouchableOpacity>
              </View>
              
              {schedules.length === 0 ? (
                <Text style={styles.emptyText}>No schedules found.</Text>
              ) : schedules.map(sched => (
                <View key={sched.ScheduleId} style={styles.cardVertical}>
                  <View style={styles.cardHeaderFlex}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name="calendar-clock" size={20} color={THEME.primary} />
                      </View>
                      <Text style={styles.cardTitle}>{sched.DoctorName ?? `Doctor ID: ${sched.DrId}`}</Text>
                    </View>
                    <View style={[styles.statusBadge, sched.IsActive ? styles.bgSuccess : styles.bgMuted]}>
                      <Text style={[styles.statusText, sched.IsActive ? styles.textSuccess : styles.textMuted]}>
                        {sched.IsActive ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.grid2Col}>
                    <View>
                      <Text style={styles.metaLabel}>Valid Period</Text>
                      <Text style={styles.metaValue}>{fmtDate(sched.StartDate)} to {fmtDate(sched.EndDate)}</Text>
                    </View>
                    <View>
                      <Text style={styles.metaLabel}>Working Hours</Text>
                      <Text style={styles.metaValue}>{fmtTime(sched.StartTime)} - {fmtTime(sched.EndTime)}</Text>
                    </View>
                  </View>

                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={styles.actionTextBtn}
                      onPress={() => navigation.navigate('AddDoctorSchedule', { schedule: sched })}
                    >
                      <Text style={styles.actionTextBlue}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionTextBtn}
                      onPress={() => handleDeleteSchedule(sched.ScheduleId)}
                    >
                      <Text style={styles.actionTextRed}>Delete</Text>
                    </TouchableOpacity>
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
                <TouchableOpacity style={styles.addMiniBtn} onPress={() => navigation.navigate('DrSlot')}>
                  <Feather name="plus" size={14} color="#FFF" />
                  <Text style={styles.addMiniBtnText}>Add Slot</Text>
                </TouchableOpacity>
              </View>

              {slots.length === 0 ? (
                <Text style={styles.emptyText}>No consultation slots found.</Text>
              ) : slots.map(slot => (
                <View key={slot.SlotId || slot.id} style={[styles.card, { alignItems: 'center' }]}>
                  <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
                    <Feather name="clock" size={20} color="#9333EA" />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{slot.DoctorName}</Text>
                    <Text style={styles.cardSub}>Consultation Slot</Text>
                  </View>
                  <View style={styles.slotBadge}>
                    <Text style={styles.slotBadgeText}>{slot.Slot} Min</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.actionIconBtn, { marginLeft: 10 }]}
                    onPress={() => handleDeleteSlot(slot.SlotId || slot.id)}
                  >
                    <Feather name="trash-2" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

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
  card: { flexDirection: 'row', backgroundColor: THEME.bg, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: THEME.border, alignItems: 'center' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: THEME.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  cardInfo: { flex: 1, justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: THEME.textPrimary, marginBottom: 2 },
  cardSub: { fontSize: 13, color: THEME.textSecondary },
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

  // Box States
  loaderBox: { paddingVertical: 40, alignItems: 'center' },
  errorBox: { paddingVertical: 40, alignItems: 'center', paddingHorizontal: 20 },
  errorText: { fontSize: 14, color: '#EF4444', textAlign: 'center', marginTop: 10, marginBottom: 20 },
  retryBtn: { backgroundColor: THEME.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  emptyText: { fontSize: 14, color: THEME.textSecondary, textAlign: 'center', marginVertical: 30 },
});