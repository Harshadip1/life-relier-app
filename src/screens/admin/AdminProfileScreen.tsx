import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Image, SafeAreaView
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

const ADMIN_SECTIONS = [
  {
    title: 'Management',
    items: [
      { id: 'users', icon: 'users', label: 'User Management', sublabel: 'Manage patients and staff', type: 'feather' },
      { id: 'laboratories', icon: 'activity', label: 'Lab Reports', sublabel: 'Review all generated reports', type: 'feather' },
      { id: 'samples', icon: 'package', label: 'Sample Tracking', sublabel: 'Oversee collection logistics', type: 'feather' },
    ]
  },
  {
    title: 'Operations',
    items: [
      { id: 'inventory', icon: 'box', label: 'Inventory', sublabel: 'Manage lab supplies & kits', type: 'feather' },
      { id: 'billing', icon: 'dollar-sign', label: 'Billing Logs', sublabel: 'View all payment transactions', type: 'feather' },
      { id: 'doctors', icon: 'heart', label: 'Doctor Registry', sublabel: 'Manage partner physicians', type: 'feather' },
    ]
  },
  {
    title: 'System Control',
    items: [
      { id: 'settings', icon: 'settings', label: 'App Settings', type: 'feather' },
      { id: 'backup', icon: 'database', label: 'Backup & Restore', type: 'feather' },
      { id: 'security', icon: 'shield', label: 'Security & Privacy', type: 'feather' },
    ]
  }
];

export default function AdminProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  async function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); } },
    ]);
  }

  const renderIcon = (name: string, type: string, color = COLORS.primary) => {
    if (type === 'feather') return <Feather name={name as any} size={20} color={color} />;
    return <MaterialCommunityIcons name={name as any} size={20} color={color} />;
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin HQ</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Admin Card */}
        <LinearGradient
          colors={['#EEF2FF', '#E0E7FF', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.adminCard}
        >
          <View style={styles.profileMain}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarBorder}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop' }} 
                  style={styles.avatar}
                />
              </View>
              <View style={styles.roleBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#fff" />
                <Text style={styles.roleText}>System Admin</Text>
              </View>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name || 'Admin User'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'admin@liferelier.com'}</Text>
              
              <View style={styles.idContainer}>
                <Text style={styles.idLabel}>STAFF ID:</Text>
                <Text style={styles.idValue}>ADM-2026-X81</Text>
              </View>

              <View style={styles.lastLoginRow}>
                <Feather name="clock" size={12} color={COLORS.textMuted} />
                <Text style={styles.lastLoginText}>Last login: 2h ago</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.decorIcon}>
            <MaterialCommunityIcons name="security" size={120} color="rgba(79, 70, 229, 0.04)" />
          </View>
        </LinearGradient>

        {/* System Summary */}
        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <TouchableOpacity><Text style={styles.seeAll}>Stats</Text></TouchableOpacity>
        </View>
        <View style={styles.summaryContainer}>
          <SummaryCard 
            icon="account-group-outline" 
            count="1,280" 
            label="Total Users" 
            color="#4F46E5" 
            bgColor="#EEF2FF"
          />
          <SummaryCard 
            icon="test-tube" 
            count="42" 
            label="Samples Today" 
            color="#0D9488" 
            bgColor="#F0FDFA"
          />
          <SummaryCard 
            icon="alert-circle-outline" 
            count="05" 
            label="Pending Tasks" 
            color="#F59E0B" 
            bgColor="#FFFBEB"
          />
        </View>

        {/* Management Sections */}
        {ADMIN_SECTIONS.map((section, sIdx) => (
          <View key={sIdx} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, iIdx) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[
                    styles.menuItem, 
                    iIdx === section.items.length - 1 && { borderBottomWidth: 0 }
                  ]}
                  onPress={() => Alert.alert('Action', `Opening ${item.label}...`)}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: '#F8FAFC' }]}>
                    {renderIcon(item.icon, item.type, '#4F46E5')}
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    {item.sublabel && <Text style={styles.menuSublabel}>{item.sublabel}</Text>}
                  </View>
                  <Feather name="chevron-right" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Danger Zone */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Feather name="power" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>System Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({ icon, count, label, color, bgColor }: any) {
  return (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIconBox, { backgroundColor: bgColor }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.summaryCount, { color: color }]}>{count}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F9FF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1E1B4B' },
  settingsBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  badge: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.danger, borderWidth: 1.5, borderColor: '#fff' },
  scrollContent: { paddingHorizontal: SPACING.lg },
  
  // Admin Card
  adminCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 20,
  },
  profileMain: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { alignItems: 'center' },
  avatarBorder: {
    padding: 3, borderRadius: 50, backgroundColor: '#4F46E5',
    elevation: 4, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#fff' },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
    marginTop: -15,
  },
  roleText: { fontSize: 10, fontWeight: '800', color: '#fff', textTransform: 'uppercase' },
  profileInfo: { marginLeft: SPACING.lg, flex: 1 },
  userName: { fontSize: 22, fontWeight: '800', color: '#1E1B4B', marginBottom: 2 },
  userEmail: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 12 },
  idContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  idLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted },
  idValue: { fontSize: 11, fontWeight: '800', color: '#4F46E5' },
  lastLoginRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lastLoginText: { fontSize: 11, color: COLORS.textMuted },
  decorIcon: { position: 'absolute', right: -20, top: -20, zIndex: -1 },

  // Summary
  sectionHeaderWrap: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E1B4B' },
  seeAll: { fontSize: 13, color: '#4F46E5', fontWeight: '600' },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2FF',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
  },
  summaryIconBox: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  summaryCount: { fontSize: 18, fontWeight: '900' },
  summaryLabel: { fontSize: 10, color: COLORS.textSecondary, textAlign: 'center', marginTop: 2, fontWeight: '600' },

  // Menu List
  sectionContainer: { marginBottom: SPACING.xl },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuIconContainer: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginRight: SPACING.md,
  },
  menuTextContainer: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '700', color: '#1E1B4B' },
  menuSublabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F2',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: 10,
    marginBottom: SPACING.lg,
    borderWidth: 1, borderColor: '#FFE4E6',
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: COLORS.danger },
});

