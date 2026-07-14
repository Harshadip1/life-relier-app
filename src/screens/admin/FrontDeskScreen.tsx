import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const T = {
  primary:  '#0D9488',
  bg:       '#F8FAFC',
  card:     '#FFFFFF',
  text:     '#0F172A',
  sub:      '#64748B',
  muted:    '#94A3B8',
  border:   '#E2E8F0',
};

const MODULES = [
  {
    title:   'New Registration',
    sub:     'Register walk-in patients & create IDs',
    icon:    'user-plus',
    fam:     'feather',
    color:   '#0F766E',
    bg:      '#F0FDFA',
    border:  '#CCFBF1',
    screen:  'NewRegistration',
  },
  {
    title:   'Patient Status',
    sub:     'Track patient journey from registration to delivery',
    icon:    'account-clock-outline',
    fam:     'material',
    color:   '#1D4ED8',
    bg:      '#EFF6FF',
    border:  '#BFDBFE',
    screen:  'PatientStatus',
  },
  {
    title:   'Bill Payment',
    sub:     'Collect payments and generate receipts',
    icon:    'cash-register',
    fam:     'material',
    color:   '#15803D',
    bg:      '#F0FDF4',
    border:  '#BBF7D0',
    screen:  'BillPayment',
  },
  {
    title:   'Appointment Booking',
    sub:     'Book doctor consultations for patients',
    icon:    'calendar-check-outline',
    fam:     'material',
    color:   '#7C3AED',
    bg:      '#F5F3FF',
    border:  '#DDD6FE',
    screen:  'AppointmentBooking',
    future:  true,
  },
  {
    title:   'Home Collection',
    sub:     'Schedule home sample collection visits',
    icon:    'home-city-outline',
    fam:     'material',
    color:   '#0891B2',
    bg:      '#ECFEFF',
    border:  '#A5F3FC',
    screen:  'HomeCollection',
    future:  true,
  },
];

export default function FrontDeskScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 0) }]}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Front Desk</Text>
          <Text style={styles.headerSub}>Patient registration & billing</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Feather name="bell" size={22} color={T.text} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      {/* ── Search Patient ── */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={T.muted} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patient by name, ID or phone..."
            placeholderTextColor={T.muted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={16} color={T.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <Text style={styles.sectionTitle}>Modules</Text>

        {MODULES.map((m) => (
          <TouchableOpacity
            key={m.title}
            style={[styles.moduleCard, { borderLeftColor: m.color, borderLeftWidth: 4 }]}
            onPress={() => navigation.navigate(m.screen)}
            activeOpacity={0.75}
          >
            {/* Icon */}
            <View style={[styles.iconBox, { backgroundColor: m.bg }]}>
              {m.fam === 'feather'
                ? <Feather name={m.icon as any} size={26} color={m.color} />
                : <MaterialCommunityIcons name={m.icon as any} size={28} color={m.color} />}
            </View>

            {/* Text */}
            <View style={styles.moduleText}>
              <View style={styles.moduleTitleRow}>
                <Text style={styles.moduleTitle}>{m.title}</Text>
                {m.future && (
                  <View style={styles.futureBadge}>
                    <Text style={styles.futureBadgeText}>Soon</Text>
                  </View>
                )}
              </View>
              <Text style={styles.moduleSub}>{m.sub}</Text>
            </View>

            {/* Arrow */}
            <View style={[styles.arrowBox, { backgroundColor: m.bg }]}>
              <Feather name="chevron-right" size={18} color={m.color} />
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },

  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8,
    backgroundColor: T.card,
    borderBottomWidth: 1, borderBottomColor: T.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: T.text },
  headerSub:   { fontSize: 12, color: T.sub, marginTop: 2 },
  notifBtn: { position: 'relative', padding: 6 },
  notifDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: T.card,
  },

  searchWrap: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: T.card, borderBottomWidth: 1, borderBottomColor: T.border },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F1F5F9', borderRadius: 12,
    paddingHorizontal: 14, height: 46,
  },
  searchInput: { flex: 1, fontSize: 14, color: T.text },

  scroll: { padding: 16 },

  sectionTitle: { fontSize: 13, fontWeight: '700', color: T.muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 14 },

  moduleCard: {
    backgroundColor: T.card,
    borderRadius: 14,
    borderWidth: 1, borderColor: T.border,
    flexDirection: 'row', alignItems: 'center',
    padding: 16, marginBottom: 12,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6,
  },
  iconBox: {
    width: 56, height: 56, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 16,
  },
  moduleText: { flex: 1 },
  moduleTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  moduleTitle: { fontSize: 16, fontWeight: '700', color: T.text },
  moduleSub:   { fontSize: 12, color: T.sub, lineHeight: 18 },

  futureBadge: {
    backgroundColor: '#FEF3C7', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2, marginLeft: 8,
  },
  futureBadgeText: { fontSize: 9, fontWeight: '800', color: '#92400E' },

  arrowBox: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 12,
  },
});
