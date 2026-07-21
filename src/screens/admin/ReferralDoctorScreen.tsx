import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, ActivityIndicator, Alert, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../utils/constants';
import {
  getAllReferingDoctors, saveReferingDoctor, updateReferingDoctor, deleteReferingDoctor,
  ReferingDoctorRecord, SaveReferingDoctorPayload, UpdateReferingDoctorPayload,
} from '../../services/doctorScheduleService';
import { useAuth } from '../../context/AuthContext';

const TEAL = COLORS.primary;

function Field({ label, required, children }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={st.label}>{label}{required && <Text style={{ color: '#EF4444' }}> *</Text>}</Text>
      {children}
    </View>
  );
}

export default function ReferralDoctorScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [records, setRecords]   = useState<ReferingDoctorRecord[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState<ReferingDoctorRecord | null>(null);
  const [saving, setSaving]       = useState(false);
  const [name, setName]       = useState('');
  const [mobile, setMobile]   = useState('');
  const [address, setAddress] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchRecords = useCallback(async () => {
    setLoading(true); setError(null);
    try { setRecords(await getAllReferingDoctors(1)); }
    catch (err: any) { setError(err?.message ?? 'Failed to load referring doctors.'); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchRecords(); }, [fetchRecords]));

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    return String(r.Name ?? '').toLowerCase().includes(q) ||
           String(r.Mobile ?? '').toLowerCase().includes(q);
  });

  const openAdd = () => {
    setEditItem(null); setName(''); setMobile(''); setAddress(''); setIsActive(true);
    setShowModal(true);
  };

  const openEdit = (item: ReferingDoctorRecord) => {
    setEditItem(item); setName(item.Name); setMobile(item.Mobile ?? '');
    setAddress(item.Address ?? ''); setIsActive(item.IsActive);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Validation', 'Name is required.'); return; }
    setSaving(true);
    try {
      if (editItem) {
        const p: UpdateReferingDoctorPayload = {
          Id: editItem.Id, Name: name.trim(), Mobile: mobile.trim(),
          Address: address.trim(), BranchId: 1, UpdatedBy: user?.name || 'Admin', IsActive: isActive,
        };
        await updateReferingDoctor(p);
      } else {
        const p: SaveReferingDoctorPayload = {
          Name: name.trim(), Mobile: mobile.trim(), Address: address.trim(),
          BranchId: 1, CreatedBy: user?.name || 'Admin', IsActive: true,
        };
        await saveReferingDoctor(p);
      }
      Alert.alert('Success', editItem ? 'Updated successfully.' : 'Saved successfully.');
      setShowModal(false); fetchRecords();
    } catch (err: any) { Alert.alert('Error', err?.message ?? 'Could not save.');
    } finally { setSaving(false); }
  };

  const handleDelete = (item: ReferingDoctorRecord) => {
    Alert.alert('Delete', `Delete "${item.Name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteReferingDoctor(item.Id, 1); setRecords(p => p.filter(r => r.Id !== item.Id)); }
        catch (err: any) { Alert.alert('Error', err?.message ?? 'Could not delete.'); }
      }},
    ]);
  };

  return (
    <View style={[st.root, { paddingTop: Math.max(insets.top, 10) }]}>
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <Feather name="arrow-left" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={st.headerTitle}>Referral Doctors</Text>
        <View style={{ width: 28 }} />
      </View>
      <View style={st.breadcrumb}>
        <MaterialCommunityIcons name="account-heart-outline" size={13} color={TEAL} />
        <Text style={st.bcText}> Dr Appointment</Text>
        <Feather name="chevron-right" size={12} color="#94A3B8" style={{ marginHorizontal: 2 }} />
        <Text style={[st.bcText, { color: TEAL, fontWeight: '700' }]}>Referral Doctors</Text>
      </View>

      <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={st.card}>
          <View style={st.cardHeader}>
            <View style={st.cardTitleRow}>
              <MaterialCommunityIcons name="account-heart-outline" size={20} color="#FFF" />
              <Text style={st.cardTitle}> Referral Doctors</Text>
              <View style={st.badge}><Text style={st.badgeTxt}>{records.length} records</Text></View>
            </View>
            <View style={st.tabRow}>
              <TouchableOpacity style={st.tabBtn} onPress={fetchRecords} disabled={loading}>
                {loading ? <ActivityIndicator size={12} color="#FFF" /> : <Feather name="refresh-cw" size={13} color="#CBD5E1" />}
                <Text style={st.tabTxt}> List</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[st.tabBtn, { backgroundColor: '#15803D' }]} onPress={openAdd}>
                <Feather name="plus" size={14} color="#FFF" />
                <Text style={[st.tabTxt, { color: '#FFF' }]}> Add Doctor</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={st.body}>
            <View style={st.searchBar}>
              <Feather name="search" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput style={st.searchInput} placeholder="Search by name or mobile..."
                placeholderTextColor="#94A3B8" value={search} onChangeText={setSearch} />
            </View>

            {loading && records.length === 0 ? (
              <View style={st.centre}><ActivityIndicator size="large" color={TEAL} /><Text style={st.centreTxt}>Loading…</Text></View>
            ) : error ? (
              <View style={st.centre}>
                <MaterialCommunityIcons name="cloud-off-outline" size={44} color="#CBD5E1" />
                <Text style={st.emptyTitle}>Could not load data</Text>
                <Text style={st.emptySub}>{error}</Text>
                <TouchableOpacity style={st.retryBtn} onPress={fetchRecords}>
                  <Feather name="refresh-cw" size={14} color={TEAL} /><Text style={st.retryTxt}> Retry</Text>
                </TouchableOpacity>
              </View>
            ) : filtered.length === 0 ? (
              <View style={st.centre}>
                <MaterialCommunityIcons name="account-heart-outline" size={44} color="#CBD5E1" />
                <Text style={st.emptyTitle}>No referring doctors found</Text>
                <Text style={st.emptySub}>Tap "+ Add Doctor" to create one.</Text>
              </View>
            ) : (
              filtered.map((item, idx) => (
                <View key={String(item.Id ?? idx)} style={st.row}>
                  <View style={st.rowIcon}>
                    <MaterialCommunityIcons name="account-heart-outline" size={18} color={TEAL} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={st.rowName}>{item.Name}</Text>
                    {item.Mobile  ? <Text style={st.rowSub}>📱 {item.Mobile}</Text>  : null}
                    {item.Address ? <Text style={st.rowSub}>📍 {item.Address}</Text> : null}
                  </View>
                  <View style={st.rowActions}>
                    <View style={[st.statusPill, { backgroundColor: item.IsActive ? '#F0FDFA' : '#F1F5F9' }]}>
                      <Text style={[st.statusTxt, { color: item.IsActive ? TEAL : '#94A3B8' }]}>
                        {item.IsActive ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                    <TouchableOpacity style={st.editBtn} onPress={() => openEdit(item)}>
                      <Feather name="edit-2" size={13} color="#3B82F6" />
                    </TouchableOpacity>
                    <TouchableOpacity style={st.delBtn} onPress={() => handleDelete(item)}>
                      <Feather name="trash-2" size={13} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={st.footer}><Text style={st.footerTxt}>© 2026 - Life Relier Infosoft Pvt Ltd</Text></View>

      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={st.modalOverlay}>
          <View style={st.modalCard}>
            <View style={st.modalHeader}>
              <MaterialCommunityIcons name="account-heart-outline" size={16} color="#FFF" />
              <Text style={st.modalTitle}>{editItem ? ' Edit Referring Doctor' : ' Add Referring Doctor'}</Text>
            </View>
            <View style={st.modalActions}>
              <TouchableOpacity style={[st.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator size={14} color="#FFF" /> : <Feather name="save" size={14} color="#FFF" />}
                <Text style={st.btnTxt}>{saving ? ' Saving…' : ' Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.cancelBtn} onPress={() => setShowModal(false)} disabled={saving}>
                <Feather name="x" size={14} color="#FFF" /><Text style={st.btnTxt}> Cancel</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={st.modalScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Field label="Name" required>
                <View style={st.inputWrap}><TextInput style={st.input} placeholder="Enter full name"
                  placeholderTextColor="#94A3B8" value={name} onChangeText={setName} /></View>
              </Field>
              <Field label="Mobile No">
                <View style={st.inputWrap}><TextInput style={st.input} placeholder="Enter mobile number"
                  placeholderTextColor="#94A3B8" value={mobile} onChangeText={setMobile}
                  keyboardType="phone-pad" maxLength={10} /></View>
              </Field>
              <Field label="Address">
                <View style={[st.inputWrap, { height: 72, alignItems: 'flex-start', paddingTop: 10 }]}>
                  <TextInput style={[st.input, { height: 52 }]} placeholder="Enter address"
                    placeholderTextColor="#94A3B8" value={address} onChangeText={setAddress} multiline /></View>
              </Field>
              {editItem && (
                <Field label="Status">
                  <TouchableOpacity
                    style={[st.toggleBtn, { backgroundColor: isActive ? '#F0FDFA' : '#F1F5F9', borderColor: isActive ? TEAL : '#CBD5E1' }]}
                    onPress={() => setIsActive(!isActive)}>
                    <View style={[st.toggleDot, { backgroundColor: isActive ? TEAL : '#94A3B8' }]} />
                    <Text style={[st.toggleTxt, { color: isActive ? TEAL : '#94A3B8' }]}>{isActive ? 'Active' : 'Inactive'}</Text>
                  </TouchableOpacity>
                </Field>
              )}
              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  breadcrumb: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5F4', paddingHorizontal: 16, paddingVertical: 8 },
  bcText: { fontSize: 12, color: '#64748B' },
  scroll: { padding: 16, paddingBottom: 20 },
  footer: { backgroundColor: TEAL, paddingVertical: 12, alignItems: 'center' },
  footerTxt: { fontSize: 12, color: '#FFF', fontWeight: '500' },
  card: { backgroundColor: '#FFF', borderRadius: 14, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  cardHeader: { backgroundColor: TEAL, padding: 14 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#FFF', marginRight: 8 },
  badge: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  badgeTxt: { fontSize: 11, color: '#FFF', fontWeight: '600' },
  tabRow: { flexDirection: 'row', gap: 10 },
  tabBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  tabTxt: { fontSize: 13, fontWeight: '600', color: '#CBD5E1' },
  body: { padding: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, height: 44, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 14, color: '#0F172A' },
  centre: { alignItems: 'center', paddingVertical: 36 },
  centreTxt: { marginTop: 10, fontSize: 13, color: '#64748B' },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: '#334155', marginTop: 10 },
  emptySub: { fontSize: 12, color: '#94A3B8', marginTop: 4, textAlign: 'center' },
  retryBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 14, borderWidth: 1.5, borderColor: TEAL, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 7 },
  retryTxt: { fontSize: 13, fontWeight: '700', color: TEAL },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  rowIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#F0FDFA', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  rowName: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  rowSub: { fontSize: 11, color: '#64748B', marginTop: 1 },
  rowActions: { alignItems: 'flex-end', gap: 5 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusTxt: { fontSize: 11, fontWeight: '700' },
  editBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BFDBFE' },
  delBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECACA' },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, backgroundColor: '#F8FAFC', paddingHorizontal: 14, height: 48 },
  input: { flex: 1, fontSize: 14, color: '#0F172A' },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, gap: 8 },
  toggleDot: { width: 8, height: 8, borderRadius: 4 },
  toggleTxt: { fontSize: 14, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: TEAL, paddingHorizontal: 16, paddingVertical: 14, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  modalActions: { flexDirection: 'row', gap: 10, padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalScroll: { padding: 16 },
  saveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#15803D', borderRadius: 10, paddingVertical: 11 },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#64748B', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 11 },
  btnTxt: { fontSize: 13, fontWeight: '700', color: '#FFF' },
});
