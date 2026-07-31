import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const T = { primary:'#0D9488', tealDark:'#0F766E', tealBg:'#F0FDFA', tealBorder:'#CCFBF1', bg:'#F8FAFC', card:'#FFF', text:'#0F172A', sub:'#64748B', muted:'#94A3B8', border:'#E2E8F0', danger:'#EF4444' };

const MENU = [
  { icon: 'account-edit-outline',    label: 'Edit Profile',      color: T.tealDark },
  { icon: 'lock-reset',              label: 'Change Password',   color: '#7C3AED'  },
  { icon: 'bell-outline',            label: 'Notifications',     color: '#F59E0B'  },
  { icon: 'help-circle-outline',     label: 'Help & Support',    color: '#3B82F6'  },
];

export default function PhlebotomistProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 0) }]}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Profile</Text>
      </View>

      {/* Avatar & Info */}
      <View style={s.profileCard}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop' }}
          style={s.avatar}
        />
        <Text style={s.name}>{user?.name ?? 'Phlebotomist'}</Text>
        <View style={s.roleBadge}>
          <MaterialCommunityIcons name="account-heart-outline" size={13} color={T.tealDark} />
          <Text style={s.roleText}>  Phlebotomist</Text>
        </View>
        <Text style={s.email}>{user?.email ?? 'phlebotomist@lab.com'}</Text>
      </View>

      {/* Stats row */}
      <View style={s.statsRow}>
        {[{ label: 'Today', value: '11' }, { label: 'This Week', value: '68' }, { label: 'This Month', value: '240' }].map(stat => (
          <View key={stat.label} style={s.statItem}>
            <Text style={s.statValue}>{stat.value}</Text>
            <Text style={s.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Menu */}
      <View style={s.menuCard}>
        {MENU.map((item, idx) => (
          <TouchableOpacity
            key={item.label}
            style={[s.menuRow, idx < MENU.length - 1 && { borderBottomWidth: 1, borderBottomColor: T.border }]}
            activeOpacity={0.7}
          >
            <View style={[s.menuIcon, { backgroundColor: `${item.color}15` }]}>
              <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
            </View>
            <Text style={s.menuLabel}>{item.label}</Text>
            <Feather name="chevron-right" size={18} color={T.muted} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Feather name="power" size={18} color={T.danger} />
        <Text style={s.logoutText}>  Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: T.bg },
  header:     { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14, backgroundColor: T.card, borderBottomWidth: 1, borderBottomColor: T.border },
  headerTitle:{ fontSize: 20, fontWeight: '800', color: T.text },

  profileCard:{ alignItems: 'center', backgroundColor: T.card, paddingVertical: 24, marginHorizontal: 16, marginTop: 16, borderRadius: 16, borderWidth: 1, borderColor: T.border },
  avatar:     { width: 80, height: 80, borderRadius: 40, marginBottom: 12, borderWidth: 3, borderColor: T.tealBorder },
  name:       { fontSize: 18, fontWeight: '800', color: T.text },
  roleBadge:  { flexDirection: 'row', alignItems: 'center', backgroundColor: T.tealBg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, marginTop: 6, borderWidth: 1, borderColor: T.tealBorder },
  roleText:   { fontSize: 12, fontWeight: '700', color: T.tealDark },
  email:      { fontSize: 13, color: T.sub, marginTop: 6 },

  statsRow:   { flexDirection: 'row', backgroundColor: T.card, marginHorizontal: 16, marginTop: 12, borderRadius: 14, borderWidth: 1, borderColor: T.border, overflow: 'hidden' },
  statItem:   { flex: 1, alignItems: 'center', paddingVertical: 14, borderRightWidth: 1, borderRightColor: T.border },
  statValue:  { fontSize: 20, fontWeight: '900', color: T.tealDark },
  statLabel:  { fontSize: 11, color: T.sub, marginTop: 2 },

  menuCard:   { backgroundColor: T.card, marginHorizontal: 16, marginTop: 12, borderRadius: 14, borderWidth: 1, borderColor: T.border, overflow: 'hidden' },
  menuRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  menuIcon:   { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuLabel:  { flex: 1, fontSize: 14, fontWeight: '600', color: T.text },

  logoutBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', marginHorizontal: 16, marginTop: 12, borderRadius: 14, paddingVertical: 14, borderWidth: 1, borderColor: '#FEE2E2' },
  logoutText: { fontSize: 15, fontWeight: '700', color: T.danger },
});
