import React, { useState, useEffect, useCallback } from 'react';
import { COLORS, API_BASE_URL } from '../../utils/constants';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import BlinkingEmergencyBulb from '../../components/BlinkingEmergencyBulb';

const T = { primary:'#0D9488', tealDark:'#0F766E', bg:'#F8FAFC', card:'#FFF', text:'#0F172A', sub:'#64748B', muted:'#94A3B8', border:'#E2E8F0', amber:'#F59E0B', green:'#10B981', blue:'#3B82F6' };

const STATUS_STYLE: Record<string, any> = {
  Pending:   { bg: '#FFFBEB', color: T.amber,    icon: 'clock-outline'          },
  Collected: { bg: '#ECFDF5', color: COLORS.success,    icon: 'check-circle-outline'   },
  Rejected:  { bg: '#FEF2F2', color: '#EF4444',  icon: 'close-circle-outline'   },
  Urgent:    { bg: '#FEF2F2', color: '#EF4444',  icon: 'alert-circle-outline'   },
};

interface TestStatusRecord {
  PID: number;
  PatRegID: string;
  PatientName: string;
  sex: string;
  Age: number;
  MainTestName: string;
  BarcodeID?: string;
  Status: string;
  Patregdate: string;
  Emergency?: string;
  [key: string]: any;
}

