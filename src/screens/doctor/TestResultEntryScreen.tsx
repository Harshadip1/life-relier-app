import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PRIMARY = '#0D9488';

const STATUS_OPTIONS = ['All', 'Pending', 'Completed', 'Tested', 'Authorized', 'Emergency', 'IntRece', 'IntNotRece', 'Outsource', 'Abnormal'];

// Mock data based on the screenshot
const mockResults = [
  { id: '1', date: '17/08/2026, 06:22 pm', regNo: '112', ppid: '111', center: 'ADC Lab', name: 'Mr Abhishek Mahadik', sex: 'M', age: '24Y', refDr: 'Self', status: 'Reg', balance: '0.00' },
  { id: '2', date: '17/08/2026, 06:22 pm', regNo: '112', ppid: '111', center: 'ADC Lab', name: 'Mr Abhishek Mahadik', sex: 'M', age: '24Y', refDr: 'Self', status: 'Reg', balance: '0.00' },
  { id: '3', date: '12/08/2026, 06:31 pm', regNo: '107', ppid: '107', center: 'ADC Lab', name: 'Master Abhishek Mahadik', sex: 'M', age: '20Y', refDr: 'Divya', status: 'Auth', balance: '160.00' },
];

export default function TestResultEntryScreen({ navigation }: any) {
  const [showFilters, setShowFilters] = useState(false);
  const [activeStatus, setActiveStatus] = useState('All');

  const renderResultCard = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{item.name}</Text>
          <Text style={styles.patientDetails}>{item.sex} • {item.age} • Reg: {item.regNo} • PPID: {item.ppid}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Auth' ? '#8B5CF6' : '#EF4444' }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="clock-outline" size={14} color="#64748B" />
          <Text style={styles.metaText}>{item.date}</Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="hospital-building" size={14} color="#64748B" />
          <Text style={styles.metaText}>{item.center}</Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="doctor" size={14} color="#64748B" />
          <Text style={styles.metaText}>{item.refDr}</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}><MaterialCommunityIcons name="file-pdf-box" size={20} color="#EF4444" /></TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F1F5F9' }]}><Text style={styles.actionLetter}>C</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}><Text style={[styles.actionLetter, {color: '#EF4444'}]}>N</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}><Text style={[styles.actionLetter, {color: '#EF4444'}]}>N</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FEF3C7' }]}><Text style={[styles.actionLetter, {color: '#D97706'}]}>NA</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}><Text style={[styles.actionLetter, {color: '#EF4444'}]}>N</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#DBEAFE' }]}><MaterialCommunityIcons name="calendar-edit" size={20} color="#3B82F6" /></TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#D1FAE5' }]}><MaterialCommunityIcons name="account-edit" size={20} color="#10B981" /></TouchableOpacity>
        </ScrollView>
        <Text style={styles.balanceText}>Bal: ₹{item.balance}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Result Entry</Text>
      </View>

      <View style={styles.filterSection}>
        <TouchableOpacity 
          style={styles.filterHeader}
          onPress={() => setShowFilters(!showFilters)}
        >
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <MaterialCommunityIcons name="filter-variant" size={20} color="#FFFFFF" />
            <Text style={styles.filterHeaderText}>Search Filters</Text>
          </View>
          <MaterialCommunityIcons name={showFilters ? "chevron-up" : "chevron-down"} size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {showFilters && (
          <View style={styles.filterForm}>
            <View style={styles.inputRow}>
              <TextInput style={styles.input} placeholder="From Date" />
              <TextInput style={styles.input} placeholder="To Date" />
            </View>
            <View style={styles.inputRow}>
              <TextInput style={styles.input} placeholder="PPID No" />
              <TextInput style={styles.input} placeholder="Reg No" />
            </View>
            <TextInput style={[styles.input, {marginBottom: 10}]} placeholder="Patient Name" />
            
            <TouchableOpacity style={styles.searchBtn}>
              <MaterialCommunityIcons name="magnify" size={20} color="#FFFFFF" />
              <Text style={styles.searchBtnText}>Search</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.statusScrollWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusScroll}>
            {STATUS_OPTIONS.map(status => (
              <TouchableOpacity 
                key={status}
                style={[styles.statusChip, activeStatus === status && styles.statusChipActive]}
                onPress={() => setActiveStatus(status)}
              >
                <Text style={[styles.statusChipText, activeStatus === status && styles.statusChipTextActive]}>{status}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Test Results</Text>
        <Text style={styles.countText}>{mockResults.length} records</Text>
      </View>
      
      <FlatList
        data={mockResults}
        keyExtractor={(item) => item.id}
        renderItem={renderResultCard}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  
  filterSection: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  filterHeader: { backgroundColor: PRIMARY, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  filterHeaderText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15, marginLeft: 8 },
  filterForm: { padding: 16, backgroundColor: '#F0FDFA' },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  input: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, height: 44, fontSize: 14 },
  searchBtn: { backgroundColor: '#3B82F6', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 8, height: 44 },
  searchBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15, marginLeft: 8 },
  
  statusScrollWrapper: { paddingVertical: 12 },
  statusScroll: { paddingHorizontal: 16, gap: 8 },
  statusChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  statusChipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  statusChipText: { fontSize: 13, fontWeight: '500', color: '#64748B' },
  statusChipTextActive: { color: '#FFFFFF' },

  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: PRIMARY },
  listTitle: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  countText: { color: '#FFFFFF', fontSize: 13, opacity: 0.9 },
  listContent: { padding: 16 },
  
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  patientDetails: { fontSize: 13, color: '#64748B' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#475569' },
  
  actionsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actionRow: { gap: 8 },
  actionBtn: { width: 32, height: 32, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  actionLetter: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  balanceText: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginLeft: 12 },
});
