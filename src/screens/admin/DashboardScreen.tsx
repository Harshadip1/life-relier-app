import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const T = {
  primary:   '#0D9488',
  bg:        '#F8FAFC',
  card:      '#FFFFFF',
  text:      '#0F172A',
  sub:       '#64748B',
  muted:     '#94A3B8',
  border:    '#F1F5F9',
  danger:    '#EF4444',
  dangerBg:  '#FEF2F2',
};

// ─── Quick Actions ────────────────────────────────────────────────────────────
const QUICK = [
  { label: 'New\nRegistration', icon: 'user-plus',            fam: 'feather',   color: '#0F766E', bg: '#F0FDFA', screen: 'NewRegistration'  },
  { label: 'Sample\nCollection',icon: 'eyedropper-variant',   fam: 'material',  color: '#0369A1', bg: '#F0F9FF', screen: 'SampleCollection'  },
  { label: 'Result\nEntry',     icon: 'clipboard-edit-outline',fam: 'material', color: '#7C3AED', bg: '#F5F3FF', screen: 'ResultEntry'       },
  { label: 'Bill\nPayment',     icon: 'cash-register',        fam: 'material',  color: '#15803D', bg: '#F0FDF4', screen: 'BillPayment'       },
  { label: 'Pending\nReports',  icon: 'file-alert-outline',   fam: 'material',  color: '#DC2626', bg: '#FEF2F2', screen: 'PendingReports'    },
];

export default function DashboardScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 0) }]}>

      {/* ── Teal Header Band ── */}
      <View style={styles.headerBand}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Good Morning 👋</Text>
          <Text style={styles.adminName}>Admin</Text>
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

        {/* ── Recent Activities ── */}
        <View style={styles.sectionRow}>
          <SectionTitle title="Recent Activities" />
          <TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
        </View>
        <View style={styles.activityCard}>
          <ActivityRow icon="user-plus"         iconFam="feather"  color="#0D9488" bg="#F0FDFA" name="Rahul Sharma"  action="Patient Registered"  time="10:15 AM"
            avatar="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop" />
          <ActivityRow icon="flask-outline"      iconFam="material" color="#0369A1" bg="#F0F9FF" name="Priya Patil"   action="Sample Collected"    time="10:05 AM"
            avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" />
          <ActivityRow icon="check-circle-outline" iconFam="material" color="#15803D" bg="#F0FDF4" name="Arjun Khan"  action="Report Approved"     time="09:45 AM"
            avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop" />
          <ActivityRow icon="cash-register"      iconFam="material" color="#7C3AED" bg="#F5F3FF" name="Sneha Joshi"  action="Payment Received"    time="09:20 AM"
            avatar="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop" isLast />
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

function SectionTitle({ title, style }: any) {
  return <Text style={[styles.sectionTitle, style]}>{title}</Text>;
}

function StatCard({ value, label, icon, color, bg, border, onPress }: any) {
  return (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: bg, borderColor: border }]}
      activeOpacity={0.8} onPress={onPress}
    >
      <View style={[styles.statIconBox, { backgroundColor: '#FFFFFF' }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function ActivityRow({ icon, iconFam, color, bg, name, action, time, avatar, isLast }: any) {
  return (
    <View style={[styles.actRow, !isLast && styles.actBorder]}>
      <View style={styles.actAvatarWrap}>
        <Image source={{ uri: avatar }} style={styles.actAvatar} />
        <View style={[styles.actIconBadge, { backgroundColor: bg }]}>
          {iconFam === 'feather'
            ? <Feather name={icon} size={9} color={color} />
            : <MaterialCommunityIcons name={icon} size={10} color={color} />}
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.actName}>{name}</Text>
        <Text style={styles.actAction}>{action}</Text>
      </View>
      <Text style={styles.actTime}>{time}</Text>
    </View>
  );
}

function AlertCard({ number, label, icon, color, bg, border, onPress }: any) {
  return (
    <TouchableOpacity
      style={[styles.alertCard, { backgroundColor: bg, borderColor: border }]}
      activeOpacity={0.8} onPress={onPress}
    >
      <View style={[styles.alertIconBox, { backgroundColor: '#FFF' }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.alertNum, { color }]}>{number}</Text>
      <Text style={styles.alertLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },

  // Header band
  headerBand: {
    backgroundColor: T.primary,
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
    backgroundColor: '#FCD34D', borderWidth: 1.5, borderColor: T.primary,
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
  statCard: {
    width: '47.5%', borderRadius: 14, borderWidth: 1,
    padding: 14, alignItems: 'flex-start',
    elevation: 0,
  },
  statIconBox: {
    width: 38, height: 38, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, color: T.sub, fontWeight: '500', marginTop: 2 },

  // Section title
  sectionTitle: { fontSize: 15, fontWeight: '800', color: T.text, marginBottom: 14, marginTop: 24 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 14 },
  viewAll: { fontSize: 12, fontWeight: '700', color: T.primary },

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
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  quickLabel: {
    fontSize: 10, fontWeight: '700', color: T.text,
    textAlign: 'center', lineHeight: 13,
  },

  // Activity
  activityCard: {
    backgroundColor: T.card, borderRadius: 16, padding: 4,
    borderWidth: 1, borderColor: T.border,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6,
  },
  actRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12 },
  actBorder: { borderBottomWidth: 1, borderBottomColor: T.border },
  actAvatarWrap: { position: 'relative', marginRight: 12 },
  actAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E2E8F0' },
  actIconBadge: {
    position: 'absolute', bottom: -2, right: -4,
    width: 17, height: 17, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: T.card,
  },
  actName: { fontSize: 13, fontWeight: '700', color: T.text, marginBottom: 2 },
  actAction: { fontSize: 11, color: T.sub },
  actTime: { fontSize: 10, color: T.muted, fontWeight: '500' },

  // Alerts
  alertCard: {
    width: 120, borderRadius: 14, borderWidth: 1,
    padding: 14, marginRight: 12, alignItems: 'center',
    elevation: 0,
  },
  alertIconBox: {
    width: 44, height: 44, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
  },
  alertNum: { fontSize: 26, fontWeight: '900', marginBottom: 2 },
  alertLabel: { fontSize: 11, color: T.sub, fontWeight: '600', textAlign: 'center' },
});
