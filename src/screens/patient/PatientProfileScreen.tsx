import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

const SECTIONS = [
  {
    title: 'Account',
    items: [
      { id: 'personal', icon: 'user', label: 'Personal Information', sublabel: 'View and update your personal details', type: 'feather' },
      { id: 'password', icon: 'lock', label: 'Change Password', sublabel: 'Update your account password', type: 'feather' },
    ]
  },
  {
    title: 'Bookings',
    items: [
      { id: 'bookings', icon: 'calendar', label: 'My Bookings', sublabel: 'View your test bookings', type: 'feather' },
      { id: 'payments', icon: 'script-text-outline', label: 'Payment History', sublabel: 'View your payment transactions', type: 'material' },
    ]
  },
  {
    title: 'Support',
    items: [
      { id: 'help', icon: 'headset', label: 'Help & Support', sublabel: 'Get help for your queries', type: 'material' },
      { id: 'contact', icon: 'flask-outline', label: 'Contact Laboratory', sublabel: 'Reach out to our support team', type: 'material' },
    ]
  }
];

export default function PatientProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets(); 

  async function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); } },
    ]);
  }

  const handleMenuPress = (id: string) => {
    switch (id) {
      case 'personal': navigation.navigate('PersonalInfo'); break;
      case 'bookings': navigation.navigate('MyBookings'); break;
      case 'payments': navigation.navigate('Payments'); break;
      default: Alert.alert('Coming Soon', 'This section will be enabled in the next update.'); break;
    }
  };

  const renderIcon = (name: string, type: string, size = 20, color = COLORS.primary) => {
    if (type === 'feather') return <Feather name={name as any} size={size} color={color} />;
    if (type === 'material') return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
    return <Ionicons name={name as any} size={size} color={color} />;
  };

  const initials = user?.name ? user.name.charAt(0).toUpperCase() : 'I';

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 20) }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <Feather name="settings" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ── Profile Card ── */}
        <View style={styles.profileCard}>
          {/* Default Initial Avatar */}
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName} numberOfLines={1}>{user?.name || 'INTERNSVEDA EDUTECH PVT LTD'}</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.idLabel}>Patient ID: </Text>
              <Text style={styles.idValue} numberOfLines={1}>{user?.id || 'patient_001'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Feather name="phone" size={13} color={COLORS.primary} />
              <Text style={styles.phoneText}>{user?.phone || '+91 91234 56789'}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('PersonalInfo')}>
            <Feather name="edit-2" size={12} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* ── Dynamic Menu Sections ── */}
        {SECTIONS.map((section, sIdx) => (
          <View key={sIdx} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, iIdx) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.menuItem, iIdx === section.items.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => handleMenuPress(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuIconContainer}>
                    {renderIcon(item.icon, item.type)}
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    {item.sublabel && <Text style={styles.menuSublabel}>{item.sublabel}</Text>}
                  </View>
                  <Feather name="chevron-right" size={20} color="#CBD5E1" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* ── Logout Button ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
          <Feather name="log-out" size={18} color={COLORS.danger || '#EF4444'} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA' }, 
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 10,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#0F172A' },
  settingsBtn: { padding: 4 },
  
  // Adjusted bottom padding to cleanly end right above the new flat nav bar
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  
  // Profile Card Fixes
  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 20,
    padding: 16, marginBottom: 30,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  avatarPlaceholder: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#CCFBF1', 
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: COLORS.primary },
  profileInfo: { flex: 1, marginLeft: 16, marginRight: 8 },
  userName: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  idLabel: { fontSize: 13, color: '#64748B' },
  idValue: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  phoneText: { fontSize: 13, color: '#64748B', marginLeft: 6 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: COLORS.primary, borderRadius: 20,
  },
  editBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },

  // Menu List Sections
  sectionContainer: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  menuCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  menuIconContainer: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#F0FDFA',
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  menuTextContainer: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: '#0F172A', marginBottom: 2 },
  menuSublabel: { fontSize: 12, color: '#94A3B8' },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: COLORS.danger || '#EF4444',
    paddingVertical: 16, borderRadius: 16, gap: 8, marginTop: 8,
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: COLORS.danger || '#EF4444' },
});