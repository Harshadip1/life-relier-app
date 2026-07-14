import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

type StatusType = 'ready' | 'pending' | 'processing' | 'collected' | 'scheduled' | 'sample_collected';

interface StatusBadgeProps {
  status: StatusType;
}

const STATUS_CONFIG: Record<StatusType, { label: string; color: string; bg: string; dot: string }> = {
  ready: { label: 'Ready', color: '#10B981', bg: '#D1FAE5', dot: '🟢' },
  pending: { label: 'Pending', color: '#F59E0B', bg: '#FEF3C7', dot: '🟡' },
  processing: { label: 'Processing', color: '#3B82F6', bg: '#DBEAFE', dot: '🔵' },
  collected: { label: 'Sample Collected', color: '#F59E0B', bg: '#FEF3C7', dot: '🟡' },
  scheduled: { label: 'Scheduled', color: '#6366F1', bg: '#EEF2FF', dot: '🟣' },
  sample_collected: { label: 'Sample Collected', color: '#F59E0B', bg: '#FEF3C7', dot: '🟡' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.text, { color: cfg.color }]}>{cfg.dot} {cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
