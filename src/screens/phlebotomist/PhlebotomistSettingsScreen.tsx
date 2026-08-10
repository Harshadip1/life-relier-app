import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const T = {
  primary:    '#0D9488',
  tealDark:   '#0F766E',
  tealBg:     '#F0FDFA',
  tealBorder: '#CCFBF1',
  bg:         '#FFFFFF',
  screenBg:   '#F8FAFC',
  text:       '#0F172A',
  sub:        '#64748B',
  muted:      '#94A3B8',
  border:     '#E2E8F0',
  danger:     '#EF4444',
  dangerBg:   '#FFF1F2',
};

function MenuItem({ icon, label, sub, onPress, danger }: any) {
  return (
    <TouchableOpacity style={s.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.menuIcon, { backgroundColor: danger ? T.dangerBg : T.tealBg }]}>
        <MaterialCommunityIcons name={icon} size={20} color={danger ? T.danger : T.tealDark} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.menuLabel, danger && { color: T.danger }]}>{label}</Text>
        {sub && <Text style={s.menuSub}>{sub}</Text>}
      </View>
      <Feather name="chevron-right" size={16} color={T.muted} />
    </TouchableOpacity>
  );
}

export default function PhlebotomistSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Profile card */}
        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Text style={s.avatarTxt}>{(user?.name ?? 'F').charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.profileName}>{user?.name || 'Phlebotomist'}</Text>
            <Text style={s.profileEmail}>{user?.email || 'flibo@liferelier.com'}</Text>
            <View style={s.roleBadge}>
              <Text style={s.roleTxt}>Phlebotomist</Text>
            </View>
          </View>
        </View>

        {/* Account */}
        <Text style={s.sectionLabel}>Account</Text>
        <View style={s.card}>
          <MenuItem
            icon="account-outline"
            label="My Profile"
            sub="View personal information"
            onPress={() => Alert.alert('Profile', `Name: ${user?.name}\nEmail: ${user?.email}\nPhone: ${user?.phone ?? '—'}`)}
          />
          <View style={s.divider} />
          <MenuItem
            icon="shield-lock-outline"
            label="Change Password"
            sub="Update your login password"
            onPress={() => Alert.alert('Change Password', 'Contact your administrator to change your password.')}
          />
          <View style={s.divider} />
          <MenuItem
            icon="bell-outline"
            label="Notifications"
            sub="Manage alert preferences"
            onPress={() => Alert.alert('Notifications', 'Notification settings coming soon.')}
          />
        </View>

        {/* Work */}
        <Text style={s.sectionLabel}>Work</Text>
        <View style={s.card}>
          <MenuItem
            icon="hospital-building-outline"
            label="My Branch"
            sub="Life Relier Diagnostics — Branch 1"
            onPress={() => Alert.alert('My Branch', 'Branch details coming soon.')}
          />
          <View style={s.divider} />
          <MenuItem
            icon="clock-time-eight-outline"
            label="Shift Timing"
            sub="07:00 AM – 03:00 PM"
            onPress={() => Alert.alert('Shift Timing', 'Shift timing settings coming soon.')}
          />
          <View style={s.divider} />
          <MenuItem
            icon="map-marker-outline"
            label="Collection Centers"
            sub="Assigned centers for sample pickup"
            onPress={() => Alert.alert('Collection Centers', 'Assigned centers list coming soon.')}
          />
        </View>

        {/* Support */}
        <Text style={s.sectionLabel}>Support</Text>
        <View style={s.card}>
          <MenuItem
            icon="help-circle-outline"
            label="Help & FAQ"
            sub="How to use the app"
            onPress={() => Alert.alert('Help', 'Contact your lab administrator for assistance.')}
          />
          <View style={s.divider} />
          <MenuItem
            icon="information-outline"
            label="App Version"
            sub="Life Relier LIMS v1.0.0"
            onPress={() => {}}
          />
        </View>

        {/* Logout */}
        <Text style={s.sectionLabel}>Session</Text>
        <View style={s.card}>
          <MenuItem
            icon="logout"
            label="Logout"
            sub="Sign out of your account"
            danger
            onPress={() => Alert.alert('Logout', 'Are you sure you want to logout?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Logout', style: 'destructive', onPress: () => logout() },
            ])}
          />
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: T.screenBg },
  header:      { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14, backgroundColor: T.bg, borderBottomWidth: 1, borderBottomColor: T.border },
  title:       { fontSize: 22, fontWeight: '800', color: T.text },
  scroll:      { padding: 16 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.bg, borderRadius: 16, borderWidth: 1, borderColor: T.tealBorder, padding: 16, marginBottom: 20 },
  avatar:      { width: 56, height: 56, borderRadius: 28, backgroundColor: T.tealBg, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarTxt:   { fontSize: 22, fontWeight: '800', color: T.tealDark },
  profileName: { fontSize: 16, fontWeight: '800', color: T.text },
  profileEmail:{ fontSize: 12, color: T.sub, marginTop: 2 },
  roleBadge:   { backgroundColor: T.tealBg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 5, borderWidth: 1, borderColor: T.tealBorder },
  roleTxt:     { fontSize: 10, fontWeight: '700', color: T.tealDark },
  sectionLabel:{ fontSize: 12, fontWeight: '700', color: T.muted, marginBottom: 8, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  card:        { backgroundColor: T.bg, borderRadius: 14, borderWidth: 1, borderColor: T.border, overflow: 'hidden', marginBottom: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 },
  menuItem:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  menuIcon:    { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuLabel:   { fontSize: 14, fontWeight: '600', color: T.text },
  menuSub:     { fontSize: 11, color: T.muted, marginTop: 2 },
  divider:     { height: 1, backgroundColor: T.border, marginLeft: 68 },
});
