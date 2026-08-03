/**
 * Doctor Settings & Profile Screen
 * Provides consultation settings, notification preferences, practice profile,
 * security controls, and account management for doctors.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Alert, Modal, TextInput, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const T = {
  primary: '#0D9488', tealDark: '#0F766E', tealBg: '#F0FDFA', tealBorder: '#CCFBF1',
  bg: '#FFFFFF', screenBg: '#F8FAFC', text: '#0F172A',
  sub: '#64748B', muted: '#94A3B8', border: '#E2E8F0',
  green: '#10B981', warning: '#F59E0B', danger: '#EF4444', dangerBg: '#FEF2F2',
};

export default function DoctorSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const doctorName = user?.name || 'Dr. Girish Patil';

  // State toggles
  const [apptNotify,     setApptNotify]     = useState(true);
  const [reportNotify,   setReportNotify]   = useState(true);
  const [urgentAlerts,   setUrgentAlerts]   = useState(true);
  const [autoReminder,   setAutoReminder]   = useState(true);
  const [biometricLogin, setBiometricLogin] = useState(false);

  // Practice settings
  const [slotDuration,   setSlotDuration]   = useState('15'); // mins
  const [qualification,  setQualification]  = useState('MD - Internal Medicine');
  const [regNo,          setRegNo]          = useState('MCI-9988442');

  // Edit Profile Modal
  const [editModal,      setEditModal]      = useState(false);
  const [editQual,       setEditQual]       = useState(qualification);
  const [editReg,        setEditReg]        = useState(regNo);

  // Change Password Modal
  const [passModal,      setPassModal]      = useState(false);
  const [oldPass,        setOldPass]        = useState('');
  const [newPass,        setNewPass]        = useState('');
  const [confirmPass,    setConfirmPass]    = useState('');

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out of your doctor account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const handleSaveProfile = () => {
    setQualification(editQual);
    setRegNo(editReg);
    setEditModal(false);
    Alert.alert('Profile Updated', 'Your doctor practice profile has been updated.');
  };

  const handleChangePassword = () => {
    if (!oldPass || !newPass) {
      Alert.alert('Error', 'Please fill in all password fields.');
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert('Error', 'New password and confirm password do not match.');
      return;
    }
    setPassModal(false);
    setOldPass(''); setNewPass(''); setConfirmPass('');
    Alert.alert('Success', 'Password changed successfully.');
  };

  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 0) }]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Doctor Settings</Text>
        <Text style={s.headerSub}>Manage your practice preferences & account</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Doctor Profile Banner */}
        <View style={s.doctorCard}>
          <View style={s.avatarRow}>
            <View style={s.avatar}>
              <Text style={s.avatarTxt}>{doctorName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.doctorName}>{doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`}</Text>
              <Text style={s.qualTxt}>{qualification}</Text>
              <Text style={s.regTxt}>Reg No: {regNo}</Text>
            </View>
            <TouchableOpacity style={s.editBtn} onPress={() => { setEditQual(qualification); setEditReg(regNo); setEditModal(true); }}>
              <Feather name="edit-2" size={14} color={T.primary} />
            </TouchableOpacity>
          </View>
          <View style={s.badgeRow}>
            <View style={s.verifiedBadge}>
              <MaterialCommunityIcons name="check-decagram" size={14} color={T.primary} />
              <Text style={s.verifiedTxt}>Verified Practitioner</Text>
            </View>
            <View style={s.branchBadge}>
              <Feather name="map-pin" size={12} color={T.sub} />
              <Text style={s.branchTxt}>Life Relier Central</Text>
            </View>
          </View>
        </View>

        {/* Consultation Preferences */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Consultation & Practice Settings</Text>
          <View style={s.sectionCard}>
            <View style={s.rowItem}>
              <View style={s.iconBox}><MaterialCommunityIcons name="clock-outline" size={18} color={T.tealDark} /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>Default Slot Duration</Text>
                <Text style={s.rowSub}>Default duration per patient consultation</Text>
              </View>
              <View style={s.slotWrap}>
                {['15m', '20m', '30m'].map(m => {
                  const val = m.replace('m','');
                  const active = slotDuration === val;
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[s.slotChip, active && s.slotChipActive]}
                      onPress={() => setSlotDuration(val)}
                    >
                      <Text style={[s.slotChipTxt, active && s.slotChipTxtActive]}>{m}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={s.divider} />

            <View style={s.rowItem}>
              <View style={s.iconBox}><MaterialCommunityIcons name="bell-ring-outline" size={18} color={T.tealDark} /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>Follow-up Reminders</Text>
                <Text style={s.rowSub}>Automatically remind patients for follow-up consults</Text>
              </View>
              <Switch
                value={autoReminder}
                onValueChange={setAutoReminder}
                trackColor={{ false: '#CBD5E1', true: T.primary }}
                thumbColor="#FFF"
              />
            </View>
          </View>
        </View>

        {/* Notifications & Alerts */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Notifications & Alerts</Text>
          <View style={s.sectionCard}>
            <View style={s.rowItem}>
              <View style={s.iconBox}><Feather name="calendar" size={16} color={T.tealDark} /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>Appointment Bookings</Text>
                <Text style={s.rowSub}>Alert when a new appointment is assigned</Text>
              </View>
              <Switch
                value={apptNotify}
                onValueChange={setApptNotify}
                trackColor={{ false: '#CBD5E1', true: T.primary }}
                thumbColor="#FFF"
              />
            </View>

            <View style={s.divider} />

            <View style={s.rowItem}>
              <View style={s.iconBox}><MaterialCommunityIcons name="file-document-outline" size={18} color={T.tealDark} /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>Patient Report Alerts</Text>
                <Text style={s.rowSub}>Notify when lab test report is ready</Text>
              </View>
              <Switch
                value={reportNotify}
                onValueChange={setReportNotify}
                trackColor={{ false: '#CBD5E1', true: T.primary }}
                thumbColor="#FFF"
              />
            </View>

            <View style={s.divider} />

            <View style={s.rowItem}>
              <View style={s.iconBox}><MaterialCommunityIcons name="alert-circle-outline" size={18} color={T.danger} /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>Critical Value Alerts</Text>
                <Text style={s.rowSub}>High priority alerts for abnormal lab values</Text>
              </View>
              <Switch
                value={urgentAlerts}
                onValueChange={setUrgentAlerts}
                trackColor={{ false: '#CBD5E1', true: T.primary }}
                thumbColor="#FFF"
              />
            </View>
          </View>
        </View>

        {/* Security & Account */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Security & Account</Text>
          <View style={s.sectionCard}>
            <TouchableOpacity style={s.rowItem} onPress={() => setPassModal(true)}>
              <View style={s.iconBox}><Feather name="lock" size={16} color={T.tealDark} /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>Change Password</Text>
                <Text style={s.rowSub}>Update your account security password</Text>
              </View>
              <Feather name="chevron-right" size={16} color={T.muted} />
            </TouchableOpacity>

            <View style={s.divider} />

            <View style={s.rowItem}>
              <View style={s.iconBox}><MaterialCommunityIcons name="fingerprint" size={18} color={T.tealDark} /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>Biometric Authentication</Text>
                <Text style={s.rowSub}>Use Face ID / Fingerprint to log in</Text>
              </View>
              <Switch
                value={biometricLogin}
                onValueChange={setBiometricLogin}
                trackColor={{ false: '#CBD5E1', true: T.primary }}
                thumbColor="#FFF"
              />
            </View>
          </View>
        </View>

        {/* Support & Legal */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Support & Information</Text>
          <View style={s.sectionCard}>
            <TouchableOpacity
              style={s.rowItem}
              onPress={() => Alert.alert('Lab Support Desk', 'Call: +91 1800 233 4567\nEmail: doctor.support@liferelier.com')}
            >
              <View style={s.iconBox}><MaterialCommunityIcons name="headphones" size= {18} color={T.tealDark} /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>Doctor Support Desk</Text>
                <Text style={s.rowSub}>Contact lab support for urgent queries</Text>
              </View>
              <Feather name="chevron-right" size={16} color={T.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Feather name="log-out" size={18} color={T.danger} />
          <Text style={s.logoutTxt}>Log Out of Doctor Account</Text>
        </TouchableOpacity>

        <Text style={s.versionTxt}>Life Relier LIMS  •  Doctor Portal v1.2.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Doctor Profile Modal */}
      {editModal && (
        <Modal visible transparent animationType="fade">
          <View style={s.overlay}>
            <View style={s.modalBox}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Edit Practice Profile</Text>
                <TouchableOpacity onPress={() => setEditModal(false)}>
                  <Feather name="x" size={20} color={T.sub} />
                </TouchableOpacity>
              </View>
              <Text style={s.inputLabel}>Medical Qualification</Text>
              <TextInput
                style={s.input}
                value={editQual}
                onChangeText={setEditQual}
                placeholder="e.g. MD - Internal Medicine"
              />

              <Text style={[s.inputLabel, { marginTop: 12 }]}>Medical Council Registration No.</Text>
              <TextInput
                style={s.input}
                value={editReg}
                onChangeText={setEditReg}
                placeholder="e.g. MCI-9988442"
              />

              <TouchableOpacity style={s.saveBtn} onPress={handleSaveProfile}>
                <Text style={s.saveBtnTxt}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Change Password Modal */}
      {passModal && (
        <Modal visible transparent animationType="fade">
          <View style={s.overlay}>
            <View style={s.modalBox}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Change Password</Text>
                <TouchableOpacity onPress={() => setPassModal(false)}>
                  <Feather name="x" size={20} color={T.sub} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={s.input}
                placeholder="Current Password"
                secureTextEntry
                value={oldPass}
                onChangeText={setOldPass}
              />
              <TextInput
                style={[s.input, { marginTop: 10 }]}
                placeholder="New Password"
                secureTextEntry
                value={newPass}
                onChangeText={setNewPass}
              />
              <TextInput
                style={[s.input, { marginTop: 10 }]}
                placeholder="Confirm New Password"
                secureTextEntry
                value={confirmPass}
                onChangeText={setConfirmPass}
              />
              <TouchableOpacity style={s.saveBtn} onPress={handleChangePassword}>
                <Text style={s.saveBtnTxt}>Update Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: T.screenBg },
  header:      { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, backgroundColor: T.bg, borderBottomWidth: 1, borderBottomColor: T.border },
  headerTitle: { fontSize: 20, fontWeight: '800', color: T.text },
  headerSub:   { fontSize: 11, color: T.sub, marginTop: 2 },
  scroll:      { padding: 16 },
  doctorCard:  { backgroundColor: T.bg, borderRadius: 16, borderWidth: 1, borderColor: T.border, padding: 16, marginBottom: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
  avatarRow:   { flexDirection: 'row', alignItems: 'center' },
  avatar:      { width: 52, height: 52, borderRadius: 26, backgroundColor: T.tealBg, alignItems: 'center', justifyContent: 'center', marginRight: 14, borderWidth: 1, borderColor: T.tealBorder },
  avatarTxt:   { fontSize: 22, fontWeight: '800', color: T.tealDark },
  doctorName:  { fontSize: 16, fontWeight: '800', color: T.text },
  qualTxt:     { fontSize: 12, color: T.primary, fontWeight: '600', marginTop: 1 },
  regTxt:      { fontSize: 11, color: T.sub, marginTop: 2 },
  editBtn:     { width: 32, height: 32, borderRadius: 8, backgroundColor: T.tealBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: T.tealBorder },
  badgeRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  verifiedBadge:{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: T.tealBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  verifiedTxt: { fontSize: 11, fontWeight: '700', color: T.tealDark },
  branchBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  branchTxt:   { fontSize: 11, color: T.sub },
  section:     { marginBottom: 16 },
  sectionTitle:{ fontSize: 13, fontWeight: '700', color: T.sub, marginBottom: 8, paddingHorizontal: 2 },
  sectionCard: { backgroundColor: T.bg, borderRadius: 14, borderWidth: 1, borderColor: T.border, overflow: 'hidden' },
  rowItem:     { flexDirection: 'row', alignItems: 'center', padding: 14 },
  iconBox:     { width: 36, height: 36, borderRadius: 10, backgroundColor: T.tealBg, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowTitle:    { fontSize: 14, fontWeight: '700', color: T.text },
  rowSub:      { fontSize: 11, color: T.sub, marginTop: 2 },
  divider:     { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 14 },
  slotWrap:    { flexDirection: 'row', gap: 4 },
  slotChip:    { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: T.border, backgroundColor: '#F8FAFC' },
  slotChipActive:{ backgroundColor: T.primary, borderColor: T.primary },
  slotChipTxt: { fontSize: 11, fontWeight: '700', color: T.sub },
  slotChipTxtActive: { color: '#FFF' },
  logoutBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: T.dangerBg, borderRadius: 12, paddingVertical: 14, borderWidth: 1, borderColor: '#FEE2E2', marginBottom: 16 },
  logoutTxt:   { fontSize: 14, fontWeight: '700', color: T.danger },
  versionTxt:  { textAlign: 'center', fontSize: 11, color: T.muted },
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox:    { width: '100%', backgroundColor: T.bg, borderRadius: 16, padding: 20 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  modalTitle:  { fontSize: 16, fontWeight: '800', color: T.text },
  inputLabel:  { fontSize: 12, fontWeight: '700', color: T.sub, marginBottom: 4 },
  input:       { borderWidth: 1, borderColor: T.border, borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 13, color: T.text, backgroundColor: '#F8FAFC' },
  saveBtn:     { backgroundColor: T.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 16 },
  saveBtnTxt:  { color: '#FFF', fontSize: 14, fontWeight: '700' },
});
