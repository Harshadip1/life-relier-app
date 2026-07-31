import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const T = {
  primary:  '#0D9488',
  tealDark: '#0F766E',
  tealBg:   '#F0FDFA',
  bg:       '#F8FAFC',
  card:     '#FFFFFF',
  text:     '#0F172A',
  sub:      '#64748B',
  muted:    '#94A3B8',
  border:   '#E2E8F0',
  danger:   '#EF4444',
  amber:    '#F59E0B',
  purple:   '#7C3AED',
  blue:     '#3B82F6',
  green:    '#10B981',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 'Good Morning 🌅';
  if (h >= 12 && h < 17) return 'Good Afternoon ☀️';
  if (h >= 17 && h < 21) return 'Good Evening 🌆';
  return 'Good Night 🌙';
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// ── Dummy data (replace with real API) ───────────────────────────────────────
const STATS = [
  { label: 'Appointments', value: '18', icon: 'calendar-check-outline',  color: T.blue,   bg: '#EFF6FF' },
  { label: 'Registration', value: '2',  icon: 'account-plus-outline',     color: T.purple, bg: '#F5F3FF' },
  { label: 'Bill Pending', value: '4',  icon: 'wallet-outline',           color: T.amber,  bg: '#FFFBEB' },
  { label: 'Collected',    value: '11', icon: 'test-tube',                color: T.green,  bg: '#ECFDF5' },
];

const QUICK_ACTIONS = [
  { label: 'Registration',     icon: 'account-plus-outline',  color: T.primary, bg: T.tealBg, screen: 'PhleboRegistration' },
  { label: 'Sample\nCollection', icon: 'test-tube',           color: '#0369A1', bg: '#F0F9FF', screen: 'PhleboCollection'   },
  { label: 'Appointments',     icon: 'calendar-month-outline',color: '#7C3AED', bg: '#F5F3FF', screen: 'PhleboAppointments' },
  { label: 'Bill\nPayment',    icon: 'currency-rupee',        color: T.amber,   bg: '#FFFBEB', screen: 'PhleboBillPayment'  },
];

const NEXT_PATIENT = {
  name:     'Rajesh Patil',
  gender:   'Male',
  age:      34,
  time:     '09:40 AM',
  tests:    ['CBC', 'LFT', 'HbA1c'],
  doctor:   'Dr. Shah',
  priority: 'High Priority',
  status:   'Waiting',
};

export default function PhlebotomistHomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 0) }]}>

      {/* ── Teal Header ── */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{getGreeting()}, {user?.name ?? 'Phlebotomist'} 👋</Text>
          <Text style={styles.role}>Phlebotomist</Text>
          <View style={styles.dateRow}>
            <MaterialCommunityIcons name="calendar-outline" size={13} color="rgba(255,255,255,0.75)" />
            <Text style={styles.dateText}>  {formatDate(new Date())}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn}>
            <Feather name="bell" size={20} color="#FFF" />
            <View style={styles.notifDot}><Text style={{ fontSize: 8, color: '#FFF', fontWeight: '800' }}>3</Text></View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarBtn} onPress={() => navigation.navigate('PhleboProfile')}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop' }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[T.primary]} tintColor={T.primary} />}
      >
        {/* ── Stats Grid ── */}
        <View style={styles.statsGrid}>
          {STATS.map(s => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg }]}>
              <View style={[styles.statIcon, { backgroundColor: '#FFF' }]}>
                <MaterialCommunityIcons name={s.icon as any} size={22} color={s.color} />
              </View>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            </View>
          ))}
        </View>

        {/* ── Quick Actions ── */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickRow}>
          {QUICK_ACTIONS.map(q => (
            <TouchableOpacity
              key={q.label}
              style={styles.quickCard}
              onPress={() => navigation.navigate(q.screen)}
              activeOpacity={0.75}
            >
              <View style={[styles.quickIcon, { backgroundColor: q.bg }]}>
                <MaterialCommunityIcons name={q.icon as any} size={26} color={q.color} />
              </View>
              <Text style={styles.quickLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Next Patient ── */}
        <Text style={styles.sectionTitle}>Next Patient</Text>
        <View style={styles.patientCard}>
          {/* Time badge */}
          <View style={styles.timeBadge}>
            <Text style={styles.timeText}>{NEXT_PATIENT.time.split(' ')[0]}</Text>
            <Text style={styles.timeAmpm}>{NEXT_PATIENT.time.split(' ')[1]}</Text>
          </View>

          {/* Patient info */}
          <View style={styles.patientInfo}>
            <View style={styles.patientNameRow}>
              <Text style={styles.patientName}>{NEXT_PATIENT.name}</Text>
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>{NEXT_PATIENT.priority}</Text>
                <MaterialCommunityIcons name="arrow-up-circle" size={12} color="#EF4444" style={{ marginLeft: 2 }} />
              </View>
            </View>

            <Text style={styles.patientMeta}>{NEXT_PATIENT.gender}  •  {NEXT_PATIENT.age} Years</Text>

            <View style={styles.testsRow}>
              {NEXT_PATIENT.tests.map(t => (
                <View key={t} style={styles.testChip}>
                  <Text style={styles.testChipText}>{t}</Text>
                </View>
              ))}
            </View>

            <View style={styles.doctorRow}>
              <MaterialCommunityIcons name="stethoscope" size={13} color={T.sub} />
              <Text style={styles.doctorText}>  {NEXT_PATIENT.doctor}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{NEXT_PATIENT.status}</Text>
                <MaterialCommunityIcons name="timer-sand" size={12} color={T.amber} style={{ marginLeft: 2 }} />
              </View>
            </View>

            <View style={styles.actionBtns}>
              <TouchableOpacity style={styles.viewBtn} activeOpacity={0.8}>
                <Text style={styles.viewBtnText}>View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.collectBtn} activeOpacity={0.8}>
                <MaterialCommunityIcons name="test-tube" size={16} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.collectBtnText}>Start Collection</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.bg },

  header:  {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: T.tealDark,
    paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24,
  },
  greeting:{ fontSize: 16, fontWeight: '700', color: '#FFF' },
  role:    { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2, fontWeight: '500' },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  dateText:{ fontSize: 12, color: 'rgba(255,255,255,0.75)' },

  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  headerBtn:   {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute', top: 5, right: 5,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#EF4444',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: T.tealDark,
  },
  avatarBtn:{ width: 38, height: 38, borderRadius: 10, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  avatar:   { width: 38, height: 38 },

  scroll:  { paddingHorizontal: 16, paddingTop: 20 },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  statCard:  {
    width: '47%', borderRadius: 14,
    padding: 14, alignItems: 'flex-start',
  },
  statIcon:  {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
  },
  statLabel: { fontSize: 12, color: T.sub, fontWeight: '500', marginBottom: 2 },
  statValue: { fontSize: 24, fontWeight: '900' },

  // Section
  sectionTitle: { fontSize: 16, fontWeight: '800', color: T.text, marginBottom: 14, marginTop: 20 },

  // Quick Actions
  quickRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  quickCard: { width: '23%', alignItems: 'center' },
  quickIcon: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  quickLabel: { fontSize: 11, fontWeight: '700', color: T.text, textAlign: 'center', lineHeight: 14 },

  // Next Patient Card
  patientCard: {
    flexDirection: 'row',
    backgroundColor: T.card, borderRadius: 16,
    borderWidth: 1, borderColor: T.border,
    padding: 16,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
  },
  timeBadge: {
    backgroundColor: T.tealBg, borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 8,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 14, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: '#CCFBF1',
    minWidth: 56,
  },
  timeText:  { fontSize: 16, fontWeight: '900', color: T.tealDark },
  timeAmpm:  { fontSize: 10, fontWeight: '700', color: T.tealDark, marginTop: 1 },

  patientInfo:    { flex: 1 },
  patientNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  patientName:    { fontSize: 15, fontWeight: '800', color: T.text },
  priorityBadge:  {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FEF2F2', borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 3,
    borderWidth: 1, borderColor: '#FEE2E2',
  },
  priorityText: { fontSize: 10, fontWeight: '700', color: '#EF4444' },

  patientMeta: { fontSize: 12, color: T.sub, marginBottom: 8, fontWeight: '500' },

  testsRow:    { flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  testChip:    {
    backgroundColor: '#EFF6FF', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: '#DBEAFE',
  },
  testChipText:{ fontSize: 11, fontWeight: '700', color: '#1D4ED8' },

  doctorRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  doctorText:  { fontSize: 12, color: T.sub, flex: 1 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFBEB', borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 3,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  statusText:  { fontSize: 10, fontWeight: '700', color: T.amber },

  actionBtns:  { flexDirection: 'row', gap: 8 },
  viewBtn:     {
    flex: 1, height: 38, borderRadius: 10,
    borderWidth: 1.5, borderColor: T.border,
    alignItems: 'center', justifyContent: 'center',
  },
  viewBtnText: { fontSize: 12, fontWeight: '700', color: T.text },
  collectBtn:  {
    flex: 1.6, height: 38, borderRadius: 10,
    backgroundColor: T.tealDark,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  collectBtnText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
});
