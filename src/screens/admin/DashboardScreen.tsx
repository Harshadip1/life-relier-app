import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import SectionHeader from '../../components/SectionHeader';
import BookingCard from '../../components/BookingCard';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';
import { DUMMY_DASHBOARD_STATS, DUMMY_BOOKINGS } from '../../utils/dummy_data';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  function onRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
    >
      {/* Top Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>{greeting}, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>
        <View style={styles.notifBtn}>
          <MaterialCommunityIcons name="bell-outline" size={22} color={COLORS.textPrimary} />
          <View style={styles.notifDot} />
        </View>
      </View>

      {/* Health Summary Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerLeft}>
          <View style={styles.bannerIconRow}>
            <MaterialCommunityIcons name="heart-pulse" size={20} color={COLORS.primary} />
            <Text style={styles.bannerTitle}>Lab Summary</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.bannerStat}>
              <Text style={styles.bannerStatValue}>{DUMMY_DASHBOARD_STATS.totalBookings}</Text>
              <Text style={styles.bannerStatLabel}>Total Bookings</Text>
            </View>
            <View style={styles.bannerDivider} />
            <View style={styles.bannerStat}>
              <Text style={styles.bannerStatValue}>{DUMMY_DASHBOARD_STATS.pendingReports}</Text>
              <Text style={styles.bannerStatLabel}>Pending Reports</Text>
            </View>
            <View style={styles.bannerDivider} />
            <View style={styles.bannerStat}>
              <Text style={[styles.bannerStatValue, { color: COLORS.danger }]}>
                ₹{DUMMY_DASHBOARD_STATS.todayRevenue.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.bannerStatLabel}>Today Revenue</Text>
            </View>
            <View style={styles.bannerDivider} />
            <View style={styles.bannerStat}>
              <Text style={styles.bannerStatValue}>{DUMMY_DASHBOARD_STATS.totalPatients}</Text>
              <Text style={styles.bannerStatLabel}>Total Patients</Text>
            </View>
          </View>
        </View>
        <MaterialCommunityIcons name="microscope" size={60} color="rgba(13,148,136,0.15)" style={styles.bannerBgIcon} />
      </View>

      {/* Stats Grid */}
      <SectionHeader title="Overview" />
      <View style={styles.statsGrid}>
        <StatCard title="Bookings" value={DUMMY_DASHBOARD_STATS.totalBookings} icon="calendar-check" color="#0D9488" bgColor="#CCFBF1" />
        <StatCard title="Pending" value={DUMMY_DASHBOARD_STATS.pendingReports} icon="clock-outline" color="#F59E0B" bgColor="#FEF3C7" />
        <StatCard title="Revenue" value={`₹${(DUMMY_DASHBOARD_STATS.todayRevenue / 1000).toFixed(1)}K`} icon="currency-inr" color="#EF4444" bgColor="#FEE2E2" />
        <StatCard title="Patients" value={DUMMY_DASHBOARD_STATS.totalPatients} icon="account-group" color="#6366F1" bgColor="#EEF2FF" />
      </View>

      {/* Recent Bookings */}
      <SectionHeader title="Recent Bookings" onViewAll={() => { }} />
      {DUMMY_BOOKINGS.slice(0, 4).map((b) => (
        <BookingCard key={b.id} booking={b} />
      ))}

      <View style={{ height: SPACING.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  greeting: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  date: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  banner: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  bannerLeft: { flex: 1 },
  bannerIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.sm },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  bannerStat: { flex: 1, alignItems: 'center' },
  bannerStatValue: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  bannerStatLabel: { fontSize: 9, color: COLORS.textSecondary, textAlign: 'center', marginTop: 2 },
  bannerDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  bannerBgIcon: { position: 'absolute', right: -10, bottom: -10 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -SPACING.xs },
});