export default function PhlebotomistCollectionScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [collections, setCollections] = useState<TestStatusRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'Urgent' | 'Pending' | 'Collected' | 'All'>('Urgent');

  // Fetch patient test status from API
  const fetchCollections = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Fetch from both branches (1 and 4) for today only
      const [branch1Response, branch4Response] = await Promise.all([
        fetch(`${API_BASE_URL}/api/TestStatus/GetPatientTestStatus`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            BranchId: 1,
            FromDate: todayStr,
            ToDate: todayStr,
            Status: '', // Get all statuses
          }),
        }),
        fetch(`${API_BASE_URL}/api/TestStatus/GetPatientTestStatus`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            BranchId: 4,
            FromDate: todayStr,
            ToDate: todayStr,
            Status: '', // Get all statuses
          }),
        }),
      ]);

      const branch1Data = await branch1Response.json();
      const branch4Data = await branch4Response.json();
      
      const branch1Records: TestStatusRecord[] = Array.isArray(branch1Data) ? branch1Data : [];
      const branch4Records: TestStatusRecord[] = Array.isArray(branch4Data) ? branch4Data : [];
      
      // Merge and deduplicate records by unique key (PID + PatRegID + MainTestName)
      const recordMap = new Map<string, TestStatusRecord>();
      [...branch1Records, ...branch4Records].forEach(record => {
        const key = `${record.PID}-${record.PatRegID}-${record.MainTestName}`;
        if (!recordMap.has(key)) {
          recordMap.set(key, record);
        }
      });
      
      const mergedRecords = Array.from(recordMap.values());
      setCollections(mergedRecords);
    } catch (error) {
      console.error('Failed to fetch collections:', error);
      Alert.alert('Error', 'Failed to load sample collections');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount and when screen is focused
  useFocusEffect(useCallback(() => {
    fetchCollections();
  }, [fetchCollections]));

  // Filter by status
  const filtered = collections.filter(c => {
    // Search filter
    const matchesSearch = c.PatientName?.toLowerCase().includes(search.toLowerCase()) ||
      c.PatRegID?.toLowerCase().includes(search.toLowerCase()) ||
      c.BarcodeID?.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;

    // Status filter
    const isUrgent = c.Emergency === 'Y' || c.Emergency === '1' || c.Emergency === 'Yes';
    
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Urgent') return isUrgent && c.Status !== 'Collected';
    if (selectedFilter === 'Pending') return c.Status === 'Pending' && !isUrgent;
    if (selectedFilter === 'Collected') return c.Status === 'Collected';
    
    return true;
  });

  const handleCollectSample = async (record: TestStatusRecord) => {
    Alert.alert('Collect Sample', `Mark sample collected for ${record.PatientName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Collected', 
        onPress: async () => {
          try {
            // Update status locally immediately for better UX
            setCollections(prev => prev.map(c => 
              c.PID === record.PID && c.PatRegID === record.PatRegID && c.MainTestName === record.MainTestName
                ? { ...c, Status: 'Collected' } 
                : c
            ));
            
            // TODO: Call API to update status in database
            // For now, status update is reflected in UI immediately
            // The API endpoint for updating test status should be implemented on backend
            
            Alert.alert('Success', `Sample for ${record.PatientName} marked as collected.`);
          } catch (error) {
            console.error('Failed to collect sample:', error);
            Alert.alert('Error', 'Failed to update sample status');
            // Revert the change
            fetchCollections();
          }
        } 
      },
    ]);
  };

  const handleReject = async (record: TestStatusRecord) => {
    Alert.alert('Reject Sample', `Reject sample for ${record.PatientName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Reject', 
        style: 'destructive',
        onPress: async () => {
          try {
            setCollections(prev => prev.map(c => 
              c.PID === record.PID && c.PatRegID === record.PatRegID && c.MainTestName === record.MainTestName
                ? { ...c, Status: 'Rejected' } 
                : c
            ));
            
            Alert.alert('Rejected', `${record.PatientName}'s sample rejected.`);
          } catch (error) {
            console.error('Failed to reject sample:', error);
            Alert.alert('Error', 'Failed to update sample status');
            fetchCollections();
          }
        }
      },
    ]);
  };

  // Count for badges
  const urgentCount = collections.filter(c => 
    (c.Emergency === 'Y' || c.Emergency === '1' || c.Emergency === 'Yes') && c.Status !== 'Collected'
  ).length;
  const pendingCount = collections.filter(c => 
    c.Status === 'Pending' && !(c.Emergency === 'Y' || c.Emergency === '1' || c.Emergency === 'Yes')
  ).length;
  const collectedCount = collections.filter(c => c.Status === 'Collected').length;

  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 0) }]}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Sample Collection</Text>
        <Text style={s.headerSub}>
          {urgentCount} urgent, {pendingCount} pending today
        </Text>
      </View>

      {/* Status Filter Tabs - URGENT FIRST */}
      <View style={s.filterRow}>
        <TouchableOpacity
          style={[s.filterTab, selectedFilter === 'Urgent' && s.filterTabActive]}
          onPress={() => setSelectedFilter('Urgent')}
        >
          <Text style={[s.filterText, selectedFilter === 'Urgent' && s.filterTextActive]}>
            Urgent
          </Text>
          <View style={[s.filterBadge, selectedFilter === 'Urgent' && s.filterBadgeActive]}>
            <Text style={[s.filterBadgeText, selectedFilter === 'Urgent' && s.filterBadgeTextActive]}>
              {urgentCount}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.filterTab, selectedFilter === 'Pending' && s.filterTabActive]}
          onPress={() => setSelectedFilter('Pending')}
        >
          <Text style={[s.filterText, selectedFilter === 'Pending' && s.filterTextActive]}>
            Pending
          </Text>
          <View style={[s.filterBadge, selectedFilter === 'Pending' && s.filterBadgeActive]}>
            <Text style={[s.filterBadgeText, selectedFilter === 'Pending' && s.filterBadgeTextActive]}>
              {pendingCount}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.filterTab, selectedFilter === 'Collected' && s.filterTabActive]}
          onPress={() => setSelectedFilter('Collected')}
        >
          <Text style={[s.filterText, selectedFilter === 'Collected' && s.filterTextActive]}>
            Collected
          </Text>
          <View style={[s.filterBadge, selectedFilter === 'Collected' && s.filterBadgeActive]}>
            <Text style={[s.filterBadgeText, selectedFilter === 'Collected' && s.filterBadgeTextActive]}>
              {collectedCount}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.filterTab, selectedFilter === 'All' && s.filterTabActive]}
          onPress={() => setSelectedFilter('All')}
        >
          <Text style={[s.filterText, selectedFilter === 'All' && s.filterTextActive]}>
            All
          </Text>
          <View style={[s.filterBadge, selectedFilter === 'All' && s.filterBadgeActive]}>
            <Text style={[s.filterBadgeText, selectedFilter === 'All' && s.filterBadgeTextActive]}>
              {collections.length}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={s.searchBar}>
        <Feather name="search" size={16} color={COLORS.textMuted} style={{ marginRight: 8 }} />
        <TextInput 
          style={s.searchInput} 
          placeholder="Search by name, PID, or barcode..." 
          placeholderTextColor={COLORS.textMuted} 
          value={search} 
          onChangeText={setSearch} 
        />
        <TouchableOpacity style={s.scanBtn}>
          <MaterialCommunityIcons name="barcode-scan" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={T.primary} />
          <Text style={s.loadingText}>Loading samples...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => `${item.PID}-${item.PatRegID}-${item.MainTestName}-${index}`}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <MaterialCommunityIcons name="test-tube-empty" size={64} color={COLORS.cardBorder} />
              <Text style={s.emptyText}>No samples found</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isUrgent = item.Emergency === 'Y' || item.Emergency === '1' || item.Emergency === 'Yes' || (item as any).Isemergency === true;
            const displayStatus = isUrgent && item.Status !== 'Collected' ? 'Urgent' : item.Status;
            const ss = STATUS_STYLE[displayStatus];
            
            // Format time from Patregdate
            const timeStr = item.Patregdate ? new Date(item.Patregdate).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : '--:--';

            return (
              <View style={s.card}>
                <View style={s.cardHeader}>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={s.name}>{item.PatientName}</Text>
                      {isUrgent && <BlinkingEmergencyBulb size={18} />}
                    </View>
                    <Text style={s.pid}>PID: {item.PatRegID}</Text>
                    {item.BarcodeID && <Text style={s.pid}>Barcode: {item.BarcodeID}</Text>}
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: ss.bg }]}>
                    <MaterialCommunityIcons name={ss.icon} size={12} color={ss.color} style={{ marginRight: 3 }} />
                    <Text style={[s.statusTxt, { color: ss.color }]}>{displayStatus}</Text>
                  </View>
                </View>

                <View style={s.divider} />

                <View style={s.detailRow}>
                  <MaterialCommunityIcons name="clock-outline" size={13} color={COLORS.textSecondary} />
                  <Text style={s.detailTxt}>  {timeStr}</Text>
                  <MaterialCommunityIcons name="account-outline" size={13} color={COLORS.textSecondary} style={{ marginLeft: 16 }} />
                  <Text style={s.detailTxt}>  {item.sex}, {item.Age}y</Text>
                </View>

                <View style={s.testsRow}>
                  <View style={s.testChip}>
                    <Text style={s.testChipTxt}>{item.MainTestName}</Text>
                  </View>
                </View>

                {(item.Status === 'Pending' || (isUrgent && item.Status !== 'Collected')) && (
                  <View style={s.actionRow}>
                    <TouchableOpacity style={s.rejectBtn} onPress={() => handleReject(item)}>
                      <Text style={s.rejectTxt}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.collectBtn} onPress={() => handleCollectSample(item)}>
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
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: COLORS.background },
  header:      { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  headerSub:   { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  // Filter Tabs
  filterRow:         { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  filterTab:         { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 8, borderRadius: 8, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.cardBorder, gap: 4 },
  filterTabActive:   { backgroundColor: T.primary, borderColor: T.primary },
  filterText:        { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  filterTextActive:  { color: '#FFF', fontWeight: '700' },
  filterBadge:       { backgroundColor: COLORS.cardBorder, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, minWidth: 20, alignItems: 'center' },
  filterBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  filterBadgeText:   { fontSize: 10, fontWeight: '700', color: COLORS.textSecondary },
  filterBadgeTextActive: { color: '#FFF' },

  searchBar:   { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, margin: 16, borderRadius: 10, borderWidth: 1, borderColor: COLORS.cardBorder, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, fontSize: 13, color: COLORS.textPrimary },
  scanBtn:     { width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.primaryDark, alignItems: 'center', justifyContent: 'center' },

  // Loading & Empty states
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  loadingText:      { marginTop: 12, fontSize: 14, color: COLORS.textSecondary },
  emptyContainer:   { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText:        { marginTop: 16, fontSize: 15, color: COLORS.textSecondary, fontWeight: '500' },

  list:        { paddingHorizontal: 16, paddingBottom: 100 },
  card:        { backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1, borderColor: COLORS.cardBorder, padding: 14 },
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name:        { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  pid:         { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusTxt:   { fontSize: 11, fontWeight: '700' },
  divider:     { height: 1, backgroundColor: COLORS.cardBorder, marginVertical: 10 },
  detailRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailTxt:   { fontSize: 12, color: COLORS.textSecondary },
  testsRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  testChip:    { backgroundColor: '#F0F9FF', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: '#BAE6FD' },
  testChipTxt: { fontSize: 11, fontWeight: '600', color: T.blue },
  actionRow:   { flexDirection: 'row', gap: 8 },
  rejectBtn:   { flex: 1, height: 36, borderRadius: 8, borderWidth: 1.5, borderColor: '#FEE2E2', backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' },
  rejectTxt:   { fontSize: 12, fontWeight: '700', color: '#EF4444' },
  collectBtn:  { flex: 2, height: 36, borderRadius: 8, backgroundColor: COLORS.primaryDark, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  collectTxt:  { fontSize: 12, fontWeight: '700', color: '#FFF' },
});
