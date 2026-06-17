import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Modal, TextInput, ActivityIndicator, Image, SafeAreaView
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

// Multi-section menu items for cleaner mapping
const SECTIONS = [
  {
    title: 'Account',
    items: [
      { id: 'personal', icon: 'person-outline', label: 'Personal Information', sublabel: 'View and edit profile details', type: 'feather' },
      { id: 'addresses', icon: 'map-pin', label: 'Saved Addresses', sublabel: 'Manage home collection addresses', type: 'feather' },
      { id: 'notifications', icon: 'bell', label: 'Notifications', sublabel: 'Manage notification preferences', type: 'feather' },
      { id: 'security', icon: 'shield', label: 'Privacy & Security', sublabel: 'Change password and security settings', type: 'feather' },
    ]
  },
  {
    title: 'Bookings',
    items: [
      { id: 'bookings', icon: 'clipboard-list-outline', label: 'My Bookings', sublabel: 'View all current and past bookings', type: 'material' },
      { id: 'payments', icon: 'credit-card-outline', label: 'Payment History', sublabel: 'View invoices and payment records', type: 'material' },
    ]
  },
  {
    title: 'Support',
    items: [
      { id: 'contact', icon: 'phone-call', label: 'Contact Laboratory', type: 'feather' },
      { id: 'faq', icon: 'help-circle', label: 'Help & FAQs', type: 'feather' },
      { id: 'terms', icon: 'file-text', label: 'Terms & Conditions', type: 'feather' },
      { id: 'privacy', icon: 'lock', label: 'Privacy Policy', type: 'feather' },
    ]
  }
];

export default function PatientProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [saving, setSaving] = useState(false);

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

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Card */}
        <LinearGradient
          colors={['#E0F2F1', '#F0FDFA', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.profileMain}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop' }} 
                style={styles.avatar}
              />
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                <Text style={styles.verifiedText}>Verified Patient</Text>
              </View>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name || 'Ubaid Jasnaik'}</Text>
              
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="card-account-details-outline" size={16} color={COLORS.primary} />
                <Text style={styles.infoText}>Patient ID: {user?.id || 'PAT-2026-178'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Feather name="phone" size={14} color={COLORS.primary} />
                <Text style={styles.infoText}>+91 XXXXX XXXXX</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Feather name="mail" size={14} color={COLORS.primary} />
                <Text style={styles.infoText}>{user?.email || 'ubaid@example.com'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Feather name="calendar" size={14} color={COLORS.primary} />
                <Text style={styles.infoText}>Member Since: June 2026</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.shieldDecoration}>
            <MaterialCommunityIcons name="shield-cross" size={100} color="rgba(13, 148, 136, 0.05)" />
          </View>
        </LinearGradient>

        {/* Health Summary */}
        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionTitle}>Health Summary</Text>
        </View>
        <View style={styles.summaryContainer}>
          <SummaryCard
            icon="file-document-outline"
            count="12"
            label="Reports Available"
            color="#0D9488"
            bgColor="#CCFBF1"
            onPress={() => navigation.navigate('Reports')}
          />
          <SummaryCard
            icon="beaker-outline"
            count="18"
            label="Tests Completed"
            color="#6366F1"
            bgColor="#EEF2FF"
            onPress={() => navigation.navigate('TestsCompleted')}
          />
          <SummaryCard
            icon="calendar-outline"
            count="2"
            label="Active Bookings"
            color="#8B5CF6"
            bgColor="#F5F3FF"
            onPress={() => navigation.navigate('MyBookings')}
          />
        </View>

        {/* Dynamic Sections */}
        {SECTIONS.map((section, sIdx) => (
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
                  onPress={() => handleMenuPress(item.id)}
                >
                  <View style={styles.menuIconContainer}>
                    {renderIcon(item.icon, item.type)}
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

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Feather name="log-out" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({ icon, count, label, color, bgColor, onPress }: any) {
  return (
    <TouchableOpacity style={styles.summaryCard} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.summaryIconBox, { backgroundColor: bgColor }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.summaryCount}>{count}</Text>
      <Text style={[styles.summaryLabel, { color: COLORS.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  settingsBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  scrollContent: { paddingHorizontal: SPACING.lg },
  
  // Profile Card
  profileCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  profileMain: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { alignItems: 'center' },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    marginBottom: SPACING.sm,
    borderWidth: 3,
    borderColor: '#fff',
  },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  verifiedText: { fontSize: 10, fontWeight: '700', color: COLORS.primary },
  profileInfo: { marginLeft: SPACING.lg, flex: 1 },
  userName: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  infoText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  shieldDecoration: { position: 'absolute', right: -10, top: 10, zIndex: -1 },

  // Summary
  sectionHeaderWrap: { marginBottom: SPACING.md },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },
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
    borderColor: '#F1F5F9',
    elevation: 1,
  },
  summaryIconBox: {
    width: 48, height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  summaryCount: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  summaryLabel: { fontSize: 11, textAlign: 'center', marginTop: 4, fontWeight: '500' },

  // Menu List
  sectionContainer: { marginBottom: SPACING.xl },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  menuIconContainer: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#F0FDFA',
    alignItems: 'center', justifyContent: 'center',
    marginRight: SPACING.md,
  },
  menuTextContainer: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
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
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: COLORS.danger },
});