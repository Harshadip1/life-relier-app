import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import StatusBadge from './StatusBadge';
import { COLORS, BORDER_RADIUS, SPACING } from '../utils/constants';
import { ReportItem } from '../utils/types';

interface ReportCardProps {
  report: ReportItem;
  onView?: () => void;
}

const REPORT_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  default: { icon: 'file-document', color: '#6366F1', bg: '#EEF2FF' },
  'CBC Report': { icon: 'water', color: '#EF4444', bg: '#FEE2E2' },
  'Thyroid Profile': { icon: 'butterfly', color: '#8B5CF6', bg: '#EDE9FE' },
  'Lipid Panel': { icon: 'heart-pulse', color: '#EC4899', bg: '#FCE7F3' },
};

export default function ReportCard({ report, onView }: ReportCardProps) {
  const iconCfg = REPORT_ICONS[report.reportName] || REPORT_ICONS.default;

  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: iconCfg.bg }]}>
        <MaterialCommunityIcons name={iconCfg.icon as any} size={24} color={iconCfg.color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{report.reportName}</Text>
        <Text style={styles.date}>{report.date}</Text>
        <StatusBadge status={report.status as any} />
      </View>
      {report.status === 'ready' && (
        <TouchableOpacity style={styles.btn} onPress={onView}>
          <MaterialCommunityIcons name="eye" size={14} color={COLORS.primary} />
          <Text style={styles.btnText}>View Report</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  info: { flex: 1, gap: 3 },
  name: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  date: { fontSize: 12, color: COLORS.textSecondary },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  btnText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
});
