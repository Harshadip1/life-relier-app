import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, Modal, Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const THEME = {
  primary: '#0F766E',
  bg: '#FFFFFF',
  screenBg: '#FAFAFA',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
};

const DUMMY_SAMPLES = [
  { id: '1', name: 'Rahul Sharma', pid: 'PT123456', age: '32', gender: 'Male', time: '09:30 AM', status: 'Awaiting Accession', sId: 'SMP-250515-001', barcode: 'BC250515001', tests: ['CBC', 'Thyroid Profile', 'HbA1c'], color: '#EAB308', bg: '#FEF9C3', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop' },
  { id: '2', name: 'Priya Patil', pid: 'PT123455', age: '32', gender: 'Female', time: '09:45 AM', status: 'Received', sId: 'SMP-250515-002', barcode: 'BC250515002', tests: ['Lipid Profile', 'Vitamin D'], color: '#3B82F6', bg: '#EFF6FF', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop' },
  { id: '3', name: 'Arjun Verma', pid: 'PT123454', age: '32', gender: 'Male', time: '10:00 AM', status: 'Awaiting Accession', sId: 'SMP-250515-003', barcode: 'BC250515003', tests: ['CBC', 'LFT', 'KFT', 'HbA1c'], color: '#EAB308', bg: '#FEF9C3', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop' },
];

export default function SamplesScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [selectedSample, setSelectedSample] = useState<any>(null);

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 10) }]}>
      
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={THEME.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accession</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}><Feather name="filter" size={20} color={THEME.primary} /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><MaterialCommunityIcons name="line-scan" size={22} color={THEME.primary} /></TouchableOpacity>
        </View>
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={THEME.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Sample ID, Patient ID, Barcode"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.scanBtnMini}>
          <MaterialCommunityIcons name="barcode-scan" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ── Today's Summary ── */}
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { borderColor: '#DBEAFE', backgroundColor: '#EFF6FF' }]}>
            <View style={[styles.summaryIconBox, { backgroundColor: '#DBEAFE' }]}><Feather name="activity" size={18} color="#1D4ED8" /></View>
            <View>
              <Text style={[styles.summaryValue, { color: '#1D4ED8' }]}>24</Text>
              <Text style={styles.summaryLabel}>Pending Accession</Text>
            </View>
          </View>
          <View style={[styles.summaryCard, { borderColor: '#DCFCE7', backgroundColor: '#F0FDF4' }]}>
            <View style={[styles.summaryIconBox, { backgroundColor: '#DCFCE7' }]}><Feather name="check-circle" size={18} color="#15803D" /></View>
            <View>
              <Text style={[styles.summaryValue, { color: '#15803D' }]}>86</Text>
              <Text style={styles.summaryLabel}>Received Today</Text>
            </View>
          </View>
          <View style={[styles.summaryCard, { borderColor: '#FEE2E2', backgroundColor: '#FEF2F2' }]}>
            <View style={[styles.summaryIconBox, { backgroundColor: '#FEE2E2' }]}><MaterialCommunityIcons name="alarm-light-outline" size={18} color="#EF4444" /></View>
            <View>
              <Text style={[styles.summaryValue, { color: '#EF4444' }]}>5</Text>
              <Text style={styles.summaryLabel}>Urgent Samples</Text>
            </View>
          </View>
        </View>

        {/* ── Sample Queue ── */}
        <View style={styles.queueHeaderRow}>
          <Text style={styles.sectionTitle}>Sample Queue</Text>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.sortText}>Sort: <Text style={{ color: THEME.primary, fontWeight: '600' }}>Collection Time</Text></Text>
            <Feather name="chevron-down" size={14} color={THEME.primary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {DUMMY_SAMPLES.map(item => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.sampleCard, selectedSample?.id === item.id && { borderColor: THEME.primary, borderWidth: 1.5 }]}
            activeOpacity={0.8}
            onPress={() => setSelectedSample(item)}
          >
            {/* Top Row: Patient Info */}
            <View style={styles.cardHeader}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{item.name}</Text>
                <Text style={styles.patientId}>PID: <Text style={{ color: THEME.primary }}>{item.pid}</Text></Text>
                <View style={styles.cardMetaRow}>
                  <Feather name="user" size={12} color={THEME.textSecondary} />
                  <Text style={styles.metaText}>{item.age} Yrs</Text>
                  <MaterialCommunityIcons name="gender-male-female" size={12} color={THEME.textSecondary} style={{ marginLeft: 8 }} />
                  <Text style={styles.metaText}>{item.gender}</Text>
                </View>
              </View>
              <View style={styles.cardActionsRight}>
                <View style={[styles.statusBadge, { backgroundColor: item.bg }]}>
                  <View style={[styles.statusDot, { backgroundColor: item.color }]} />
                  <Text style={[styles.statusText, { color: item.color }]}>{item.status}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  <Feather name="clock" size={12} color={THEME.textSecondary} />
                  <Text style={[styles.metaText, { marginLeft: 4 }]}>{item.time}</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Middle Row: IDs & Barcode */}
            <View style={styles.idsRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.idLabel}>Sample ID</Text>
                <Text style={styles.idValue}>{item.sId}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.idLabel}>Barcode</Text>
                <Text style={styles.idValue}>{item.barcode}</Text>
              </View>
              <MaterialCommunityIcons name="barcode" size={30} color={THEME.textSecondary} />
              <Feather name="chevron-right" size={20} color={THEME.textSecondary} style={{ marginLeft: 10 }} />
            </View>

            {/* Bottom Row: Tests */}
            <View style={styles.testsRow}>
              <Text style={styles.testsLabel}>Tests ({item.tests.length}): </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {item.tests.map(test => (
                  <View key={test} style={styles.testChip}><Text style={styles.testChipText}>{test}</Text></View>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Mini Action Modal (Placeholder for Accept/Reject) ── */}
      <Modal visible={!!selectedSample} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.dragHandle} />
            <Text style={styles.sheetTitle}>Sample Options: {selectedSample?.name}</Text>
            
            <TouchableOpacity style={styles.acceptBtn} onPress={() => setSelectedSample(null)}>
              <Feather name="check-circle" size={18} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.acceptBtnText}>Accept Sample</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.rejectBtn} onPress={() => setSelectedSample(null)}>
              <Feather name="file-minus" size={18} color="#EF4444" style={{ marginRight: 8 }} />
              <Text style={styles.rejectBtnText}>Reject Sample</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedSample(null)}>
              <Text style={styles.cancelBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.screenBg },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: THEME.textPrimary },
  headerRight: { flexDirection: 'row', gap: 12 },
  iconBtn: { padding: 4 },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.bg, marginHorizontal: 20, borderRadius: 12, paddingLeft: 14, paddingRight: 6, height: 48, borderWidth: 1, borderColor: THEME.border, marginBottom: 16 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 13, color: THEME.textPrimary },
  scanBtnMini: { backgroundColor: THEME.primary, width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

  scrollContent: { paddingHorizontal: 20 },
  
  sectionTitle: { fontSize: 16, fontWeight: '700', color: THEME.textPrimary, marginBottom: 12 },
  
  // Summary Cards
  summaryGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  summaryCard: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
  summaryIconBox: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  summaryValue: { fontSize: 18, fontWeight: '800' },
  summaryLabel: { fontSize: 10, color: THEME.textSecondary, fontWeight: '500', marginTop: 2 },

  // Queue Header
  queueHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sortText: { fontSize: 12, color: THEME.textSecondary },

  // Sample Cards
  sampleCard: { backgroundColor: THEME.bg, borderRadius: 16, borderWidth: 1, borderColor: THEME.border, marginBottom: 16, padding: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6 },
  cardHeader: { flexDirection: 'row', marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E2E8F0', marginRight: 12 },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 15, fontWeight: '700', color: THEME.textPrimary, marginBottom: 2 },
  patientId: { fontSize: 12, color: THEME.textSecondary, fontWeight: '500', marginBottom: 6 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 11, color: THEME.textSecondary, marginLeft: 4 },
  
  cardActionsRight: { alignItems: 'flex-end' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statusText: { fontSize: 9, fontWeight: '700' },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },

  idsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  idLabel: { fontSize: 11, color: THEME.textSecondary, marginBottom: 2 },
  idValue: { fontSize: 13, fontWeight: '700', color: THEME.textPrimary },

  testsRow: { flexDirection: 'row', alignItems: 'center' },
  testsLabel: { fontSize: 12, color: THEME.textSecondary, fontWeight: '500', marginRight: 8 },
  testChip: { backgroundColor: '#F0FDFA', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#CCFBF1', marginRight: 6 },
  testChipText: { fontSize: 11, color: THEME.primary, fontWeight: '600' },

  // Simple Bottom Sheet
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: THEME.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  dragHandle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: THEME.textPrimary, marginBottom: 20, textAlign: 'center' },
  
  acceptBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.primary, height: 50, borderRadius: 12, marginBottom: 12 },
  acceptBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  
  rejectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', height: 50, borderRadius: 12, borderWidth: 1, borderColor: '#FEE2E2', marginBottom: 16 },
  rejectBtnText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },

  cancelBtn: { alignItems: 'center', paddingVertical: 10 },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: THEME.textSecondary },
});