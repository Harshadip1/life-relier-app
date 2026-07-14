import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import StatusBadge from './StatusBadge';
import { COLORS, BORDER_RADIUS, SPACING } from '../utils/constants';
import { BookingItem } from '../utils/types';

interface BookingCardProps {
  booking: BookingItem;
}

export default function BookingCard({ booking }: BookingCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="calendar-check" size={20} color={COLORS.primary} />
        </View>
        <View>
          <Text style={styles.name}>{booking.patientName}</Text>
          <Text style={styles.test}>{booking.testName}</Text>
          <Text style={styles.date}>{booking.date}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>₹{booking.amount}</Text>
        <StatusBadge status={booking.status as any} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  test: { fontSize: 12, color: COLORS.textSecondary },
  date: { fontSize: 11, color: COLORS.textMuted },
  right: { alignItems: 'flex-end', gap: 4 },
  amount: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
});
