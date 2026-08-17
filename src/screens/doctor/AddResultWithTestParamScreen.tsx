import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PRIMARY = '#0D9488';

const mockPatients = [
  { id: '113', name: 'Cat Dsadas', status: 'Not Tested' },
  { id: '112', name: 'Mr Abhishek Mahadik', status: 'Not Tested' },
  { id: '110', name: 'MS Geeta More', status: 'Completed' },
];

const mockParams = [
  { id: '1', name: 'Hemoglobin', unit: 'g/dL', range: '13.0 - 17.0', val: '' },
  { id: '2', name: 'RBC Count', unit: 'Million/µL', range: '4.50 - 5.90', val: '' },
  { id: '3', name: 'Hematocrit', unit: '%', range: '40 - 52', val: '' },
  { id: '4', name: 'WBC Count', unit: 'cells/µL', range: '4000 - 11000', val: '' },
];

export default function AddResultWithTestParamScreen({ navigation }: any) {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('All');

  const renderPatientCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.patientCard, selectedPatient?.id === item.id && styles.patientCardActive]}
      onPress={() => setSelectedPatient(item)}
    >
      <View style={styles.patientInfo}>
        <Text style={[styles.patientReg, selectedPatient?.id === item.id && { color: '#FFFFFF' }]}>{item.id}</Text>
        <Text style={[styles.patientName, selectedPatient?.id === item.id && { color: '#FFFFFF' }]}>{item.name}</Text>
      </View>
      <Text style={[styles.patientStatus, item.status === 'Completed' ? { color: '#10B981' } : { color: '#F59E0B' }, selectedPatient?.id === item.id && { color: '#FFFFFF', opacity: 0.9 }]}>
        {item.status}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { selectedPatient ? setSelectedPatient(null) : navigation.goBack() }} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedPatient ? 'Enter Results' : 'Patient List (Parameter Edit)'}</Text>
      </View>

      {!selectedPatient ? (
        <View style={styles.listContainer}>
          <View style={styles.searchBar}>
            <TextInput style={styles.searchInput} placeholder="Patient Name / Reg ID..." />
            <TouchableOpacity style={styles.searchBtn}>
              <MaterialCommunityIcons name="magnify" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterTabs}>
            {['All', 'Pending', 'Completed'].map(tab => (
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={styles.tabItem}>
                <MaterialCommunityIcons name={activeTab === tab ? "radiobox-marked" : "radiobox-blank"} size={20} color={activeTab === tab ? PRIMARY : '#94A3B8'} />
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={mockPatients}
            keyExtractor={item => item.id}
            renderItem={renderPatientCard}
            contentContainerStyle={styles.flatListContent}
          />
        </View>
      ) : (
        <View style={styles.detailContainer}>
          <ScrollView>
            <View style={styles.patientHeader}>
              <Text style={styles.detailName}>{selectedPatient.id} {selectedPatient.name}</Text>
              <Text style={styles.detailMeta}>Gender/Age: Male / 22 Year</Text>
              <Text style={styles.detailMeta}>Ref Dr: Girish Patil  •  Center: ADC Lab</Text>
            </View>
            
            <View style={styles.testSection}>
              <Text style={styles.testSectionTitle}>HEMATOLOGY - Complete Blood Count</Text>
              
              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#EF4444'}]}><Text style={styles.actionText}>Unauthorize</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#3B82F6'}]}><Text style={styles.actionText}>Print Report</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#F59E0B'}]}><Text style={styles.actionText}>Re-Run</Text></TouchableOpacity>
              </View>

              <View style={styles.paramsList}>
                {mockParams.map(param => (
                  <View key={param.id} style={styles.paramRow}>
                    <Text style={styles.paramName}>{param.name}</Text>
                    <TextInput style={styles.paramInput} placeholder="Enter result..." />
                    <View style={styles.paramMetaRow}>
                      <Text style={styles.paramUnit}>{param.unit}</Text>
                      <Text style={styles.paramRange}>{param.range}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetBtn}>
              <MaterialCommunityIcons name="refresh" size={20} color="#64748B" />
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn}>
              <MaterialCommunityIcons name="cloud-upload" size={20} color="#FFFFFF" />
              <Text style={styles.saveText}>Save (F5)</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  
  listContainer: { flex: 1 },
  searchBar: { flexDirection: 'row', padding: 16, gap: 12 },
  searchInput: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 16, height: 44 },
  searchBtn: { backgroundColor: '#3B82F6', width: 44, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  filterTabs: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tabItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tabText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  tabTextActive: { color: '#0F172A', fontWeight: '600' },
  flatListContent: { padding: 16 },
  patientCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  patientCardActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  patientInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  patientReg: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  patientName: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  patientStatus: { fontSize: 13, fontWeight: '600' },

  detailContainer: { flex: 1 },
  patientHeader: { backgroundColor: '#F0FDFA', padding: 16, borderBottomWidth: 1, borderBottomColor: '#CCFBF1' },
  detailName: { fontSize: 18, fontWeight: '700', color: '#0D9488', marginBottom: 4 },
  detailMeta: { fontSize: 13, color: '#475569', marginBottom: 2 },
  
  testSection: { padding: 16 },
  testSectionTitle: { fontSize: 15, fontWeight: '700', color: '#334155', backgroundColor: '#F1F5F9', padding: 12, borderRadius: 8, marginBottom: 12 },
  actionRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  actionBtn: { flex: 1, height: 36, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  actionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  
  paramsList: { gap: 16 },
  paramRow: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  paramName: { fontSize: 15, fontWeight: '600', color: '#1E293B', marginBottom: 12 },
  paramInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, height: 44, paddingHorizontal: 12, fontSize: 15, marginBottom: 12 },
  paramMetaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  paramUnit: { fontSize: 13, color: '#64748B' },
  paramRange: { fontSize: 13, color: '#64748B' },
  
  footer: { flexDirection: 'row', padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', gap: 12 },
  resetBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 8, backgroundColor: '#F1F5F9', gap: 8 },
  resetText: { color: '#475569', fontSize: 15, fontWeight: '600' },
  saveBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 8, backgroundColor: '#3B82F6', gap: 8 },
  saveText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});
