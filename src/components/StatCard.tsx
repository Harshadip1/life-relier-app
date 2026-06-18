import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING } from '../utils/constants';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  bgColor: string;
  subtitle?: string;
}

export default function StatCard({ title, value, icon, color, bgColor, subtitle }: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrapper, { backgroundColor: bgColor }]}>
        <MaterialCommunityIcons name={icon as any} size={22} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    flex: 1,
    margin: SPACING.xs,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  title: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
