import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, API_BASE_URL } from '../../utils/constants';

const T = {
  primary: '#0D9488', bg: '#FFFFFF', screenBg: '#F8FAFC',
  text: '#0F172A', sub: '#64748B', border: '#E2E8F0',
  success: '#10B981', danger: '#EF4444'
};

export default function PhleboAccessionScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState<Record<string, 'Accept' | 'Reject'>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`${API_BASE_URL}/api/TestStatus/GetPatientTestStatus`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          BranchId: 1, FromDate: today, ToDate: today,
          PatRegID: '', PatientName: '', DoctorName: '',
          TestName: '', MobileNo: '', Barcode: '', CenterCode: '',
          SubDepartment: '', Status: 'All',
        }),
      });
      const resData = await res.json();
      const rows = Array.isArray(resData) ? resData : (resData?.value ?? []);
      
      const map = new Map<number, any>();
      for (const r of rows) {
        if (map.has(r.PID)) {
          map.get(r.PID)!.test += `, ${r.MainTestName}`;
        } else {
          map.set(r.PID, {
            id: r.PatRegID?.toString() || r.PID?.toString(),
            name: r.PatientName ?? r.Patname ?? '—',
            gender: r.sex ?? 'Unknown',
            age: r.Age ? `${r.Age} ${r.MDY || 'Year'}` : '—',
            center: r.CenterName ?? '—',
            doc: r.Drname ?? '—',
            test: r.MainTestName ?? '',
            type: 'Whole Blood', 
            barcode: r.BarcodeID ?? '—',
            mobile: r.Patphoneno ?? '—',
            regDate: r.Patregdate ?? '—',
            accDate: '—', // No explicit accepted date in basic model
            isPhleboAccept: r.IspheboAccept ?? 0
          });
        }
      }
      
      // Accession screen shows samples that have been collected (IspheboAccept === 2)
      const list = Array.from(map.values()).filter(x => x.isPhleboAccept === 2);
      setData(list);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load samples.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); return () => {}; }, [load]));

  const toggleAction = (id: string, val: 'Accept' | 'Reject') => {
    setActions(prev => ({ ...prev, [id]: val }));
  };

  const renderItem = ({ item }: { item: any }) => {
    const act = actions[item.id] || 'Accept';
    return (
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.regNo}>Reg: {item.id}</Text>
          <Text style={s.center}>{item.center}</Text>
        </View>
        <View style={s.row}>
          <View style={s.avatar}><Text style={s.avatarText}>{item.name.charAt(0)}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{item.name}</Text>
            <Text style={s.subInfo}>{item.gender}, {item.age} • Mobile: {item.mobile}</Text>
          </View>
        </View>
        <Text style={s.testName}><Text style={{fontWeight: '700'}}>Test:</Text> {item.test}</Text>
        <Text style={s.sampleType}><Text style={{fontWeight: '700'}}>Sample:</Text> {item.type} (Barcode: {item.barcode})</Text>
        <View style={s.datesRow}>
          <View>
            <Text style={s.dateLabel}>Reg Date</Text>
            <Text style={s.dateValue}>{item.regDate}</Text>
          </View>
          <View>
            <Text style={s.dateLabel}>Accepted Date</Text>
            <Text style={s.dateValue}>{item.accDate}</Text>
          </View>
        </View>
        
        <View style={s.footerActions}>
          <View style={s.radioGroup}>
            <TouchableOpacity style={s.radioOption} onPress={() => toggleAction(item.id, 'Accept')}>
              <MaterialCommunityIcons name={act === 'Accept' ? "radiobox-marked" : "radiobox-blank"} size={20} color={act === 'Accept' ? T.primary : T.sub} />
              <Text style={s.radioText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.radioOption} onPress={() => toggleAction(item.id, 'Reject')}>
              <MaterialCommunityIcons name={act === 'Reject' ? "radiobox-marked" : "radiobox-blank"} size={20} color={act === 'Reject' ? T.danger : T.sub} />
              <Text style={s.radioText}>Reject</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={s.submitBtn}>
            <MaterialCommunityIcons name="send" size={16} color="#FFF" style={{marginRight: 4}} />
            <Text style={s.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>

        <View style={[s.footerActions, { borderTopWidth: 0, paddingTop: 8 }]}>
           <View style={{ flex: 1 }} />
           <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={s.printBtn}><Feather name="printer" size={16} color="#FFF" /></TouchableOpacity>
            <TouchableOpacity style={s.printAllBtn}><Feather name="printer" size={16} color="#FFF" /></TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 0) }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 16 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.title}>Sample Acceptance</Text>
      </View>
      
      <View style={s.searchContainer}>
        <Feather name="search" size={18} color={T.sub} />
        <TextInput
          style={s.searchInput}
          placeholder="Search table..."
          value={search}
          onChangeText={setSearch}
        />
        <Text style={s.recordCount}>{data.length} records</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={T.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={data.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.barcode.includes(search))}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.screenBg },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.primary, padding: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', margin: 16, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: T.border, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: T.text },
  recordCount: { fontSize: 12, color: T.sub },
  list: { paddingHorizontal: 16, paddingBottom: 30 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: T.border, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  regNo: { fontSize: 13, fontWeight: '700', color: T.primary },
  center: { fontSize: 12, color: T.sub, backgroundColor: T.screenBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#0369A1' },
  name: { fontSize: 16, fontWeight: '700', color: T.text },
  subInfo: { fontSize: 13, color: T.sub, marginTop: 2 },
  testName: { fontSize: 14, color: T.text, marginBottom: 4 },
  sampleType: { fontSize: 14, color: T.text, marginBottom: 12 },
  datesRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: 8, borderRadius: 8, marginBottom: 12 },
  dateLabel: { fontSize: 11, color: T.sub },
  dateValue: { fontSize: 12, color: T.text, fontWeight: '600' },
  footerActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: T.border, paddingTop: 12 },
  radioGroup: { flexDirection: 'column', gap: 6 },
  radioOption: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  radioText: { fontSize: 14, color: T.text },
  submitBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B82F6', paddingHorizontal: 16, height: 36, borderRadius: 18 },
  submitText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  printBtn: { width: 36, height: 36, backgroundColor: '#64748B', borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  printAllBtn: { width: 36, height: 36, backgroundColor: '#EF4444', borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
