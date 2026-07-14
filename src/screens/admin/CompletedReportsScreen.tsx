import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const T = {
  primary: '#0D9488',
  bg:      '#F8FAFC',
  card:    '#FFFFFF',
  text:    '#0F172A',
  sub:     '#64748B',
  muted:   '#94A3B8',
  border:  '#E2E8F0',
  success: '#10B981',
  danger:  '#EF4444',
};

const FILTERS = ['Today', 'This Week', 'This Month', 'Custom'];

const DUMMY_REPORTS = [
  {
    id: 'RPT567890', name: 'Rahul Sharma', pid: 'PT123456',
    tests: ['CBC', 'Lipid Profile', 'HbA1c'], date: '01-07-2026', time: '11:30 AM',
    status: 'Normal', critical: false,
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop',
  },
  {
    id: 'RPT567891', name: 'Priya Patil', pid: 'PT123457',
    tests: ['Thyroid Profile', 'Vitamin D'], date: '01-07-2026', time: '11:15 AM',
    status: 'Critical', critical: true,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
  },
  {
    id: 'RPT567892', name: 'Arjun Khan', pid: 'PT123454',
    tests: ['KFT', 'LFT'], date: '01-07-2026', time: '10:45 AM',
    status: 'Normal', critical: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop',
  },
];

export default function CompletedReportsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('Today');

  const filtered = DUMMY_REPORTS.filter(
    r => r.name.toLowerCase().includes(search.toLowerCase()) ||
         r.pid.toLowerCase().includes(search.toLowerCase()) ||
         r.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 0) }]}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Reports</Text>
          <Text style={styles.headerSub}>Completed & approved reports</Text>
        </View>
        <TouchableOpacity style={styles.filterIconBtn}>
          <Feather name="sliders" size={20} color={T.text} />
        </TouchableOpacity>
      </View>

      {/* ── Search ── */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={T.muted} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by patient name, ID or report ID..."
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

      {/* ── Date Filters ── */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Summary Row ── */}
      <View style={styles.summaryRow}>
        <SummaryMini value="86" label="Total" color={T.primary}  bg="#F0FDFA" />
        <SummaryMini value="3"  label="Critical" color="#DC2626" bg="#FEF2F2" />
        <SummaryMini value="42" label="Delivered" color="#15803D" bg="#F0FDF4" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.resultCount}>{filtered.length} report{filtered.length !== 1 ? 's' : ''} found</Text>

        {filtered.map(r => (
          <View key={r.id} style={[styles.reportCard, r.critical && styles.reportCardCritical]}>
            {/* Critical banner */}
            {r.critical && (
              <View style={styles.criticalBanner}>
                <Feather name="alert-triangle" size={12} color="#DC2626" />
                <Text style={styles.criticalText}> Critical Values Detected</Text>
              </View>
            )}

            <View style={styles.cardTop}>
              <Image source={{ uri: r.avatar }} style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.patientName}>{r.name}</Text>
                <Text style={styles.patientId}>PID: <Text style={{ color: T.primary }}>{r.pid}</Text></Text>
                <View style={styles.cardMeta}>
                  <Feather name="file-text" size={11} color={T.muted} />
                  <Text style={styles.cardMetaText}> {r.id}</Text>
                  <Feather name="clock" size={11} color={T.muted} style={{ marginLeft: 10 }} />
                  <Text style={styles.cardMetaText}> {r.date} • {r.time}</Text>
                </View>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: r.critical ? '#FEF2F2' : '#F0FDF4' },
              ]}>
                <Text style={[styles.statusText, { color: r.critical ? '#DC2626' : T.success }]}>
                  {r.status}
                </Text>
              </View>
            </View>

            {/* Tests */}
            <View style={styles.testsRow}>
              {r.tests.map(t => (
                <View key={t} style={styles.testChip}>
                  <Text style={styles.testChipText}>{t}</Text>
                </View>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.cardActions}>
              <ActionBtn icon="eye" label="View" />
              <ActionBtn icon="download" label="PDF" />
              <ActionBtn icon="printer" label="Print" />
              <ActionBtn icon="mail" label="Email" />
            </View>
          </View>
        ))}

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

function SummaryMini({ value, label, color, bg }: any) {
  return (
    <View style={[styles.summaryMini, { backgroundColor: bg }]}>
      <Text style={[styles.summaryMiniVal, { color }]}>{value}</Text>
      <Text style={[styles.summaryMiniLabel, { color }]}>{label}</Text>
    </View>
  );
}

function ActionBtn({ icon, label }: any) {
  return (
    <TouchableOpacity style={styles.actionBtn}>
      <Feather name={icon} size={14} color={T.primary} />
      <Text style={styles.actionBtnText}>{label}</Text>
    </TouchableOpacity>
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
  filterIconBtn: { padding: 6 },

  searchWrap: {
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: T.card,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F1F5F9', borderRadius: 12,
    paddingHorizontal: 14, height: 44,
  },
  searchInput: { flex: 1, fontSize: 14, color: T.text },

  filterRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: T.card,
    borderBottomWidth: 1, borderBottomColor: T.border,
  },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: T.border,
    backgroundColor: T.bg,
  },
  filterChipActive: { backgroundColor: T.primary, borderColor: T.primary },
  filterChipText: { fontSize: 12, fontWeight: '600', color: T.sub },
  filterChipTextActive: { color: '#FFF' },

  summaryRow: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: T.card,
    borderBottomWidth: 1, borderBottomColor: T.border,
  },
  summaryMini: {
    flex: 1, borderRadius: 10, paddingVertical: 8, alignItems: 'center',
  },
  summaryMiniVal: { fontSize: 20, fontWeight: '900' },
  summaryMiniLabel: { fontSize: 10, fontWeight: '600', marginTop: 1 },

  scroll: { padding: 16 },
  resultCount: { fontSize: 12, color: T.muted, fontWeight: '600', marginBottom: 14 },

  reportCard: {
    backgroundColor: T.card, borderRadius: 14, borderWidth: 1, borderColor: T.border,
    marginBottom: 14, overflow: 'hidden',
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6,
  },
  reportCardCritical: { borderColor: '#FCA5A5', borderWidth: 1.5 },

  criticalBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FEF2F2', paddingHorizontal: 14, paddingVertical: 6,
    borderBottomWidth: 1, borderBottomColor: '#FEE2E2',
  },
  criticalText: { fontSize: 11, fontWeight: '700', color: '#DC2626' },

  cardTop: { flexDirection: 'row', alignItems: 'flex-start', padding: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E2E8F0', marginRight: 12 },
  patientName: { fontSize: 15, fontWeight: '700', color: T.text, marginBottom: 2 },
  patientId: { fontSize: 11, color: T.sub, marginBottom: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center' },
  cardMetaText: { fontSize: 10, color: T.muted },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  statusText:  { fontSize: 11, fontWeight: '700' },

  testsRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 6,
    paddingHorizontal: 14, paddingBottom: 12,
    borderTopWidth: 1, borderTopColor: T.border,
    paddingTop: 10,
  },
  testChip: {
    backgroundColor: '#F0FDFA', borderRadius: 6,
    paddingHorizontal: 9, paddingVertical: 3,
    borderWidth: 1, borderColor: '#CCFBF1',
  },
  testChipText: { fontSize: 11, color: T.primary, fontWeight: '600' },

  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1, borderTopColor: T.border,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 11, gap: 5,
    borderRightWidth: 1, borderRightColor: T.border,
  },
  actionBtnText: { fontSize: 12, fontWeight: '600', color: T.primary },
});
