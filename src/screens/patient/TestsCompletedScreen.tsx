import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

const COMPLETED_TESTS = [
  { id: '1', name: 'Complete Blood Count (CBC)',  date: '15 Jun 2026', lab: 'Life Relier Lab', result: 'Normal',   price: 700  },
  { id: '2', name: 'Thyroid Profile (T3, T4, TSH)', date: '10 Jun 2026', lab: 'Life Relier Lab', result: 'Normal',   price: 1200 },
  { id: '3', name: 'Lipid Panel',                 date: '05 Jun 2026', lab: 'Life Relier Lab', result: 'Review',   price: 900  },
  { id: '4', name: 'Blood Sugar (Fasting)',        date: '01 Jun 2026', lab: 'Life Relier Lab', result: 'Normal',   price: 200  },
  { id: '5', name: 'Liver Function Test (LFT)',   date: '25 May 2026', lab: 'Life Relier Lab', result: 'Normal',   price: 950  },
  { id: '6', name: 'Kidney Function Test (KFT)',  date: '20 May 2026', lab: 'Life Relier Lab', result: 'Normal',   price: 850  },
  { id: '7', name: 'Vitamin D (25-OH)',            date: '15 May 2026', lab: 'Life Relier Lab', result: 'Low',      price: 1100 },
  { id: '8', name: 'HbA1c',                       date: '10 May 2026', lab: 'Life Relier Lab', result: 'Normal',   price: 600  },
  { id: '9', name: 'Urine Routine',               date: '05 May 2026', lab: 'Life Relier Lab', result: 'Normal',   price: 250  },
  { id: '10', name: 'Iron Studies',               date: '01 May 2026', lab: 'Life Relier Lab', result: 'Review',   price: 800  },
  { id: '11', name: 'ESR',                        date: '25 Apr 2026', lab: 'Life Relier Lab', result: 'Normal',   price: 150  },
  { id: '12', name: 'CRP (C-Reactive Protein)',   date: '20 Apr 2026', lab: 'Life Relier Lab', result: 'Normal',   price: 500  },
  { id: '13', name: 'Electrolytes Panel',         date: '15 Apr 2026', lab: 'Life Relier Lab', result: 'Normal',   price: 700  },
  { id: '14', name: 'Dengue NS1 Antigen',         date: '10 Apr 2026', lab: 'Life Relier Lab', result: 'Negative', price: 900  },
  { id: '15', name: 'Typhoid (Widal Test)',        date: '05 Apr 2026', lab: 'Life Relier Lab', result: 'Negative', price: 350  },
  { id: '16', name: 'HIV Screening',              date: '01 Apr 2026', lab: 'Life Relier Lab', result: 'Negative', price: 500  },
  { id: '17', name: 'Hepatitis B Surface Antigen', date: '25 Mar 2026', lab: 'Life Relier Lab', result: 'Negative', price: 600 },
  { id: '18', name: 'Chest X-Ray Report',         date: '20 Mar 2026', lab: 'Life Relier Lab', result: 'Normal',   price: 1200 },
];

const RESULT_CONFIG: Record<string, { color: string; bg: string }> = {
  Normal:   { color: '#10B981', bg: '#D1FAE5' },
  Review:   { color: '#F59E0B', bg: '#FEF3C7' },
  Low:      { color: '#EF4444', bg: '#FEE2E2' },
  Negative: { color: '#6366F1', bg: '#EEF2FF' },
};

export default function TestsCompletedScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tests Completed</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{COMPLETED_TESTS.length}</Text>
        </View>
      </View>

      <FlatList
        data={COMPLETED_TESTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.summaryBanner}>
            <MaterialCommunityIcons name="beaker-check" size={32} color={COLORS.primary} />
            <View style={{ marginLeft: SPACING.md }}>
              <Text style={styles.bannerTitle}>All Completed Tests</Text>
              <Text style={styles.bannerSub}>Your full test history is shown below</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const cfg = RESULT_CONFIG[item.result] ?? { color: COLORS.textSecondary, bg: '#F1F5F9' };
          return (
            <View style={styles.card}>
              <View style={styles.cardLeft}>
                <View style={styles.iconBox}>
                  <MaterialCommunityIcons name="test-tube" size={20} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.testName}>{item.name}</Text>
                  <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
                    <Text style={styles.metaText}>{item.date}</Text>
                    <Text style={styles.metaDot}>·</Text>
                    <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
                    <Text style={styles.metaText}>{item.lab}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.cardRight}>
                <View style={[styles.resultBadge, { backgroundColor: cfg.bg }]}>
                  <Text style={[styles.resultText, { color: cfg.color }]}>{item.result}</Text>
                </View>
                <Text style={styles.price}>₹{item.price}</Text>
              </View>
            </View>
          );
        }}
        ListFooterComponent={<View style={{ height: SPACING.xl }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { marginRight: 12 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  countBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  countText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  listContent: { padding: SPACING.md },

  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  bannerSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  card: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: SPACING.sm },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  testName: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  metaText: { fontSize: 11, color: COLORS.textMuted },
  metaDot: { fontSize: 11, color: COLORS.textMuted },

  cardRight: { alignItems: 'flex-end', gap: 6 },
  resultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  resultText: { fontSize: 11, fontWeight: '700' },
  price: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
});
