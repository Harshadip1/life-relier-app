import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PRIMARY = '#0D9488';

const mockTat = [
  { id: '1', srNo: '1', regNo: '113', patient: 'Cat Dsadas', test: 'Complete Blood Count', regDate: '17/08/2026, 06:28 pm', authDate: 'Pending', refDoctor: 'Girish Patil', doctor: 'Girish Patil', expectedTat: '2 Hours', actualDur: 'Pending', status: 'Pending' }
];

export default function TATPatientWiseScreen({ navigation }: any) {
  const [showFilters, setShowFilters] = useState(false);

  const renderTatCard = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{item.patient}</Text>
          <Text style={styles.patientDetails}>Reg: {item.regNo} • Test: {item.test}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Pending' ? '#FEF3C7' : '#D1FAE5' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Pending' ? '#D97706' : '#059669' }]}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.metaRow}>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Registration</Text>
          <Text style={styles.metaValue}>{item.regDate}</Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Authorized</Text>
          <Text style={styles.metaValue}>{item.authDate}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Ref Doctor</Text>
          <Text style={styles.metaValue}>{item.refDoctor}</Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Main Doctor</Text>
          <Text style={styles.metaValue}>{item.doctor}</Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.footerCol}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#64748B" />
          <Text style={styles.footerLabel}>Expected: <Text style={styles.footerValue}>{item.expectedTat}</Text></Text>
        </View>
        <View style={styles.footerCol}>
          <MaterialCommunityIcons name="timer-sand" size={16} color="#64748B" />
          <Text style={styles.footerLabel}>Actual: <Text style={styles.footerValue}>{item.actualDur}</Text></Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TAT Patient Wise</Text>
      </View>

      <View style={styles.filterSection}>
        <TouchableOpacity style={styles.filterHeader} onPress={() => setShowFilters(!showFilters)}>
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
              <TextInput style={styles.input} placeholder="From Hour (0-23)" />
              <TextInput style={styles.input} placeholder="To Hour (0-23)" />
            </View>
            <View style={styles.inputRow}>
              <TextInput style={styles.input} placeholder="Patient Name" />
              <TextInput style={styles.input} placeholder="Registration No" />
            </View>
            <TextInput style={[styles.input, {marginBottom: 10}]} placeholder="Test Name" />
            
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.clearBtn}>
                <MaterialCommunityIcons name="refresh" size={20} color="#475569" />
                <Text style={styles.clearBtnText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.searchBtn}>
                <MaterialCommunityIcons name="magnify" size={20} color="#FFFFFF" />
                <Text style={styles.searchBtnText}>Search</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>TAT Details</Text>
        <TouchableOpacity style={styles.refreshBadge}>
          <MaterialCommunityIcons name="refresh" size={16} color="#0284C7" />
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={mockTat}
        keyExtractor={(item) => item.id}
        renderItem={renderTatCard}
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
  actionRow: { flexDirection: 'row', gap: 10 },
  clearBtn: { flex: 1, backgroundColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 8, height: 44 },
  clearBtnText: { color: '#475569', fontWeight: '600', fontSize: 15, marginLeft: 4 },
  searchBtn: { flex: 2, backgroundColor: '#3B82F6', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 8, height: 44 },
  searchBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15, marginLeft: 8 },
  
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: PRIMARY },
  listTitle: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  refreshBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0F2FE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  refreshText: { color: '#0284C7', fontSize: 12, fontWeight: '600', marginLeft: 4 },
  listContent: { padding: 16 },
  
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  patientDetails: { fontSize: 13, color: '#64748B' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },
  
  metaRow: { flexDirection: 'row', marginBottom: 12 },
  metaCol: { flex: 1 },
  metaLabel: { fontSize: 12, color: '#94A3B8', marginBottom: 2 },
  metaValue: { fontSize: 13, color: '#334155', fontWeight: '500' },
  
  footerRow: { flexDirection: 'row', marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  footerCol: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerLabel: { fontSize: 13, color: '#64748B' },
  footerValue: { fontWeight: '600', color: '#0F172A' },
});
