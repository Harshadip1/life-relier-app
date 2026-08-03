import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const T = { primary:'#0D9488', tealDark:'#0F766E', bg:'#F8FAFC', card:'#FFF', text:'#0F172A', sub:'#64748B', muted:'#94A3B8', border:'#E2E8F0', amber:'#F59E0B', green:'#10B981', blue:'#3B82F6' };

const COLLECTIONS = [
  { id:'1', name:'Rajesh Patil',  pid:'PT-001', tests:['CBC','LFT'],          tube:'Red / Purple', status:'Pending',   time:'09:40 AM' },
  { id:'2', name:'Priya Sharma',  pid:'PT-002', tests:['Thyroid','Vitamin D'],  tube:'Yellow',       status:'Collected', time:'10:00 AM' },
  { id:'3', name:'Arjun Mehta',   pid:'PT-003', tests:['KFT','Lipid Profile'],  tube:'Red',          status:'Pending',   time:'10:30 AM' },
  { id:'4', name:'Sneha Joshi',   pid:'PT-004', tests:['HbA1c'],               tube:'Purple',       status:'Rejected',  time:'11:00 AM' },
];

const STATUS_STYLE: Record<string, any> = {
  Pending:   { bg: '#FFFBEB', color: T.amber,    icon: 'clock-outline'          },
  Collected: { bg: '#ECFDF5', color: colors.success,    icon: 'check-circle-outline'   },
  Rejected:  { bg: '#FEF2F2', color: '#EF4444',  icon: 'close-circle-outline'   },
};

export default function PhlebotomistCollectionScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const filtered = COLLECTIONS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.pid.toLowerCase().includes(search.toLowerCase())
  );

  const handleCollect = (name: string) => {
    Alert.alert('Collect Sample', `Mark sample collected for ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Collected', onPress: () => Alert.alert('Done', `Sample for ${name} marked as collected.`) },
    ]);
  };

  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 0) }]}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Sample Collection</Text>
        <Text style={s.headerSub}>
          {COLLECTIONS.filter(c => c.status === 'Pending').length} pending today
        </Text>
      </View>

      <View style={s.searchBar}>
        <Feather name="search" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput style={s.searchInput} placeholder="Search by name or PID..." placeholderTextColor={colors.textMuted} value={search} onChangeText={setSearch} />
        <TouchableOpacity style={s.scanBtn}>
          <MaterialCommunityIcons name="barcode-scan" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const ss = STATUS_STYLE[item.status];
          return (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <View>
                  <Text style={s.name}>{item.name}</Text>
                  <Text style={s.pid}>PID: {item.pid}</Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: ss.bg }]}>
                  <MaterialCommunityIcons name={ss.icon} size={12} color={ss.color} style={{ marginRight: 3 }} />
                  <Text style={[s.statusTxt, { color: ss.color }]}>{item.status}</Text>
                </View>
              </View>

              <View style={s.divider} />

              <View style={s.detailRow}>
                <MaterialCommunityIcons name="clock-outline" size={13} color={colors.textSecondary} />
                <Text style={s.detailTxt}>  {item.time}</Text>
                <MaterialCommunityIcons name="test-tube" size={13} color={colors.textSecondary} style={{ marginLeft: 16 }} />
                <Text style={s.detailTxt}>  {item.tube}</Text>
              </View>

              <View style={s.testsRow}>
                {item.tests.map(t => (
                  <View key={t} style={s.testChip}><Text style={s.testChipTxt}>{t}</Text></View>
                ))}
              </View>

              {item.status === 'Pending' && (
                <View style={s.actionRow}>
                  <TouchableOpacity style={s.rejectBtn} onPress={() => Alert.alert('Rejected', `${item.name}'s sample rejected.`)}>
                    <Text style={s.rejectTxt}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.collectBtn} onPress={() => handleCollect(item.name)}>
                    <MaterialCommunityIcons name="test-tube" size={14} color="#FFF" style={{ marginRight: 4 }} />
                    <Text style={s.collectTxt}>Collect Sample</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: colors.background },
  header:      { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  headerSub:   { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  searchBar:   { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, margin: 16, borderRadius: 10, borderWidth: 1, borderColor: colors.cardBorder, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, fontSize: 13, color: colors.textPrimary },
  scanBtn:     { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  list:        { paddingHorizontal: 16, paddingBottom: 100 },
  card:        { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.cardBorder, padding: 14 },
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name:        { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  pid:         { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusTxt:   { fontSize: 11, fontWeight: '700' },
  divider:     { height: 1, backgroundColor: colors.cardBorder, marginVertical: 10 },
  detailRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailTxt:   { fontSize: 12, color: colors.textSecondary },
  testsRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  testChip:    { backgroundColor: '#F0F9FF', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: '#BAE6FD' },
  testChipTxt: { fontSize: 11, fontWeight: '600', color: T.blue },
  actionRow:   { flexDirection: 'row', gap: 8 },
  rejectBtn:   { flex: 1, height: 36, borderRadius: 8, borderWidth: 1.5, borderColor: '#FEE2E2', backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' },
  rejectTxt:   { fontSize: 12, fontWeight: '700', color: '#EF4444' },
  collectBtn:  { flex: 2, height: 36, borderRadius: 8, backgroundColor: colors.primaryDark, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  collectTxt:  { fontSize: 12, fontWeight: '700', color: '#FFF' },
});
