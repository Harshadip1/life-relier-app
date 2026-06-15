import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Modal, TextInput, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconBox}>
        <MaterialCommunityIcons name={icon as any} size={18} color={COLORS.primary} />
      </View>
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function PatientProfileScreen() {
  const { user, logout } = useAuth();
  const [showEdit, setShowEdit] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editAddress, setEditAddress] = useState(user?.address || '');
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); } },
    ]);
  }

  async function handleSaveProfile() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setShowEdit(false);
      Alert.alert('Success', 'Profile updated successfully');
    }, 800);
  }

  async function handleChangePw() {
    if (!oldPw || !newPw || !confirmPw) { Alert.alert('Error', 'All fields are required'); return; }
    if (newPw !== confirmPw) { Alert.alert('Error', 'New passwords do not match'); return; }
    if (newPw.length < 4) { Alert.alert('Error', 'Password must be at least 4 characters'); return; }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setShowChangePw(false);
      setOldPw(''); setNewPw(''); setConfirmPw('');
      Alert.alert('Success', 'Password changed successfully');
    }, 1000);
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'P'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <View style={styles.roleBadge}>
          <MaterialCommunityIcons name="account-heart-outline" size={14} color={COLORS.primary} />
          <Text style={styles.roleText}>Patient</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Patient Details</Text>
        <InfoRow icon="account-outline" label="Full Name" value={user?.name || '-'} />
        <InfoRow icon="email-outline" label="Email" value={user?.email || '-'} />
        <InfoRow icon="phone-outline" label="Phone" value={user?.phone || '-'} />
        <InfoRow icon="map-marker-outline" label="Address" value={user?.address || '-'} />
        <InfoRow icon="identifier" label="Patient ID" value={user?.id || '-'} />
      </View>

      {/* Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Actions</Text>
        <TouchableOpacity style={styles.actionRow} onPress={() => setShowEdit(true)}>
          <View style={[styles.actionIcon, { backgroundColor: COLORS.primaryLight }]}>
            <MaterialCommunityIcons name="account-edit-outline" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.actionLabel}>Edit Profile</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={() => setShowChangePw(true)}>
          <View style={[styles.actionIcon, { backgroundColor: '#EEF2FF' }]}>
            <MaterialCommunityIcons name="lock-reset" size={20} color="#6366F1" />
          </View>
          <Text style={styles.actionLabel}>Change Password</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionRow, styles.logoutRow]} onPress={handleLogout}>
          <View style={[styles.actionIcon, { backgroundColor: '#FEE2E2' }]}>
            <MaterialCommunityIcons name="logout" size={20} color={COLORS.danger} />
          </View>
          <Text style={[styles.actionLabel, { color: COLORS.danger }]}>Logout</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      {/* Edit Profile Modal */}
      <Modal visible={showEdit} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            {[
              { label: 'Full Name', val: editName, set: setEditName, kb: 'default' as const },
              { label: 'Phone', val: editPhone, set: setEditPhone, kb: 'phone-pad' as const },
              { label: 'Address', val: editAddress, set: setEditAddress, kb: 'default' as const },
            ].map((f) => (
              <View key={f.label} style={styles.modalField}>
                <Text style={styles.modalLabel}>{f.label}</Text>
                <TextInput
                  style={styles.modalInput}
                  value={f.val}
                  onChangeText={f.set}
                  keyboardType={f.kb}
                  placeholder={f.label}
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            ))}
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowEdit(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={showChangePw} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Change Password</Text>
            {[
              { label: 'Current Password', val: oldPw, set: setOldPw },
              { label: 'New Password', val: newPw, set: setNewPw },
              { label: 'Confirm Password', val: confirmPw, set: setConfirmPw },
            ].map((f) => (
              <View key={f.label} style={styles.modalField}>
                <Text style={styles.modalLabel}>{f.label}</Text>
                <TextInput
                  style={styles.modalInput}
                  secureTextEntry
                  value={f.val}
                  onChangeText={f.set}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            ))}
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowChangePw(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleChangePw} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: SPACING.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md },
  avatarSection: { alignItems: 'center', marginVertical: SPACING.lg },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  name: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20, marginTop: 6,
  },
  roleText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  card: {
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  infoIconBox: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  infoLabel: { fontSize: 11, color: COLORS.textMuted },
  infoValue: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, gap: SPACING.sm },
  logoutRow: { borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 4, paddingTop: SPACING.md },
  actionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.md },
  modalField: { marginBottom: SPACING.md },
  modalLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 6 },
  modalInput: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm, fontSize: 15, color: COLORS.textPrimary, backgroundColor: COLORS.background,
  },
  modalBtns: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  cancelBtn: {
    flex: 1, borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md, height: 48, alignItems: 'center', justifyContent: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
  saveBtn: {
    flex: 1, backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md, height: 48, alignItems: 'center', justifyContent: 'center',
  },
  saveText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
