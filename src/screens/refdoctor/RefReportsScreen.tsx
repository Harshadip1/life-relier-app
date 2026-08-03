import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { fetchRefPatients, PatientRow } from './RefPatientsScreen';

const T = {
  primary: '#0D9488', tealDark: '#0F766E', tealBg: '#F0FDFA',
  bg: '#FFFFFF', screenBg: '#F8FAFC', text: '#0F172A',
  sub: '#64748B', muted: '#94A3B8', border: '#E2E8F0',
  green: '#10B981', warning: '#F59E0B',
};

const TABS = ['All', 'Report Ready', 'Processing', 'Registered'];

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
}

function statusColor(s: string) {
  switch (s) {
    case 'Report Ready': return { color: T.green,   bg: '#ECFDF5' };
    case 'Processing':   return { color: '#F97316', bg: '#FFF7ED' };
    default:             return { color: T.warning,  bg: '#FFFBEB' };
  }
}

export default function RefReportsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [rows,       setRows]       = useState<PatientRow[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab,  setActiveTab]  = useState('All');

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try { setRows(await fetchRefPatients(user?.name ?? '')); }
    catch (e: any) { Alert.alert('Error', e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = activeTab === 'All' ? rows : rows.filter(r => r.Status === activeTab);
  const readyCount = rows.filter(r => r.Status === 'Report Ready').length;

  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 10) }]}>
      <View style={s.header}>
        <Text style={s.title}>Reports</Text>
        <View style={s.readyBadge}>
          <Text style={s.readyTxt}>{readyCount} Ready</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={s.tabsWrap}>
        <FlatList
          data={TABS} horizontal showsHorizontalScrollIndicator={false}
          keyExtractor={t => t}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}
          style={{ height: 44 }}
          renderItem={({ item: tab }) => (
            <TouchableOpacity style={[s.tabBtn, activeTab === tab && s.tabBtnActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={s.centre}><ActivityIndicator size="large" color={T.primary} /><Text style={s.centreText}>Loading…</Text></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => `${item.PID}-${i}`}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[T.primary]} />}
          ListEmptyComponent={<View style={s.centre}><MaterialCommunityIcons name="file-document-outline" size={48} color={T.muted} /><Text style={s.centreText}>No reports found</Text></View>}
          renderItem={({ item }) => {
            const sc = statusColor(item.Status);
            return (
              <View style={s.card}>
                <View style={s.cardRow}>
                  <View style={s.dateBox}>
                    <Text style={s.dateM}>{fmtDate(item.Patregdate).split(' ')[1]}</Text>
                    <Text style={s.dateD}>{fmtDate(item.Patregdate).split(' ')[0]}</Text>
                    <Text style={s.dateY}>{fmtDate(item.Patregdate).split(' ')[2]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.name}>{item.PatientName}</Text>
                    <Text style={s.pid}>PT{String(item.PatRegID).padStart(6,'0')}</Text>
                    <Text style={s.tests} numberOfLines={1}>{item.tests.join(' · ')}</Text>
                  </View>
                  <View style={[s.badge, { backgroundColor: sc.bg }]}>
                    <View style={[s.dot, { backgroundColor: sc.color }]} />
                    <Text style={[s.badgeTxt, { color: sc.color }]}>{item.Status}</Text>
                  </View>
                </View>
                {item.Status === 'Report Ready' && (
                  <View style={s.actionsRow}>
                    <TouchableOpacity style={s.actionBtn}>
                      <Feather name="eye" size={14} color={T.primary} />
                      <Text style={s.actionTxt}>View</Text>
                    </TouchableOpacity>
                    <View style={s.actionDivider} />
                    <TouchableOpacity style={s.actionBtn}>
                      <Feather name="download" size={14} color={T.primary} />
                      <Text style={s.actionTxt}>Download</Text>
                    </TouchableOpacity>
                    <View style={s.actionDivider} />
                    <TouchableOpacity style={s.actionBtn}>
                      <Feather name="share-2" size={14} color={T.primary} />
                      <Text style={s.actionTxt}>Share</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: T.screenBg },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
  title:      { fontSize: 18, fontWeight: '800', color: T.text },
  readyBadge: { backgroundColor: '#ECFDF5', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  readyTxt:   { fontSize: 12, fontWeight: '700', color: T.green },
  tabsWrap:   { backgroundColor: T.bg, borderBottomWidth: 1, borderBottomColor: T.border },
  tabBtn:     { height: 32, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: T.border, backgroundColor: T.bg, justifyContent: 'center' },
  tabBtnActive: { backgroundColor: T.primary, borderColor: T.primary },
  tabText:    { fontSize: 12, color: T.sub, fontWeight: '500' },
  tabTextActive: { color: '#FFF', fontWeight: '700' },
  list:       { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 80 },
  centre:     { alignItems: 'center', paddingTop: 50 },
  centreText: { fontSize: 14, color: T.sub, marginTop: 8 },
  card:       { backgroundColor: T.bg, borderRadius: 12, borderWidth: 1, borderColor: T.border, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
  cardRow:    { flexDirection: 'row', alignItems: 'center', padding: 12 },
  dateBox:    { width: 48, height: 56, backgroundColor: T.tealBg, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: '#CCFBF1' },
  dateM:      { fontSize: 9, fontWeight: '700', color: T.tealDark, textTransform: 'uppercase' },
  dateD:      { fontSize: 18, fontWeight: '800', color: T.tealDark, marginVertical: -1 },
  dateY:      { fontSize: 9, fontWeight: '600', color: T.tealDark },
  name:       { fontSize: 14, fontWeight: '700', color: T.text, marginBottom: 1 },
  pid:        { fontSize: 11, color: T.sub, marginBottom: 2 },
  tests:      { fontSize: 11, color: T.muted },
  badge:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-start' },
  dot:        { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  badgeTxt:   { fontSize: 9, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  actionBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10 },
  actionTxt:  { fontSize: 12, fontWeight: '600', color: T.primary },
  actionDivider: { width: 1, height: 18, backgroundColor: T.border, alignSelf: 'center' },
});
