import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Alert, Modal, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../utils/constants';

const T = {
  primary:   '#0D9488',
  tealDark:  '#0F766E',
  tealBg:    '#F0FDFA',
  tealBorder:'#CCFBF1',
  bg:        '#FFFFFF',
  screenBg:  '#F8FAFC',
  text:      '#0F172A',
  sub:       '#64748B',
  muted:     '#94A3B8',
  border:    '#F1F5F9',
  green:     '#10B981',
  warning:   '#F59E0B',
  danger:    '#EF4444',
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 'Good Morning 🌅';
  if (h >= 12 && h < 17) return 'Good Afternoon ☀️';
  if (h >= 17 && h < 21) return 'Good Evening 🌆';
  return 'Good Night 🌙';
}

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

function fmtTime(iso: string | null) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }); }
  catch { return iso; }
}

interface SampleRow {
  PID: number; PatRegID: number; PatientName: string;
  Patphoneno: string; Status: string; Patregdate: string;
  BarcodeID: string; Drname: string; CenterName: string;
  IspheboAccept: number; Isemergency: boolean;
  TestCharges: number; tests: string[];
}

const TABS = ['Pending', 'Collected', 'All'];

export default function PhlebotomistHomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const [samples,    setSamples]    = useState<SampleRow[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState('');
  const [activeTab,  setActiveTab]  = useState('Pending');
  const [selected,   setSelected]   = useState<SampleRow | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
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
      const data = await res.json();
      const rows: any[] = Array.isArray(data) ? data : (data?.value ?? []);
      const map = new Map<number, SampleRow>();
      for (const r of rows) {
        if (map.has(r.PID)) { map.get(r.PID)!.tests.push(r.MainTestName); }
        else {
          map.set(r.PID, {
            PID:           r.PID,
            PatRegID:      r.PatRegID,
            PatientName:   r.PatientName  ?? r.Patname ?? '—',
            Patphoneno:    r.Patphoneno   ?? '—',
            Status:        r.Status       ?? 'Registered',
            Patregdate:    r.Patregdate   ?? '',
            BarcodeID:     r.BarcodeID    ?? '—',
            Drname:        r.Drname       ?? '—',
            CenterName:    r.CenterName   ?? '—',
            IspheboAccept: r.IspheboAccept ?? 0,
            Isemergency:   r.Isemergency  ?? false,
            TestCharges:   r.TestCharges  ?? 0,
            tests:         [r.MainTestName],
          });
        }
      }
      setSamples(Array.from(map.values()));
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load samples.');
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const displayed = samples.filter(s => {
    const q = search.toLowerCase();
    const searchOk = s.PatientName.toLowerCase().includes(q) ||
                     s.Patphoneno.includes(q) || s.BarcodeID.includes(q);
    const tabOk = activeTab === 'All'       ? true
                : activeTab === 'Pending'   ? s.IspheboAccept === 0
                : activeTab === 'Collected' ? s.IspheboAccept === 2
                : true;
    return searchOk && tabOk;
  });

  const pending   = samples.filter(s => s.IspheboAccept === 0).length;
  const collected = samples.filter(s => s.IspheboAccept === 2).length;
  const urgent    = samples.filter(s => s.Isemergency).length;

  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 0) }]}>

      {/* ── Header Band ── */}
      <View style={s.headerBand}>
        <View style={{ flex: 1 }}>
          <Text style={s.greeting}>{getGreeting()}</Text>
          <Text style={s.userName}>{user?.name || 'Phlebotomist'}</Text>
          <View style={s.labRow}>
            <MaterialCommunityIcons name="check-decagram" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={s.labName}>  Sample Collection — Today</Text>
          </View>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.headerIconBtn} onPress={() => load(true)}>
            <Feather name="refresh-cw" size={18} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={s.headerIconBtn} onPress={() => logout()}>
            <Feather name="log-out" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Stats Grid ── */}
      <View style={s.statsGrid}>
        <StatCard value={String(pending)}   label="Pending Collection" icon="flask-outline"    color="#0369A1" bg="#F0F9FF" border="#BAE6FD" />
        <StatCard value={String(collected)} label="Samples Received"   icon="check-circle-outline" color="#15803D" bg="#F0FDF4" border="#BBF7D0" />
        <StatCard value={String(urgent)}    label="Urgent Samples"     icon="alarm-light-outline"  color={T.danger} bg="#FEF2F2" border="#FEE2E2" />
        <StatCard value={String(samples.length)} label="Total Today"   icon="account-group-outline" color={T.tealDark} bg={T.tealBg} border={T.tealBorder} />
      </View>

      {/* ── Search ── */}
      <View style={s.searchBar}>
        <Feather name="search" size={16} color={T.muted} style={{ marginRight: 8 }} />
        <TextInput style={s.searchInput} placeholder="Search name, barcode, mobile..."
          placeholderTextColor={T.muted} value={search} onChangeText={setSearch} />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Feather name="x" size={15} color={T.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Tabs ── */}
      <View style={s.tabsWrap}>
        <FlatList
          data={TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={t => t}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}
          style={{ height: 46 }}
          renderItem={({ item: tab }) => (
            <TouchableOpacity
              style={[s.tabBtn, activeTab === tab && s.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* ── List ── */}
      {loading ? (
        <View style={s.centre}>
          <ActivityIndicator size="large" color={T.primary} />
          <Text style={s.centreText}>Loading samples…</Text>
        </View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(item, i) => `${item.PID}-${i}`}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[T.primary]} />}
          ListEmptyComponent={
            <View style={s.centre}>
              <MaterialCommunityIcons name="flask-empty-outline" size={52} color={T.muted} />
              <Text style={s.centreText}>No samples found</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isCollected = item.IspheboAccept === 2;
            return (
              <TouchableOpacity style={s.card} onPress={() => setSelected(item)} activeOpacity={0.8}>
                {/* Header */}
                <View style={s.cardTop}>
                  <View style={s.avatar}>
                    <Text style={s.avatarText}>{item.PatientName.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={s.name}>{item.PatientName}</Text>
                      {item.Isemergency && (
                        <View style={s.urgentBadge}>
                          <Text style={s.urgentText}>URGENT</Text>
                        </View>
                      )}
                    </View>
                    <Text style={s.pid}>
                      PID: <Text style={{ color: T.primary }}>PT{String(item.PatRegID).padStart(6,'0')}</Text>
                      {'  ·  '}Barcode: {item.BarcodeID}
                    </Text>
                    <View style={s.metaRow}>
                      <Feather name="phone" size={11} color={T.muted} />
                      <Text style={s.metaText}>{item.Patphoneno}</Text>
                      <Feather name="map-pin" size={11} color={T.muted} style={{ marginLeft: 8 }} />
                      <Text style={s.metaText}>{item.CenterName}</Text>
                    </View>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: isCollected ? '#ECFDF5' : '#FFFBEB' }]}>
                    <View style={[s.statusDot, { backgroundColor: isCollected ? T.green : T.warning }]} />
                    <Text style={[s.statusText, { color: isCollected ? T.green : T.warning }]}>
                      {isCollected ? 'Collected' : 'Pending'}
                    </Text>
                  </View>
                </View>

                {/* Tests */}
                <View style={s.testsRow}>
                  <Feather name="activity" size={13} color={T.sub} style={{ marginRight: 6 }} />
                  <Text style={s.testsText} numberOfLines={1}>{item.tests.join(' · ')}</Text>
                </View>

                {/* Actions */}
                <View style={s.actionsRow}>
                  <TouchableOpacity style={s.actionBtn} onPress={() => setSelected(item)}>
                    <Feather name="file-text" size={14} color={T.primary} />
                    <Text style={s.actionText}>View Details</Text>
                  </TouchableOpacity>
                  <View style={s.actionDivider} />
                  <TouchableOpacity
                    style={s.actionBtn}
                    onPress={() => Alert.alert(
                      isCollected ? 'Already Collected' : 'Mark Collected',
                      isCollected ? 'Sample already marked.' : `Mark ${item.PatientName}'s sample as collected?`,
                      [{ text: 'Cancel', style: 'cancel' }, { text: 'Yes', onPress: () => {} }]
                    )}
                  >
                    <Feather name={isCollected ? 'check-circle' : 'droplet'} size={14} color={isCollected ? T.green : T.primary} />
                    <Text style={[s.actionText, isCollected && { color: T.green }]}>
                      {isCollected ? 'Collected' : 'Collect'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Detail Sheet */}
      {selected && (
        <Modal visible transparent animationType="slide">
          <View style={s.overlay}>
            <View style={s.sheet}>
              <View style={s.drag} />
              <TouchableOpacity style={s.closeBtn} onPress={() => setSelected(null)}>
                <Feather name="x" size={22} color={T.sub} />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={[s.avatar, { width: 50, height: 50, borderRadius: 25 }]}>
                  <Text style={[s.avatarText, { fontSize: 20 }]}>{selected.PatientName.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ marginLeft: 14 }}>
                  <Text style={{ fontSize: 17, fontWeight: '800', color: T.text }}>{selected.PatientName}</Text>
                  <Text style={{ fontSize: 12, color: T.primary, fontWeight: '600', marginTop: 2 }}>
                    PT{String(selected.PatRegID).padStart(6,'0')}
                  </Text>
                </View>
              </View>
              {[
                ['Barcode',  selected.BarcodeID],
                ['Doctor',   (selected.Drname ?? '—').trim()],
                ['Center',   selected.CenterName],
                ['Mobile',   selected.Patphoneno],
                ['Reg Date', fmtDate(selected.Patregdate)],
                ['Tests',    selected.tests.join(', ')],
                ['Charges',  `₹${(selected.TestCharges ?? 0).toFixed(0)}`],
              ].map(([label, value]) => (
                <View key={label} style={s.detailRow}>
                  <Text style={s.detailLabel}>{label}</Text>
                  <Text style={s.detailValue}>{value}</Text>
                </View>
              ))}
              <TouchableOpacity
                style={[s.collectBtn, selected.IspheboAccept === 2 && { backgroundColor: '#64748B' }]}
                onPress={() => {
                  Alert.alert(
                    selected.IspheboAccept === 2 ? 'Already Collected' : 'Mark as Collected',
                    selected.IspheboAccept === 2 ? 'This sample is already marked as collected.' : `Mark sample for ${selected.PatientName} as collected?`,
                    [{ text: 'Cancel', style: 'cancel' }, { text: 'Confirm', onPress: () => setSelected(null) }]
                  );
                }}
              >
                <Feather name={selected.IspheboAccept === 2 ? 'check-circle' : 'droplet'} size={16} color="#FFF" />
                <Text style={s.collectBtnText}>
                  {selected.IspheboAccept === 2 ? 'Already Collected' : 'Mark Collected'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function StatCard({ value, label, icon, color, bg, border }: any) {
  return (
    <View style={[s.statCard, { backgroundColor: bg, borderColor: border }]}>
      <View style={[s.statIconBox, { backgroundColor: '#FFF' }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: T.screenBg },
  headerBand:  { backgroundColor: T.primary, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  greeting:    { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  userName:    { fontSize: 22, fontWeight: '800', color: '#FFF', marginTop: 2 },
  labRow:      { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  labName:     { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  headerIconBtn:{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  statsGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 16, paddingBottom: 0 },
  statCard:    { width: '47.5%', borderRadius: 14, borderWidth: 1, padding: 14, alignItems: 'flex-start' },
  statIconBox: { width: 38, height: 38, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
  statValue:   { fontSize: 22, fontWeight: '800' },
  statLabel:   { fontSize: 11, color: T.sub, fontWeight: '500', marginTop: 2 },
  searchBar:   { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 14, marginBottom: 4, backgroundColor: T.bg, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, fontSize: 14, color: T.text },
  tabsWrap:    { backgroundColor: T.bg, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tabBtn:      { height: 34, paddingHorizontal: 16, borderRadius: 17, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: T.bg, justifyContent: 'center', alignItems: 'center' },
  tabBtnActive:{ backgroundColor: T.primary, borderColor: T.primary },
  tabText:     { fontSize: 13, color: T.sub, fontWeight: '500' },
  tabTextActive:{ color: '#FFF', fontWeight: '700' },
  list:        { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 100 },
  centre:      { alignItems: 'center', paddingTop: 60 },
  centreText:  { fontSize: 14, color: T.sub, marginTop: 10 },
  card:        { backgroundColor: T.bg, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
  cardTop:     { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderBottomWidth: 1, borderBottomColor: T.border },
  avatar:      { width: 44, height: 44, borderRadius: 22, backgroundColor: T.tealBg, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText:  { fontSize: 18, fontWeight: '800', color: T.tealDark },
  name:        { fontSize: 14, fontWeight: '700', color: T.text, marginBottom: 2 },
  pid:         { fontSize: 11.5, color: T.sub, marginBottom: 3 },
  metaRow:     { flexDirection: 'row', alignItems: 'center' },
  metaText:    { fontSize: 11, color: T.muted, marginLeft: 3 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusDot:   { width: 7, height: 7, borderRadius: 4, marginRight: 5 },
  statusText:  { fontSize: 10, fontWeight: '700' },
  urgentBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5 },
  urgentText:  { fontSize: 9, fontWeight: '800', color: T.danger },
  testsRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: T.border },
  testsText:   { flex: 1, fontSize: 12, color: T.sub },
  actionsRow:  { flexDirection: 'row', alignItems: 'center' },
  actionBtn:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 11 },
  actionText:  { fontSize: 12, fontWeight: '600', color: T.primary },
  actionDivider:{ width: 1, height: 18, backgroundColor: '#E2E8F0' },
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet:       { backgroundColor: T.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, maxHeight: '88%' },
  drag:        { width: 36, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  closeBtn:    { position: 'absolute', top: 18, right: 18, zIndex: 1 },
  detailRow:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  detailLabel: { width: 72, fontSize: 12, color: T.sub, fontWeight: '600' },
  detailValue: { flex: 1, fontSize: 13, color: T.text, fontWeight: '600' },
  collectBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: T.primary, borderRadius: 12, paddingVertical: 14, marginTop: 18, gap: 8 },
  collectBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
