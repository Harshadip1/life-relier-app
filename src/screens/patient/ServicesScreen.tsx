import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

const SERVICES = [
  { id: 'book_test', title: 'Book Test', subtitle: 'Schedule a new lab test', icon: 'flask-plus-outline', color: '#0D9488', bg: '#CCFBF1' },
  { id: 'booking_history', title: 'Booking History', subtitle: 'View all past bookings', icon: 'history', color: '#6366F1', bg: '#EEF2FF' },
  { id: 'track_sample', title: 'Track Sample', subtitle: 'Track your sample status', icon: 'map-marker-path', color: '#F59E0B', bg: '#FEF3C7' },
  { id: 'reports', title: 'Reports', subtitle: 'Access your test reports', icon: 'file-chart-outline', color: '#3B82F6', bg: '#DBEAFE' },
  { id: 'billing', title: 'Billing & Payments', subtitle: 'Manage your payments', icon: 'credit-card-outline', color: '#EF4444', bg: '#FEE2E2' },
  { id: 'invoice', title: 'Download Invoice', subtitle: 'Download payment receipts', icon: 'file-download-outline', color: '#10B981', bg: '#D1FAE5' },
];

export default function ServicesScreen() {
  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Services</Text>
      <Text style={styles.pageSubtitle}>All lab services at your fingertips</Text>

      <View style={styles.grid}>
        {SERVICES.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => Alert.alert(service.title, `Opening ${service.title}...`)}
          >
            <View style={[styles.iconBox, { backgroundColor: service.bg }]}>
              <MaterialCommunityIcons name={service.icon as any} size={28} color={service.color} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{service.title}</Text>
              <Text style={styles.cardSubtitle}>{service.subtitle}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: SPACING.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md },
  pageTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  pageSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  grid: { gap: SPACING.sm },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  cardSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
});
