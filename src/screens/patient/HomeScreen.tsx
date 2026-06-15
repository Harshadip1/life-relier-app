import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import SectionHeader from '../../components/SectionHeader';
import ReportCard from '../../components/ReportCard';
import StatusBadge from '../../components/StatusBadge';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';
import { DUMMY_REPORTS, DUMMY_UPCOMING_TESTS } from '../../utils/dummy_data';

const QUICK_ACTIONS = [
  { id: 'reports', icon: 'file-document-outline', label: 'View\nReports', color: '#6366F1', bg: '#EEF2FF' },
  { id: 'book', icon: 'flask-outline', label: 'Book\nTest', color: '#0D9488', bg: '#CCFBF1' },
  { id: 'pay', icon: 'credit-card-outline', label: 'Pay\nOnline', color: '#EF4444', bg: '#FEE2E2' },
  { id: 'contact', icon: 'phone-outline', label: 'Contact\nLab', color: '#8B5CF6', bg: '#EDE9FE' },
];

const BOOKING_STEPS = [
  { id: 1, label: 'Registration\nComplete', done: true, date: '15 Jun 2026' },
  { id: 2, label: 'Sample\nCollected', done: true, date: '15 Jun 2026' },
  { id: 3, label: 'Report\nProcessing', active: true, date: '—' },
  { id: 4, label: 'Report\nReady', done: false, date: '—' },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  function onRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
    >
      {/* Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>{greeting}, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.date}>
            {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>
        <View style={styles.notifBtn}>
          <MaterialCommunityIcons name="bell-outline" size={22} color={COLORS.textPrimary} />
          <View style={styles.notifDot} />
        </View>
      </View>

      {/* Health Summary Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerIconRow}>
          <MaterialCommunityIcons name="heart-pulse" size={20} color={COLORS.primary} />
          <Text style={styles.bannerTitle}>Health Summary</Text>
        </View>
        <View style={styles.bannerStats}>
          <View style={styles.bStat}>
            <Text style={styles.bStatVal}>12</Text>
            <Text style={styles.bStatLabel}>Total Reports{'\n'}Available</Text>
          </View>
          <View style={styles.bDivider} />
          <View style={styles.bStat}>
            <Text style={styles.bStatVal}>2</Text>
            <Text style={styles.bStatLabel}>Pending{'\n'}Reports</Text>
          </View>
          <View style={styles.bDivider} />
          <View style={styles.bStat}>
            <Text style={styles.bStatVal}>15 Jun 2026</Text>
            <Text style={styles.bStatLabel}>Last Test{'\n'}Date</Text>
          </View>
          <View style={styles.bDivider} />
          <View style={styles.bStat}>
            <Text style={[styles.bStatVal, { color: COLORS.danger }]}>₹1,250</Text>
            <Text style={styles.bStatLabel}>Outstanding{'\n'}Balance</Text>
          </View>
        </View>
        <MaterialCommunityIcons name="microscope" size={70} color="rgba(13,148,136,0.12)" style={styles.bannerBgIcon} />
      </View>

      {/* Quick Actions */}
      <SectionHeader title="Quick Actions" />
      <View style={styles.quickRow}>
        {QUICK_ACTIONS.map((a) => (
          <TouchableOpacity key={a.id} style={styles.quickCard} activeOpacity={0.85}>
            <View style={[styles.quickIcon, { backgroundColor: a.bg }]}>
              <MaterialCommunityIcons name={a.icon as any} size={24} color={a.color} />
            </View>
            <Text style={styles.quickLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Reports */}
      <SectionHeader title="Recent Reports" onViewAll={() => {}} />
      {DUMMY_REPORTS.filter((r) => r.status === 'ready').map((r) => (
        <ReportCard key={r.id} report={r} onView={() => {}} />
      ))}

      {/* Booking Status */}
      <SectionHeader title="Booking Status" />
      <View style={styles.statusCard}>
        <View style={styles.statusTrack}>
          {BOOKING_STEPS.map((step, idx) => (
            <View key={step.id} style={styles.stepWrapper}>
              {idx > 0 && (
                <View style={[styles.stepLine, step.done || step.active ? styles.stepLineDone : styles.stepLineEmpty]} />
              )}
              <View style={[
                styles.stepCircle,
                step.done ? styles.stepDone : step.active ? styles.stepActive : styles.stepEmpty,
              ]}>
                {step.done
                  ? <MaterialCommunityIcons name="check" size={12} color="#fff" />
                  : step.active
                  ? <View style={styles.stepActiveDot} />
                  : null}
              </View>
              <Text style={styles.stepLabel}>{step.label}</Text>
              <Text style={styles.stepDate}>{step.date}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Upcoming Appointment */}
      <SectionHeader title="Upcoming Appointment" />
      {DUMMY_UPCOMING_TESTS.map((t) => (
        <View key={t.id} style={styles.apptCard}>
          <View style={styles.apptLeft}>
            <View style={styles.apptIconBox}>
              <MaterialCommunityIcons
                name={t.collectionType === 'home' ? 'home-outline' : 'hospital-building'}
                size={24}
                color={COLORS.primary}
              />
            </View>
            <View>
              <View style={styles.apptBadge}>
                <Text style={styles.apptBadgeText}>
                  {t.collectionType === 'home' ? 'Home Collection' : 'Lab Visit'}
                </Text>
              </View>
              <Text style={styles.apptName}>{t.testName}</Text>
              <View style={styles.apptDateRow}>
                <MaterialCommunityIcons name="calendar" size={12} color={COLORS.textSecondary} />
                <Text style={styles.apptDate}>{t.date}</Text>
              </View>
            </View>
          </View>
          <View style={styles.apptPhlebotomist}>
            <Text style={styles.apptPhlLabel}>Assigned Phlebotomist</Text>
            <View style={styles.apptPhlRow}>
              <View style={styles.apptPhlAvatar}>
                <MaterialCommunityIcons name="account-outline" size={16} color={COLORS.textSecondary} />
              </View>
              <Text style={styles.apptPhlName}>Rizwan Ahmed</Text>
            </View>
          </View>
        </View>
      ))}

      <View style={{ height: SPACING.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md },
  greeting: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  date: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  notifBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  notifDot: {
    position: 'absolute', top: 10, right: 10,
    width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.danger,
    borderWidth: 1.5, borderColor: COLORS.surface,
  },
  banner: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.sm, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  bannerIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.sm },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  bannerStats: { flexDirection: 'row', alignItems: 'center' },
  bStat: { flex: 1, alignItems: 'center' },
  bStatVal: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  bStatLabel: { fontSize: 9, color: COLORS.textSecondary, textAlign: 'center', marginTop: 2 },
  bDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  bannerBgIcon: { position: 'absolute', right: -10, bottom: -10 },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  quickCard: {
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, alignItems: 'center', flex: 1, marginHorizontal: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  quickIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  quickLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textPrimary, textAlign: 'center' },
  statusCard: {
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  statusTrack: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  stepWrapper: { flex: 1, alignItems: 'center', position: 'relative' },
  stepLine: { position: 'absolute', top: 12, right: '50%', left: '-50%', height: 2 },
  stepLineDone: { backgroundColor: COLORS.primary },
  stepLineEmpty: { backgroundColor: COLORS.border },
  stepCircle: {
    width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  stepDone: { backgroundColor: COLORS.primary },
  stepActive: { backgroundColor: COLORS.accent, borderWidth: 2, borderColor: 'rgba(245,158,11,0.3)' },
  stepActiveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  stepEmpty: { backgroundColor: COLORS.border },
  stepLabel: { fontSize: 10, color: COLORS.textSecondary, textAlign: 'center' },
  stepDate: { fontSize: 9, color: COLORS.textMuted, textAlign: 'center' },
  apptCard: {
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SPACING.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  apptLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  apptIconBox: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  apptBadge: {
    backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 20, alignSelf: 'flex-start', marginBottom: 4,
  },
  apptBadgeText: { fontSize: 10, color: COLORS.primary, fontWeight: '600' },
  apptName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  apptDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  apptDate: { fontSize: 11, color: COLORS.textSecondary },
  apptPhlebotomist: { alignItems: 'flex-end' },
  apptPhlLabel: { fontSize: 10, color: COLORS.textMuted, marginBottom: 4 },
  apptPhlRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  apptPhlAvatar: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  apptPhlName: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
});
