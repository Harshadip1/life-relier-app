import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, API_BASE_URL } from '../../utils/constants';

const T = {
  primary: '#0D9488', bg: '#FFFFFF', screenBg: '#F8FAFC',
  text: '#0F172A', sub: '#64748B', border: '#E2E8F0',
};

export default function PhleboStatusScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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
            doc: r.Drname ?? '—',
            test: r.MainTestName ?? '',
            enterBy: r.UserId ?? '—', // Use UserId or something similar if available
            regDate: r.Patregdate ?? '—',
            phleboBy: '—', // Backend might not provide this
            phleboTime: '—', 
            diff: '0'
          });
        }
      }
      
      const list = Array.from(map.values());
      setData(list);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load statuses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); return () => {}; }, [load]));

  const renderItem = ({ item }: { item: any }) => (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Text style={s.regNo}>Reg: {item.id}</Text>
        <Text style={s.diffBadge}>{item.diff} mins</Text>
      </View>
      
      <View style={s.row}>
        <View style={s.avatar}><Text style={s.avatarText}>{item.name.charAt(0)}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={s.name}>{item.name}</Text>
          <Text style={s.subInfo}>Dr. {item.doc}</Text>
        </View>
      </View>
      
      <Text style={s.testName}><Text style={{fontWeight: '700'}}>Test:</Text> {item.test}</Text>
      
      <View style={s.gridRow}>
        <View style={s.gridItem}>
          <Text style={s.gridLabel}>Enter By</Text>
          <Text style={s.gridValue}>{item.enterBy}</Text>
        </View>
        <View style={s.gridItem}>
          <Text style={s.gridLabel}>Reg. Date</Text>
          <Text style={s.gridValue}>{item.regDate}</Text>
        </View>
      </View>

      <View style={[s.gridRow, { borderBottomWidth: 0 }]}>
        <View style={s.gridItem}>
          <Text style={s.gridLabel}>Phlebotomist By</Text>
          <Text style={s.gridValue}>{item.phleboBy}</Text>
        </View>
        <View style={s.gridItem}>
          <Text style={s.gridLabel}>Phlebo Time</Text>
          <Text style={s.gridValue}>{item.phleboTime}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 0) }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 16 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.title}>Patient Status</Text>
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
          data={data.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.id.includes(search))}
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
  diffBadge: { fontSize: 12, color: '#B45309', backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: 'hidden', fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#0369A1' },
  name: { fontSize: 16, fontWeight: '700', color: T.text },
  subInfo: { fontSize: 13, color: T.sub, marginTop: 2 },
  testName: { fontSize: 14, color: T.text, marginBottom: 12 },
  gridRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: T.border, paddingVertical: 8 },
  gridItem: { flex: 1 },
  gridLabel: { fontSize: 11, color: T.sub, marginBottom: 2 },
  gridValue: { fontSize: 13, color: T.text, fontWeight: '500' },
});
