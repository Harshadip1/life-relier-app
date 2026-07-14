import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import { getDoctorDropdown, saveSlot, DoctorDropdownItem } from '../../services/doctorScheduleService';
import { useAuth } from '../../context/AuthContext';

const TEAL = COLORS.primary;

export default function AddDoctorSlotScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [doctors, setDoctors] = useState<DoctorDropdownItem[]>([]);
  const [loadingDr, setLoadingDr] = useState(false);
  const [selectedDrId, setSelectedDrId] = useState<number | null>(null);
  const [selectedDrName, setSelectedDrName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [slotMins, setSlotMins] = useState('');
  const [saving, setSaving] = useState(false);

  // Load doctor list on mount
  useEffect(() => {
    (async () => {
      setLoadingDr(true);
      try {
        const list = await getDoctorDropdown(1);
        setDoctors(list);
      } catch (err: any) {
        Alert.alert('Error', 'Failed to load doctor list: ' + err.message);
      } finally {
        setLoadingDr(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!selectedDrId) {
      Alert.alert('Validation', 'Please select a doctor.');
      return;
    }
    if (!slotMins.trim() || isNaN(Number(slotMins)) || Number(slotMins) <= 0) {
      Alert.alert('Validation', 'Please enter a valid slot duration in minutes.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        DrId: selectedDrId,
        SlotMins: Number(slotMins),
        BranchId: 1,   // confirmed from Bruno — BranchId: 1
        CreatedBy: user?.name || 'admin',
        IsActive: true,
      };

      await saveSlot(payload);
      Alert.alert('Success', 'Consultation slot saved successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to save slot. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={TEAL} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Doctor Slot</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* ── Breadcrumb ── */}
      <View style={styles.breadcrumb}>
        <MaterialCommunityIcons name="clock-outline" size={13} color={TEAL} />
        <Text style={styles.breadcrumbLink}> DrAppointment</Text>
        <Feather name="chevron-right" size={13} color="#94A3B8" style={{ marginHorizontal: 2 }} />
        <Text style={styles.breadcrumbLink}>DrSlot</Text>
        <Feather name="chevron-right" size={13} color="#94A3B8" style={{ marginHorizontal: 2 }} />
        <Text style={[styles.breadcrumbLink, { color: TEAL, fontWeight: '700' }]}>Add New</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* ── Form Card ── */}
        <View style={styles.card}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Feather name="plus" size={18} color="#FFF" />
              <Text style={styles.cardTitle}> Add Slot</Text>
            </View>
            <View style={styles.cardHeaderActions}>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
                {saving ? (
                  <ActivityIndicator size={14} color="#FFF" />
                ) : (
                  <Feather name="save" size={14} color="#FFF" />
                )}
                <Text style={styles.btnText}>{saving ? ' Saving…' : ' Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} disabled={saving}>
                <Feather name="x" size={14} color="#FFF" />
                <Text style={styles.btnText}> Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Fields ── */}
          <View style={styles.formBody}>
            {/* Doctor */}
            <Text style={styles.label}>
              Doctor (Collection Person) <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowDropdown(!showDropdown)}
              activeOpacity={0.8}
              disabled={loadingDr || saving}
            >
              {loadingDr ? (
                <ActivityIndicator size={16} color={TEAL} style={{ marginRight: 8 }} />
              ) : null}
              <Text style={[styles.dropdownText, !selectedDrName && { color: '#94A3B8' }]}>
                {loadingDr ? 'Loading doctors…' : (selectedDrName || 'Select...')}
              </Text>
              <Feather name="chevron-down" size={18} color="#64748B" />
            </TouchableOpacity>
            {showDropdown && (
              <View style={styles.dropdownMenu}>
                {doctors.length === 0 ? (
                  <View style={styles.dropdownItem}>
                    <Text style={{ color: '#94A3B8' }}>No doctors found</Text>
                  </View>
                ) : doctors.map((p) => (
                  <TouchableOpacity
                    key={p.Id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedDrId(p.Id);
                      setSelectedDrName(p.FullName);
                      setShowDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{p.FullName}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Slot (In Mins) */}
            <Text style={[styles.label, { marginTop: 20 }]}>
              Slot Duration (In Mins) <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.textInputWrap}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter minutes (e.g. 15)"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={slotMins}
                onChangeText={setSlotMins}
                editable={!saving}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 - Life Relier Infosoft Pvt Ltd</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F1F5F9' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#0F172A', textAlign: 'center' },

  // Breadcrumb
  breadcrumb: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E8F5F4', paddingHorizontal: 16, paddingVertical: 8,
  },
  breadcrumbLink: { fontSize: 12, color: '#64748B' },

  scroll: { padding: 16, paddingBottom: 120 },

  // Card
  card: {
    backgroundColor: '#FFF', borderRadius: 14, overflow: 'hidden',
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  cardHeader: {
    backgroundColor: TEAL, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  cardHeaderActions: { flexDirection: 'row', gap: 10 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#15803D', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  cancelBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#64748B', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  btnText: { color: '#FFF', fontSize: 13, fontWeight: '600' },

  // Form
  formBody: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
  required: { color: '#EF4444' },

  // Dropdown
  dropdown: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10,
    backgroundColor: '#F8FAFC', paddingHorizontal: 14, height: 50,
  },
  dropdownText: { fontSize: 14, color: '#0F172A', flex: 1 },
  dropdownMenu: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10,
    backgroundColor: '#FFF', marginTop: 4, overflow: 'hidden',
  },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownItemText: { fontSize: 14, color: '#0F172A' },

  // Text Input
  textInputWrap: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10,
    backgroundColor: '#F8FAFC', paddingHorizontal: 14, height: 50,
    justifyContent: 'center',
  },
  textInput: { fontSize: 14, color: '#0F172A' },

  // Footer
  footer: { backgroundColor: TEAL, paddingVertical: 12, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#FFF', fontWeight: '500' },
});
