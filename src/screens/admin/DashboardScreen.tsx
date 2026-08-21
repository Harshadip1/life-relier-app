import React, { useEffect, useState } from 'react';
import { COLORS } from '../../utils/constants';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { API_BASE_URL } from '../../utils/constants';

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

  const [patientsRegistered, setPatientsRegistered] = useState<number | null>(null);
  const [pendingCollections, setPendingCollections] = useState<number | null>(null);
  const [pendingReports,     setPendingReports]     = useState<number | null>(null);
  const [todayRevenue,       setTodayRevenue]       = useState<number | null>(null);
  const [urgentSamples,      setUrgentSamples]      = useState<number | null>(null);
  const [criticalResults,    setCriticalResults]    = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const allTimeStart = '2024-01-01';
    try {
      // Patients registered — same API, same date range & grouping as PatientsScreen
      const regRes = await fetch(`${API_BASE_URL}/api/TestStatus/GetPatientTestStatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          BranchId: 1,
          FromDate: allTimeStart,
          ToDate: today,
          PatRegID: '',
          PatientName: '',
          DoctorName: '',
          TestName: '',
          MobileNo: '',
          Barcode: '',
          CenterCode: '',
          SubDepartment: '',
          Status: 'All',
        }),
      });
      const regData = await regRes.json();
      const regRows: any[] = Array.isArray(regData) ? regData : (regData?.value ?? []);
      // Count unique PIDs — matches PatientsScreen grouping logic
      const uniquePIDs = new Set(regRows.map((r: any) => r.PID));
      setPatientsRegistered(uniquePIDs.size);
    } catch {
      setPatientsRegistered(null);
    }

    try {
      // Pending collections — same API, date range & logic as SamplesScreen
      const pendRes = await fetch(`${API_BASE_URL}/api/TestStatus/GetPatientTestStatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          BranchId: 1,
          FromDate: today,
          ToDate: today,
          PatRegID: '',
          PatientName: '',
          DoctorName: '',
          TestName: '',
          MobileNo: '',
          Barcode: '',
          CenterCode: '',
          SubDepartment: '',
          Status: 'All',
        }),
      });
      const pendData = await pendRes.json();
      const rows: any[] = Array.isArray(pendData) ? pendData : (pendData?.value ?? []);
      // Group by PID then count where IspheboAccept === 0 — matches SamplesScreen logic
      const map = new Map<number, any>();
      for (const r of rows) {
        if (!map.has(r.PID)) map.set(r.PID, r);
      }
      const pendingCount = Array.from(map.values()).filter(r => r.IspheboAccept === 0).length;
      setPendingCollections(pendingCount);
    } catch {
      setPendingCollections(null);
    }

    try {
      // Pending Reports — same API & logic as PendingReportsScreen
      // Uses 2024-01-01 → today, Status: 'Registered', groups by PID
      const prRes = await fetch(`${API_BASE_URL}/api/TestStatus/GetPatientTestStatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          BranchId: 1,
          FromDate: '2024-01-01',
          ToDate: today,
          PatRegID: '', PatientName: '', DoctorName: '', TestName: '',
          MobileNo: '', Barcode: '', CenterCode: '', SubDepartment: '',
          Status: 'Registered',
        }),
      });
      const prData = await prRes.json();
      const prRows: any[] = Array.isArray(prData) ? prData : (prData?.value ?? []);
      const prMap = new Map<number, any>();
      for (const r of prRows) { if (!prMap.has(r.PID)) prMap.set(r.PID, r); }
      setPendingReports(Array.from(prMap.values()).filter(r => r.Status === 'Registered').length);
    } catch {
      setPendingReports(null);
    }

    try {
      // Urgent Samples — same API & logic as SamplesScreen
      // Today only, Status: 'All', group by PID, count Isemergency === true
      const usRes = await fetch(`${API_BASE_URL}/api/TestStatus/GetPatientTestStatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          BranchId: 1,
          FromDate: today,
          ToDate: today,
          PatRegID: '', PatientName: '', DoctorName: '', TestName: '',
          MobileNo: '', Barcode: '', CenterCode: '', SubDepartment: '',
          Status: 'All',
        }),
      });
      const usData = await usRes.json();
      const usRows: any[] = Array.isArray(usData) ? usData : (usData?.value ?? []);
      const usMap = new Map<number, any>();
      for (const r of usRows) { if (!usMap.has(r.PID)) usMap.set(r.PID, r); }
      setUrgentSamples(Array.from(usMap.values()).filter(r => r.Isemergency === true).length);
    } catch {
      setUrgentSamples(null);
    }

    try {
      // Critical Results — all-time records with Isemergency === true across any status
      // Mirrors PendingReportsScreen "Urgent" summary card logic (Status: 'All', all dates)
      const crRes = await fetch(`${API_BASE_URL}/api/TestStatus/GetPatientTestStatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          BranchId: 1,
          FromDate: '2024-01-01',
          ToDate: today,
          PatRegID: '', PatientName: '', DoctorName: '', TestName: '',
          MobileNo: '', Barcode: '', CenterCode: '', SubDepartment: '',
          Status: 'All',
        }),
      });
      const crData = await crRes.json();
      const crRows: any[] = Array.isArray(crData) ? crData : (crData?.value ?? []);
      const crMap = new Map<number, any>();
      for (const r of crRows) { if (!crMap.has(r.PID)) crMap.set(r.PID, r); }
      setCriticalResults(Array.from(crMap.values()).filter(r => r.Isemergency === true).length);
    } catch {
      setCriticalResults(null);
    }

    try {
      // Today's Revenue — same API & logic as CompletedReportsScreen (Today filter)
      // Uses today → today, Status: 'All', sums PaidAmount
      // IMPORTANT: Group by PID first to avoid counting the same payment multiple times
      const revRes = await fetch(`${API_BASE_URL}/api/TestStatus/GetPatientTestStatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          BranchId: 1,
          FromDate: today,
          ToDate: today,
          PatRegID: '', PatientName: '', DoctorName: '', TestName: '',
          MobileNo: '', Barcode: '', CenterCode: '', SubDepartment: '',
          Status: 'All',
        }),
      });
      const revData = await revRes.json();
      const revRows: any[] = Array.isArray(revData) ? revData : (revData?.value ?? []);
      
      // Group by PID to avoid duplicate counting (each patient may have multiple test records)
      const revMap = new Map<number, any>();
      for (const r of revRows) {
        if (!revMap.has(r.PID)) {
          revMap.set(r.PID, r);
        }
      }
      
      // Sum PaidAmount from unique patients only
      const total = Array.from(revMap.values()).reduce((sum: number, r: any) => sum + (r.PaidAmount ?? 0), 0);
      setTodayRevenue(total);
    } catch {
      setTodayRevenue(null);
    }

    setStatsLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { fetchStats(); }, [fetchStats]));

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
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Stats Grid ── */}
        <View style={styles.statsGrid}>
          <StatCard
            value={statsLoading ? null : (patientsRegistered !== null ? String(patientsRegistered) : '—')}
            label="Patients Registered (All)"
            icon="account-plus-outline"
            color="#0F766E"
            bg="#F0FDFA"
            border="#CCFBF1"
            onPress={() => navigation.navigate('PatientStatus')}
          />
          <StatCard
            value={statsLoading ? null : (pendingCollections !== null ? String(pendingCollections) : '—')}
            label="Pending Collections (Today)"
            icon="flask-outline"
            color="#0369A1"
            bg="#F0F9FF"
            border="#BAE6FD"
            onPress={() => navigation.navigate('SampleCollection')}
          />
          <StatCard
            value={statsLoading ? null : (pendingReports !== null ? String(pendingReports) : '—')}
            label="Pending Reports"
            icon="file-clock-outline"
            color="#DC2626"
            bg="#FEF2F2"
            border="#FEE2E2"
            onPress={() => navigation.navigate('PendingReports')}
          />
          <StatCard
            value={statsLoading ? null : (todayRevenue !== null ? `₹${todayRevenue >= 1000 ? (todayRevenue / 1000).toFixed(1) + 'k' : todayRevenue.toFixed(0)}` : '—')}
            label="Today's Revenue"
            icon="cash-multiple"
            color="#15803D"
            bg="#F0FDF4"
            border="#BBF7D0"
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <AlertCard
            number={statsLoading ? null : (criticalResults !== null ? String(criticalResults) : '—')}
            label="Critical Results"
            icon="alert-circle-outline"
            color="#7C3AED" bg="#F5F3FF" border="#DDD6FE"
            onPress={() => navigation.navigate('PendingReports')}
          />
          <AlertCard
            number={statsLoading ? null : (urgentSamples !== null ? String(urgentSamples) : '—')}
            label="Urgent Samples"
            icon="test-tube"
            color="#DC2626" bg="#FEF2F2" border="#FEE2E2"
            urgent
            onPress={() => navigation.navigate('SampleCollection')}
          />
          <AlertCard
            number={statsLoading ? null : (pendingReports !== null ? String(pendingReports) : '—')}
            label="Pending Reports"
            icon="file-alert-outline"
            color="#F59E0B" bg="#FFFBEB" border="#FDE68A"
            onPress={() => navigation.navigate('PendingReports')}
          />
        </View>

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
      {value === null
        ? <ActivityIndicator size="small" color={color} style={{ marginVertical: 4 }} />
        : <Text style={[{ fontSize: 22, fontWeight: '800' }, { color }]}>{value}</Text>
      }
      <Text style={{ fontSize: 11, color: COLORS.textSecondary, fontWeight: '500', marginTop: 2 }}>{label}</Text>
    </TouchableOpacity>
  );
}

function AlertCard({ number, label, icon, color, bg, border, onPress, urgent }: any) {
  return (
    <TouchableOpacity
      style={[
        {
          flex: urgent ? 1.15 : 1,
          borderRadius: 14, borderWidth: urgent ? 2 : 1,
          padding: 14, marginHorizontal: 5,
          alignItems: 'center', elevation: urgent ? 3 : 0,
          shadowColor: urgent ? '#DC2626' : COLORS.shadow,
          shadowOffset: { width: 0, height: urgent ? 4 : 1 },
          shadowOpacity: urgent ? 0.18 : 0.06,
          shadowRadius: urgent ? 8 : 3,
        },
        { backgroundColor: bg, borderColor: border },
      ]}
      activeOpacity={0.8} onPress={onPress}
    >
      <View style={[
        { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10, elevation: 1, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
        { backgroundColor: COLORS.card },
      ]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      {number === null
        ? <ActivityIndicator size="small" color={color} style={{ marginVertical: 4 }} />
        : <Text style={[{ fontSize: urgent ? 28 : 26, fontWeight: '900', marginBottom: 2 }, { color }]}>{number}</Text>
      }
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
