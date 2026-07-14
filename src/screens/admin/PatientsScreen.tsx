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

const DUMMY_PATIENTS = [
  { id: '1', name: 'Rahul Sharma', pid: 'PT123456', phone: '98765 43210', date: '15 May 2026, 09:30 AM', status: 'Registered', color: '#EAB308', bg: '#FEF9C3', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop' },
  { id: '2', name: 'Priya Patil', pid: 'PT123455', phone: '98765 12345', date: '15 May 2026, 10:15 AM', status: 'Sample Collected', color: '#3B82F6', bg: '#EFF6FF', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop' },
  { id: '3', name: 'Arjun Khan', pid: 'PT123454', phone: '97654 32109', date: '15 May 2026, 11:00 AM', status: 'Processing', color: '#F97316', bg: '#FFF7ED', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop' },
  { id: '4', name: 'Sneha Joshi', pid: 'PT123453', phone: '99887 66554', date: '15 May 2026, 12:20 PM', status: 'Report Ready', color: '#22C55E', bg: '#F0FDF4', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop' },
];

export default function PatientsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const TABS = ['All', 'Registered', 'Sample Collected', 'Processing', 'Report Ready', 'Delivered'];

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 10) }]}>
      
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={THEME.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient Status</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Feather name="filter" size={20} color={THEME.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={THEME.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Name, Mobile No, Patient ID"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* ── Filter Tabs ── */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {TABS.map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Patient List ── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {DUMMY_PATIENTS.map(patient => (
          <View key={patient.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Image source={{ uri: patient.avatar }} style={styles.avatar} />
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{patient.name}</Text>
                <Text style={styles.patientId}>PID: <Text style={{ color: THEME.primary }}>{patient.pid}</Text></Text>
                <View style={styles.cardMetaRow}>
                  <Feather name="phone" size={12} color={THEME.textSecondary} />
                  <Text style={styles.metaText}>{patient.phone}</Text>
                  <Feather name="calendar" size={12} color={THEME.textSecondary} style={{ marginLeft: 8 }} />
                  <Text style={styles.metaText}>{patient.date}</Text>
                </View>
              </View>
              <View style={styles.cardActionsRight}>
                <View style={[styles.statusBadge, { backgroundColor: patient.bg }]}>
                  <View style={[styles.statusDot, { backgroundColor: patient.color }]} />
                  <Text style={[styles.statusText, { color: patient.color }]}>{patient.status}</Text>
                </View>
                <TouchableOpacity style={{ marginTop: 12, alignItems: 'flex-end' }}>
                  <Feather name="more-vertical" size={18} color={THEME.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.cardActionButtons}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => setSelectedPatient(patient)}>
                <Feather name="file-text" size={14} color={THEME.primary} />
                <Text style={styles.actionBtnText}>View Details</Text>
              </TouchableOpacity>
              <View style={styles.actionDivider} />
              <TouchableOpacity style={styles.actionBtn}>
                <Feather name="edit-2" size={14} color={THEME.primary} />
                <Text style={styles.actionBtnText}>Edit</Text>
              </TouchableOpacity>
              <View style={styles.actionDivider} />
              <TouchableOpacity style={styles.actionBtn}>
                <Feather name="phone-call" size={14} color={THEME.primary} />
                <Text style={styles.actionBtnText}>Call Patient</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Floating Action Button (Navigates to New Registration) ── */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('NewRegistration')}
      >
        <Feather name="plus" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* ── Bottom Sheet Modal ── */}
      <Modal visible={!!selectedPatient} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.dragHandle} />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedPatient(null)}>
              <Feather name="x" size={24} color={THEME.textSecondary} />
            </TouchableOpacity>

            {selectedPatient && (
              <>
                <View style={styles.sheetHeader}>
                  <Image source={{ uri: selectedPatient.avatar }} style={styles.sheetAvatar} />
                  <View style={styles.sheetInfo}>
                    <Text style={styles.sheetName}>{selectedPatient.name}</Text>
                    <View style={styles.sheetMetaGrid}>
                      <View style={styles.sheetMetaItem}>
                        <Feather name="user" size={14} color={THEME.textSecondary} />
                        <Text style={styles.sheetMetaText}>32 Yrs</Text>
                      </View>
                      <View style={styles.sheetMetaItem}>
                        <Feather name="users" size={14} color={THEME.textSecondary} />
                        <Text style={styles.sheetMetaText}>Male</Text>
                      </View>
                      <View style={styles.sheetMetaItem}>
                        <Feather name="phone" size={14} color={THEME.textSecondary} />
                        <Text style={styles.sheetMetaText}>{selectedPatient.phone}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: selectedPatient.bg, alignSelf: 'flex-start', marginTop: 4 }]}>
                    <View style={[styles.statusDot, { backgroundColor: selectedPatient.color }]} />
                    <Text style={[styles.statusText, { color: selectedPatient.color }]}>{selectedPatient.status}</Text>
                  </View>
                </View>

                <Text style={styles.sheetSubTitle}>Tests (3)</Text>
                <View style={styles.sheetChipsRow}>
                  <View style={styles.sheetChip}><Text style={styles.sheetChipText}>CBC</Text></View>
                  <View style={styles.sheetChip}><Text style={styles.sheetChipText}>Thyroid Profile</Text></View>
                  <View style={styles.sheetChip}><Text style={styles.sheetChipText}>HbA1c</Text></View>
                </View>

                <Text style={styles.sheetSubTitle}>Current Status</Text>
                <View style={styles.timelineContainer}>
                  {/* Visual representation of the timeline from your design */}
                  <View style={styles.timelineLine} />
                  <View style={styles.timelineStep}>
                    <View style={[styles.timelineIconBox, { backgroundColor: THEME.primary }]}>
                      <Feather name="clipboard" size={16} color="#FFF" />
                    </View>
                    <Text style={[styles.timelineText, { color: THEME.primary }]}>Registration</Text>
                    </View>
                  <View style={styles.timelineStep}>
                    <View style={styles.timelineIconBoxBorder}>
                      <Feather name="aperture" size={16} color={THEME.textSecondary} />
                    </View>
                    <Text style={styles.timelineText}>Sample</Text>
                  </View>
                  <View style={styles.timelineStep}>
                    <View style={styles.timelineIconBoxBorder}>
                      <Feather name="activity" size={16} color={THEME.textSecondary} />
                    </View>
                    <Text style={styles.timelineText}>Testing</Text>
                  </View>
                  <View style={styles.timelineStep}>
                    <View style={styles.timelineIconBoxBorder}>
                      <Feather name="check" size={16} color={THEME.textSecondary} />
                    </View>
                    <Text style={styles.timelineText}>Delivered</Text>
                  </View>
                </View>
              </>
            )}
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
  filterBtn: { padding: 4 },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.bg, marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: THEME.border, marginBottom: 16 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14, color: THEME.textPrimary },

  tabsScroll: { marginBottom: 16, overflow: 'visible' },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: THEME.border, marginRight: 10, backgroundColor: THEME.bg },
  tabBtnActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  tabText: { fontSize: 13, color: THEME.textSecondary, fontWeight: '500' },
  tabTextActive: { color: '#FFF', fontWeight: '600' },

  listContent: { paddingHorizontal: 20 },
  card: { backgroundColor: THEME.bg, borderRadius: 16, borderWidth: 1, borderColor: THEME.border, marginBottom: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
  cardHeader: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E2E8F0', marginRight: 12 },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 16, fontWeight: '700', color: THEME.textPrimary, marginBottom: 4 },
  patientId: { fontSize: 12, color: THEME.textSecondary, fontWeight: '500', marginBottom: 6 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 11, color: THEME.textSecondary, marginLeft: 4 },
  
  cardActionsRight: { alignItems: 'flex-end' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },

  cardActionButtons: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: THEME.primary },
  actionDivider: { width: 1, height: 20, backgroundColor: THEME.border },

  fab: { position: 'absolute', bottom: 90, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: THEME.primary, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: THEME.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },

  // Modal / Bottom Sheet
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: THEME.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  dragHandle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  closeBtn: { position: 'absolute', top: 20, right: 20, zIndex: 1 },
  
  sheetHeader: { flexDirection: 'row', marginBottom: 20 },
  sheetAvatar: { width: 60, height: 60, borderRadius: 30, marginRight: 16 },
  sheetInfo: { flex: 1 },
  sheetName: { fontSize: 20, fontWeight: '700', color: THEME.textPrimary, marginBottom: 8 },
  sheetMetaGrid: { flexDirection: 'row', gap: 16 },
  sheetMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sheetMetaText: { fontSize: 12, color: THEME.textSecondary, fontWeight: '500' },

  sheetSubTitle: { fontSize: 14, fontWeight: '700', color: THEME.textPrimary, marginBottom: 12, marginTop: 10 },
  sheetChipsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  sheetChip: { backgroundColor: '#F0FDFA', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#CCFBF1' },
  sheetChipText: { fontSize: 12, color: THEME.primary, fontWeight: '600' },

  timelineContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, position: 'relative' },
  timelineLine: { position: 'absolute', top: 16, left: 30, right: 30, height: 2, backgroundColor: '#E2E8F0', zIndex: -1 },
  timelineStep: { alignItems: 'center', flex: 1 },
  timelineIconBox: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  timelineIconBoxBorder: { width: 32, height: 32, borderRadius: 16, backgroundColor: THEME.bg, borderWidth: 2, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  timelineText: { fontSize: 10, fontWeight: '600', color: THEME.textSecondary, textAlign: 'center' },
});