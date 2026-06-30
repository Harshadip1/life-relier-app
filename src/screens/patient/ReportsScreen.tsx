import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const THEME = {
  primary: '#0D9488', // Teal
  primaryLight: '#F0FDFA',
  bg: '#FFFFFF',
  screenBg: '#F8FAFC',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
};

// ─── Dummy Data ───
const LAB_REPORTS = [
  { id: 'REP-1029', date: '12 May 2026', title: 'Complete Blood Count (CBC)', lab: 'CityCare Diagnostics', isNew: true },
  { id: 'REP-0984', date: '01 Apr 2026', title: 'Thyroid Profile (T3, T4, TSH)', lab: 'CityCare Diagnostics', isNew: false },
  { id: 'REP-0855', date: '15 Jan 2026', title: 'Lipid Profile', lab: 'CityCare Diagnostics', isNew: false },
];

const PRESCRIPTIONS = [
  { id: 'RX-8832', date: '10 May 2026', doctor: 'Dr. Rahul Sharma', spec: 'Cardiologist', diagnosis: 'Hypertension Checkup' },
  { id: 'RX-7441', date: '22 Feb 2026', doctor: 'Dr. Priya Patil', spec: 'General Physician', diagnosis: 'Viral Fever' },
];

export default function ReportsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Lab Reports'); 

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 10) }]}>
      
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Medical Records</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Feather name="filter" size={22} color={THEME.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={THEME.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${activeTab.toLowerCase()}...`}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* ── Top Tabs ── */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'Lab Reports' && styles.tabBtnActive]}
          onPress={() => setActiveTab('Lab Reports')}
        >
          <MaterialCommunityIcons name="flask-outline" size={18} color={activeTab === 'Lab Reports' ? THEME.primary : THEME.textSecondary} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, activeTab === 'Lab Reports' && styles.tabTextActive]}>Lab Reports</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'Prescriptions' && styles.tabBtnActive]}
          onPress={() => setActiveTab('Prescriptions')}
        >
          <MaterialCommunityIcons name="pill" size={18} color={activeTab === 'Prescriptions' ? THEME.primary : THEME.textSecondary} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, activeTab === 'Prescriptions' && styles.tabTextActive]}>Prescriptions</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ==============================================
            VIEW 1: LAB REPORTS
        ============================================== */}
        {activeTab === 'Lab Reports' && (
          <View>
            {LAB_REPORTS.map(report => (
              <View key={report.id} style={styles.card}>
                <View style={styles.cardHeaderFlex}>
                  <View style={styles.dateBox}>
                    <Text style={styles.dateMonth}>{report.date.split(' ')[1]}</Text>
                    <Text style={styles.dateDay}>{report.date.split(' ')[0]}</Text>
                    <Text style={styles.dateYear}>{report.date.split(' ')[2]}</Text>
                  </View>
                  
                  <View style={styles.reportInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={styles.reportTitle} numberOfLines={1}>{report.title}</Text>
                      {report.isNew && <View style={styles.newBadge}><Text style={styles.newBadgeText}>NEW</Text></View>}
                    </View>
                    <Text style={styles.reportLab}>{report.lab}</Text>
                    <Text style={styles.reportId}>Report ID: {report.id}</Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.secondaryBtn}>
                    <Feather name="share-2" size={16} color={THEME.textSecondary} style={{ marginRight: 6 }} />
                    <Text style={styles.secondaryBtnText}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.primaryBtn}>
                    <Feather name="download" size={16} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.primaryBtnText}>Download PDF</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ==============================================
            VIEW 2: PRESCRIPTIONS
        ============================================== */}
        {activeTab === 'Prescriptions' && (
          <View>
            {PRESCRIPTIONS.map(rx => (
              <View key={rx.id} style={styles.card}>
                <View style={styles.cardHeaderFlex}>
                  <View style={[styles.dateBox, { backgroundColor: '#EEF2FF' }]}>
                    <Feather name="file-text" size={24} color="#4F46E5" />
                  </View>
                  
                  <View style={styles.reportInfo}>
                    <Text style={styles.reportTitle}>{rx.diagnosis}</Text>
                    <Text style={[styles.reportLab, { color: THEME.primary, fontWeight: '600' }]}>{rx.doctor}</Text>
                    <Text style={styles.reportId}>{rx.date} • {rx.spec}</Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity style={[styles.primaryBtn, { width: '100%', backgroundColor: '#EEF2FF' }]}>
                    <Feather name="eye" size={16} color="#4F46E5" style={{ marginRight: 6 }} />
                    <Text style={[styles.primaryBtnText, { color: '#4F46E5' }]}>View Prescription</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.screenBg },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: THEME.textPrimary },
  iconBtn: { padding: 8, backgroundColor: THEME.bg, borderRadius: 12, borderWidth: 1, borderColor: THEME.border },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.bg, marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: THEME.border, marginBottom: 16 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14, color: THEME.textPrimary },

  tabContainer: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#E2E8F0', borderRadius: 12, padding: 4, marginBottom: 16 },
  tabBtn: { flex: 1, flexDirection: 'row', paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  tabBtnActive: { backgroundColor: THEME.bg, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  tabText: { fontSize: 13, fontWeight: '600', color: THEME.textSecondary },
  tabTextActive: { color: THEME.primary },

  scrollContent: { paddingHorizontal: 20 },

  card: { backgroundColor: THEME.bg, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: THEME.border, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
  cardHeaderFlex: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  
  dateBox: { width: 54, height: 64, backgroundColor: THEME.primaryLight, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14, borderWidth: 1, borderColor: '#CCFBF1' },
  dateMonth: { fontSize: 10, fontWeight: '700', color: THEME.primary, textTransform: 'uppercase' },
  dateDay: { fontSize: 20, fontWeight: '800', color: THEME.primary, marginVertical: -2 },
  dateYear: { fontSize: 10, fontWeight: '600', color: THEME.primary },

  reportInfo: { flex: 1, justifyContent: 'center' },
  reportTitle: { fontSize: 15, fontWeight: '700', color: THEME.textPrimary, flex: 1 },
  newBadge: { backgroundColor: '#EF4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8 },
  newBadgeText: { fontSize: 8, fontWeight: '800', color: '#FFF' },
  reportLab: { fontSize: 13, color: THEME.textSecondary, marginBottom: 4 },
  reportId: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },

  actionRow: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16 },
  secondaryBtn: { flex: 1, flexDirection: 'row', height: 40, borderRadius: 10, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: THEME.border },
  secondaryBtnText: { color: THEME.textSecondary, fontSize: 13, fontWeight: '600' },
  primaryBtn: { flex: 1.5, flexDirection: 'row', height: 40, borderRadius: 10, backgroundColor: THEME.primary, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
});