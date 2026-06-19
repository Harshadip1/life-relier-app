import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Image,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// Assuming you have these constants, otherwise standard values are applied below
const COLORS = {
  primary: '#0D9488',
  textPrimary: '#0F172A',
  textMuted: '#64748B',
  bgLight: '#FAFAFA',
  cardBg: '#FFFFFF',
  border: '#E2E8F0',
  successText: '#16A34A',
  successBg: '#DCFCE7',
  warningText: '#D97706',
  warningBg: '#FEF3C7',
};

const TABS = ['All', 'Ready', 'Processing', 'Pending'];

// Exact data mapping to your UI image
const MOCK_REPORTS = [
  {
    id: '1',
    testName: 'CBC Report',
    date: '15 Jun 2026',
    time: '09:30 AM',
    status: 'Ready',
    // Add cbc.png to your assets folder!
    // icon: require('../../../assets/cbc.png'), 
  },
  {
    id: '2',
    testName: 'Thyroid Profile',
    date: '10 Jun 2026',
    time: '08:45 AM',
    status: 'Ready',
    // Add thyroid.png to your assets folder!
    // icon: require('../../../assets/thyroid.png'),
  },
  {
    id: '3',
    testName: 'Liver Function Test',
    date: '08 Jun 2026',
    time: '11:15 AM',
    status: 'Processing',
    // Add liver.png to your assets folder!
    // icon: require('../../../assets/liver.png'),
  },
];

export default function ReportsScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic (optional, just for completeness)
  const filteredReports = MOCK_REPORTS.filter((report) => {
    const matchesTab = activeTab === 'All' || report.status === activeTab;
    const matchesSearch = report.testName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const renderHeader = () => (
    <View style={styles.listHeaderContainer}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Feather name="search" size={20} color={COLORS.textMuted} />
        <TextInput
          placeholder="Search reports by test name"
          style={styles.searchInput}
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity>
          <Feather name="sliders" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabPill, activeTab === tab && styles.tabPillActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.helpBanner}>
      <View style={styles.helpIconBox}>
        <MaterialCommunityIcons name="clipboard-text-outline" size={32} color={COLORS.primary} />
        <View style={styles.helpShieldIcon}>
          <MaterialCommunityIcons name="shield-check" size={16} color={COLORS.primary} />
        </View>
      </View>
      <View style={styles.helpTextContainer}>
        <Text style={styles.helpTitle}>Having trouble finding your report?</Text>
        <Text style={styles.helpDesc}>
          Reports may take up to 24–48 hours to be processed and made available.
        </Text>
      </View>
      <TouchableOpacity style={styles.helpBtn}>
        <Text style={styles.helpBtnText}>Contact Lab</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      {/* Top Navigation Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Reports</Text>
        <TouchableOpacity style={styles.bellBtn}>
          <Feather name="bell" size={22} color={COLORS.textPrimary} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* FlatList for Reports */}
      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.8}>
            
            {/* Left Icon */}
            {/* <View style={styles.cardIconBox}>
              <Image source={item.icon} style={styles.cardImage} resizeMode="contain" />
            </View> */}

            {/* Right Content */}
            <View style={styles.cardBody}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.testName}>{item.testName}</Text>
                <Feather name="chevron-right" size={18} color={COLORS.textMuted} />
              </View>

              <View style={styles.dateRow}>
                <Feather name="calendar" size={12} color={COLORS.textMuted} />
                <Text style={styles.dateText}>
                  {item.date} • {item.time}
                </Text>
              </View>

              <View style={styles.cardActionRow}>
                {/* Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    item.status === 'Ready' ? styles.statusBadgeReady : styles.statusBadgeProcessing,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.status === 'Ready' ? 'check-circle' : 'clock-outline'}
                    size={14}
                    color={item.status === 'Ready' ? COLORS.successText : COLORS.warningText}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      item.status === 'Ready' ? styles.statusTextReady : styles.statusTextProcessing,
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>

                {/* View Report Button - Only show if ready */}
                {item.status === 'Ready' && (
                  <TouchableOpacity style={styles.viewReportBtn}>
                    <Feather name="eye" size={14} color={COLORS.primary} />
                    <Text style={styles.viewReportText}>View Report</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgLight },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: COLORS.bgLight,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  bellBtn: { position: 'relative', padding: 4 },
  badge: {
    position: 'absolute',
    top: 0,
    right: 2,
    backgroundColor: COLORS.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.bgLight,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },

  listContent: { paddingHorizontal: 20, paddingBottom: 30 },
  listHeaderContainer: { marginBottom: 15 },

  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  tabTextActive: { color: '#FFF' },

  // Card Styles
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F8FAFC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardIconBox: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: { width: 40, height: 40 },
  
  cardBody: { flex: 1, marginLeft: 16 },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
    gap: 6,
  },
  dateText: { fontSize: 12, color: COLORS.textMuted },
  
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  // Status Badges
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusBadgeReady: { backgroundColor: COLORS.successBg },
  statusBadgeProcessing: { backgroundColor: COLORS.warningBg },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusTextReady: { color: COLORS.successText },
  statusTextProcessing: { color: COLORS.warningText },

  viewReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewReportText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },

  // Help Banner
  helpBanner: {
    flexDirection: 'row',
    backgroundColor: '#F0FDFA',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  helpIconBox: { position: 'relative', width: 40 },
  helpShieldIcon: {
    position: 'absolute',
    bottom: -4,
    right: 2,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  helpTextContainer: { flex: 1, paddingHorizontal: 12 },
  helpTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  helpDesc: { fontSize: 11, color: COLORS.textMuted, lineHeight: 16 },
  helpBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  helpBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
