/**
 * Doctor Consultation — Today's Appointments
 * Shows strictly appointments assigned to the logged-in doctor.
 * Tap an appointment to open the full consultation flow.
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../utils/constants';

const T = {
  primary: '#0D9488', tealDark: '#0F766E', tealBg: '#F0FDFA', tealBorder: '#CCFBF1',
  bg: '#FFFFFF', screenBg: '#F8FAFC', text: '#0F172A',
  sub: '#64748B', muted: '#94A3B8', border: '#E2E8F0',
  green: '#10B981', warning: '#F59E0B', danger: '#EF4444',
};

export interface Appointment {
  AppointmentId: number;
  DrId:          number;
  Name:          string | null;
  Mobile:        string;
  AppointmentDate: string;
  Slot:          string;
  Age:           number;
  Status:        string;
  DoctorName:    string;
  Address:       string;
  GenderId:      number;
}

function fmtSlot(slot: string): string {
  if (!slot) return '—';
  if (/AM|PM/i.test(slot)) return slot;
  const [h, m] = slot.split(':').map(Number);
  if (isNaN(h)) return slot;
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${String(h % 12 || 12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ampm}`;
}

function statusMeta(s: string) {
  switch (s) {
    case 'Completed': return { color: T.green,   bg: '#ECFDF5' };
    case 'Cancelled': return { color: T.danger,  bg: '#FEF2F2' };
    default:          return { color: T.warning, bg: '#FFFBEB' };
  }
}

export default function DoctorAppointmentsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const [appts,      setAppts]      = useState<Appointment[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const doctorName = user?.name || 'Dr. Girish Patil';

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/DrAppointment/GetAllAppointment`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ BranchId: 1 }),
      });
      const data = await res.json();
      const all: Appointment[] = Array.isArray(data) ? data : (data?.value ?? []);

      const today = new Date().toISOString().split('T')[0];
      
      // Strict filter: today only AND assigned to this doctor
      const mine = all.filter(a => {
        const apptDay = String(a.AppointmentDate ?? '').substring(0, 10);
        const drNameInAppt = (a.DoctorName ?? '').trim().toLowerCase();
        const loggedDrName = doctorName.trim().toLowerCase();
        
        // Match doctor name only
        const isAssignedDoctor = drNameInAppt.includes(loggedDrName) || 
          loggedDrName.includes(drNameInAppt);

        return apptDay === today && isAssignedDoctor;
      });

      // If backend has no appointments for today, show empty state
      if (mine.length === 0) {
        setAppts([]);
      } else {
        setAppts(mine);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load appointments.');
    } finally { setLoading(false); setRefreshing(false); }
  }, [doctorName]);

  useFocusEffect(useCallback(() => { load(); return () => {}; }, [load]));

  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good Morning 🌅' : h < 17 ? 'Good Afternoon ☀️' : 'Good Evening 🌆';
  const todayStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  const pending   = appts.filter(a => a.Status === 'Pending').length;
  const completed = appts.filter(a => a.Status === 'Completed').length;

  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 0) }]}>
      {/* Header band */}
      <View style={s.headerBand}>
        <View style={{ flex: 1 }}>
          <Text style={s.greeting}>{greeting}</Text>
          <Text style={s.userName}>{doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`}</Text>
          <Text style={s.dateStr}>{todayStr}</Text>
        </View>
        <TouchableOpacity style={s.iconBtn} onPress={() => load(true)}>
          <Feather name="refresh-cw" size={18} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={[s.iconBtn, { marginLeft: 8 }]} onPress={() => logout()}>
          <Feather name="log-out" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <View style={[s.stat, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
          <Text style={[s.statVal, { color: T.warning }]}>{pending}</Text>
          <Text style={s.statLbl}>Pending</Text>
        </View>
        <View style={[s.stat, { backgroundColor: '#ECFDF5', borderColor: '#BBF7D0' }]}>
          <Text style={[s.statVal, { color: T.green }]}>{completed}</Text>
          <Text style={s.statLbl}>Completed</Text>
        </View>
        <View style={[s.stat, { backgroundColor: T.tealBg, borderColor: T.tealBorder }]}>
          <Text style={[s.statVal, { color: T.tealDark }]}>{appts.length}</Text>
          <Text style={s.statLbl}>Total</Text>
        </View>
      </View>

      <Text style={s.listTitle}>Today's Appointments (Assigned to You)</Text>

      {loading ? (
        <View style={s.centre}>
          <ActivityIndicator size="large" color={T.primary} />
          <Text style={s.centreText}>Loading today's appointments…</Text>
        </View>
      ) : error ? (
        <View style={s.centre}>
          <MaterialCommunityIcons name="cloud-off-outline" size={52} color={T.muted} />
          <Text style={s.centreText}>Could not load appointments</Text>
          <Text style={[s.centreText, { color: T.danger }]}>{error}</Text>
          <TouchableOpacity style={[s.retryBtn, { marginTop: 12 }]} onPress={() => load(true)}>
            <Feather name="refresh-cw" size={14} color={T.primary} />
            <Text style={[s.retryTxt, { color: T.primary }]}> Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={appts}
          keyExtractor={(item) => String(item.AppointmentId)}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[T.primary]} />}
          ListEmptyComponent={
            <View style={s.centre}>
              <MaterialCommunityIcons name="calendar-blank-outline" size={52} color={T.muted} />
              <Text style={s.centreText}>No appointments assigned to you today</Text>
            </View>
          }
          renderItem={({ item }) => {
            const sm = statusMeta(item.Status);
            const patientName = item.Name || `Patient #${item.AppointmentId}`;
            return (
              <TouchableOpacity
                style={s.card}
                onPress={() => navigation.navigate('ConsultationDetail', { appointment: item })}
                activeOpacity={0.8}
              >
                <View style={s.cardLeft}>
                  <View style={s.timeBox}>
                    <Text style={s.timeText}>{fmtSlot(item.Slot)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.patName}>{patientName}</Text>
                    <View style={s.metaRow}>
                      <Feather name="phone" size={11} color={T.muted} />
                      <Text style={s.metaText}>{item.Mobile || '—'}</Text>
                      {item.Age > 0 && (
                        <Text style={[s.metaText, { marginLeft: 8 }]}>•  {item.Age} yrs</Text>
                      )}
                    </View>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <View style={[s.badge, { backgroundColor: sm.bg }]}>
                    <View style={[s.dot, { backgroundColor: sm.color }]} />
                    <Text style={[s.badgeTxt, { color: sm.color }]}>{item.Status || 'Pending'}</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={T.muted} />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: T.screenBg },
  headerBand:  { backgroundColor: T.primary, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 22, flexDirection: 'row', alignItems: 'flex-start', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  greeting:    { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  userName:    { fontSize: 20, fontWeight: '800', color: '#FFF', marginTop: 2 },
  dateStr:     { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  iconBtn:     { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  statsRow:    { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  stat:        { flex: 1, borderRadius: 12, borderWidth: 1, paddingVertical: 10, alignItems: 'center' },
  statVal:     { fontSize: 22, fontWeight: '800' },
  statLbl:     { fontSize: 11, color: T.sub, marginTop: 2 },
  listTitle:   { paddingHorizontal: 16, fontSize: 14, fontWeight: '700', color: T.sub, marginBottom: 6 },
  list:        { paddingHorizontal: 16, paddingBottom: 80 },
  centre:      { alignItems: 'center', paddingTop: 50 },
  centreText:  { fontSize: 14, color: T.sub, marginTop: 10 },
  card:        { backgroundColor: T.bg, borderRadius: 14, borderWidth: 1, borderColor: T.border, marginBottom: 10, padding: 14, flexDirection: 'row', alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
  cardLeft:    { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  timeBox:     { width: 72, height: 44, borderRadius: 10, backgroundColor: T.tealBg, alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: T.tealBorder },
  timeText:    { fontSize: 12, fontWeight: '700', color: T.tealDark },
  patName:     { fontSize: 14, fontWeight: '700', color: T.text, marginBottom: 4 },
  metaRow:     { flexDirection: 'row', alignItems: 'center' },
  metaText:    { fontSize: 11, color: T.muted, marginLeft: 3 },
  badge:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  dot:         { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  badgeTxt:     { fontSize: 10, fontWeight: '700' },
  retryBtn:     { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: T.primary, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 7 },
  retryTxt:     { fontSize: 13, fontWeight: '700' },
});
