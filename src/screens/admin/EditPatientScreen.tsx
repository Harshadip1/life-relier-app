import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { API_BASE_URL } from '../../utils/constants';

const THEME = {
  primary: '#0F766E',
  primaryLight: '#F0FDFA',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  danger: '#EF4444',
  bg: '#FFFFFF',
  screenBg: '#FAFAFA',
};

export default function EditPatientScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const patient = route?.params?.patient ?? {};

  const [name, setName]     = useState(patient.name       ?? '');
  const [mobile, setMobile] = useState(patient.phone      ?? '');
  const [age, setAge]       = useState(patient.age        ?? '');
  const [gender, setGender] = useState(patient.gender     ?? 'Male');
  const [dob, setDob]       = useState(patient.dob        ?? '');
  const [city, setCity]     = useState(patient.city       ?? '');
  const [area, setArea]     = useState(patient.area       ?? '');
  const [notes, setNotes]   = useState(patient.notes      ?? '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!name.trim() || !mobile.trim() || !age.trim() || !gender.trim()) {
      Alert.alert('Validation Error', 'Name, Mobile, Age and Gender are required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        PatRegID:      patient.patRegId ?? patient.PatRegID,
        PID:           patient.pid      ?? patient.PID,
        PatientName:   name.trim(),
        MobileNo:      mobile.replace(/\s/g, ''),
        Age:           age.trim(),
        Gender:        gender,
        DOB:           dob,
        City:          city.trim(),
        Area:          area.trim(),
        Notes:         notes.trim(),
        BranchId:      patient.branchId ?? 1,
        UpdatedBy:     'admin',
      };

      const res = await fetch(
        `${API_BASE_URL}/api/NewRegistration/UpdatePatientFiles`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body:    JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.Message || data?.message || `Server error (${res.status})`);
      }

      Alert.alert(
        'Update Successful',
        data.Message || 'Patient files updated successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const InputLabel = ({ title, required }: { title: string; required?: boolean }) => (
    <Text style={styles.inputLabel}>
      {title}{required && <Text style={{ color: THEME.danger }}> *</Text>}
    </Text>
  );

  const SectionHeader = ({ icon, title }: { icon: any; title: string }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconBox}>
        <Feather name={icon} size={16} color="#FFF" />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: Math.max(insets.top, 10) }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={THEME.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Patient</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Patient Information */}
        <SectionHeader icon="user" title="Patient Information" />

        <View style={styles.inputGroup}>
          <InputLabel title="Full Name" required />
          <View style={styles.inputWrapper}>
            <Feather name="user" size={18} color={THEME.textSecondary} style={styles.inputIcon} />
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter full name" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 2, marginRight: 12 }]}>
            <InputLabel title="Mobile Number" required />
            <View style={styles.inputWrapper}>
              <Feather name="phone" size={18} color={THEME.textSecondary} style={styles.inputIcon} />
              <TextInput style={styles.input} value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
            <InputLabel title="Age" required />
            <View style={styles.inputWrapper}>
              <Feather name="calendar" size={18} color={THEME.textSecondary} style={styles.inputIcon} />
              <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" />
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1.2 }]}>
            <InputLabel title="Gender" required />
            <TouchableOpacity
              style={styles.inputWrapper}
              activeOpacity={0.7}
              onPress={() => setGender(g => (g === 'Male' ? 'Female' : g === 'Female' ? 'Other' : 'Male'))}
            >
              <Feather name="users" size={18} color={THEME.textSecondary} style={styles.inputIcon} />
              <Text style={[styles.input, { marginTop: 2 }]}>{gender}</Text>
              <Feather name="chevron-down" size={18} color={THEME.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <InputLabel title="Date of Birth" />
          <View style={styles.inputWrapper}>
            <Feather name="calendar" size={18} color={THEME.textSecondary} style={styles.inputIcon} />
            <TextInput style={styles.input} value={dob} onChangeText={setDob} placeholder="DD/MM/YYYY" />
          </View>
        </View>

        {/* Address */}
        <SectionHeader icon="map-pin" title="Address" />
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
            <InputLabel title="City" />
            <View style={styles.inputWrapper}>
              <Feather name="map-pin" size={18} color={THEME.textSecondary} style={styles.inputIcon} />
              <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="City" />
            </View>
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <InputLabel title="Area / Locality" />
            <View style={styles.inputWrapper}>
              <Feather name="map" size={18} color={THEME.textSecondary} style={styles.inputIcon} />
              <TextInput style={styles.input} value={area} onChangeText={setArea} placeholder="Area" />
            </View>
          </View>
        </View>

        {/* Notes */}
        <SectionHeader icon="file-text" title="Notes (Optional)" />
        <View style={[styles.inputWrapper, { height: 90, alignItems: 'flex-start', paddingVertical: 12, marginBottom: 24 }]}>
          <TextInput
            style={[styles.input, { textAlignVertical: 'top' }]}
            multiline
            placeholder="Add notes for laboratory staff..."
            value={notes}
            onChangeText={setNotes}
            maxLength={200}
          />
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={[styles.updateBtn, loading && { opacity: 0.7 }]}
          activeOpacity={0.8}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#FFF" style={{ marginRight: 8 }} />
            : <Feather name="save" size={18} color="#FFF" style={{ marginRight: 8 }} />}
          <Text style={styles.updateBtnText}>{loading ? 'Updating...' : 'Update Patient'}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: THEME.bg },
  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
  backBtn:       { padding: 4, marginRight: 12 },
  headerTitle:   { flex: 1, fontSize: 20, fontWeight: '700', color: THEME.textPrimary },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 24 },
  sectionIconBox:{ width: 28, height: 28, borderRadius: 14, backgroundColor: THEME.primary, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  sectionTitle:  { fontSize: 16, fontWeight: '700', color: THEME.primary },
  row:           { flexDirection: 'row', alignItems: 'flex-start' },
  inputGroup:    { marginBottom: 16 },
  inputLabel:    { fontSize: 12, fontWeight: '600', color: THEME.textSecondary, marginBottom: 6 },
  inputWrapper:  { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: THEME.border, borderRadius: 12, paddingHorizontal: 12, height: 48, backgroundColor: THEME.bg },
  inputIcon:     { marginRight: 8 },
  input:         { flex: 1, fontSize: 14, color: THEME.textPrimary, fontWeight: '500' },
  updateBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.primary, height: 54, borderRadius: 12 },
  updateBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});
