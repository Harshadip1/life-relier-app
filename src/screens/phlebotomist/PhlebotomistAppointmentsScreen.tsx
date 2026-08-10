import React, { useState } from 'react';
import { COLORS } from '../../utils/constants';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ScrollView, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const T = {
  primary:  '#0D9488',
  tealDark: '#0F766E',
  tealBg:   '#F0FDFA',
  bg:       '#FFFFFF',
  screenBg: '#F8FAFC',
  text:     '#0F172A',
  sub:      '#64748B',
  muted:    '#94A3B8',
  border:   '#E2E8F0',
  amber:    '#F59E0B',
  green:    '#10B981',
  blue:     '#3B82F6',
  danger:   '#EF4444',
};

// ── Date strip ────────────────────────────────────────────────────────────────
const DATES = [
  { label: 'Today',    sub: '30 July', active: true  },
  { label: 'Tomorrow', sub: '31 July', active: false },
  { label: 'Friday',   sub: '01 Aug',  active: false },
  { label: 'Saturday', sub: '02 Aug',  active: false },
];

// ── Filter tabs ────────────────────────────────────────────────────────────────
const TABS = ['All (18)', 'Waiting (7)', 'Collected (10)', 'Missed (1)'];

// ── Appointment data ───────────────────────────────────────────────────────────
type AppStatus = 'Waiting' | 'Confirmed' | 'Collected' | 'Missed';

interface Appt {
  id:       string;
  time:     string;
  duration: string;
  name:     string;
  age:      number;
  gender:   string;
  mobile:   string;
  tests:    string[];
  status:   AppStatus;
  location: string;
  avatar:   string;
}

const APPOINTMENTS: Appt[] = [
  {
    id: '1', time: '09:00\nAM', duration: '10 min',
    name: 'Rajesh Patil',   age: 34, gender: 'Male',   mobile: '9876543210',
    tests: ['CBC', 'LFT', 'ESR'],
    status: 'Waiting', location: 'Lab Visit',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop',
  },
  {
    id: '2', time: '09:20\nAM', duration: '10 min',
    name: 'Meera Sharma',   age: 29, gender: 'Female', mobile: '9876543221',
    tests: ['Lipid Profile', 'TSH'],
    status: 'Confirmed', location: 'Lab Visit',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
  },
  {
    id: '3', time: '09:40\nAM', duration: '10 min',
    name: 'Akshay More',    age: 28, gender: 'Male',   mobile: '9876543232',
    tests: ['Vitamin D', 'Calcium'],
    status: 'Collected', location: 'Lab Visit',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop',
  },
  {
    id: '4', time: '10:00\nAM', duration: '10 min',
    name: 'Suresh Jadhav',  age: 61, gender: 'Male',   mobile: '9876543243',
    tests: ['RBS', 'HbA1c'],
    status: 'Waiting', location: 'Home Collection',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop',
  },
  {
    id: '5', time: '10:20\nAM', duration: '10 min',
    name: 'Anita Sharma',   age: 32, gender: 'Female', mobile: '9876543254',
    tests: ['CBC', 'Ferritin'],
    status: 'Collected', location: 'Lab Visit',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop',
  },
  {
    id: '6', time: '10:40\nAM', duration: '10 min',
    name: 'Rahul More',     age: 27, gender: 'Male',   mobile: '9876543265',
    tests: ['LFT', 'KFT', 'Electrolytes'],
    status: 'Missed', location: 'Lab Visit',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop',
  },
];

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG: Record<AppStatus, { bg: string; color: string; icon: string; btnLabel: string; btnStyle: 'primary' | 'outline' | 'grey' }> = {
  Waiting:   { bg: '#FFFBEB', color: T.amber,   icon: 'timer-sand',          btnLabel: 'Start Collection', btnStyle: 'primary' },
  Confirmed: { bg: '#EFF6FF', color: T.blue,    icon: 'check-circle-outline', btnLabel: 'Start Collection', btnStyle: 'primary' },
  Collected: { bg: '#ECFDF5', color: COLORS.success,   icon: 'check-circle',        btnLabel: 'View Details',     btnStyle: 'outline' },
  Missed:    { bg: '#FEF2F2', color: COLORS.danger,  icon: 'close-circle',        btnLabel: 'Reschedule',       btnStyle: 'grey'    },
};

export default function PhlebotomistAppointmentsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [activeTab,  setActiveTab]  = useState(0);
  const [activeDate, setActiveDate] = useState(0);

  // Filter appointments by tab
  const filterMap: Record<number, AppStatus | null> = {
    0: null,        // All
    1: 'Waiting',
    2: 'Collected',
    3: 'Missed',
  };

  const filtered = filterMap[activeTab] == null
    ? APPOINTMENTS
    : APPOINTMENTS.filter(a => a.status === filterMap[activeTab]);

  const renderItem = ({ item, index }: { item: Appt; index: number }) => {
    const cfg = STATUS_CFG[item.status];
    const isHome = item.location === 'Home Collection';

    const handleAction = () => {
      if (item.status === 'Waiting' || item.status === 'Confirmed') {
        Alert.alert('Start Collection', `Start sample collection for ${item.name}?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Start', onPress: () => Alert.alert('Started', `Collection started for ${item.name}`) },
        ]);
      } else if (item.status === 'Missed') {
        Alert.alert('Reschedule', `Reschedule appointment for ${item.name}?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Reschedule', onPress: () => {} },
        ]);
      }
    };

    return (
      <View style={[s.card, index < filtered.length - 1 && s.cardBorder]}>
        {/* Time column */}
        <View style={s.timeCol}>
          <Text style={s.timeText}>{item.time}</Text>
          <View style={s.durationRow}>
            <MaterialCommunityIcons name="clock-outline" size={11} color={T.amber} />
            <Text style={s.durationText}> {item.duration}</Text>
          </View>
        </View>

        {/* Avatar */}
        <Image source={{ uri: item.avatar }} style={s.avatar} />

        {/* Patient info */}
        <View style={s.info}>
          {/* Name + Status */}
          <View style={s.nameRow}>
            <Text style={s.name} numberOfLines={1}>{item.name}</Text>
            <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
              <Text style={[s.statusText, { color: cfg.color }]}>{item.status}</Text>
              <MaterialCommunityIcons name={cfg.icon as any} size={12} color={cfg.color} style={{ marginLeft: 2 }} />
            </View>
          </View>

          {/* Age / Gender */}
          <Text style={s.meta}>{item.age} Years  •  {item.gender}</Text>

          {/* Mobile */}
          <View style={s.mobileRow}>
            <Feather name="phone" size={11} color={COLORS.textSecondary} />
            <Text style={s.mobileText}>  {item.mobile}</Text>
          </View>

          {/* Tests */}
          <View style={s.testsRow}>
            {item.tests.map(t => (
              <View key={t} style={s.testChip}>
                <Text style={s.testChipTxt}>{t}</Text>
              </View>
            ))}
          </View>

          {/* Location + Action button */}
          <View style={s.bottomRow}>
            <View style={s.locationRow}>
              <MaterialCommunityIcons
                name={isHome ? 'home-outline' : 'map-marker-outline'}
                size={13}
                color={COLORS.textSecondary}
              />
              <Text style={s.locationText}>  {item.location}</Text>
            </View>
            <TouchableOpacity
              style={[
                s.actionBtn,
                cfg.btnStyle === 'primary' && s.actionBtnPrimary,
                cfg.btnStyle === 'outline' && s.actionBtnOutline,
                cfg.btnStyle === 'grey'    && s.actionBtnGrey,
              ]}
              onPress={handleAction}
              activeOpacity={0.8}
            >
              <Text style={[
                s.actionBtnTxt,
                cfg.btnStyle === 'primary' && { color: '#FFF' },
                cfg.btnStyle === 'outline' && { color: COLORS.primaryDark },
                cfg.btnStyle === 'grey'    && { color: COLORS.textSecondary },
              ]}>
                {cfg.btnLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 0) }]}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Feather name="arrow-left" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Appointments</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={() => Alert.alert('Search', 'Search coming soon.')}><Feather name="search" size={20} color="#FFF" /></TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert('Filter', 'Filter coming soon.')}><Feather name="filter" size={20} color="#FFF" /></TouchableOpacity>
        </View>
      </View>

      {/* ── Date Strip ── */}
      <View style={s.dateStrip}>
        <TouchableOpacity style={s.calIcon}>
          <MaterialCommunityIcons name="calendar-month-outline" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          {DATES.map((d, i) => (
            <TouchableOpacity
              key={d.label}
              style={[s.dateBtn, i === activeDate && s.dateBtnActive]}
              onPress={() => setActiveDate(i)}
              activeOpacity={0.8}
            >
              <Text style={[s.dateBtnLabel, i === activeDate && s.dateBtnLabelActive]}>{d.label}</Text>
              <Text style={[s.dateBtnSub, i === activeDate && s.dateBtnSubActive]}>{d.sub}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={s.calIcon}>
          <MaterialCommunityIcons name="calendar-blank-outline" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* ── Filter Tabs ── */}
      <View style={s.tabBar}>
        {TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, i === activeTab && s.tabActive]}
            onPress={() => setActiveTab(i)}
            activeOpacity={0.8}
          >
            <Text style={[s.tabText, i === activeTab && s.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── List ── */}
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListFooterComponent={
          <View style={s.footer}>
            <MaterialCommunityIcons name="calendar-clock-outline" size={16} color={COLORS.primaryDark} />
            <View style={{ marginLeft: 10 }}>
              <Text style={s.footerTitle}>You have 7 appointments remaining today</Text>
              <Text style={s.footerSub}>Keep going! You're doing great.</Text>
            </View>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: COLORS.background },

  // Header
  header:      { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryDark, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14, gap: 12 },
  backBtn:     { padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: '#FFF' },

  // Date strip
  dateStrip:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 10, backgroundColor: COLORS.background, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  calIcon:        { padding: 6 },
  dateBtn:        { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, marginHorizontal: 4, alignItems: 'center' },
  dateBtnActive:  { backgroundColor: COLORS.primaryDark, borderRadius: 10 },
  dateBtnLabel:   { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  dateBtnLabelActive: { color: '#FFF' },
  dateBtnSub:     { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  dateBtnSubActive: { color: 'rgba(255,255,255,0.75)' },

  // Tabs
  tabBar:    { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder, backgroundColor: COLORS.background },
  tab:       { flex: 1, paddingVertical: 11, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2.5, borderBottomColor: COLORS.primary },
  tabText:   { fontSize: 11, fontWeight: '600', color: COLORS.textMuted },
  tabTextActive: { color: COLORS.primary, fontWeight: '800' },

  // Cards
  card:       { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.background, alignItems: 'flex-start' },
  cardBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },

  // Time column
  timeCol:      { width: 52, alignItems: 'center', marginRight: 10, paddingTop: 2 },
  timeText:     { fontSize: 12, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center', lineHeight: 17 },
  durationRow:  { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  durationText: { fontSize: 10, color: T.amber, fontWeight: '600' },

  // Avatar
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 10, backgroundColor: COLORS.cardBorder },

  // Info
  info:       { flex: 1 },
  nameRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  name:       { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, flex: 1, marginRight: 6 },
  statusBadge:{ flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },

  meta:       { fontSize: 11, color: COLORS.textSecondary, marginBottom: 3 },
  mobileRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  mobileText: { fontSize: 11, color: COLORS.textSecondary },

  testsRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  testChip:   { backgroundColor: COLORS.background ?? '#F8FAFC', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: COLORS.cardBorder },
  testChipTxt:{ fontSize: 11, fontWeight: '600', color: COLORS.textPrimary },

  bottomRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  locationRow:  { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 11, color: COLORS.textSecondary },

  // Action buttons
  actionBtn:        { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, minWidth: 110, alignItems: 'center' },
  actionBtnPrimary: { backgroundColor: COLORS.primaryDark },
  actionBtnOutline: { borderWidth: 1.5, borderColor: COLORS.primaryDark },
  actionBtnGrey:    { borderWidth: 1.5, borderColor: COLORS.cardBorder },
  actionBtnTxt:     { fontSize: 12, fontWeight: '700' },

  // Footer
  footer:      { flexDirection: 'row', alignItems: 'center', margin: 16, backgroundColor: COLORS.primaryLight, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#CCFBF1' },
  footerTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primaryDark },
  footerSub:   { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
});
