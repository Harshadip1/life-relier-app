import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const T = {
  primary: '#0D9488', bg: '#FFFFFF', screenBg: '#F8FAFC',
  text: '#0F172A', sub: '#64748B', muted: '#94A3B8',
  border: '#E2E8F0', danger: '#EF4444', dangerBg: '#FFF1F2',
};

function roleLabel(role: string): string {
  switch (role) {
    case 'admin':         return 'System Admin';
    case 'patient':       return 'Patient';
    case 'refdoctor':     return 'Referring Doctor';
    case 'phlebotomist':  return 'Phlebotomist';
    default:              return 'User';
  }
}

function roleColor(role: string): string {
  switch (role) {
    case 'admin':         return '#0D9488';
    case 'patient':       return '#0369A1';
    case 'refdoctor':     return '#7C3AED';
    case 'phlebotomist':  return '#0891B2';
    default:              return '#64748B';
  }
}

function roleIcon(role: string): string {
  switch (role) {
    case 'admin':         return 'shield-account-outline';
    case 'patient':       return 'account-outline';
    case 'refdoctor':     return 'doctor';
    case 'phlebotomist':  return 'eyedropper-variant';
    default:              return 'account-outline';
  }
}

interface InfoRowProps { icon: string; label: string; value: string; }
function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={s.infoRow}>
      <View style={s.infoIconBox}>
        <Feather name={icon as any} size={16} color={T.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value || '—'}</Text>
      </View>
    </View>
  );
}

export default function SharedProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const initials = (user?.name ?? 'U').charAt(0).toUpperCase();
  const color    = roleColor(user?.role ?? '');

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 0) }]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Avatar card */}
        <View style={s.avatarCard}>
          <View style={[s.avatar, { backgroundColor: color + '20' }]}>
            <Text style={[s.avatarText, { color }]}>{initials}</Text>
          </View>
          <Text style={s.name}>{user?.name || 'User'}</Text>
          <View style={[s.roleBadge, { backgroundColor: color + '15' }]}>
            <MaterialCommunityIcons
              name={roleIcon(user?.role ?? '') as any}
              size={14} color={color}
              style={{ marginRight: 5 }}
            />
            <Text style={[s.roleText, { color }]}>{roleLabel(user?.role ?? '')}</Text>
          </View>
        </View>

        {/* Info section */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Account Information</Text>
          <View style={s.sectionCard}>
            <InfoRow icon="user"     label="Full Name" value={user?.name ?? ''} />
            <View style={s.divider} />
            <InfoRow icon="mail"     label="Email"    value={user?.email ?? ''} />
            <View style={s.divider} />
            <InfoRow icon="phone"    label="Phone"    value={user?.phone ?? ''} />
            <View style={s.divider} />
            <InfoRow icon="hash"     label="User ID"  value={user?.id ?? ''} />
          </View>
        </View>

        {/* Role info */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Role & Access</Text>
          <View style={[s.sectionCard, { borderLeftWidth: 4, borderLeftColor: color }]}>
            <View style={s.roleInfoRow}>
              <View style={[s.roleIconLarge, { backgroundColor: color + '15' }]}>
                <MaterialCommunityIcons name={roleIcon(user?.role ?? '') as any} size={28} color={color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.roleInfoTitle, { color }]}>{roleLabel(user?.role ?? '')}</Text>
                <Text style={s.roleInfoDesc}>
                  {user?.role === 'admin'
                    ? 'Full access to all system features including patient management, lab results, and configurations.'
                    : user?.role === 'patient'
                    ? 'Access to personal reports, booking tests, payment history, and health records.'
                    : user?.role === 'refdoctor'
                    ? 'View referred patients, billing records, test reports, and available health packages.'
                    : user?.role === 'phlebotomist'
                    ? 'Manage sample collection queue, appointments, patient registration, bills, and reports.'
                    : 'Standard user access.'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Logout */}
        <View style={s.section}>
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Feather name="log-out" size={18} color={T.danger} />
            <Text style={s.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App version */}
        <Text style={s.version}>Life Relier LIMS  •  v1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: T.screenBg },
  header:      { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14, backgroundColor: T.bg, borderBottomWidth: 1, borderBottomColor: T.border },
  headerTitle: { fontSize: 22, fontWeight: '800', color: T.text },
  scroll:      { padding: 16 },

  // Avatar
  avatarCard:  { alignItems: 'center', backgroundColor: T.bg, borderRadius: 16, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: T.border, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
  avatar:      { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText:  { fontSize: 28, fontWeight: '900' },
  name:        { fontSize: 19, fontWeight: '800', color: T.text, marginBottom: 8 },
  roleBadge:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  roleText:    { fontSize: 13, fontWeight: '700' },

  // Sections
  section:     { marginBottom: 16 },
  sectionTitle:{ fontSize: 13, fontWeight: '700', color: T.sub, marginBottom: 8, paddingHorizontal: 2 },
  sectionCard: { backgroundColor: T.bg, borderRadius: 14, borderWidth: 1, borderColor: T.border, overflow: 'hidden' },
  divider:     { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 14 },

  // Info rows
  infoRow:     { flexDirection: 'row', alignItems: 'center', padding: 14 },
  infoIconBox: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#F0FDFA', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  infoLabel:   { fontSize: 11, color: T.muted, fontWeight: '500', marginBottom: 2 },
  infoValue:   { fontSize: 14, color: T.text, fontWeight: '600' },

  // Role info
  roleInfoRow:  { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
  roleIconLarge:{ width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  roleInfoTitle:{ fontSize: 15, fontWeight: '800', marginBottom: 6 },
  roleInfoDesc: { fontSize: 12, color: T.sub, lineHeight: 18 },

  // Logout
  logoutBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: T.dangerBg, borderRadius: 14, paddingVertical: 14, gap: 10, borderWidth: 1, borderColor: '#FFE4E6' },
  logoutText:  { fontSize: 15, fontWeight: '700', color: T.danger },

  version:     { textAlign: 'center', fontSize: 11, color: T.muted, marginTop: 8 },
});
