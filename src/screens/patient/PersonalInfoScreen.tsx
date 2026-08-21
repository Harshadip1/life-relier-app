import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS, API_BASE_URL } from '../../utils/constants';

interface PatientData {
  PID: number;
  Patname: string;
  sex: string;
  Age: number;
  MobileNo: string;
  Pataddress?: string;
  Email?: string;
  BranchId: number;
  [key: string]: any;
}

export default function PersonalInfoScreen({ navigation }: any) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Patient data fields
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      // Use user ID (PID) from auth context to fetch patient details
      const pid = user?.id || user?.phone;
      
      if (!pid) {
        Alert.alert('Error', 'Patient ID not found. Please log in again.');
        navigation.goBack();
        return;
      }

      // For demo: If PID is not a number, search by mobile
      // In production, always use PID from authentication
      const response = await fetch(`${API_BASE_URL}/api/EditPatient/GetPatient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ PID: pid }),
      });

      const data = await response.json();
      
      if (data?.PatientInfo && data.PatientInfo.length > 0) {
        const patient = data.PatientInfo[0];
        setPatientData(patient);
        setName(patient.Patname || '');
        setEmail(patient.Email || '');
        setPhone(patient.MobileNo || '');
        setAge(String(patient.Age || ''));
        setGender(patient.sex || '');
        setAddress(patient.Pataddress || '');
      } else {
        // Fallback: Use auth context data
        setName(user?.name || '');
        setEmail(user?.email || '');
        setPhone(user?.phone || '');
      }
    } catch (error) {
      console.error('Failed to fetch patient data:', error);
      Alert.alert('Error', 'Could not load patient information. Using profile data.');
      // Fallback to auth context
      setName(user?.name || '');
      setEmail(user?.email || '');
      setPhone(user?.phone || '');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name.');
      return;
    }

    if (phone && phone.replace(/\D/g, '').length !== 10) {
      Alert.alert('Validation Error', 'Mobile number must be exactly 10 digits.');
      return;
    }

    if (age && (isNaN(Number(age)) || Number(age) < 0 || Number(age) > 150)) {
      Alert.alert('Validation Error', 'Please enter a valid age.');
      return;
    }

    setSaving(true);

    try {
      const updatePayload = {
        PID: patientData?.PID || user?.id,
        BranchId: patientData?.BranchId || 1,
        Patname: name.trim(),
        sex: gender || 'Male',
        Age: age ? parseInt(age, 10) : 0,
        MobileNo: phone.replace(/\D/g, ''),
        Pataddress: address.trim(),
        Email: email.trim(),
        // Include other required fields from existing patient data
        ...patientData,
        // Override with updated values
        Patname: name.trim(),
        sex: gender || patientData?.sex || 'Male',
        Age: age ? parseInt(age, 10) : patientData?.Age || 0,
        MobileNo: phone.replace(/\D/g, ''),
        Pataddress: address.trim(),
        Email: email.trim(),
      };

      const response = await fetch(`${API_BASE_URL}/api/EditPatient/UpdatePatient`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      const result = await response.json();

      if (response.ok && (result.Message || '').toLowerCase().includes('success')) {
        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error(result.Message || 'Update failed');
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Information</Text>
        </View>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.centerText}>Loading your information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase() || 'P'}</Text>
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Feather name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.form}>
          <InputField 
            label="Full Name" 
            value={name} 
            onChangeText={setName} 
            icon="user" 
            editable={!saving}
          />
          
          <InputField 
            label="Email Address" 
            value={email} 
            onChangeText={setEmail} 
            icon="mail" 
            keyboardType="email-address"
            editable={!saving}
          />
          
          <InputField 
            label="Phone Number" 
            value={phone} 
            onChangeText={setPhone} 
            icon="phone" 
            keyboardType="phone-pad"
            editable={!saving}
            maxLength={10}
          />
          
          <InputField 
            label="Age" 
            value={age} 
            onChangeText={setAge} 
            icon="calendar" 
            keyboardType="numeric"
            editable={!saving}
            maxLength={3}
          />
          
          <InputField 
            label="Gender" 
            value={gender} 
            onChangeText={setGender} 
            icon="users"
            editable={!saving}
          />

          <InputField 
            label="Address" 
            value={address} 
            onChangeText={setAddress} 
            icon="map-pin"
            editable={!saving}
            multiline
          />

          {/* READ-ONLY Access Information */}
          {patientData && (
            <View style={styles.readOnlySection}>
              <Text style={styles.readOnlyTitle}>Account Information (Read Only)</Text>
              <View style={styles.readOnlyCard}>
                <View style={styles.readOnlyRow}>
                  <Text style={styles.readOnlyLabel}>Patient ID:</Text>
                  <Text style={styles.readOnlyValue}>{patientData.PID || user?.id || '—'}</Text>
                </View>
                <View style={styles.readOnlyRow}>
                  <Text style={styles.readOnlyLabel}>Branch:</Text>
                  <Text style={styles.readOnlyValue}>Branch {patientData.BranchId || 1}</Text>
                </View>
                {patientData.PatRegID && (
                  <View style={styles.readOnlyRow}>
                    <Text style={styles.readOnlyLabel}>Registration ID:</Text>
                    <Text style={styles.readOnlyValue}>{patientData.PatRegID}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.readOnlyNote}>
                <Feather name="lock" size={12} color={COLORS.textMuted} /> 
                {' '}These fields cannot be modified by patients. Contact admin for changes.
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]} 
          onPress={handleUpdate}
          disabled={saving}
        >
          {saving ? (
            <>
              <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.saveBtnText}>Saving...</Text>
            </>
          ) : (
            <Text style={styles.saveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function InputField({ 
  label, 
  value, 
  onChangeText, 
  icon, 
  keyboardType = 'default',
  editable = true,
  maxLength,
  multiline = false
}: any) {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, multiline && styles.inputContainerMultiline]}>
        <Feather name={icon} size={18} color={COLORS.primary} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholderTextColor={COLORS.textMuted}
          editable={editable}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.card },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  backBtn: { marginRight: SPACING.md },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  centerText: { marginTop: 12, fontSize: 14, color: COLORS.textSecondary },

  content: { padding: SPACING.lg, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: SPACING.xl },
  avatarBox: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  avatarText: { fontSize: 40, fontWeight: '800', color: COLORS.primary },
  editAvatarBtn: {
    position: 'absolute', right: 0, bottom: 0,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  form: { gap: SPACING.lg },
  inputWrapper: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    minHeight: 56,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  inputContainerMultiline: {
    minHeight: 80,
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
  },
  inputIcon: { marginRight: SPACING.sm },
  input: { flex: 1, fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
  inputMultiline: { 
    minHeight: 60, 
    textAlignVertical: 'top',
    paddingTop: 4,
  },

  // Read-only section
  readOnlySection: { marginTop: SPACING.xl },
  readOnlyTitle: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: COLORS.textPrimary, 
    marginBottom: 12 
  },
  readOnlyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  readOnlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  readOnlyLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  readOnlyValue: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '600' },
  readOnlyNote: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
    lineHeight: 16,
  },

  saveBtn: {
    backgroundColor: COLORS.primary,
    height: 56, borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    marginTop: SPACING.xxl,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
