import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const T = {
  primary:  '#0D9488',
  bg:       '#F8FAFC',
  card:     '#FFFFFF',
  text:     '#0F172A',
  sub:      '#64748B',
  muted:    '#94A3B8',
  border:   '#E2E8F0',
  danger:   '#EF4444',
  dangerBg: '#FFF1F2',
};

// ─── Master sections ──────────────────────────────────────────────────────────
const SECTIONS = [
  {
    title:  'Doctor Management',
    icon:   'stethoscope',
    color:  '#4F46E5',
    bg:     '#EEF2FF',
    items: [
      { label: 'Doctors',           icon: 'account-tie-outline',   color: '#4F46E5', bg: '#EEF2FF', screen: 'DoctorManagement'   },
      { label: 'Doctor Schedule',   icon: 'calendar-month',        color: '#0F766E', bg: '#F0FDFA', screen: 'DrAppointment'      },
      { label: 'Dr Slot',           icon: 'clock-time-four-outline',color: '#0891B2', bg: '#ECFEFF', screen: 'DrSlot'            },
      { label: 'Dr Appointment',    icon: 'calendar-check-outline',color: '#7C3AED', bg: '#F5F3FF', screen: 'AppointmentRecords' },
      { label: 'Show Appointment',  icon: 'calendar-search',       color: '#C2410C', bg: '#FFF7ED', screen: 'ShowAppointment'    },
      { label: 'Referral Doctors',  icon: 'account-heart-outline', color: '#DC2626', bg: '#FEF2F2', screen: 'ReferralDoctor'     },
    ],
  },
  {
    title:  'Test Management',
    icon:   'test-tube',
    color:  '#0369A1',
    bg:     '#F0F9FF',
    items: [
      { label: 'Test Master',        icon: 'test-tube',               color: '#0369A1', bg: '#F0F9FF', screen: 'TestMaster'        },
      { label: 'Test Charge Detail', icon: 'currency-inr',            color: '#0D9488', bg: '#F0FDFA', screen: 'TestChargeDetail'  },
      { label: 'Packages',           icon: 'package-variant-closed',  color: '#7C3AED', bg: '#F5F3FF', screen: 'Packages'          },
      { label: 'Package Master',     icon: 'package-variant',         color: '#1D4ED8', bg: '#EFF6FF', screen: 'PackageMaster'     },
      { label: 'Department Master',icon: 'office-building-outline',color: '#92400E', bg: '#FEF3C7', screen: 'DepartmentMaster'  },
      { label: 'Sample Type',     icon: 'flask-outline',           color: '#6D28D9', bg: '#F5F3FF', screen: 'SampleTypeMaster'  },
      { label: 'Tube Master',     icon: 'test-tube-empty',         color: '#065F46', bg: '#ECFDF5', screen: 'TubeMaster'        },
    ],
  },
  {
    title:  'Laboratory',
    icon:   'microscope',
    color:  '#0891B2',
    bg:     '#ECFEFF',
    items: [
      { label: 'Collection Centers', icon: 'map-marker-outline',   color: '#0891B2', bg: '#ECFEFF', screen: 'CollectionCenter'  },
      { label: 'Instruments',        icon: 'robot-industrial-outline', color: '#6D28D9', bg: '#F5F3FF', screen: 'Instruments'   },
    ],
  },
  {
    title:  'Staff',
    icon:   'account-group-outline',
    color:  '#7C3AED',
    bg:     '#F5F3FF',
    items: [
      { label: 'Staff',        icon: 'account-multiple-outline',   color: '#7C3AED', bg: '#F5F3FF', screen: 'StaffManagement'   },
      { label: 'Roles',        icon: 'shield-account-outline',     color: '#1D4ED8', bg: '#EFF6FF', screen: 'Roles'             },
      { label: 'Permissions',  icon: 'lock-outline',               color: '#15803D', bg: '#F0FDF4', screen: 'Permissions'       },
    ],
  },
];

export default function MasterScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 0) }]}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Master</Text>
          <Text style={styles.headerSub}>Configuration — not for daily use</Text>
        </View>
        <TouchableOpacity style={styles.settingsBtn}>
          <Feather name="settings" size={20} color={T.sub} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Admin identity chip */}
        <View style={styles.adminChip}>
          <View style={styles.adminAvatar}>
            <Feather name="user" size={20} color={T.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.adminName}>{user?.name || 'Admin'}</Text>
            <Text style={styles.adminEmail}>{user?.email || 'admin@lab.com'}</Text>
          </View>
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>System Admin</Text>
          </View>
        </View>

        {/* ── Grouped sections ── */}
        {SECTIONS.map(sec => (
          <View key={sec.title} style={styles.section}>
            {/* Section header */}
            <View style={styles.secHeader}>
              <View style={[styles.secIconBox, { backgroundColor: sec.bg }]}>
                <MaterialCommunityIcons name={sec.icon as any} size={18} color={sec.color} />
              </View>
              <Text style={[styles.secTitle, { color: sec.color }]}>{sec.title}</Text>
              <View style={[styles.secDivider, { backgroundColor: sec.color, opacity: 0.15 }]} />
            </View>

            {/* Items */}
            <View style={styles.itemsCard}>
              {sec.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.menuItem, idx === sec.items.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => navigation.navigate(item.screen)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconBox, { backgroundColor: item.bg }]}>
                    <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Feather name="chevron-right" size={18} color={T.muted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => logout()}
          activeOpacity={0.8}
        >
          <Feather name="power" size={18} color={T.danger} />
          <Text style={styles.logoutText}>System Logout</Text>
        </TouchableOpacity>

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
    paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12,
    backgroundColor: T.card,
    borderBottomWidth: 1, borderBottomColor: T.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: T.text },
  headerSub:   { fontSize: 12, color: T.sub, marginTop: 2 },
  settingsBtn: { padding: 6 },

  scroll: { padding: 16 },

  adminChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.card, borderRadius: 14,
    borderWidth: 1, borderColor: '#CCFBF1',
    padding: 14, marginBottom: 24,
  },
  adminAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#F0FDFA',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  adminName:  { fontSize: 15, fontWeight: '700', color: T.text },
  adminEmail: { fontSize: 12, color: T.sub, marginTop: 1 },
  adminBadge: {
    backgroundColor: '#F0FDFA', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: '#CCFBF1',
  },
  adminBadgeText: { fontSize: 10, fontWeight: '700', color: T.primary },

  section: { marginBottom: 24 },
  secHeader: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 10,
  },
  secIconBox: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8,
  },
  secTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 0.3 },
  secDivider: { flex: 1, height: 1, marginLeft: 10 },

  itemsCard: {
    backgroundColor: T.card,
    borderRadius: 14, borderWidth: 1, borderColor: T.border,
    overflow: 'hidden',
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: T.border,
  },
  menuIconBox: {
    width: 36, height: 36, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 14,
  },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: T.text },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: T.dangerBg, borderRadius: 14,
    paddingVertical: 14, gap: 10,
    borderWidth: 1, borderColor: '#FFE4E6',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: T.danger },
});
