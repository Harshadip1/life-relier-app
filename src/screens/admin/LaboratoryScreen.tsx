import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
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
};

// Workflow steps — show them as a vertical pipeline
const WORKFLOW = [
  {
    step: 1,
    title:  'Sample Collection',
    sub:    'Collect patient samples in the lab or at home',
    icon:   'eyedropper-variant',
    fam:    'material',
    color:  '#0369A1',
    bg:     '#F0F9FF',
    border: '#BAE6FD',
    screen: 'SampleCollection',
    stat:   { value: '8', label: 'Pending' },
  },
  {
    step: 2,
    title:  'Accession',
    sub:    'Receive, label and route samples to departments',
    icon:   'line-scan',
    fam:    'material',
    color:  '#6D28D9',
    bg:     '#F5F3FF',
    border: '#DDD6FE',
    screen: 'Accession',
    stat:   { value: '24', label: 'Awaiting' },
  },
  {
    step: 3,
    title:  'Result Entry',
    sub:    'Enter test results for accessioned samples',
    icon:   'clipboard-edit-outline',
    fam:    'material',
    color:  '#C2410C',
    bg:     '#FFF7ED',
    border: '#FED7AA',
    screen: 'ResultEntry',
    stat:   { value: '18', label: 'Pending' },
  },
  {
    step: 4,
    title:  'Pending Reports',
    sub:    'Review entered results before approval',
    icon:   'file-clock-outline',
    fam:    'material',
    color:  '#DC2626',
    bg:     '#FEF2F2',
    border: '#FEE2E2',
    screen: 'PendingReports',
    stat:   { value: '14', label: 'Pending' },
  },
  {
    step: 5,
    title:  'Report Approval',
    sub:    'Pathologist approval before releasing reports',
    icon:   'check-decagram-outline',
    fam:    'material',
    color:  '#0F766E',
    bg:     '#F0FDFA',
    border: '#CCFBF1',
    screen: 'ReportApproval',
    stat:   { value: '7', label: 'To Review' },
  },
];

export default function LaboratoryScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 0) }]}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Laboratory</Text>
          <Text style={styles.headerSub}>Sample-to-report workflow</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Feather name="bell" size={22} color={T.text} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      {/* ── Summary Strip ── */}
      <View style={styles.summaryStrip}>
        <SummaryPill value="56" label="Samples Today"   color="#0369A1" bg="#EFF6FF" />
        <SummaryPill value="18" label="Pending Results" color="#C2410C" bg="#FFF7ED" />
        <SummaryPill value="3"  label="Critical"        color="#DC2626" bg="#FEF2F2" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Workflow label ── */}
        <Text style={styles.workflowLabel}>
          <MaterialCommunityIcons name="arrow-down-circle-outline" size={14} color={T.primary} />
          {'  '}Lab Workflow
        </Text>

        {WORKFLOW.map((w, i) => (
          <View key={w.step} style={{ position: 'relative' }}>
            {/* connector line between cards */}
            {i < WORKFLOW.length - 1 && (
              <View style={styles.connector}>
                <View style={styles.connectorLine} />
                <MaterialCommunityIcons name="chevron-down" size={16} color={T.muted} style={styles.connectorArrow} />
              </View>
            )}

            <TouchableOpacity
              style={[styles.workCard, { borderColor: w.border, borderLeftColor: w.color }]}
              onPress={() => navigation.navigate(w.screen)}
              activeOpacity={0.75}
            >
              {/* Step badge */}
              <View style={[styles.stepBadge, { backgroundColor: w.color }]}>
                <Text style={styles.stepNum}>{w.step}</Text>
              </View>

              {/* Icon */}
              <View style={[styles.workIconBox, { backgroundColor: w.bg }]}>
                <MaterialCommunityIcons name={w.icon as any} size={26} color={w.color} />
              </View>

              {/* Text */}
              <View style={styles.workText}>
                <Text style={styles.workTitle}>{w.title}</Text>
                <Text style={styles.workSub}>{w.sub}</Text>
              </View>

              {/* Stat chip */}
              <View style={styles.workRight}>
                <View style={[styles.statChip, { backgroundColor: w.bg }]}>
                  <Text style={[styles.statChipValue, { color: w.color }]}>{w.stat.value}</Text>
                  <Text style={[styles.statChipLabel, { color: w.color }]}>{w.stat.label}</Text>
                </View>
                <Feather name="chevron-right" size={18} color={T.muted} style={{ marginTop: 6 }} />
              </View>
            </TouchableOpacity>
          </View>
        ))}

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

function SummaryPill({ value, label, color, bg }: any) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillValue, { color }]}>{value}</Text>
      <Text style={[styles.pillLabel, { color }]}>{label}</Text>
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
  notifBtn: { position: 'relative', padding: 6 },
  notifDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: T.card,
  },

  summaryStrip: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: T.card,
    borderBottomWidth: 1, borderBottomColor: T.border,
  },
  pill: {
    flex: 1, borderRadius: 10, paddingVertical: 10,
    alignItems: 'center',
  },
  pillValue: { fontSize: 20, fontWeight: '900' },
  pillLabel: { fontSize: 10, fontWeight: '600', marginTop: 2 },

  scroll: { padding: 16 },

  workflowLabel: {
    fontSize: 12, fontWeight: '700', color: T.sub,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 16,
  },

  connector: {
    alignItems: 'center', height: 28,
    zIndex: 1,
  },
  connectorLine: {
    width: 2, flex: 1, backgroundColor: '#E2E8F0',
  },
  connectorArrow: { position: 'absolute', bottom: -2 },

  workCard: {
    backgroundColor: T.card,
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    flexDirection: 'row', alignItems: 'center',
    padding: 14,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6,
    position: 'relative',
    overflow: 'visible',
  },
  stepBadge: {
    position: 'absolute', top: -8, left: 12,
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNum: { fontSize: 10, fontWeight: '900', color: '#FFF' },

  workIconBox: {
    width: 50, height: 50, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 14,
  },
  workText: { flex: 1 },
  workTitle: { fontSize: 15, fontWeight: '700', color: T.text, marginBottom: 3 },
  workSub:   { fontSize: 11, color: T.sub, lineHeight: 16 },
  workRight: { alignItems: 'flex-end', marginLeft: 8 },

  statChip: {
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    alignItems: 'center', minWidth: 52,
  },
  statChipValue: { fontSize: 18, fontWeight: '900' },
  statChipLabel: { fontSize: 9,  fontWeight: '700', marginTop: 1 },
});
