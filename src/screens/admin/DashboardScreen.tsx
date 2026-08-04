import React from 'react';
import { COLORS } from '../../utils/constants';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

// ─── Quick Actions ────────────────────────────────────────────────────────────
const QUICK = [
  { label: 'New\nRegistration', icon: 'user-plus',            fam: 'feather',   color: '#0F766E', bg: '#F0FDFA', screen: 'NewRegistration'  },
  { label: 'Sample\nCollection',icon: 'eyedropper-variant',   fam: 'material',  color: '#0369A1', bg: '#F0F9FF', screen: 'SampleCollection'  },
  { label: 'Result\nEntry',     icon: 'clipboard-edit-outline',fam: 'material', color: '#7C3AED', bg: '#F5F3FF', screen: 'ResultEntry'       },
  { label: 'Bill\nPayment',     icon: 'cash-register',        fam: 'material',  color: '#15803D', bg: '#F0FDF4', screen: 'BillPayment'       },
  { label: 'Pending\nReports',  icon: 'file-alert-outline',   fam: 'material',  color: '#DC2626', bg: '#FEF2F2', screen: 'PendingReports'    },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning 🌅';
  if (hour >= 12 && hour < 17) return 'Good Afternoon ☀️';
  if (hour >= 17 && hour < 21) return 'Good Evening 🌆';
  return 'Good Night 🌙';
}

export default function DashboardScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const T = {
    primary:   COLORS.primary,
    bg:        COLORS.background,
    card:      COLORS.card,
    text:      COLORS.textPrimary,
    sub:       COLORS.textSecondary,
    muted:     COLORS.textMuted,
    border:    COLORS.cardBorder,
    danger:    COLORS.danger,
    dangerBg:  COLORS.dangerBg,
  };
  const displayName = user?.name || 'Admin';
  const greeting = getGreeting();

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 0) }]}>

      {/* ── COLORS.primary Header Band ── */}
      <View style={styles.headerBand}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.adminName}>{displayName}</Text>
          <View style={styles.labRow}>
            <MaterialCommunityIcons name="check-decagram" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.labName}>  CityCare Diagnostics Laboratory</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
            <Feather name="bell" size={20} color="#FFF" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarBtn} activeOpacity={0.8}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop' }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Stats Grid ── */}
        <View style={styles.statsGrid}>
          <StatCard
            value="48"     label="Patients Registered"      icon="account-plus-outline"  color="#0F766E"  bg="#F0FDFA"  border="#CCFBF1"
            onPress={() => navigation.navigate('PatientStatus')}
          />
          <StatCard
            value="26"     label="Pending Collections"      icon="flask-outline"          color="#0369A1"  bg="#F0F9FF"  border="#BAE6FD"
            onPress={() => navigation.navigate('SampleCollection')}
          />
          <StatCard
            value="14"     label="Pending Reports"          icon="file-clock-outline"     color="#DC2626"  bg="#FEF2F2"  border="#FEE2E2"
            onPress={() => navigation.navigate('PendingReports')}
          />
          <StatCard
            value="₹42.5k" label="Today's Revenue"         icon="cash-multiple"          color="#15803D"  bg="#F0FDF4"  border="#BBF7D0"
          />
        </View>

        {/* ── Quick Actions ── */}
        <SectionTitle title="Quick Actions" />
        <View style={styles.quickRow}>
          {QUICK.map(q => (
            <TouchableOpacity
              key={q.label} style={styles.quickCard}
              onPress={() => navigation.navigate(q.screen)}
              activeOpacity={0.75}
            >
              <View style={[styles.quickIconBox, { backgroundColor: q.bg }]}>
                {q.fam === 'feather'
                  ? <Feather name={q.icon as any} size={22} color={q.color} />
                  : <MaterialCommunityIcons name={q.icon as any} size={24} color={q.color} />}
              </View>
              <Text style={styles.quickLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Critical Alerts ── */}
        <SectionTitle title="Critical Alerts" style={{ marginTop: 24 }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
          <AlertCard number="3"  label="Critical Results"  icon="alert-circle-outline" color="#DC2626" bg="#FEF2F2" border="#FEE2E2" />
          <AlertCard number="14" label="Pending Reports"   icon="file-alert-outline"   color="#F59E0B" bg="#FFFBEB" border="#FDE68A"
            onPress={() => navigation.navigate('PendingReports')} />
          <AlertCard number="5"  label="Urgent Samples"   icon="test-tube"            color="#0369A1" bg="#F0F9FF" border="#BAE6FD" />
        </ScrollView>

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SectionTitle({ title, style, colors }: any) {
  return <Text style={[{ fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 14, marginTop: 24 }, style]}>{title}</Text>;
}

function StatCard({ value, label, icon, color, bg, border, onPress }: any) {
  return (
    <TouchableOpacity
      style={[{ width: '47.5%', borderRadius: 14, borderWidth: 1, padding: 14, alignItems: 'flex-start', elevation: 0 }, { backgroundColor: bg, borderColor: border }]}
      activeOpacity={0.8} onPress={onPress}
    >
      <View style={[{ width: 38, height: 38, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 10, elevation: 1, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 }, { backgroundColor: COLORS.card }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <Text style={[{ fontSize: 22, fontWeight: '800' }, { color }]}>{value}</Text>
      <Text style={{ fontSize: 11, color: COLORS.textSecondary, fontWeight: '500', marginTop: 2 }}>{label}</Text>
    </TouchableOpacity>
  );
}

function AlertCard({ number, label, icon, color, bg, border, onPress }: any) {
  return (
    <TouchableOpacity
      style={[{ width: 120, borderRadius: 14, borderWidth: 1, padding: 14, marginRight: 12, alignItems: 'center', elevation: 0 }, { backgroundColor: bg, borderColor: border }]}
      activeOpacity={0.8} onPress={onPress}
    >
      <View style={[{ width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10, elevation: 1, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 }, { backgroundColor: COLORS.card }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <Text style={[{ fontSize: 26, fontWeight: '900', marginBottom: 2 }, { color }]}>{number}</Text>
      <Text style={{ fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', textAlign: 'center' }}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  // Header band
  headerBand: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20, paddingTop: 18, paddingBottom: 26,
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  adminName: { fontSize: 24, fontWeight: '800', color: '#FFF', marginTop: 2 },
  labRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  labName: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  headerIconBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute', top: 7, right: 7,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#FCD34D', borderWidth: 1.5, borderColor: COLORS.primary,
  },
  avatarBtn: {
    width: 38, height: 38, borderRadius: 10,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
  },
  avatar: { width: 38, height: 38 },

  scroll: { paddingHorizontal: 16, paddingTop: 20 },

  // Stats
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, marginBottom: 8,
  },

  // Quick Actions
  quickRow: { flexDirection: 'row', justifyContent: 'space-between' },
  quickCard: {
    width: '18%',
    alignItems: 'center',
  },
  quickIconBox: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
    elevation: 1, shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  quickLabel: {
    fontSize: 10, fontWeight: '700', color: COLORS.textPrimary,
    textAlign: 'center', lineHeight: 13,
  },
});
