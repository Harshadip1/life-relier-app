import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../utils/constants';

const THEME = {
  primary: '#0D9488',
  primaryLight: '#F0FDFA',
  bg: '#FFFFFF',
  screenBg: '#F8FAFC',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
};

interface LabReport {
  id:       string;
  date:     string;
  title:    string;
  lab:      string;
  status:   string;
  barcode:  string;
  charges:  number;
  isNew:    boolean;
}

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

export default function ReportsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [search,     setSearch]     = useState('');
  const [activeTab,  setActiveTab]  = useState('Lab Reports');
  const [reports,    setReports]    = useState<LabReport[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`${API_BASE_URL}/api/TestStatus/GetPatientTestStatus`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          BranchId: 1, FromDate: '2024-01-01', ToDate: today,
          PatRegID: '', PatientName: user?.name ?? '',
          DoctorName: '', TestName: '', MobileNo: user?.phone ?? '',
          Barcode: '', CenterCode: '', SubDepartment: '', Status: 'All',
        }),
      });
      const data = await res.json();
      const rows: any[] = Array.isArray(data) ? data : (data?.value ?? []);

      // De-duplicate by barcode → one card per test row
      const seen = new Set<string>();
      const mapped: LabReport[] = [];
      for (const r of rows) {
        const key = r.BarcodeID;
        if (seen.has(key)) continue;
        seen.add(key);
        const regDate = new Date(r.Patregdate);
        const daysDiff = (Date.now() - regDate.getTime()) / (1000 * 60 * 60 * 24);
        mapped.push({
          id:      `${r.PatRegID}-${r.BarcodeID}`,
          date:    formatDate(r.Patregdate),
          title:   r.MainTestName,
          lab:     r.CenterName ?? 'Life Relier Diagnostics',
          status:  r.Status,
          barcode: r.BarcodeID,
          charges: r.TestCharges ?? 0,
          isNew:   daysDiff <= 7,
        });
      }
      setReports(mapped);
    } catch { setReports([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, [user]);

  useFocusEffect(useCallback(() => { fetchReports(); }, [fetchReports]));

  const filtered = reports.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.barcode.includes(search)
  );

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 10) }]}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Medical Records</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => fetchReports(true)}>
          <Feather name="refresh-cw" size={20} color={THEME.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={THEME.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tests or barcode..."
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Feather name="x" size={16} color={THEME.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'Lab Reports' && styles.tabBtnActive]}
          onPress={() => setActiveTab('Lab Reports')}
        >
          <MaterialCommunityIcons name="flask-outline" size={18}
            color={activeTab === 'Lab Reports' ? THEME.primary : THEME.textSecondary}
            style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, activeTab === 'Lab Reports' && styles.tabTextActive]}>
            Lab Reports
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'Prescriptions' && styles.tabBtnActive]}
          onPress={() => setActiveTab('Prescriptions')}
        >
          <MaterialCommunityIcons name="pill" size={18}
            color={activeTab === 'Prescriptions' ? THEME.primary : THEME.textSecondary}
            style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, activeTab === 'Prescriptions' && styles.tabTextActive]}>
            Prescriptions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centre}>
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text style={styles.centreText}>Loading records…</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchReports(true)} colors={[THEME.primary]} />
          }
        >
          {activeTab === 'Lab Reports' && (
            <>
              {filtered.length === 0 ? (
                <View style={styles.centre}>
                  <MaterialCommunityIcons name="flask-empty-outline" size={48} color="#CBD5E1" />
                  <Text style={styles.centreText}>No lab reports found</Text>
                </View>
              ) : (
                filtered.map(report => (
                  <View key={report.id} style={styles.card}>
                    <View style={styles.cardHeaderFlex}>
                      <View style={styles.dateBox}>
                        <Text style={styles.dateMonth}>{report.date.split(' ')[1]}</Text>
                        <Text style={styles.dateDay}>{report.date.split(' ')[0]}</Text>
                        <Text style={styles.dateYear}>{report.date.split(' ')[2]}</Text>
                      </View>

                      <View style={styles.reportInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <Text style={styles.reportTitle} numberOfLines={1}>{report.title}</Text>
                          {report.isNew && (
                            <View style={styles.newBadge}>
                              <Text style={styles.newBadgeText}>NEW</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.reportLab}>{report.lab}</Text>
                        <Text style={styles.reportId}>Barcode: {report.barcode}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 }}>
                          <View style={[styles.statusPill, {
                            backgroundColor: report.status === 'Report Ready' ? '#ECFDF5' : '#FFFBEB',
                          }]}>
                            <Text style={[styles.statusText, {
                              color: report.status === 'Report Ready' ? '#10B981' : '#F59E0B',
                            }]}>{report.status}</Text>
                          </View>
                          <Text style={{ fontSize: 11, color: THEME.textSecondary, fontWeight: '600' }}>
                            ₹{report.charges}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.actionRow}>
                      <TouchableOpacity style={styles.secondaryBtn}>
                        <Feather name="share-2" size={16} color={THEME.textSecondary} style={{ marginRight: 6 }} />
                        <Text style={styles.secondaryBtnText}>Share</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.primaryBtn}>
                        <Feather name="download" size={16} color="#FFF" style={{ marginRight: 6 }} />
                        <Text style={styles.primaryBtnText}>Download PDF</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </>
          )}

          {activeTab === 'Prescriptions' && (
            <View style={styles.centre}>
              <MaterialCommunityIcons name="pill" size={48} color="#CBD5E1" />
              <Text style={styles.centreText}>No prescriptions available</Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: THEME.screenBg },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: THEME.textPrimary },
  iconBtn:     { padding: 8, backgroundColor: THEME.bg, borderRadius: 12, borderWidth: 1, borderColor: THEME.border },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.bg, marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: THEME.border, marginBottom: 16 },
  searchIcon:  { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14, color: THEME.textPrimary },
  tabContainer:{ flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#E2E8F0', borderRadius: 12, padding: 4, marginBottom: 16 },
  tabBtn:      { flex: 1, flexDirection: 'row', paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  tabBtnActive:{ backgroundColor: THEME.bg, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  tabText:     { fontSize: 13, fontWeight: '600', color: THEME.textSecondary },
  tabTextActive:{ color: THEME.primary },
  scrollContent:{ paddingHorizontal: 20 },
  centre:      { alignItems: 'center', paddingVertical: 48 },
  centreText:  { fontSize: 14, color: THEME.textSecondary, marginTop: 12 },
  card:        { backgroundColor: THEME.bg, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: THEME.border, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
  cardHeaderFlex: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dateBox:     { width: 54, height: 64, backgroundColor: THEME.primaryLight, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14, borderWidth: 1, borderColor: '#CCFBF1' },
  dateMonth:   { fontSize: 10, fontWeight: '700', color: THEME.primary, textTransform: 'uppercase' },
  dateDay:     { fontSize: 20, fontWeight: '800', color: THEME.primary, marginVertical: -2 },
  dateYear:    { fontSize: 10, fontWeight: '600', color: THEME.primary },
  reportInfo:  { flex: 1, justifyContent: 'center' },
  reportTitle: { fontSize: 15, fontWeight: '700', color: THEME.textPrimary, flex: 1 },
  newBadge:    { backgroundColor: '#EF4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8 },
  newBadgeText:{ fontSize: 8, fontWeight: '800', color: '#FFF' },
  reportLab:   { fontSize: 13, color: THEME.textSecondary, marginBottom: 2 },
  reportId:    { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  statusPill:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText:  { fontSize: 10, fontWeight: '700' },
  actionRow:   { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16 },
  secondaryBtn:{ flex: 1, flexDirection: 'row', height: 40, borderRadius: 10, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: THEME.border },
  secondaryBtnText:{ color: THEME.textSecondary, fontSize: 13, fontWeight: '600' },
  primaryBtn:  { flex: 1.5, flexDirection: 'row', height: 40, borderRadius: 10, backgroundColor: THEME.primary, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText:{ color: '#FFF', fontSize: 13, fontWeight: '700' },
});
