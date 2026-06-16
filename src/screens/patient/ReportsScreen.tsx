import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';
import { DUMMY_REPORTS } from '../../utils/dummy_data';

export default function ReportsScreen({ navigation }: any) {
  const readyReports = DUMMY_REPORTS.filter(r => r.status === 'ready');

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Reports</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Feather name="filter" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            placeholder="Search reports by test name..."
            style={styles.searchInput}
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
      </View>

      <FlatList
        data={readyReports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.reportCard}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="file-chart-outline" size={30} color={COLORS.primary} />
            </View>
            <View style={styles.reportInfo}>
              <Text style={styles.testName}>{item.testName}</Text>
              <Text style={styles.reportDate}>{item.date}</Text>
              <View style={styles.tagRow}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>Standard</Text>
                </View>
                <View style={[styles.tag, { backgroundColor: '#F0F9FF' }]}>
                  <Text style={[styles.tagText, { color: '#0369A1' }]}>Digital Copy</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.downloadIcon}>
              <Feather name="download-cloud" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListHeaderComponent={<Text style={styles.listTitle}>Showing {readyReports.length} Available Reports</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  filterBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0FDFA' },
  searchSection: { padding: SPACING.md, backgroundColor: '#fff' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  searchInput: { flex: 1, marginLeft: SPACING.sm, fontSize: 14, color: COLORS.textPrimary },
  listContent: { padding: SPACING.md },
  listTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: SPACING.md },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1, borderColor: '#F1F5F9',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
  },
  iconContainer: {
    width: 60, height: 60, borderRadius: BORDER_RADIUS.lg,
    backgroundColor: '#F0FDFA',
    alignItems: 'center', justifyContent: 'center',
  },
  reportInfo: { flex: 1, marginLeft: SPACING.md },
  testName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  reportDate: { fontSize: 12, color: COLORS.textMuted, marginTop: 2, marginBottom: 8 },
  tagRow: { flexDirection: 'row', gap: 8 },
  tag: { backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  tagText: { fontSize: 10, fontWeight: '700', color: COLORS.primary },
  downloadIcon: { padding: 8 },
});
